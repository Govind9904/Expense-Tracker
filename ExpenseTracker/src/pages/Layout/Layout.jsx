// Layout.jsx
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Layout.css"; // Sidebar + Layout CSS

function Layout() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [showMsg, setShowMsg] = useState(false);
  const [hide, setHide] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    axios
      .post(
        "http://127.0.0.1:3000/api/logout",
        {},
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          navigate("/");
        } else {
          setError(res.data.msg);
          setShowMsg(true);
          setHide(false);
        }
      })
      .catch((err) => {
        console.error("Logout Error:", err);
        setError(err.message);
        setShowMsg(true);
        setHide(false);
      });
  };

  useEffect(() => {
    if (showMsg) {
      const timer = setTimeout(() => {
        setHide(true);
        setTimeout(() => setShowMsg(false), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showMsg]);

  return (
    <div className="layout-container">
      {/* Notification */}
      {error && (
        <div className={`notification ${showMsg ? "show" : ""} ${hide ? "hide" : ""}`}>
          <p>{error}</p>
          <button className="close-btn" onClick={() => setShowMsg(false)}>×</button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-title">Expense Tracker</div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
          <NavLink to="/report" className={({ isActive }) => isActive ? "active" : ""}>Reports</NavLink>
          <NavLink to="/bill/generation" className={({ isActive }) => isActive ? "active" : ""}>Expense Generation</NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
