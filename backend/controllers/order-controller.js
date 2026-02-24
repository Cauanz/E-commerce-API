const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

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

    const prices = cartItems.map((item) =>
      Number.parseFloat(item.original_price),
    );
    const totalAmount = prices.reduce((acc, cur) => acc + cur, 0);

    const newOrder = await Order.create({
      user_id: userId,
      status: "pending",
      total_amount: totalAmount,
    });

    const orderItems = cartItems.map(async (item) => {
      await OrderItem.create({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.original_price,
      });
    });

    // TODO - ADICIONAR OPÇÕES DE PROVEDORES NA REQUISIÇÃO?
    const mercadoPagoOrder = "https://api.mercadopago.com/v1/orders";

    // TODO - TERMINAR A REQUISIÇÃO PARA ORDER NO MERCADOPAGO

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
