import { Link } from "react-router";
import { Home, History, User, LogOut, GraduationCap } from "lucide-react";
import "./Navbar.css";

export default function Navbar({ handleLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <img
            src="/unnamed-removebg-preview.png"
            alt="GoonPay Logo"
            className="navbar-logo-icon"
            style={{ width: "64px", height: "64px", objectFit: "contain" }}
          />
          <h1 className="navbar-title">GoonPay</h1>
        </div>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <Home className="nav-icon" />
            Dashboard
          </Link>

          <Link to="/history" className="nav-link">
            <History className="nav-icon" />
            History
          </Link>

          <Link to="/classes" className="nav-link">
            <GraduationCap className="nav-icon" />
            Classes
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
