const Product = require("../models/Product");

const addProduct = async (req, res) => {
  try {
    const { name, description, stock, price } = req.body;

    if (name && description) {
      if (typeof name !== "string" || typeof description !== "string")
        res
          .status(400)
          .send(
            "Name or description using the wrong type, both must be strings",
          );
    } else {
      res.status(400).send("Name or description missing.");
    }

    if (stock && price) {
      if (typeof stock !== "number" || typeof price !== "number")
        res
          .status(400)
          .send("Stock or price using the wrong type, both must be integers");
    } else {
      res.status(400).send("Stock or price missing.");
    }

    const product = await Product.findOne({ where: { name: name } });

    if (product) {
      res.status(409).send("Product already exists, try updating it.");
      return;
    }

    const newProduct = Product.create({
      name: name,
      description: description,
      stock: stock,
      price: price,
    });

    res.status(200).send("Product successfully created", newProduct);
  } catch (error) {
    res.status(404).send(`Something went wrong trying to login: ${error}`);
  }
};

module.exports = {
  addProduct,
};
