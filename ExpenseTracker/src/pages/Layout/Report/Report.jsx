import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Report.css";
import Chart from "react-apexcharts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { color } from "chart.js/helpers";
import { colors } from "@mui/material";

export default function Reports() {
  const [filter, setFilter] = useState("month");

  const today = new Date();
  const [year, setYear] = useState(today);
  const [month, setMonth] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [charData, setChartData] = useState([]);
  const [category,setCategory] = useState([]);
  const [filterCategory,setFilterCategory] = useState("All");
  const [overallTotal,setOverAllTotal] = useState(0);
  const token = localStorage.getItem("token");

  const [lineChartYear,setLineChartYear] = useState(today);
  const [lineChartData, setLineChartData] = useState([]);
  const [lineChartSeries, setLineChartSeries] = useState([]);

  const navigate = useNavigate();

  
  
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
    });
  }
  
  useEffect(()=>{
    if (!token) {
      navigate("/");
    }

    getCategories();
    getDataforLineChart();
  },[]);

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
      setChartData(res.data.data);
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
        setChartData(res.data.data);
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
      setChartData(res.data.data);
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
      setChartData(res.data.data);
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
      setChartData(res.data.data);
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
        setChartData(res.data.data);
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
        : charData.reduce(
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
      labels: charData.map((item) => item.category),
      data: charData.map((item) => Number(item.total) || 0),
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
    }
    else if (filteredTotal === 0) {
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

    const getDataforLineChart = () => {
      axios.post("http://127.0.0.1:3000/api/expenses/monthly",
        {
          "year" : lineChartYear.getFullYear()
        },
        {
          headers : {
            Authorization : `Bearer ${token}`
          }
        }
      ).then((res)=>{
        setLineChartData(res.data.monthlyExpenses || []);
      }).catch((err)=>{
        console.log(err);
      })
    }

    useEffect(() => {
      getDataforLineChart();
    }, [lineChartYear]);

    useEffect(() => {
      if (lineChartData.length === 0) {
        setLineChartSeries([
          {
            name: "Monthly Expense",
            data: Array(12).fill(0),
          },
        ]);
        return;
      }

      const monthlyTotals = Array(12).fill(0);

      lineChartData.forEach((item) => {
        monthlyTotals[item.month - 1] = Number(item.total);
      });

      setLineChartSeries([
        {
          name: "Expense",
          data: monthlyTotals,
        },
      ]);
    }, [lineChartData]);

    // --- Line Chart Data ----

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

   const lineChartOptions = {
      chart: {
        type: "line",
        toolbar: { show: false },
         foreColor: "#ffffff", 
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      markers: {
        size: 2,
      },
      xaxis: {
        categories: monthNames,
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: (val) => `₹ ${val}`,
          
        },
      },
      colors: ["#FF6702"],
    };

  return (
    <>
    <div className="report-header">
      <div>
        <h3>Filter by</h3>
      </div>
      <div>
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
    </div>
          
    <div className="charts">
      <div>
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
        <div style={{ width: "300px" , alignItems : "start", height : "300px", maxWidth : "500px" , maxHeight : "500px" }}>
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
      {/* Line Chart  */}
      
      <div>
        <Chart
          options={lineChartOptions}
          series={lineChartSeries}
          type="line"
          height={320}
          width={800}
        />
      </div>
    </>
  );
}
