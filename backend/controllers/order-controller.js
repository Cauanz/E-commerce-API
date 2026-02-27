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

    const clientOrder = await Order.findOne({
      where: {
        id: orderId,
        status: "pending",
      },
    });

    // const checkOrder = new Date() > clientOrder.expires_at;

    // if (!checkOrder) {
    //   res.status(404).send("The order has expired");
    //   return;
    // }

    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
    });

    console.log(orderItems);

    if (!orderItems || orderItems.length === 0) {
      res.status(404).send("Order Items couldn't be found or don't exist");
      return;
    }

    // const prices = orderItems.map(
    //   (item) => Number.parseFloat(item.price_at_purchase) * item.quantity,
    // );
    // const totalAmount = prices.reduce((acc, cur) => acc + cur, 0);

    const products = await Promise.all(
      orderItems.map((item) => {
        return Product.findOne({ where: { id: item.product_id } });
      }),
    );

    // TODO - TERMINAR DE CRIAR ISSO E REVISAR SE ESTÁ CORRETO ANTES
    // const checkoutSession = await stripe.checkout.sessions.create({
    //   success_url: "", //! FALTA A URL, TALVEZ CRIAR OUTRO ENDPOINT PARA RETORNO
    //   line_items: orderItems.map((item) => ({
    //     price_data: {
    //       currency: "brl",
    //       product_data: {
    //         id: item.product_id,
    //       },
    //       unit_amount: item.price_at_purchase * 100,
    //     },
    //     quantity: item.quantity,
    //   })),
    //   mode: "payment",
    //   metadata: {
    //     orderId: clientOrder.id,
    //   },
    // });

    // const stripePaymentIntent = await stripe.paymentIntents.create({
    //   amount: newOrder.total_amount
    // })
    //TODO - AINDA NÃO SEI COMO O STRIPE FUNCIONA
    // TODO - E A REGRA É QUE ELE REMOVA OS ITENS TEMPORARIAMENTE DO STOCK E SE CANCELADO ELE DEVOLVE, SE NÃO ELE MANTEM REMOVIDO (POR QUE O CLIENTE COMPROU COM SUCESSO)
    //TODO - AQUI É ONDE ELE DECIDE DE MANTER OU DEVOLVE STOCK, DEPOIS DA API DO STRIPE DIZER SE O PAGAMENTO FOI BEM SUCEDIDO OU NÃO
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to finish the order: ${error}`);
  }
};

module.exports = {
  placeOrder,
  payOrder,
};
