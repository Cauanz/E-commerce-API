const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "postgres://postgres:2456@localhost:5432/e-commerce-api-db",
  {
    logging: false,
  },
);

module.exports = sequelize;
