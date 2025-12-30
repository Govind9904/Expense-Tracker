const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ExpenseTracker", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("MySQL Connected successfully"))
  .catch((err) => console.log("DB Error:", err));

module.exports = sequelize;
