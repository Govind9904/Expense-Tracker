import React, { useEffect, useState } from "react";
import "./dashboard.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// For chart rendering
import Chart from "react-apexcharts";
import { color } from "chart.js/helpers";

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
  const [totalPages, setTotalPages] = useState(0);

  const today = new Date();

  const [currentDate, setCurrentDate] = useState({
    month: new Date().getMonth(), // 0-11
    year: new Date().getFullYear(),
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
  };

  // Get Today Expense
  const getTodayExpense = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/today/expense",
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
  };

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
        console.log("List", res);
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
        setTotal_Expense(res.data.yearlyTotal);
      })
      .catch((err) => {
        console.log(err);
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
  // const today = new Date();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
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
      labels: {
        style: {
          colors: "#ffffff",
        },
      },
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
      theme: "dark",
      style: {
        fontSize: "12px",
        color: "1fa2ff",
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "70%",
      },
    },
    colors: ["#FF6D00"],
    dataLabels: { enabled: false },
    // tooltip: { enabled: true },
    title: {
      text: `Expenses by Day (${monthNames[currentMonth]} ${currentYear})`,
      align: "center",
      style: {
        color: "#ffffffff",
        fontSize: "16px",
        fontWeight: "600",
      },
    },
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
          <div className="graph-back-next-btn">
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
                stroke="#FF6D00"
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
                stroke="#FF6D00"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-chevron-right-icon lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
          <Chart
            type="bar"
            options={chartOptions}
            series={chartSeries}
            height={280}
          />
        </div>

        {/* Expense List */}
        <div className="dashboard-expense-list">
          <div className="expense-list-header">
            <div className="expense-list-title">Latest Expense</div>
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
    </>
  );
}
