const createUser = require("../controllers/user-controller");

const router = require("express").Router();

router.post("/user/register/", createUser);
router.post("/product/register", addProduct);

module.exports = router;
