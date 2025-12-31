import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Report.css";
import Chart from "react-apexcharts";
import axios from "axios";

export default function Reports() {
  const [filter, setFilter] = useState("month");

  const today = new Date();
  const [year, setYear] = useState(today);
  const [month, setMonth] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [charData, setChartData] = useState([]);

  const token = localStorage.getItem("token");
  // console.log("Token in Report:", token);

  useEffect(()=>{
    if (!token) {
      navigate("/");
    }
  },[]);

  const getPieChartDataforYear = () =>{
   axios.post("http://127.0.0.1:3000/api/report/expense/year",
    {
       "year" : year.getFullYear()
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

  // Chart Data for Month

  const getPieChartDataforMonth = () =>{
    axios.post("http://127.0.0.1:3000/api/report/expense/month",
      {
        "month" : month.getMonth() + 1,
        "year" : month.getFullYear()
      },
      {
        headers : {
          Authorization : `Bearer ${token}`
        }
      })
      .then((res)=>{
        setChartData(res.data.data);
      }).catch((err)=>{
        console.log(err);
      })
  }

  const pieData = {
    labels  : charData.map((item) => item.category),
    datasets : [
      {
        label: "Monthly Expenses",
        data: charData.map((item) => item.total),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#8AFF33",
          "#FF33F6",
          "#33FFF3",
        ],
        borderWidth: 1,
      },
    ],
  }

  const getPieChartDataforDate = () =>{
   axios.post("http://127.0.0.1:3000/api/report/expense/date",
    {
        startDate,
        endDate
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

  const chartOptions = {
  labels: pieData.labels, // categories
  colors: pieData.datasets[0].backgroundColor, // colors
  legend: { position: "bottom" },
  dataLabels: {
    enabled: true
  }
};

const chartSeries = pieData.datasets[0].data; // totals


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
  }, [filter, year, month, startDate,endDate]);

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

    <div style={{ maxWidth: "500px", marginTop: "20px" }}>
      {charData.length === 0 ? (
        <p>No data to display</p>
      ) : (
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="pie"
          width="100%"
        />
      )}
    </div>
    </>
  );
}
