const createUser = require("../controllers/user-controller");

const router = require("express").Router();

router.post("/user/register/", createUser);
// router.post("/user/login/", );


router.post("/product/", addProduct); // ADD PRODUCT
// router.post("/product/", ); // REMOVE PRODUCT
// router.post("/product/", ); // UPDATE PRODUCT(S)

module.exports = router;
