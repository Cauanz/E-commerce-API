const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res
        .status(400)
        .send("Something is missing in the request or is invalid, try again");
      return;
    }

    const salt = bcrypt.genSalt(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const existingUser = User.findOne({ email: email });

    if (existingUser) {
      res.status(409).send("This email is already being used");
      return;
    }

    const newUser = await User.create(
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: passwordHash,
      },
      (err, user) => {
        if (err)
          return res
            .status(500)
            .send("There was an error trying to create the user");

        let token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400, // expires in 24 hours
        });
        res.status(200).send({ newUser, token: token });
      },
    );
    // TODO - ESTÁ GERANDO UM ERRO DE ALGO ERRADO, REVISAR
  } catch (error) {
    res.status(404).send("Something went wrong trying to create a user");
  }
};

module.exports = createUser;
