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
      res
        .status(400)
        .send("Quantity is missing or is invalid. It must be at least 1");
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

    if (!userCart || userCart.status !== 'active') {
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

    //TODO - ADICIONAR A FUNÇÃO QUE SE ENVIADO O MESMO PRODUTO COM QUANTIDADE DIFERENTE, VOCE SOMA

    res.status(204).send("Product successfully added to the user's cart");
  } catch (error) {
    res
      .status(404)
      .send(
        `Something went wrong trying to add the product to the user's cart: ${error}`,
      );
  }
};

const updateProductOnCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;

    if (!quantity || typeof quantity !== "number") {
      res
        .status(400)
        .send("Quantity is missing or is invalid. It must be at least 1");
      return;
    }

    if (!cartItemId || typeof cartItemId !== "string") {
      res.status(400).send("Cart Item ID is missing or is invalid");
      return;
    }

    const cartItem = await CartItem.findOne({ where: { id: cartItemId } });

    if (!cartItem) {
      res.status(400).send("CartItem couldn't be found or do not exist");
      return;
    }

    const updatedCartItem = await CartItem.update(
      { quantity: quantity },
      { where: { id: cartItemId } },
    );

    if (!updatedCartItem) {
      res.status(400).send("CartItem couldn't be updated");
      return;
    }

    res.status(204).send("CartItem updated successfully");
  } catch (error) {
    res
      .status(404)
      .send(
        `Something went wrong trying to update the quantity of the product on the user cart: ${error}`,
      );
  }
};

const removeProductFromCart = async (req, res) => {
  try {
    const cartItemId = req.params.id;

    if (!cartItemId || typeof cartItemId !== "string") {
      res.status(400).send("Cart Item ID is missing or is invalid");
      return;
    }

    const cartItem = await CartItem.findOne({ where: { id: cartItemId } });

    if (!cartItem) {
      res.status(400).send("CartItem couldn't be found or do not exist");
      return;
    }

    const removedCartItem = await CartItem.destroy({
      where: { id: cartItemId },
    });

    if (!removedCartItem) {
      res.status(400).send("CartItem couldn't be removed");
      return;
    }

    res.status(204).send("CartItem removed from cart successfully");
  } catch (error) {
    res
      .status(404)
      .send(
        `Something went wrong trying to update the quantity of the product on the user cart: ${error}`,
      );
  }
};

//! DEBUG
const getCarts = async (req, res) => {
  try {
    const carts = await Cart.findAll({});

    if (!carts) {
      res.status(400).send("Couldn't find all the carts");
      return;
    }

    res.send(carts);
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to get the carts: ${error}`);
  }
};

//! DEBUG
const getCartItems = async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({});

    if (!cartItems) {
      res.status(400).send("Couldn't find all the carts' items");
      return;
    }

    res.send(cartItems);
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to get the carts' items: ${error}`);
  }
};

module.exports = {
  addProductToCart,
  getCarts,
  getCartItems,
  updateProductOnCart,
  removeProductFromCart,
};
