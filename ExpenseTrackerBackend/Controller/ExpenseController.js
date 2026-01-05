const { User, Category } = require("../Models");
const { Op, fn, col } = require("sequelize");
const Expense = require("../Models/Expense");
const sequelize = require("../Database/db");
const PDFDocument = require("pdfkit");
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

exports.getTodayExpense = async (req,res) => {
  try{
      const userId = req.user.id;

      // Start of today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // End of today
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const todayExpense = await Expense.sum("amount",{
        where : {
          userId,
          date : {
            [Op.between]: [startOfDay, endOfDay],
          }
        }
      });

      return res.status(200).json({
        todayExpense : todayExpense || 0,
      })
    }catch(err){
      return res.status(500).json({
        error : err
      })
    }
}

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
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name"],
        },
        { model: Category, as: "category", attributes: ["id", "name"] },
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

// ------ Report Page ------

// ------- Get Year Total Expense for Report Page -------
exports.getYearlyTotalforReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year , filterCategory } = req.body;

    if (!year) {
      return res.status(400).json({ message: "year is required" });
    }

    const totalyear = Number(year);

    const startDate = new Date(totalyear, 0, 1);
    const endDate = new Date(totalyear, 11, 31, 23, 59, 59);


    const overallTotal = await Expense.sum("amount", {
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] },
      },
    });

    // ✅ correct include
    const categoryInclude = {
      model: Category,
      as: "category",
      attributes: [],
      required: true, // 🔥 MUST
    };

    // ✅ apply filter correctly
    if (filterCategory && filterCategory !== "All") {
      categoryInclude.where = {
        name: filterCategory,
      };
    }

    const data = await Expense.findAll({
      attributes: [
        [col("category.name"), "category"],
        [fn("SUM", col("Expense.amount")), "total"],
      ],
      include: [categoryInclude],
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] },
      },
      group: ["category.name"],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      year,
      data,
      overallTotal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// -------- Get Selected Month Data for Pie Chart ------------

exports.getSelectedMonthDataforChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year, filterCategory } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const overallTotal = await Expense.sum("amount", {
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] },
      },
    });

    // ✅ correct include
    const categoryInclude = {
      model: Category,
      as: "category",
      attributes: [],
      required: true, // 🔥 MUST
    };

    // ✅ apply filter correctly
    if (filterCategory && filterCategory !== "All") {
      categoryInclude.where = {
        name: filterCategory,
      };
    }

    const data = await Expense.findAll({
      attributes: [
        [col("category.name"), "category"],
        [fn("SUM", col("Expense.amount")), "total"],
      ],
      include: [categoryInclude],
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] },
      },
      group: ["category.name"],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      month,
      year,
      filterCategory,
      data,
      overallTotal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ------ Date Chart ----- 

exports.getSelectedDateDateforChart = async (req,res) =>{
  try {
  const userId = req.user.id;
  const { startDate, endDate , filterCategory } = req.body;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate and endDate are required" });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const overallTotal = await Expense.sum("amount", {
    where: {
      userId,
      date: { [Op.between]: [start, end] },
    },
  });

  // ✅ correct include
  const categoryInclude = {
    model: Category,
    as: "category",
    attributes: [],
    required: true, // 🔥 MUST
  };

  // ✅ apply filter correctly
  if (filterCategory && filterCategory !== "All") {
    categoryInclude.where = {
      name: filterCategory,
    };
  }

  const data = await Expense.findAll({
    attributes: [
      [col("category.name"), "category"],
      [fn("SUM", col("Expense.amount")), "total"],
    ],
    include:[categoryInclude],
    where: {
      userId,
      date: { [Op.between]: [start, end] },
    },
    group: ["category.name"],
    raw: true,
  });

  return res.status(200).json({
    success: true,
    startDate,
    endDate,
    data,
    overallTotal
  });
  } catch (err) {
  console.error("Date range report error:", err);
  res.status(500).json({ error: err.message });
  }
}

// ---- Get MonthlyData for Line Chart -----

exports.getMonthlyDataforYear = async (req,res) => {
  try{
  const userId = req.user.id;
  const { year }  = req.body;

    const monthlyExpenses = await Expense.findAll({
      attributes : [
        [sequelize.fn("MONTH" , sequelize.col("date")),"month"],
        [sequelize.fn("SUM" , sequelize.col("amount")), "total"],
      ],
      where : {
        userId,
        date :{
          [Op.between] :[
            new Date(year,0, 1),
            new Date(year, 11, 31, 23, 59, 59),
          ],
        },
      },
      group :["month"],
      order :[[sequelize.literal("month"),"ASC"]],
    });
    return res.status(200).json({ monthlyExpenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 


// --------------------- Bill Generation ----------------

exports.getEntriesforBill = async (req,res) => {
  const userId = req.user.id;
  const { startDate , endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required"
      });
    }

    const entries =await Expense.findAll({
    where : {
      userId,
      date : {
        [Op.between] : [
          startDate,endDate
        ]
      }
    },
    include : [
      {
        model :User,
        as : "user",
        attributes: ["id", "first_name", "last_name"],
      },
      {
        model : Category,
        as : "category",
        attributes : ["id","name"]
      }
    ]
  });

  res.status(200).json({
    data : entries,
    success : true
  })
}


// --------------- Download PDF ---------------

exports.downloadPdf = async (req, res) => {
};

