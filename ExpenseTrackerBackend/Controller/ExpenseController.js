const { User, Category } = require("../Models");
const { Op } = require("sequelize");
const Expense = require("../Models/Expense");
// const { parse } = require("dotenv");

exports.createExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    const { amount, description, date, categoryId, payment_mode } = req.body;

    const newExpense = await Expense.create({
      amount,
      description,
      date,
      userId,
      categoryId,
      payment_mode,
    });

    res.status(201).json({
      message: "Expense created successfully",
      expense: newExpense,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// Get Paginated Expesne List
exports.getExpensesList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, listPage, limit = 5 } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate required" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ msg: "startDate must be before endDate" });
    }

    const offset = (listPage - 1) * limit;

    const { count, rows } = await Expense.findAndCountAll({
      where: {
        userId,
        date: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      },
      include: [
        { model: User, attributes: ["id", "first_name", "last_name"] },
        { model: Category, attributes: ["id", "name"] },
      ],
      limit,
      offset,
      order: [["date", "DESC"]],
    });

    return res.status(200).json({
      expenses: rows,
      currentPage: listPage,
      totalPages: Math.ceil(count / limit),
      totalRecords: count,
      pageSize: limit,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};


// GraphData Api
exports.getGraphData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate required" });
    }

    const monthly_expenses = await Expense.findAll({
      where: {
        userId,
        date: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      },
      order: [["date", "ASC"]],
    });

    const total_monthlyExpense = monthly_expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const year = new Date(startDate).getFullYear();

    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-01`);

    const yearly_total = await Expense.sum("amount", {
      where: {
        userId,
        date: { [Op.between]: [start, end] },
      },
    });

    return res.status(200).json({
      graphData: monthly_expenses,
      total_monthlyExpense: total_monthlyExpense,
      yearly_total: yearly_total,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Monthly Total Expense

exports.getMonthlyTotal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate required" });
    }

    const monthly_expenses = await Expense.sum("amount", {
      where: {
        userId,
        date: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      },
    });

    return res.status(200).json({
      monthlyTotal: monthly_expenses || 0,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Get Yearly  Total
exports.getTotalYearly = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentDate } = req.body;

    if (!currentDate || !currentDate.year) {
      return res.status(400).json({ message: "currentDate.year is required" });
    }

    const year = Number(currentDate.year);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    let yearlyTotal = await Expense.sum("amount", {
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // 🔥 IMPORTANT FIX
    yearlyTotal = yearlyTotal || 0;

    return res.status(200).json({
      userId,
      year,
      yearlyTotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
