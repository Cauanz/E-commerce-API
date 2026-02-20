const jwt = require("jsonwebtoken");

const addProductToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const JWTtoken = req.token;

    if (!productId || typeof productId !== "string") {
      res.status(400).send("Product ID is missing or is invalid");
      return;
    }
    if (!quantity || typeof quantity !== "number") {
      res.status(400).send("Quantity is missing or is invalid");
      return;
    }

    if (!JWTtoken || typeof JWTtoken !== "string") {
      res.status(400).send("User ID is missing or is invalid");
      return;
    }

    const user = jwt.verify(JWTtoken, process.env.SECRET);
    const userId = user.id;

    // TODO - PEGAMOS O ID DO USER, AGOR É ACHAR UM CART QUE CONTENHA ESSE ID E FAZER O RESTO DA OPERAÇÃO

    res.status(204);
  } catch (error) {
    res
      .status(404)
      .send(
        `Something went wrong trying to add the product to the user's cart: ${error}`,
      );
  }
};

module.exports = { addProductToCart };
