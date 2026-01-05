import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css"; // make sure extension is correct
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState , useEffect} from "react";

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
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          navigate("/");
        } else {
          setError(res.data.msg);
          setShowMsg(true);
          setHide(false);
          return;
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
      <div className="layout-container">
        <aside className="sidebar">
          <div className="sidebar-title">Expense Tracker</div>

          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/report"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              Reports
            </NavLink>

            <NavLink
              to="/bill/generation"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              Expense Bill Generation
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              Profile
            </NavLink>
          </nav>

          <div className="sidebar-logout">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;
