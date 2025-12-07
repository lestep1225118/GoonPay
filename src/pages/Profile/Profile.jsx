import Navbar from "../../components/Navbar/Navbar.jsx";
import { User as UserIcon } from "lucide-react";
import "./Profile.css";

export default function Profile({
  currentUser,
  getUserTransactions,
  handleLogout,
}) {
  return (
    <div className="profile-page">
      <Navbar handleLogout={handleLogout} />

      <div className="profile-container">
        <div className="profile-card">

          <div className="profile-header">
            <div className="profile-avatar">
              <UserIcon className="profile-avatar-icon" />
            </div>

            <h2 className="profile-username">{currentUser.username}</h2>
            <p className="profile-email">{currentUser.email}</p>
          </div>

          <div className="profile-grid">

            <div className="profile-item">
              <p className="item-label">Reward Balance</p>
              <p className="item-value blue">
                {currentUser.balance.toFixed(2)} goonbucks
              </p>
            </div>

            <div className="profile-item">
              <p className="item-label">User ID</p>
              <p className="item-value mono">{currentUser.id}</p>
            </div>

            <div className="profile-item">
              <p className="item-label">Member Since</p>
              <p className="item-value">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="profile-item">
              <p className="item-label">Total Transactions</p>
              <p className="item-value">
                {getUserTransactions().length}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
