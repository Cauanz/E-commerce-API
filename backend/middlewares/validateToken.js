const jwt = require("jsonwebtoken");

const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader && !uthHeader.startsWith("Bearer ")) {
      req.token = null;
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).send("Missing or invalid token");
      return;
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) res.status(401).send("Token expired!");
      return;
      //* POR ENQUANTO A VERIFICAÇÃO É SÓ SE O TOKEN ESTÁ VALIDO (NÃO EXPIRADO POR DATA) MAS ADICIONAR VERIFICAÇÃO MELHOR
    });

    req.token = token;
    next();
  } catch (error) {
    res.status(401).send("Missing or invalid token");
  }
};

module.exports = validateToken;
