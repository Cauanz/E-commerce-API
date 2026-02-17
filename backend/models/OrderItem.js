const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.db");

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Order",
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
  price_at_purchase: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
});

module.exports = OrderItem;
// TODO - COLOCAR ESSE TODO NO FIM QUE TEM QUE REVISAR SE FIZ ISSO DIREITO E REVER OS MODELS
