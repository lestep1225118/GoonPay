import { Send, History, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Link } from "react-router";
import Navbar from "../../components/Navbar/Navbar.jsx";
import "./Dashboard.css";

export default function Dashboard({ currentUser, getUserTransactions, handleLogout }) {
  const recent = getUserTransactions().slice(0, 5);

  return (
    <div className="dashboard-page">
      <Navbar handleLogout={handleLogout} />

      <div className="dashboard-container">

        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-card-inner">
            <div>
              <p className="balance-label">Available Balance</p>
              <h2 className="balance-amount">${currentUser.balance.toFixed(2)}</h2>
              <p className="balance-welcome">
                Welcome back, {currentUser.username}!
              </p>
            </div>
            <DollarSign className="balance-icon" />
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="quick-grid">
          <div className="quick-card">
            <h3 className="quick-title">Quick Send</h3>
            <Link to="/send" className="quick-button primary">
              <Send className="icon-sm" />
              Send Money
            </Link>
          </div>

          <div className="quick-card">
            <h3 className="quick-title">Recent Activity</h3>
            <Link to="/history" className="quick-button secondary">
              <History className="icon-sm" />
              View History
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-card">
          <h3 className="recent-title">Recent Transactions</h3>

          {recent.length === 0 ? (
            <p className="no-transactions">No transactions yet</p>
          ) : (
            <div className="recent-list">
              {recent.map((t) => (
                <div key={t.id} className="transaction-row">

                  <div className="transaction-left">
                    {t.from === currentUser.id ? (
                      <div className="circle red">
                        <ArrowUpRight className="icon-sm red-text" />
                      </div>
                    ) : (
                      <div className="circle green">
                        <ArrowDownLeft className="icon-sm green-text" />
                      </div>
                    )}

                    <div>
                      <p className="transaction-name">
                        {t.from === currentUser.id
                          ? `To ${t.toUsername}`
                          : `From ${t.fromUsername}`}
                      </p>
                      <p className="transaction-date">
                        {new Date(t.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p
                    className={
                      t.from === currentUser.id
                        ? "transaction-amount red-text"
                        : "transaction-amount green-text"
                    }
                  >
                    {t.from === currentUser.id ? "-" : "+"}${t.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
