import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Bill_Generation.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Bill_Generation() {
  const [phase, setPhase] = useState('month');
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [showEntries, setShowEntries] = useState(false);

  const [data,setData] = useState(null);
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const getEntries = () => {
    axios.post("http://127.0.0.1:3000/api/bill/generate",
     {
        startDate : customStart,
        endDate : customEnd
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

  const handleDownloadPDF = () =>{
    axios.post("http://127.0.0.1:3000/api/download/pdf",
      {
        data
      },
      {
        responseType : "blob"
      
      }).then((res)=>{
        console.log(res);
      }).catch((err)=>{
        console.log(err);
      })
  }

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
                dateFormat="yyyy-MM-dd"
                className="billgen-datepicker"
                placeholderText="Start date"
              />
              <DatePicker
                selected={customEnd}
                onChange={date => setCustomEnd(date)}
                dateFormat="yyyy-MM-dd"
                className="billgen-datepicker"
                placeholderText="End date"
              />
            </>
          )}
          <button className="billgen-generate-btn" onClick={() => getEntries()}>
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
                  <td>{entry.date}</td>
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