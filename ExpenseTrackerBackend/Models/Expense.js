const { DataTypes } = require("sequelize");
const sequelize = require("../Database/db");

const Expense = sequelize.define("Expense", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  payment_mode: {
    type: DataTypes.ENUM,
    values: ["cash", "credit_card", "debit_card", "online_payment"],
    field: "payment_mode",
  },

  userId: {
    // <── USE THIS
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },

  categoryId: {
    // <── USE THIS
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Categories",
      key: "id",
    },
  },
});

module.exports = Expense;
