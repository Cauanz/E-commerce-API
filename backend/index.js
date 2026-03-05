const express = require("express");
const cors = require("cors");
require("dotenv").config();
const router = require("./routes/router");
const sequelize = require("./config/sequelize.db");

const User = require("./models/User");
const Cart = require("./models/Cart");
const CartItem = require("./models/CartItem");
const Order = require("./models/Order");
const OrderItem = require("./models/OrderItem");
const Product = require("./models/Product");
const Payment = require("./models/Payment");

const app = express();

app.use(cors());
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
