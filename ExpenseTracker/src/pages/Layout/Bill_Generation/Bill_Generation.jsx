import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Bill_Generation.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Bill_Generation() {
  const [phase, setPhase] = useState("month");
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [showEntries, setShowEntries] = useState(false);

  const [data,setData] = useState(null);
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  // Get Last Month

  const getLastMonth = () => {
  const today = new Date();

  // First day of current month
  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
    0, 0, 0, 0
  );

  // Last day of previous month
  const endDate = new Date(firstDayOfCurrentMonth);
  endDate.setMilliseconds(-1); // goes to previous month's last millisecond

  // First day of previous month
  const startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    1,
    0, 0, 0, 0
  );

  console.log(startDate,endDate)

  return { startDate, endDate };
};


  // ---- for Last Six Month ---- 
  
  const getLastThreeMonths = () => {
  const today = new Date();

  // First day of current month
  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
    0, 0, 0, 0
  );

  // End date = last day of previous month
  const endDate = new Date(firstDayOfCurrentMonth);
  endDate.setMilliseconds(-1);

  // Start date = first day, 3 months before endDate month
  const startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth() - 2,
    1,
    0, 0, 0, 0
  );

  return { startDate, endDate };
};

  // ---- for Last Six Month ---- 
  
const getLastSixMonth = () => {
  const today = new Date();

  // 1️⃣ First day of current month
  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
    0, 0, 0, 0
  );

  // 2️⃣ End date = last millisecond of previous month
  const endDate = new Date(firstDayOfCurrentMonth);
  endDate.setMilliseconds(-1);

  // 3️⃣ Start date = first day, 6 months before endDate month
  const startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth() - 5,
    1,
    0, 0, 0, 0
  );

  console.log(startDate, endDate);
  return { startDate, endDate };
};


  
  // ----------- For Last Year ------------ 

  const getLastYear = () => {
  const today = new Date();
  const lastYear = today.getFullYear() - 1;

  // Start: Jan 1 of last year
  const startDate = new Date(
    lastYear,
    0, // January
    1,
    0, 0, 0, 0
  );

  // End: Dec 31 of last year
  const endDate = new Date(
    lastYear,
    11, // December
    31,
    23, 59, 59, 999
  );

  console.log(startDate,endDate)
  return { startDate, endDate };
};
  
  
  // Get Last Month Entries 
  const getLastMonthEntries = () => {
    const { startDate , endDate } = getLastMonth();

    axios.post("http://127.0.0.1:3000/api/bill/generate",
     {
        startDate,
        endDate
     },
     {
      headers : {
        Authorization : `Bearer ${token}`
      }
     }).then((res)=>{
        setData(res.data.data);
        console.log(res.data.data)
        setShowEntries(true)
     }).catch((err)=>{
      console.log(err);
    })
  }

  // Get Entries for Last Three Months
    const getLastThreeEntries = () => {
      
      const { startDate , endDate } = getLastThreeMonths();

      console.log(startDate , endDate)
 
    axios.post("http://127.0.0.1:3000/api/bill/generate",
     {
       startDate,
       endDate
     },
     {
      headers : {
        Authorization : `Bearer ${token}`
      }
     }).then((res)=>{
        setData(res.data.data);
        console.log(res.data.data)
        setShowEntries(true)
      }).catch((err)=>{
        console.log(err);
     })
  }

  // Get Last Six Month Entries
  const getLastSixEntries = () => {

  const { startDate , endDate } = getLastSixMonth();
  axios.post("http://127.0.0.1:3000/api/bill/generate",
    {
        startDate,
        endDate
    },
    {
    headers : {
      Authorization : `Bearer ${token}`
    }
    }).then((res)=>{
      setData(res.data.data);
      console.log(res.data.data)
      setShowEntries(true)
    }).catch((err)=>{
    console.log(err);
    })
  }

  const getLastYearEntries = () => {

  const { startDate , endDate } = getLastYear();
  axios.post("http://127.0.0.1:3000/api/bill/generate",
    {
        startDate,
        endDate
    },
    {
    headers : {
      Authorization : `Bearer ${token}`
    }
    }).then((res)=>{
      setData(res.data.data);
      console.log(res.data.data)
      setShowEntries(true)
    }).catch((err)=>{
      console.log(err);
    })
  }

  const getEntries = () => {
    if(phase === "month"){
      getLastMonthEntries();
    }
    if(phase === "3month"){
      getLastThreeEntries();
    }
    if(phase === "6month"){
      getLastSixEntries();
    }
    if(phase === "year"){
      getLastYearEntries();
    }
  }

  const handleDownloadPDF = async () => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/download/pdf",
      { 
        data: data,
        startDate : customStart,
        endDate : customEnd
       }, // your array
      {
        responseType: "blob", // VERY IMPORTANT
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    // 👇 Create PDF file from blob
    const file = new Blob([response.data], {
      type: "text/html",
    });

    // 👇 Create downloadable link
    const fileURL = window.URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = fileURL;
    link.download = "report.pdf";
    document.body.appendChild(link);
    link.click();

    // 👇 Cleanup
    link.remove();
    window.URL.revokeObjectURL(fileURL);

  } catch (error) {
    console.error("PDF download error:", error);
  }
};

  useEffect(()=>{
      if(!token){
        navigate("/");
      }
  })

  return (
    <div className="billgen-fullpage">
      <div className="billgen-topbar">
            <h2>Generate Bill</h2>
        <div className="billgen-period-row">
          <select
            value={phase}
            onChange={e => setPhase(e.target.value)}
            className="billgen-select"
          >
            <option value="month">Past Month</option>
            <option value="3month">Past 3 Months</option>
            <option value="6month">Past 6 Months</option>
            <option value="year">Past Year</option>
            <option value="custom">Custom Range</option>
          </select>
          {phase === 'custom' && (
            <>
              <DatePicker
                selected={customStart}
                onChange={date => setCustomStart(date)}
                dateFormat="dd/MM/yyyy"
                className="billgen-datepicker"
                placeholderText="Start date"
              />
              <DatePicker
                selected={customEnd}
                onChange={date => setCustomEnd(date)}
                dateFormat="dd/MM/yyyy"
                className="billgen-datepicker"
                placeholderText="End date"
              />
            </>
          )}
          <button className="billgen-generate-btn" onClick={getEntries}>
            Generate
          </button>
        </div>
      </div>
      {showEntries && (
        <div className="billgen-entries">
          <h3 className="billgen-entries-title">Expenses  { `${phase}`}</h3>
          <table className="billgen-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment Mode</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, idx) => (
                <tr key={idx}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.category?.name}</td>
                  <td>{entry.description}</td>
                  <td>{entry.payment_mode}</td>
                  <td>₹{entry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="billgen-download-row">
            <button className="billgen-btn billgen-pdf" onClick={()=>{handleDownloadPDF()}} >Download PDF</button>
            <button className="billgen-btn billgen-excel">Download Excel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bill_Generation;