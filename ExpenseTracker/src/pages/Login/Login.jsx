import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setHide(true); // Start fade-out
        setTimeout(() => setShowMsg(false), 500); // Remove box after fade-out
      }, 2000); // Show message for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showMsg]);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email))
      return "Please enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const clientError = validate();
    if (clientError) {
      setError(clientError);
      setShowMsg(true);
      setHide(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 200) {
        if (result.token) localStorage.setItem("token", result.token);
        navigate("/dashboard");
        console.log(response);
      } else {
        setHide(false);
        setShowMsg(false);
        setTimeout(() => {
          setError(result.msg);
          setShowMsg(true);
        }, 10);
      }
    } catch (err) {
      setHide(false);
      setShowMsg(false);
      setTimeout(() => {
        setError(err);
        setShowMsg(true);
      }, 10);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
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
      <div className="login-container">
        <aside className="login-side">
          <img
            src="/src/assets/best-budget-expense-tracker-app-for-iphone.png"
            alt="app"
            className="side-illustration"
          />
          <h2 className="side-title">ExpenseTracker</h2>
          <p className="side-sub">Smart budgeting · Clear insights · Secure</p>
          <ul className="side-features">
            <li>Quick expense logging</li>
            <li>Visual charts & trends</li>
            <li>Secure local data</li>
          </ul>
        </aside>

        <main className="login-card">
          <div className="login-header">
            <h3 className="login-title">Welcome back</h3>
            <p className="login-desc">Log in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-group">
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

            <div className="login-group password-group">
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Button */}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Footer */}
            <p className="login-footer">
              Don’t have an account? <Link to="/register">Register</Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
