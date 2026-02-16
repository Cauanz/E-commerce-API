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

    let token = jwt.sign({ id: newUser._id }, process.env.SECRET, {
      expiresIn: 86400, // expires in 24 hours
    });
    // TODO - ESTÁ GERANDO UM ERRO DE ALGO ERRADO, REVISAR
    res.status(200).send({ newUser, token: token });
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to create a user: ${error}`);
  }
};

// TODO - ADICIONAR OUTROS MODELOS
// TODO - ADICIONAR SISTEMA DE AUTENTICAÇÃO/AUTORIZAÇÃO AGORA?

module.exports = createUser;
