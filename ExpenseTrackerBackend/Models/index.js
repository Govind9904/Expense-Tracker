const User = require("./User");
const Expense = require("./Expense");
const Category = require("./Category");

// 1.User -> Many Expense
User.hasMany(Expense, { foreignKey: "userId" , as : "expenses"});
Expense.belongsTo(User, { foreignKey: "userId",as : "user" });

// 2.Category -> Many Expense
Category.hasMany(Expense, { foreignKey: "categoryId"  , as : "expenses"});
Expense.belongsTo(Category, { foreignKey: "categoryId", as: "category", });

module.exports = {
  User,
  Expense,
  Category,
};
