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
    const pendingOrder = await Order.findOne({ where: { user_id: userId } });
    if (pendingOrder) {
      const dateNow = new Date(Date().now());
      if (pendingOrder.expires_at < dateNow) {
        pendingOrder.status = "cancelled";
      }
    }
    //! DEBUG

    //TODO - TERMINAR ESSA FUNÇÃO ACIMA QUE POR ENQUANTO É PARA DEBUG MAS TEM QUE TECNICAMENTE EXISTIR QUE VERIFICA SE TEM ORDERS PENDENTES E CANCELA ELAS ANTES DE CRIAR OUTRA (POR QUE A REGRA É QUE SÓ PODE TER UMA ATIVA)
    //TODO - E TERMINAR ABAIXO PARA CRIAR A NOVA ORDER E AINDA NÃO SEI COMO FUNCIONA O STRIPE
    // TODO - E A REGRA É QUE ELE REMOVA OS ITENS TEMPORARIAMENTE DO STOCK E SE CANCELADO ELE DEVOLVE, SE NÃO ELE MANTEM REMOVIDO (POR QUE O CLIENTE COMPROU COM SUCESSO)

    // const newOrder = await Order.create({
    //   user_id: userId,
    //   status: "pending",
    //   total_amount: totalAmount,
    // });

    // const orderItems = cartItems.map(async (item) => {
    //   await OrderItem.create({
    //     order_id: newOrder.id,
    //     product_id: item.product_id,
    //     quantity: item.quantity,
    //     price_at_purchase: item.original_price,
    //   });

    //   await Product.decrement("stock", { by: item.quantity });
    // });

    // const stripePaymentIntent = await stripe.paymentIntents.create({
    //   amount: newOrder.total_amount
    // })

    //TODO - PRONTO, MAS ACHO QUE ESTA ERRADO OU FALTA COISAS, POR QUE AINDA NÃO FAZ SENTIDO
    res.status(204).send("Order placed successfully, waiting for payment...");
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to place the order: ${error}`);
  }
};

module.exports = {
  placeOrder,
};
