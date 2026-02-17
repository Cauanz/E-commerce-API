const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.db");

const CartItem = sequelize.define(
  "cartItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Cart",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Product",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    original_price: {
      type: DataTypes.DECIMAL,
    },
  },
  {
    tableName: "cartItems",
  },
);

module.exports = CartItem;
