const { createUser, userLogin } = require("../controllers/user-controller");

const router = require("express").Router();

router.post("/user/register/", createUser);
router.post("/user/login/", userLogin);

// router.get("/products/", addProduct); // GET PRODUCTS
// router.get("/products/", addProduct); // GET PRODUCT BY ID
//TODO - SE VOCE CONSEGUIR DEIXAR BUSCAR TODOS OS PRODUTOS E BUSCAR 1 PRODUTO POR ID EM UM ENDPOINT SÓ SERIA MELHOR

// router.post("/products/", addProduct); // ADD PRODUCT
// router.delete("/products/", removeProduct); // REMOVE PRODUCT
// router.put("/products/", updateProduct); // UPDATE PRODUCT(S)

module.exports = router;
