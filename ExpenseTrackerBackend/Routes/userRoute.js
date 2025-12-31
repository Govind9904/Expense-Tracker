const express = require("express");
const router = express.Router();

const userController = require("../Controller/userController.js");
const CategoryController = require("../Controller/CategoryController.js");
const ExpenseController = require("../Controller/ExpenseController.js");
const { authenticateToken } = require("../Middleware/Auth.js");

// Category Route

router.post("/add/category",authenticateToken,CategoryController.createCategory);
router.post("/categories",authenticateToken,CategoryController.getAllCategories);

// Expense Routes

// Paginated Expense
router.post("/expenses", authenticateToken, ExpenseController.getExpensesList);

// GraphData Expense List
router.post("/expense/graph",authenticateToken,ExpenseController.getGraphData);

// Expense by Month
router.post("/expense/month",authenticateToken,ExpenseController.getMonthlyTotal);

// get Yearly Expense
router.post("/expense/year",authenticateToken,ExpenseController.getTotalYearly);

// add Expense
router.post("/add/expense", authenticateToken, ExpenseController.createExpense);

// router.post('/expenses/monthly',authenticateToken,ExpenseController.getTotalExpensebyDate);

router.post("/report/expense/year",authenticateToken,ExpenseController.getYearlyTotalforReport);
router.post("/report/expense/month",authenticateToken,ExpenseController.getSelectedMonthDataforChart);
router.post("/report/expense/date",authenticateToken,ExpenseController.getSelectedDateDateforChart);

router.post("/register", userController.register);
router.post("/login", userController.login);


// -------------- Report Page Route -----------------


// Logout Route
router.post("/logout", authenticateToken, userController.logut);

module.exports = router;
