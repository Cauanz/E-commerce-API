const express = require("express");
const cors = require("cors");
require("dotenv").config();
const router = require("./routes/router");
const sequelize = require("./config/sequelize.db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1", router);

app.listen(process.env.PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  console.log(`Listening on port: ${process.env.PORT}`);
});
