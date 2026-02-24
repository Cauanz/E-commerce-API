const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize.db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM,
      values: ["pending", "paid", "shipped", "cancelled"],
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    tableName: "orders",
    createdAt: "created_at",
  },
);

module.exports = Order;
