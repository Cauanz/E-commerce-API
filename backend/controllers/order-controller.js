const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const stripe = require("../config/stripe_provider");
const Product = require("../models/Product");

const placeOrder = async (req, res) => {
  try {
    const token = req.token;

    if (!token || typeof token !== "string") {
      res.status(400).send("User ID is missing or is invalid");
      return;
    }

    const user = jwt.verify(token, process.env.SECRET);
    const userId = user.id;

    const userCart = await Cart.findOne({
      where: { user_id: userId, status: "active" },
    });

    if (!userCart) {
      res.status(404).send("Cart couldn't be found or doesn't exist");
      return;
    }

    const cartItems = await CartItem.findAll({
      where: { cart_id: userCart.id },
    });

    if (!cartItems || cartItems.length === 0) {
      res.status(404).send("Cart Items couldn't be found or don't exist");
      return;
    }

    const prices = cartItems.map(
      (item) => Number.parseFloat(item.original_price) * item.quantity,
    );
    const totalAmount = prices.reduce((acc, cur) => acc + cur, 0);

    //! DEBUG
    const pendingOrder = await Order.findOne({
      where: { user_id: userId, status: "pending" },
    });
    if (pendingOrder) {
      const dateNow = new Date();
      if (dateNow > pendingOrder.expires_at) {
        pendingOrder.status = "cancelled";
      }
    }
    //! DEBUG

    //* - TERMINAR ESSA FUNÇÃO ACIMA QUE POR ENQUANTO É PARA DEBUG MAS TEM QUE TECNICAMENTE EXISTIR QUE VERIFICA SE TEM ORDERS PENDENTES E CANCELA ELAS ANTES DE CRIAR OUTRA (POR QUE A REGRA É QUE SÓ PODE TER UMA ATIVA)

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const newOrder = await Order.create({
      user_id: userId,
      status: "pending",
      total_amount: totalAmount,
      expires_at: expiresAt,
    });

    await Promise.all(
      cartItems.map(async (item) => {
        await OrderItem.create({
          order_id: newOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.original_price,
        });

        await Product.decrement("stock", {
          by: item.quantity,
          where: { id: item.product_id },
        });
      }),
    );

    const convertedCart = await Cart.update(
      { status: "converted" },
      { where: { user_id: userId } },
    );

    res.status(200).send({
      message: "Order placed successfully, waiting for payment...",
      orderId: newOrder.id,
    });
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to place the order: ${error}`);
  }
};

const payOrder = async (req, res) => {
  try {
    //! NÃO RECEBA DADOS DO CLIENTE (PELO MENOS NÃO OS DO CARTÃO) ISSO É FEITO PELO STRIPE COM O ORDERID QUE O FRONT RECEBE E ENVIA NA REQUISIÇÃO PARA PAGAR O ORDER
    const orderId = req.params.orderId;
    const token = req.token;

    if (!token || typeof token !== "string") {
      res.status(400).send("User ID is missing or is invalid");
      return;
    }

    const user = jwt.verify(token, process.env.SECRET);
    const userId = user.id;

    const clientOrder = await Order.findOne({
      where: {
        id: orderId,
        status: "pending",
      },
    });

    if (!clientOrder) {
      throw new Error("No order has been found");
    }

    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
    });

    if (!orderItems || orderItems.length === 0) {
      res.status(404).send("Order Items couldn't be found or don't exist");
      return;
    }

    const checkOrder = new Date() > clientOrder.expires_at;
    if (checkOrder) {
      await Promise.all(
        orderItems.map(async (item) => {
          await Product.increment("stock", {
            by: item.quantity,
            where: { id: item.product_id },
          });
        }),

        await Order.update(
          { status: "cancelled" },
          { where: { user_id: userId, id: orderId } },
        ),
      );

      res.status(404).send("The order has expired");
      return;
    }

    const productIds = [...new Set(orderItems.map((item) => item.product_id))];
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ["id", "name"],
    });

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    const lineItems = orderItems.map((item) => {
      const product = productsById.get(item.product_id);

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: product.name,
          },
          unit_amount: item.price_at_purchase * 100,
        },
        quantity: item.quantity,
      };
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      success_url: `http://localhost:3000/v1/orders/${orderId}/success`, //! ROTA PARA TESTE LOCAL (MUDE POSTERIORMENTE)
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: clientOrder.id,
      },
    });

    const checkoutUrl = checkoutSession.url;

    if (!checkoutUrl) {
      throw new Error("checkout URL not found");
    }

    res.status(200).send(checkoutSession);
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to finish the order: ${error}`);
  }
};

const paymentSuccess = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findOne({
      where: { id: orderId, status: "pending" },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    await Order.update(
      { status: "paid" },
      { where: { id: orderId, status: "pending" } },
    );

    res.send(204).send("Order paid successfully");
  } catch (error) {
    res.status(404).send(`Something went wrong paying the order: ${error}`);
  }
};

const paymentFailure = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findOne({
      where: { id: orderId, status: "pending" },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
    });

    if (!orderItems || orderItems.length === 0) {
      res.status(404).send("Order Items couldn't be found or don't exist");
      return;
    }

    //! NÃO TESTADO
    // TODO - BASICAMENTE FAZ UM ROLLBACK SE NÃO DER CERTO O PEDIDO (É OBRIGATÓRIO ABRIR UM NOVO PEDIDO, MAS PODE REUTILIZAR O MESMO CARRINHO)
    orderItems.map(async (item) => {
      await Product.increment("stock", {
        by: item.quantity,
        where: { id: item.product_id },
      });
    });

    await Order.update(
      { status: "cancelled" },
      { where: { user_id: userId, id: orderId } },
    );

    await Cart.update({ status: "active" }, { where: { user_id: userId } });

    res.send(204).send("Order not paid");
  } catch (error) {
    res.status(404).send(`Something went wrong paying the order: ${error}`);
  }
};

module.exports = {
  placeOrder,
  payOrder,
  paymentSuccess,
  paymentFailure,
};
