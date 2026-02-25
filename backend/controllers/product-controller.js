const Product = require("../models/Product");

const addProduct = async (req, res) => {
  try {
    const { name, description, stock, price } = req.body;

    if (name && description) {
      if (typeof name !== "string" || typeof description !== "string") {
        res
          .status(400)
          .send(
            "Name or description using the wrong type, both must be strings",
          );
        return;
      }
    } else {
      res.status(400).send("Name or description missing.");
      return;
    }

    if (stock && price) {
      if (typeof stock !== "number" || typeof price !== "number") {
        res
          .status(400)
          .send("Stock or price using the wrong type, both must be integers");
        return;
      }
    } else {
      res.status(400).send("Stock or price missing.");
      return;
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

    res.status(204).send("Product successfully created", newProduct);
  } catch (error) {
    res
      .status(500)
      .send(`Something went wrong trying to add the product: ${error}`);
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();

    if (!products) res.status(404).send("Products couldn't be recovered");

    res.status(200).send(products);
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to get the products: ${error}`);
  }
};

const getProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({ where: { id: productId } });

    if (!product)
      res.status(404).send("Product couldn't be recovered or doesn't exist");

    res.status(200).send(product);
  } catch (error) {
    res
      .status(404)
      .send(`Something went wrong trying to get the product: ${error}`);
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;
    const keys = Object.keys(data);

    if (!data) {
      res.status(400).send("A field is either missing or is invalid");
      return;
    }

    if (!productId) {
      res.status(400).send("Product id is missing or is invalid");
      return;
    }

    for (const key of keys) {
      await Product.update({ [key]: data[key] }, { where: { id: productId } });
    }

    //* P.S. TALVEZ O ORDER NÃO FUNCIONE PORQUE A TABELA CRIADA NÃO INCLUI O NOVO CAMPO EXPIRES_AT

    // const updatedProduct = keyValues.map(async (key, value) => {
    //   await Product.update({ key: key }, { where: { id: productId } });
    // });

    res.status(204).send("Data updated successfully");
  } catch (error) {
    res
      .status(500)
      .send(`Something went wrong trying to update the product: ${error}`);
  }
};

const increaseStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;

    if (!quantity) {
      res.status(400).send("Quantity is missing");
      return;
    }

    if (!productId) {
      res.status(400).send("Product ID is missing");
      return;
    }

    const updatedStock = await Product.increment("stock", {
      by: quantity,
      where: { id: productId },
    });

    res.status(204).send("The product stock has been incremented");
  } catch (error) {
    res
      .status(500)
      .send(
        `Something went wrong trying to update the stock of the product: ${error}`,
      );
  }
};

const decreaseStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;

    if (!quantity) {
      res.status(400).send("Quantity is missing");
      return;
    }

    if (!productId) {
      res.status(400).send("Product ID is missing");
      return;
    }

    const updatedStock = await Product.decrement("stock", {
      by: quantity,
      where: { id: productId },
    });

    res.status(204).send("The product stock has been decremented");
  } catch (error) {
    res
      .status(500)
      .send(
        `Something went wrong trying to update the stock of the product: ${error}`,
      );
  }
};

const removeProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      res.status(400).send("Product ID is missing");
      return;
    }

    const deleteProduct = await Product.destroy({ where: { id: productId } });

    res.status(204).send("The product stock has been removed");
  } catch (error) {
    res
      .status(500)
      .send(`Something went wrong trying to delete the product: ${error}`);
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  increaseStock,
  decreaseStock,
  removeProduct,
};
