import "./login.css";
import { LogIn, CreditCard } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";

export default function Login() {
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);

    const res = await login(form.username, form.password);

    setLoading(false);

    if (!res.ok) {
      setLocalError(res.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-icon-wrapper">
            <img src="/logo.png" alt="MoonPay Logo" className="login-icon" style={{ width: '192px', height: '192px', objectFit: 'contain' }} />
          </div>
          <h1 className="login-title">MoonPay</h1>
          <p className="login-subtitle">Reward Transfer System</p>
        </div>

        <div className="login-description">
          <p className="description-text">
            This is a reward system where students can receive moonbucks from professors for rewards and transfer them to professors for rewards.
          </p>
        </div>

        {localError && <div className="alert alert-error">{localError}</div>}

        <form onSubmit={handleSubmit} className="form-section">

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            <LogIn className="icon-sm" />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="switch-section">
          <p>Don't have an account?</p>
          <Link to="/signup" className="switch-link">Create Account</Link>
        </div>

      </div>
    </div>
  );
}
