const express = require("express");
const cors = require("cors");
require("dotenv").config();
const router = require("./routes/router");
const sequelize = require("./config/sequelize.db");
const stripe = require("./config/stripe_provider");

const User = require("./models/User");
const Cart = require("./models/Cart");
const CartItem = require("./models/CartItem");
const Order = require("./models/Order");
const OrderItem = require("./models/OrderItem");
const Product = require("./models/Product");
const Payment = require("./models/Payment");

const app = express();
app.use(cors());

app.post(
  "/webhooks/stripe/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const webhookTestSecret = process.env.STRIPE_WEBHOOK_SECRET;
      let event;
      if (webhookTestSecret) {
        const signature = req.headers["stripe-signature"];
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookTestSecret,
          );
        } catch (err) {
          console.log(`⚠️ Webhook signature verification failed.`, err.message);
          res.sendStatus(400);
          return;
        }
      }

      // const event = JSON.parse(req.body.toString()); //! USADO PARA DEBUG

      const eventObject = event?.data?.object;
      const metadata = eventObject.metadata;

      const order = await Order.findOne({
        where: { id: metadata.orderId, status: "pending" },
      });

      if (!order) {
        res.status(404).send("Order not found or already paid");
        return;
      }

      switch (event.type) {
        case "checkout.session.completed":
          //* - PRECISAMOS DO USER_ID PORQUE OS ORDERS TEM ID DO TIPO INTEIRO, OU SEJA POUCO NÚMERO, VAI TER VÁRIOS IGUAIS

          await Order.update(
            { status: "paid" },
            {
              where: {
                id: metadata.orderId,
                user_id: metadata.userId,
                status: "pending",
              },
            },
          );

          await Payment.update(
            { status: "approved" },
            {
              where: {
                order_id: metadata.orderId,
                transaction_id: eventObject.id,
              },
            },
          );
          res.status(204).send("Order paid successfully");
          break;
        case "payment_intent.payment_failed":
          //* - BASICAMENTE FAZ UM ROLLBACK SE NÃO DER CERTO O PEDIDO (É OBRIGATÓRIO ABRIR UM NOVO PEDIDO, MAS PODE REUTILIZAR O MESMO CARRINHO)

          const orderItems = await OrderItem.findAll({
            where: { order_id: metadata.orderId },
          });

          if (!orderItems || orderItems.length === 0) {
            res
              .status(404)
              .send("Order Items couldn't be found or don't exist");
            return;
          }

          orderItems.map(async (item) => {
            await Product.increment("stock", {
              by: item.quantity,
              where: { id: item.product_id },
            });
          });

          await Order.update(
            { status: "cancelled" },
            { where: { user_id: metadata.userId, id: metadata.orderId } },
          );

          await Payment.update(
            { status: "failed" },
            {
              where: {
                order_id: metadata.orderId,
                transaction_id: eventObject.id,
              },
            },
          );

          // await Cart.update(
          //   { status: "active" },
          //   { where: { user_id: order.user_id } },
          // );

          res.send(200).send("Order not paid");
          break;
        default:
          res.status(200).send("Event received");
          break;
      }
    } catch (error) {
      res.status(500).send(`Something went wrong paying the order: ${error}`);
    }
  },
);

app.use(express.json());

app.use("/v1", router);

app.listen(process.env.PORT, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  console.log(`Listening on port: ${process.env.PORT}`);
});

module.exports = app;
