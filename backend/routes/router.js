const createUser = require("../controllers/user-controller");

const router = require("express").Router();

router.post("/user/register/", createUser);

module.exports = router;
