import React, { useEffect, useState } from "react";
import "./dashboard.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// For chart rendering
import Chart from "react-apexcharts";


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



  // Pie Chart Data
  const [pieCharData, setPieChartData] = useState([]);
  const [pieCategory,setPieCategory] = useState([]);
  const [filterCategory,setFilterCategory] = useState("All");
  const [overallTotal,setOverAllTotal] = useState(0);
  const [filter, setFilter] = useState("month");
   const today = new Date();
  const [year, setYear] = useState(today);
  const [month, setMonth] = useState(today);

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
        console.log("List",res);
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

 

useEffect(() => {
  if (startDate && endDate) {
    getExpenseList();
  }
}, [listPage]);


// Pie Chart API or Functions for Data

  const getPieChartDataforYear = () =>{
   
    axios.post("http://127.0.0.1:3000/api/report/expense/year",
    {
       "year" : year.getFullYear(),
       "filterCategory" : filterCategory
    },
    {
       headers : {
        Authorization : `Bearer ${token}`
       }
    })
    .then((res)=>{
      setPieChartData(res.data.data);
      setOverAllTotal(res.data.overallTotal);
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  // Chart Data for Month

  const getPieChartDataforMonth = () =>{
    axios.post("http://127.0.0.1:3000/api/report/expense/month",
      {
        "month" : month.getMonth() + 1,
        "year" : month.getFullYear(),
        "filterCategory" : filterCategory
      },
      {
        headers : {
          Authorization : `Bearer ${token}`
        }
      })
      .then((res)=>{
        setPieChartData(res.data.data);
        setOverAllTotal(res.data.overallTotal);
      }).catch((err)=>{
        console.log(err);
      })
  }

  
  const getPieChartDataforDate = () =>{
    axios.post("http://127.0.0.1:3000/api/report/expense/date",
      {
        startDate,
        endDate,
        "filterCategory" : filterCategory
      },
      {
        headers : {
          Authorization : `Bearer ${token}`
        }
    })
    .then((res)=>{
      setPieChartData(res.data.data);
    })
    .catch((err)=>{
      console.log(err);
    })
  }

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

  const getPieChartDataforPreviousMonth = () =>{
    const {month ,year } = getPreviousMonth();

   axios.post("http://127.0.0.1:3000/api/report/expense/month",
    {
        month,
        year,
        "filterCategory" : filterCategory
    },
    {
       headers : {
        Authorization : `Bearer ${token}`
       }
    })
    .then((res)=>{
      setPieChartData(res.data.data);
      setOverAllTotal(res.data.overallTotal);
    })
    .catch((err)=>{
      if(err.status === 403){
        navigate("/");
      }else{
        console.log(err);
      }
    })
  }
  
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
  }

  const getPieChartDataforLastSixMonth = () =>{

    const { startDate, endDate } = getLastSixMonth();

    axios.post("http://127.0.0.1:3000/api/report/expense/date",
    {
        startDate,
        endDate,
        "filterCategory" : filterCategory
    },
    {
       headers : {
        Authorization : `Bearer ${token}`
       }
      })
      .then((res)=>{
      setPieChartData(res.data.data);
      setOverAllTotal(res.data.overallTotal);
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  // ----------- For Last Year ------------ 

  const getLastYear = () => {
    
    const today = new Date();
    const last_year = today.getFullYear() - 1;

    return last_year;
  }


  const getPieChartDataforLastYear = () =>{
   
   const last_year= getLastYear();

    axios.post("http://127.0.0.1:3000/api/report/expense/year",
    {
      "year" : last_year,
      "filterCategory" : filterCategory
    },
    {
       headers : {
        Authorization : `Bearer ${token}`
       }
      })
      .then((res)=>{
        setPieChartData(res.data.data);
        setOverAllTotal(Number(res.data.overallTotal) || 0);
      })
      .catch((err)=>{
        console.log(err);
      })
    }

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
  
    if(filter === "previousMonth"){
      getPieChartDataforPreviousMonth();
    }
    
    if(filter === "sixMonth"){
      getPieChartDataforLastSixMonth();
    }
    
    if(filter === "lastYear"){
      getPieChartDataforLastYear();
    }
  }, [filter, year, month, startDate,endDate,filterCategory]);

   // 1️⃣ normalize totals (API-safe)
      const overallTotalSafe = Number(overallTotal) || 0;
  
      // calculate filtered total only when a category is selected
      const filteredTotal =
        filterCategory === "All"
          ? 0
          : pieCharData.reduce(
              (acc, item) => acc + Number(item.total || 0),
              0
            );
  
      // remaining amount
      const remainingTotal = Math.max(
        overallTotalSafe - filteredTotal,
        0
      );
  
  
      // 2️⃣ base pie data (All categories)
      const pieData = {
        labels: pieCharData.map((item) => item.category),
        data: pieCharData.map((item) => Number(item.total) || 0),
        colors: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#8AFF33",
          "#FF33F6",
          "#33FFF3",
        ],
      };
  
      // 3️⃣ dynamic chart values
      let pieChartSeries = [];
      let chartLabels = [];
      let chartColors = [];
  
      if (filterCategory === "All") {
        pieChartSeries = pieData.data;
        chartLabels = pieData.labels;
        chartColors = pieData.colors;
      } else if (filteredTotal > 0) {
        pieCharData = [filteredTotal, remainingTotal];
        chartLabels = [filterCategory, "Other Expenses"];
        chartColors = ["#36A2EB", "#E0E0E0"];
      }
      else if (filteredTotal === 0) {
        pieChartSeries = [filteredTotal, remainingTotal];
        chartLabels = [filterCategory, "Other Expenses"];
        chartColors = ["#36A2EB", "#E0E0E0"];
      }
  
      // 4️⃣ chart options (ApexCharts)
      const pieChartOptions = {
        labels: chartLabels,
        colors: chartColors,
        legend: { position: "bottom" },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val.toFixed(2)}%`,
        },
      };
  
  

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
                  <select className="categorySelector" onChange={(e)=>setFilterCategory(e.target.value)}>
                    <option value="All">All Category</option>
                    {category.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="pieChart">
                  <div style={{ width: "350px" , alignItems : "start", height : "390px", maxWidth : "500px" , maxHeight : "500px" }}>
                    {chartSeries.length > 0 && (
                      <Chart
                        type="pie"
                        series={pieChartSeries}
                        options={pieChartOptions}
                        height="100%"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
    </>
  );
}
