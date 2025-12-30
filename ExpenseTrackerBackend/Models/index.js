const User = require("./User");
const Expense = require("./Expense");
const Category = require("./Category");

// 1.User -> Many Expense
User.hasMany(Expense, { foreignKey: "userId" });
Expense.belongsTo(User, { foreignKey: "userId" });

// 2.Category -> Many Expense
Category.hasMany(Expense, { foreignKey: "categoryId" });
Expense.belongsTo(Category, { foreignKey: "categoryId" });

module.exports = {
  User,
  Expense,
  Category,
};
