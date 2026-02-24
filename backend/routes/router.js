const {
  addProductToCart,
  getCarts,
  getCartItems,
  updateProductOnCart,
  removeProductFromCart,
} = require("../controllers/cart-controller");
const { placeOrder } = require("../controllers/order-controller");
const {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  increaseStock,
  decreaseStock,
  removeProduct,
} = require("../controllers/product-controller");
const { createUser, userLogin } = require("../controllers/user-controller");
const validateToken = require("../middlewares/validateToken");

const router = require("express").Router();

// TODO - POR ALGUM MOTIVO O TOKEN NÃO ESTÁ SENDO VALIDADO E AS ROTAS FUNCIONAM MESMO SEM TOKEN

//USER OPERATIONS
router.post("/user/register/", createUser);
router.post("/user/login/", userLogin);
// router.post("/user/logout/",); // LOGOUT ENDPOINT

// CART/ORDER OPERATIONS
router.post("/cart/items/", validateToken, addProductToCart); // ADD PRODUCT TO CART
router.patch("/cart/items/:id", validateToken, updateProductOnCart); // UPDATE ITEM ON CART
router.delete("/cart/items/:id", validateToken, removeProductFromCart); //REMOVE ITEM FROM CART
router.post("/orders/", validateToken, placeOrder); // PLACE ORDER
// router.post("/orders/:id/pay",); // FINISH ORDER

//! DEBUG
router.get("/carts/", getCarts); // GET ALL CARTS
router.get("/cart-items/", getCartItems); // GET ALL CART ITEMS

//TODO - SE VOCE CONSEGUIR DEIXAR BUSCAR TODOS OS PRODUTOS E BUSCAR 1 PRODUTO POR ID EM UM ENDPOINT SÓ SERIA MELHOR
router.get("/products/", getProducts); // GET PRODUCTS
router.get("/products/:id", getProduct); // GET PRODUCT BY ID

//ADMIN OPERATIONS
// TODO - FUTURAMENTE ADICIONAR O MIDDLEWARE QUE VALIDA SE É ADMIN
router.post("/products/", validateToken, addProduct); // ADD PRODUCT
router.patch("/products/:id", updateProduct); // UPDATE PRODUCT(S)
router.post("/products/:id/increase-stock", validateToken, increaseStock); // INCREASE STOCK
router.post("/products/:id/decrease-stock", validateToken, decreaseStock); // DECREASE STOCK
router.delete("/products/:id", removeProduct); // REMOVE PRODUCT

module.exports = router;
