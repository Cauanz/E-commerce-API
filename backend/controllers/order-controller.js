const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Order = require("../models/Order");

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
      res.status(404).send("Cart couldn't be found or don't exist");
    }

    const cartItems = await CartItem.findAll({
      where: { cart_id: userCart.id },
    });

    // TODO - TERMINAR ISSO AQUI
    // TODO - CONVERTER CARTITEMS EM ORDERITEMS (QUE SÃO CONGELADOS E NÃO MUDAM)
    //TODO - CRIAR O ORDER (TALVEZ TENHA QUE CRIAR ANTES? MAS COMO VAMOS ADICIONAR O TOTAL_AMOUNT? VAI TER QUE ATUALIZAR O ORDER QUE ACABAMOS DE CRIAR?)

    // console.log(cartItems);

    // const order = await Order.create({
    //   user_id: userId,
    //   status: "pending",
    //   total_amount: something,
    // });
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to place the order: ${error}`);
  }
};

module.exports = {
  placeOrder,
};
