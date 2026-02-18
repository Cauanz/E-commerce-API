const { addProduct } = require("../controllers/product-controller");
const { createUser, userLogin } = require("../controllers/user-controller");
const validateToken = require("../middlewares/validateToken");

const router = require("express").Router();

//USER OPERATIONS
router.post("/user/register/", createUser);
router.post("/user/login/", userLogin);

// CART/ORDER OPERATIONS
// router.post("/cart/items/",); // ADD PRODUCT TO CART
// router.patch("/cart/items/:id",); // UPDATE ITEM ON CART
// router.delete("/cart/items/:id",); //REMOVE ITEM FROM CART
// router.post("/orders/",); // PLACE ORDER
// router.post("/orders/:id/pay",); // FINISH ORDER

//TODO - SE VOCE CONSEGUIR DEIXAR BUSCAR TODOS OS PRODUTOS E BUSCAR 1 PRODUTO POR ID EM UM ENDPOINT SÓ SERIA MELHOR
// router.get("/products/", getProducts); // GET PRODUCTS
// router.get("/products/", addProduct); // GET PRODUCT BY ID

//ADMIN OPERATIONS
router.post("/products/", validateToken, addProduct); // ADD PRODUCT
// router.post("/products/:id/increase-stock", validateToken, increaseStock); // INCREASE STOCK
// router.post("/products/:id/decrease-stock", validateToken, decreaseStock); // DECREASE STOCK
// router.delete("/products/:id", removeProduct); // REMOVE PRODUCT
// router.patch("/products/:id", updateProduct); // UPDATE PRODUCT(S)

module.exports = router;
