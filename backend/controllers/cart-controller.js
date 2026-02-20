const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

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

    const product = await Product.findOne({ where: { id: productId } });

    if (!product) {
      res.status(400).send("Product couldn't be found");
      return;
    }

    const userCart = await Cart.findOne({ where: { user_id: userId } });

    if (!userCart) {
      const newCart = await Cart.create({
        user_id: userId,
        status: "active",
      });

      const newProduct = await CartItem.create({
        cart_id: newCart.id,
        product_id: productId,
        quantity: quantity,
        original_price: product.price,
      });
    }

    const newProduct = await CartItem.create({
      cart_id: userCart.id,
      product_id: productId,
      quantity: quantity,
      original_price: product.price,
    });

    // TODO - FUNCIONANDO MAS PRECISA REVISAR E VER O QUE FAZER DEPOIS (TALVEZ UMA ROTA QUE RECUPERE O CARRINHO, SE JÁ NÃO TEM UMA)

    res.status(204).send("Product successfully added to the user's cart");
  } catch (error) {
    res
      .status(404)
      .send(
        `Something went wrong trying to add the product to the user's cart: ${error}`,
      );
  }
};

module.exports = { addProductToCart };
