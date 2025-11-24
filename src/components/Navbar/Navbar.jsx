import { Link } from "react-router";
import { Home, Send, History, User, LogOut, CreditCard } from "lucide-react";
import "./Navbar.css";

export default function Navbar({ handleLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <div className="navbar-logo">
          <CreditCard className="navbar-logo-icon" />
          <h1 className="navbar-title">GoonPay</h1>
        </div>

        <div className="navbar-links">

          <Link to="/" className="nav-link">
            <Home className="nav-icon" />
            Dashboard
          </Link>

          <Link to="/send" className="nav-link">
            <Send className="nav-icon" />
            Send
          </Link>

          <Link to="/history" className="nav-link">
            <History className="nav-icon" />
            History
          </Link>

          <Link to="/profile" className="nav-link">
            <User className="nav-icon" />
            Profile
          </Link>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut className="nav-icon red-icon" />
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}
