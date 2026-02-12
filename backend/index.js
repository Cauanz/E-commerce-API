const express = require("express");
const cors = require("cors");
require("dotenv").config();
const router = require("./routes/router");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port: ${process.env.PORT}`);
});
