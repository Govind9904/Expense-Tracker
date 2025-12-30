import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Report.css";

export default function Reports() {
  const [filter, setFilter] = useState("month");

  const today = new Date();
  const [year, setYear] = useState(today);
  const [month, setMonth] = useState(today);
  const [date, setDate] = useState(today);

  return (
    <div className="report-header">
      <h3>Filter by</h3>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="year">Year</option>
        <option value="month">Month</option>
        <option value="date">Date</option>
      </select>

      <div className="filter-inputs">

        {/* YEAR */}
        {filter === "year" && (
          <DatePicker
            selected={year}
            onChange={(date) => setYear(date)}
            showYearPicker
            dateFormat="yyyy"
            className="custom-input"
          />
        )}

        {/* MONTH */}
        {filter === "month" && (
          <DatePicker
            selected={month}
            onChange={(date) => setMonth(date)}
            showMonthYearPicker
            dateFormat="MMM     yyyy"   // 👈 THIS IS THE KEY
            className="custom-input"
          />
        )}

        {/* DATE */}
        {filter === "date" && (
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
            dateFormat="dd/MM/yyyy"
            className="custom-input"
          />
        )}

      </div>
    </div>
  );
}
