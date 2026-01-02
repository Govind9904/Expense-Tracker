import React, { useEffect, useState } from "react";
import "./dashboard.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
// For chart rendering
import Chart from "react-apexcharts";
import spendingImg  from "../../../assets/spending.png"
import categories from "../../../assets/categories.png"
import report from "../../../assets/report.png"

export default function Dashboard() {
  const [userExpense, setUserExpense] = useState([]);
  const [showMsg, setShowMsg] = useState(false);
  const [hide, setHide] = useState(false);
  const [error, setError] = useState("");
  const [todayExpense, setTodayExpense] = useState(0);
  const [Monthly_Expense, setMonthly_Expense] = useState(0);
  const [Total_Expense, setTotal_Expense] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [category, setCategory] = useState([]);

  // Pagenation for Page and Limit
  const [listPage, setListPage] = useState(1);
  const [totalPages , setTotalPages] = useState(0);


  const [currentDate, setCurrentDate] = useState({
    month: new Date().getMonth(), // 0-11   
    year: new Date().getFullYear(),
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
  });

  // Expense form state
  const [expenseFormData, setExpenseFormData] = useState({
    date: "",
    description: "",
    amount: "",
    categoryId: "",
    payment_mode: "",
  });

  const navigate = useNavigate();
  const now = new Date();

  // Handle Forward and Backward Month on the Graph

  const handleClickon = (direction) => {
    setCurrentDate(({ month, year }) => {
      let newMonth = month;
      let newYear = year;

      if (direction === "Back") {
        newMonth--;
        if (newMonth < 0) {
          newMonth = 11;
          newYear--;
        }
      } else {
        newMonth++;
        if (newMonth > 11) {
          newMonth = 0;
          newYear++;
        }
      }

      return { month: newMonth, year: newYear };
    });
  };

  // Start of current month
  const startDate = new Date(currentDate.year, currentDate.month, 1);
  startDate.setHours(0, 0, 0, 0);

  // End of current month
  const endDate = new Date(currentDate.year, currentDate.month + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  useEffect(() => {
    if (showMsg) {
      const timer = setTimeout(() => {
        setHide(true);
        setTimeout(() => setShowMsg(false), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showMsg]);

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/");
  }

  // Get Categories

  const getExpenseAndCategories = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/expenses",
        {
          startDate,
          endDate,
          page: "1",
          limit: "5",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res)
        setMonthly_Expense(res.data.monthly_TotalExpense);
      })
      .catch((err) => {
        if (err.response?.data?.msg === "Invalid token") {
          localStorage.removeItem("token");
          navigate("/");
        }
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
      });

    axios
      .post(
        "http://127.0.0.1:3000/api/categories",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setCategory(res.data?.categories);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  };

  // Get Today Expense
  const getTodayExpense = () =>{
    axios.post("http://127.0.0.1:3000/api/today/expense",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setTodayExpense(res.data.todayExpense);
        })
        .catch((err) => {
          console.error("Error fetching categories:", err);
        });
  }

  // Graph Data && Total Monthly Expense API Fetch

  const getGraphData = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/expense/graph",
        {
          startDate,
          endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // console.log(res);
        setGraphData(res.data.graphData);
        setMonthly_Expense(res.data.total_monthlyExpense);
      })
      .catch((err) => {
        if (err.response?.data?.msg === "Invalid token") {
          localStorage.removeItem("token");
          navigate("/");
        }
        if (err.response?.status === 401) {
          setHide(false);
          setError(err.message);
          setShowMsg(true);
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
        // Reset animation first
        setHide(false);
        setShowMsg(false);

        setTimeout(() => {
          setError(err.message || "Something went wrong");
          setShowMsg(true); // trigger animation again
        }, 10);
      });
  };

  // Expense List API

  const getExpenseList = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/expenses",
        {
          listPage,
          startDate,
          endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // console.log("List",res);
        setTotalPages(res.data.totalPages);
        setUserExpense(res.data.expenses);
      })
      .catch((err) => {
        if (err.response?.data?.msg === "Invalid token") {
          localStorage.removeItem("token");
          navigate("/");
        }
        if (err.response?.status === 401) {
          setHide(false);
          setError(err.message);
          setShowMsg(true);
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
        // Reset animation first
        setHide(false);
        setShowMsg(false);

        setTimeout(() => {
          setError(err.message || "Something went wrong");
          setShowMsg(true); // trigger animation again
        }, 10);
      });
  };

  // Get Total Yearly
  const getYearTotal = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/expense/year",
        {
          currentDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        // console.log(res);
        setTotal_Expense(res.data.yearlyTotal);
      })
      .catch((err) => {
        // console.log(err);
      });
  };

  useEffect(() => {
    getExpenseAndCategories();
    getGraphData();
    getExpenseList();
    getYearTotal();
    getTodayExpense();
  }, []);

  useEffect(() => {
    getExpenseAndCategories();
    getGraphData();
    getExpenseList();
    getTodayExpense();
  }, [currentDate.month]);

  useEffect(() => {
    getYearTotal();
  }, [currentDate.year]);
  // Prepare data for bar chart (expenses by day for current month)
  const today = new Date();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonth = currentDate.month;
  const currentYear = currentDate.year;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
  const dayTotals = Array(daysInMonth).fill(0);
  graphData.forEach((expense) => {
    const dateObj = new Date(expense.date);
    if (
      dateObj.getMonth() === currentMonth &&
      dateObj.getFullYear() === currentYear
    ) {
      const day = dateObj.getDate();
      dayTotals[day - 1] += expense.amount;
    }
  });
    const chartSeries = [
      {
        name: "Expense",
        data: dayTotals,
      },
    ];

    const chartOptions = {
      chart: {
        type: "bar",
        toolbar: { show: false },
      },
      xaxis: {
        categories: dayLabels,
        labels : {
          style : {
            colors: "#ffffff",   
          }
        }
     },
      yaxis: {
        labels: {
          style: {
            colors: "#ffffff",   
            fontSize: "12px",
          },
        },
      },
      tooltip: {
        theme: "light", 
        style: {
          fontSize: "12px",
          color : "1fa2ff"
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "70%",
        },
      },
      colors: ["#1fa2ff"],
      dataLabels: { enabled: false },
      // tooltip: { enabled: true },
      title: {
        text: `Expenses by Day (${monthNames[currentMonth]} ${currentYear})`,
        align: "center",
        style : {
          color: "#ffffffff",   
          fontSize: "16px",
          fontWeight: "600",
        }
      },
    };

  // Expense form change handler
  const handleChnageExpense = (e) => {
    const { name, value } = e.target;
    setExpenseFormData((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  // Close Add Expense Modal on successful submission
  const closeModal = () => {
    const modalEl = document.getElementById("addExpenseModal");
    if (!modalEl) return;

    let modal = window.bootstrap.Modal.getInstance(modalEl);
    if (!modal) {
      modal = new window.bootstrap.Modal(modalEl);
    }
    modal.hide();
  };
  // Expense form submit handler
  const handleExoenseFormSubmit = () => {

    axios
      .post("http://127.0.0.1:3000/api/add/expense", expenseFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // Refresh expense list
        setUserExpense((prevExpenses) => [res.data.expense, ...prevExpenses]);
        getExpenseList();
        getExpenseAndCategories();
        getGraphData();
        getTodayExpense();
        // Auto close modal
        closeModal();
        // Reset form
        setExpenseFormData({
          date: "",
          description: "",
          amount: "",
          categoryId: "",
          payment_mode: "",
        });
      })
      .catch((err) => {
        console.error("Error adding expense:", err);
        setHide(false);
        setShowMsg(false);

        setTimeout(() => {
          setError(err.message || "Something went wrong while adding expense");
          setShowMsg(true); // trigger animation again
        }, 10);
      });
  };

  // Category form Change Handler
  const handleCategoryChange = (e) =>{
     const { name , value } = e.target;
     setCategoryForm((prev)=>({
      ...prev,
      [name] : value
     }))
  }

  // Add Categort API
  const handleCategorySubmit = () => {
  axios
    .post(
      "http://127.0.0.1:3000/api/add/category",
      categoryForm,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => {
      // Refresh category list
      setCategory((prev) => [...prev, res.data.category]);

      // Reset form
      setCategoryForm({ name: "" });

      // Close modal
      const modalEl = document.getElementById("addCategoryModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    })
    .catch((err) => {
      setError(err.message || "Failed to add category");
      setShowMsg(true);
      console.log(err);
    });
};



  const handleList = (Page) => {
  if (Page === "Next") {
    setListPage(prev => {
      const nextPage = prev + 1;
      setListPage(nextPage);
      getExpenseList();
    });
  } 
  else if (Page === "Back") {
    setListPage(prev => {
      if (prev === 1) return prev;
      const prevPage = prev - 1;
      setListPage(prevPage);
      getExpenseList();
    });
  } 
  else {
    // console.log(Page);
  }
};

useEffect(() => {
  if (startDate && endDate) {
    getExpenseList();
  }
}, [listPage]);


  return (
    <>
      <div>
        {error && (
          <div
            className={`notification ${showMsg ? "show" : ""} ${
              hide ? "hide" : ""
            }`}
          >
            <p>{error}</p>
            <button className="close-btn" onClick={() => setShowMsg(false)}>
              ×
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}

      <div className="dashboard-content">
        {/* Topbar */}

        {/* Cards */}
        <div className="dashboard-cards">
         
          <div className="dashboard-card">
            <div className="card-label">Today Expense</div>
            <div className="card-value">
              {"\u20B9"} {todayExpense}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-label">Monthly Expense</div>
            <div className="card-value">
              {"\u20B9"} {Monthly_Expense}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-label">Total Expense(Year)</div>
            <div className="card-value">
              {"\u20B9"} {Total_Expense}
            </div>
          </div>

        </div>
        {/* Expense Graph */}
        <div className="dashboard-graph">
          {/* <div className="graph-back-next-btn">
            <button
              className="graph-nav-btn"
              onClick={() => handleClickon("Back")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1fa2ff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-chevron-left-icon lucide-chevron-left"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              className="graph-nav-btn"
              onClick={() => handleClickon("Next")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1fa2ff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-chevron-right-icon lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div> */}
          <Chart
            type="bar"
            options={chartOptions}
            series={chartSeries}
            height={280}
          />
        </div>

        {/* Add Buttons for Expense */}
        <div className="dashboard-card-expense">
          <div className="dashboard-card-label">Quick Access</div>

          <div className="dashboard-card-all">
            <div className="">
             <button className="add-expense-btn" data-bs-toggle="modal" data-bs-target="#addExpenseModal">
               <img className="quick-access" src={spendingImg} alt="" /> New Expense
              </button>
            </div>
            <div>
             <button className="add-expense-btn" data-bs-toggle="modal" data-bs-target="#addCategoryModal">
              <img className="quick-access" src={categories} alt="" />  Category
              </button>
            </div>
            <div>
              <Link to="/report">
                <button className="add-expense-btn">
                  <img className="quick-access" src={report} alt="" />  Report
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="dashboard-expense-list">
          <div className="expense-list-header">
            <div className="expense-list-title">Latest Expense</div>
            {/* <div className="list-icon">
              <button onClick={() => handleList("Back")} disabled={listPage === 1}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1fa2ff"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-arrow-left-icon lucide-arrow-left"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </button>
              <button onClick={() => handleList("Next")} disabled={listPage === totalPages}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1fa2ff"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-arrow-right-icon lucide-arrow-right"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div> */}
          </div>
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payment</th>
                <th>Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {userExpense.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.description}</td>
                  <td>{expense?.category?.name}</td>
                  <td>₹{expense.amount}</td>
                  <td>{expense.payment_mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      {/* Add Expense Bootstrap Modal */}
      <div
        className="modal fade"
        id="addExpenseModal"
        tabIndex="-1"
        aria-labelledby="addExpenseModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title" id="addExpenseModalLabel">
                Add New Expense
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              <form id="expenseForm">
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={expenseFormData.date}
                    onChange={handleChnageExpense}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    name="description"
                    value={expenseFormData.description}
                    onChange={handleChnageExpense}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    value={expenseFormData.amount}
                    onChange={handleChnageExpense}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="categoryId"
                    value={expenseFormData.categoryId}
                    onChange={handleChnageExpense}
                  >
                    <option value="">Select Category</option>
                    {category.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Payment Mode</label>
                  <select
                    className="form-select"
                    name="payment_mode"
                    value={expenseFormData.payment_mode}
                    onChange={handleChnageExpense}
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="online_payment">Online Payment</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExoenseFormSubmit}
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <div className="modal fade" id="addCategoryModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Add Category</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="categoryName"
                  value={categoryForm.name}
                  onChange={handleCategoryChange}
                  placeholder="e.g. Food, Travel"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCategorySubmit}
              >
                Save Category
              </button>
            </div>

          </div>
        </div>
      </div>

    </>
  );
}
