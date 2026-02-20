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

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      res.status(409).send("This email is already being used");
      return;
    }

    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: passwordHash,
    });

    res.status(200).send({ newUser });
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to create a user: ${error}`);
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send("Email or password missing or invalid!");
      return;
    }

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      res.status(409).send("User not found!");
      return;
    }

    const checkPassword = bcrypt.compareSync(password, user.password);

    if (checkPassword === false) {
      res.status(401).send("The password is wrong!");
      return;
    }

    let token = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: 86400, // expires in 24 hours
      // expiresIn: "30s", //! PARA DEBUG
    });

    res.status(200).send({ token: token });
  } catch (error) {
    res.status(404).send(`Something went wrong trying to login: ${error}`);
  }
};

// const getUsers //! SOMENTE PARA DEBUG

module.exports = { createUser, userLogin };
