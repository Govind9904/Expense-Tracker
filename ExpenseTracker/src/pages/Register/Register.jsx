import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./register.css";

export default function Register() {
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone:"",
    address : "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [hide, setHide] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setError("");
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

  const validate = () => {
    if (!data.first_name.trim() || !data.last_name.trim())
      return "Please enter your full name.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email))
      return "Please enter a valid email address.";
    if (data.password.length < 6)
      return "Password must be at least 6 characters.";
    if (data.password !== data.confirm_password)
      return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const clientError = validate();
    if (clientError) {
      setHide(false);
      setShowMsg(false);
      setTimeout(() => {
        setError(clientError);
        setShowMsg(true);
      }, 10);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        navigate("/");
      } else {
        setHide(false);
        setShowMsg(false);
        setTimeout(() => {
          setError(result.error);
          setShowMsg(true);
        }, 10);
      }
    } catch (err) {
      setHide(false);
      setShowMsg(false);
      setTimeout(() => {
        setError(err?.message);
        setShowMsg(true);
      }, 10);
    } finally {
      setLoading(false);
    }
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

      <div className="register-bg">
        <div className="register-container">
          <aside className="register-side">
            <img
              src="/src/assets/best-budget-expense-tracker-app-for-iphone.png"
              alt="app"
              className="side-illustration"
            />
            <h2 className="side-title">ExpenseTracker</h2>
            <p className="side-sub">
              Smart budgeting · Clear insights · Secure
            </p>
            <ul className="side-features">
              <li>Quick expense logging</li>
              <li>Visual charts & trends</li>
              <li>Secure local data</li>
            </ul>
          </aside>

          <main className="register-card">
            <div className="register-header">
              <h3 className="register-title">Create your account</h3>
              <p className="register-desc">
                Start managing your money better in minutes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              <div className="name-row">
                <div className="register-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="John"
                    value={data.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="register-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Doe"
                    value={data.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="register-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="name-row">
                <div className="register-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="phone"
                    value={data.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="register-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="address"
                    value={data.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="register-group password-group">
                <label>Password</label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 6 characters"
                    value={data.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="register-group password-group">
                <label>Confirm Password</label>
                <div className="password-field">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm_password"
                    placeholder="Re-type your password"
                    value={data.confirm_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Button */}
              <button className="register-btn" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Create Account"}
              </button>

              {/* Footer */}
              <p className="register-footer">
                Already have an account? <Link to="/">Log In</Link>
              </p>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}
