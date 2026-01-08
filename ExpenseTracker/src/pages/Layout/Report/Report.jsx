import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Report.css";
import Chart from "react-apexcharts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import spendingImg from "../../../assets/spending.png";
import categories from "../../../assets/categories.png";
import Swal from "sweetalert2";

export default function Reports() {
  const [filter, setFilter] = useState("month");

  const today = new Date();
  const [year, setYear] = useState(today);
  const [month, setMonth] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [charData, setChartData] = useState([]);
  const [category, setCategory] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [overallTotal, setOverAllTotal] = useState(0);
  const token = localStorage.getItem("token");

  const [lineChartYear, setLineChartYear] = useState(new Date()); // year selection
  const [lineChartData, setLineChartData] = useState([]);
  const [lineChartSeries, setLineChartSeries] = useState([]);
  const [lineChartOptions, setLineChartOptions] = useState({});

  const [userExpense, setUserExpense] = useState([]);
  const [listPage, setListPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isEdit, setIsEdit] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState(null);

  const [deletedId, setDeletedId] = useState(null);

  const [currentDate, setCurrentDate] = useState({
    month: new Date().getMonth(), // 0-11
    year: new Date().getFullYear(),
  });

  const navigate = useNavigate();

  // Expense form state
  const [expenseFormData, setExpenseFormData] = useState({
    date: "",
    description: "",
    amount: "",
    categoryId: "",
    payment_mode: "",
  });

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

  const closeModal = () => {
    const modalEl = document.getElementById("addExpenseModal");
    const modalInstance = window.bootstrap.Modal.getInstance(modalEl);

    if (modalInstance) {
      modalInstance.hide();
    }
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

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
  });

  // Category form Change Handler
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add Categort API
  const handleCategorySubmit = () => {
    axios
      .post("http://127.0.0.1:3000/api/add/category", categoryForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
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

  const getCategories = () => {
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

  // Start of current month
  const listStartDate = new Date(currentDate.year, currentDate.month, 1);
  listStartDate.setHours(0, 0, 0, 0);

  // End of current month
  const listEndDate = new Date(currentDate.year, currentDate.month + 1, 0);
  listEndDate.setHours(23, 59, 59, 999);

  const getExpenseList = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/expenses",
        {
          listPage,
          startDate: listStartDate,
          endDate: listEndDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
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
      });
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
    getCategories();
    getDataforLineChart();
    getExpenseList();
  }, []);

  useEffect(() => {
    getExpenseList();
  }, [currentDate.month, currentDate.year]);

  const getPieChartDataforYear = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/report/expense/year",
        {
          year: year.getFullYear(),
          filterCategory: filterCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setChartData(res.data.data);
        setOverAllTotal(res.data.overallTotal);
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

  // Chart Data for Month

  const getPieChartDataforMonth = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/report/expense/month",
        {
          month: month.getMonth() + 1,
          year: month.getFullYear(),
          filterCategory: filterCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setChartData(res.data.data);
        setOverAllTotal(res.data.overallTotal);
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

  const getPieChartDataforDate = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/report/expense/date",
        {
          startDate,
          endDate,
          filterCategory: filterCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setChartData(res.data.data);
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

  const getPreviousMonth = () => {
    const now = new Date();
    let month = now.getMonth();
    let year = now.getFullYear();

    if (month === 0) {
      month = 12;
      year = year - 1;
    }

    return { month, year };
  };

  // ---- for Previous Month -----

  const getPieChartDataforPreviousMonth = () => {
    const { month, year } = getPreviousMonth();

    axios
      .post(
        "http://127.0.0.1:3000/api/report/expense/month",
        {
          month,
          year,
          filterCategory: filterCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setChartData(res.data.data);
        setOverAllTotal(res.data.overallTotal);
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
  };

  // ---- for Last Six Month ----

  const getLastSixMonth = () => {
    const today = new Date();

    // End date is today
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    // Start date is 6 months ago
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
  };

  const getPieChartDataforLastSixMonth = () => {
    const { startDate, endDate } = getLastSixMonth();

    axios
      .post(
        "http://127.0.0.1:3000/api/report/expense/date",
        {
          startDate,
          endDate,
          filterCategory: filterCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setChartData(res.data.data);
        setOverAllTotal(res.data.overallTotal);
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

  // ----------- For Last Year ------------

  const getLastYear = () => {
    const today = new Date();
    const last_year = today.getFullYear() - 1;

    return last_year;
  };

  const getPieChartDataforLastYear = () => {
    const last_year = getLastYear();

    axios
      .post(
        "http://127.0.0.1:3000/api/report/expense/year",
        {
          year: last_year,
          filterCategory: filterCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setChartData(res.data.data);
        setOverAllTotal(Number(res.data.overallTotal) || 0);
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
    if (filter === "year") {
      getPieChartDataforYear();
    }

    if (filter === "month") {
      getPieChartDataforMonth();
    }

    if (filter === "date") {
      getPieChartDataforDate();
    }

    if (filter === "previousMonth") {
      getPieChartDataforPreviousMonth();
    }

    if (filter === "sixMonth") {
      getPieChartDataforLastSixMonth();
    }

    if (filter === "lastYear") {
      getPieChartDataforLastYear();
    }
  }, [filter, year, month, startDate, endDate, filterCategory]);

  // 1️⃣ normalize totals (API-safe)
  const overallTotalSafe = Number(overallTotal) || 0;

  // calculate filtered total only when a category is selected
  const filteredTotal =
    filterCategory === "All"
      ? 0
      : charData.reduce((acc, item) => acc + Number(item.total || 0), 0);

  // remaining amount
  const remainingTotal = Math.max(overallTotalSafe - filteredTotal, 0);

  // 2️⃣ base pie data (All categories)
  const pieData = {
    labels: charData.map((item) => item.category),
    data: charData.map((item) => Number(item.total) || 0),
    colors: ["#FF6384", "#36A2EB", "#FFCE56", "#8AFF33", "#FF33F6", "#33FFF3"],
  };

  // 3️⃣ dynamic chart values
  let chartSeries = [];
  let chartLabels = [];
  let chartColors = [];

  if (filterCategory === "All") {
    chartSeries = pieData.data;
    chartLabels = pieData.labels;
    chartColors = pieData.colors;
  } else if (filteredTotal > 0) {
    chartSeries = [filteredTotal, remainingTotal];
    chartLabels = [filterCategory, "Other Expenses"];
    chartColors = ["#36A2EB", "#E0E0E0"];
  } else if (filteredTotal === 0) {
    chartSeries = [filteredTotal, remainingTotal];
    chartLabels = [filterCategory, "Other Expenses"];
    chartColors = ["#36A2EB", "#E0E0E0"];
  }

  // 4️⃣ chart options (ApexCharts)
  const chartOptions = {
    labels: chartLabels,
    colors: chartColors,
    legend: { position: "bottom" },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(2)}%`,
    },
  };

  // --------------------------- Line Chart -----------------------------

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

  // Fetch data from API
  const getDataforLineChart = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:3000/api/expenses/monthly",
        { year: lineChartYear.getFullYear() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLineChartData(res.data.monthlyExpenses || []);
    } catch (err) {
      console.log(err);
      setLineChartData([]); // fallback empty
    }
  };

  // Fetch data when year changes
  useEffect(() => {
    getDataforLineChart();
  }, [lineChartYear]);

  // Build chart series and options dynamically whenever data changes
  useEffect(() => {
    // Prepare monthly totals
    const monthlyTotals = Array(12).fill(0);
    lineChartData.forEach((item) => {
      monthlyTotals[item.month - 1] = Number(item.total);
    });

    // Set series
    setLineChartSeries([
      {
        name: "Monthly Expense",
        data: monthlyTotals,
      },
    ]);

    // Set options dynamically
    setLineChartOptions({
      chart: {
        type: "line",
        toolbar: { show: false },
        foreColor: "#ffffff",
      },
      stroke: {
        curve: "straight",
        width: 2,
      },
      markers: {
        size: 4,
      },
      xaxis: {
        categories: monthNames,
        labels: {
          style: { colors: "#ffffff" },
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => `₹ ${val}`,
          style: { colors: "#ffffff" },
        },
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: (val) => `₹ ${val}`,
        },
      },
      colors: ["#FF6702"],
    });
  }, [lineChartData]); // runs whenever data changes

  // Expense List
  const handleList = (Page) => {
    if (Page === "Next") {
      setListPage((prev) => {
        const nextPage = prev + 1;
        setListPage(nextPage);
        getExpenseList();
      });
    } else if (Page === "Back") {
      setListPage((prev) => {
        if (prev === 1) return prev;
        const prevPage = prev - 1;
        setListPage(prevPage);
        getExpenseList();
      });
    } 
  };

  useEffect(() => {
    getExpenseList();
  }, [listPage]);

  const handleEdit = (expense) => {
    setIsEdit(true);
    setEditExpenseId(expense.id);

    setExpenseFormData({
      date: expense.date.split("T")[0],
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.category?.id,
      payment_mode: expense.payment_mode,
    });
  };

  const handleUpdateExpense = () => {
    axios
      .post(
        `http://127.0.0.1:3000/api/update/expense/${editExpenseId}`,
        expenseFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        getExpenseList();
        getPieChartDataforMonth();
        getDataforLineChart();
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

  // const handleDelete = (id) => {
  //   setDeletedId(id);
  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to delete this expense?"
  //   );

  //   if (!confirmDelete) return;

  //   axios
  //     .post(
  //       `http://127.0.0.1:3000/api/delete/expense/${id}`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       getExpenseList();
  //       getPieChartDataforMonth();
  //       getDataforLineChart();
  //     })
  //     .catch((err) => {
  //       console.error("Delete Expense Error:", err);

  //       if (err.response?.data?.msg === "Invalid token") {
  //         localStorage.removeItem("token");
  //         navigate("/");
  //       }

  //       if (err.response?.status === 401) {
  //         localStorage.removeItem("token");
  //         navigate("/");
  //       }
  //     });
  // };

  const handleDelete = (id) => {
    setDeletedId(id);

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Call delete API
        axios
          .post(`http://127.0.0.1:3000/api/delete/expense/${id}`, {} ,{
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            // console.log(res.data);
            getExpenseList();
            getPieChartDataforMonth();
            getDataforLineChart();

            Swal.fire("Deleted!", "Expense has been deleted.", "success");
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("Error!", "Something went wrong.", "error");
          });
      }
    });
  };
  
  return (
    <>
      <div className="report-page">
        <div className="repor-tpage-graphs">
          <div className="report-header">
            <div className="select-header">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="year">Year</option>
                <option value="month">Month</option>
                <option value="date">Date</option>
                <option value="previousMonth">Previous Month</option>
                <option value="sixMonth">Last 6 Months</option>
                <option value="lastYear">Last Year</option>
              </select>
            </div>
            <div className="filter-inputs">
              {filter === "year" && (
                <DatePicker
                  selected={year}
                  onChange={(date) => setYear(date)}
                  showYearPicker
                  dateFormat="yyyy"
                  className="custom-input"
                />
              )}

              {filter === "month" && (
                <DatePicker
                  selected={month}
                  onChange={(date) => setMonth(date)}
                  showMonthYearPicker
                  dateFormat="MMM     yyyy"
                  className="custom-input"
                />
              )}

              {filter === "date" && (
                <div className="date-range">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Start Date"
                    className="custom-input"
                  />
                  <span>to</span>

                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    endDate={endDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="End Date"
                    className="custom-input"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="charts">
            <div className="select-category">
              <label htmlFor="">Category : </label>
              <select
                className="categorySelector"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Category</option>
                {category.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pieChart">
              <div
                style={{
                  width: "300px",
                  alignItems: "start",
                  height: "350px",
                  maxWidth: "400px",
                  maxHeight: "400px",
                }}
              >
                {chartSeries.length > 0 && (
                  <Chart
                    type="pie"
                    series={chartSeries}
                    options={chartOptions}
                    height="100%"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="line-chart">
          <Chart
            options={lineChartOptions}
            series={lineChartSeries}
            type="line"
            height={400}
            width={700}
          />
        </div>
      </div>

      {/* Add Buttons for Expense */}
      <div className="dashboard-card-expense">
        <div className="dashboard-card-label">Quick Access</div>

        <div className="dashboard-card-all">
          <div className="">
            <button
              className="add-expense-btn"
              data-bs-toggle="modal"
              data-bs-target="#addExpenseModal"
            >
              <img className="quick-access" src={spendingImg} alt="" /> New
              Expense
            </button>
          </div>
          <div>
            <button
              className="add-expense-btn"
              data-bs-toggle="modal"
              data-bs-target="#addCategoryModal"
            >
              <img className="quick-access" src={categories} alt="" /> Category
            </button>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="expense-list">
        <div className="expense-list-header">
          <div className="expense-list-title">
            Expense of {monthNames[currentDate.month]} {currentDate.year}
          </div>
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
            <div className="listPage">Month</div>
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
        </div>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Payment</th>
              <th>Payment Mode</th>
              <th>Action</th>
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
                <td className="table-edit-delete-svg">
                  {/* EDIT */}
                  <svg
                    onClick={() => handleEdit(expense)}
                    data-bs-toggle="modal"
                    data-bs-target="#addExpenseModal"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF6D00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-square-pen"
                  >
                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                  </svg>

                  {/* DELETE */}
                  <svg
                    onClick={() => handleDelete(expense.id)}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="red"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trash-2"
                  >
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="list-icon">
          <button onClick={() => handleList("Back")} disabled={listPage === 1}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF6D00"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-arrow-left-icon lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
          <label htmlFor="">Page</label>
          <button
            onClick={() => handleList("Next")}
            disabled={listPage === totalPages}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF6D00"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-arrow-right-icon lucide-arrow-right"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
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
                {isEdit ? "Update Expense" : "Add New Expense"}
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
                onClick={isEdit ? handleUpdateExpense : handleExoenseFormSubmit}
              >
                {isEdit ? "Update Expense" : "Save Expense"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <div
        className="modal fade"
        id="addCategoryModal"
        tabIndex="-1"
        aria-hidden="true"
      >
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
              <button className="btn btn-secondary" data-bs-dismiss="modal">
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
