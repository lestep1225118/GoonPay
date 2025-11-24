import "./signup.css";
import { UserPlus } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";

export default function Signup() {
  const { signup } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLocalError("");
    setLocalSuccess("");

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const res = await signup({
      username: form.username,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (!res.ok) {
      setLocalError(res.error);
      return;
    }

    setLocalSuccess(res.message);
    setForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="signup-page">
      <div className="signup-card">

        <div className="signup-header">
          <div className="signup-icon-wrapper">
            <UserPlus className="signup-icon" />
          </div>

          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join GoonPay today</p>
        </div>

        {localError && <div className="alert alert-error">{localError}</div>}
        {localSuccess && <div className="alert alert-success">{localSuccess}</div>}

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
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
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

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            <UserPlus className="icon-sm" />
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        <div className="switch-section">
          <p>Already have an account?</p>
          <Link to="/" className="switch-link">Login</Link>
        </div>

        <div className="info-box">
          <strong>Note:</strong> New accounts start with $1,000.00 virtual balance
        </div>

      </div>
    </div>
  );
}
