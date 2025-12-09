import React from "react";
import Navbar from "../../components/Navbar/Navbar.jsx";
import "./History.css";

export default function HistoryPage({
  currentUser,
  getUserTransactions,
  handleLogout,
}) {
  const txs = getUserTransactions() || [];

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDescription = (t) => {
    return t.note || "No note provided";
  };

  // Combine all transactions and sort by date (most recent first)
  const allTransactions = txs
    .map((t) => ({
      ...t,
      isIncoming: t.to === currentUser.id,
      amount: t.amount,
      timestamp: t.timestamp,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA; // Most recent first
    });

  return (
    <div className="history-page">
      <Navbar handleLogout={handleLogout} />

      <div className="history-container">
        <header className="history-header">
          <h2>GoonBucks History</h2>
          <p>
            See every GoonBucks payment you&apos;ve made or received across all
            classes.
          </p>
        </header>

        <div className="history-card">
          {allTransactions.length === 0 ? (
            <p className="history-empty">
              No transaction history yet.
            </p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th className="history-th-date">Date</th>
                  <th className="history-th-description">Description</th>
                  <th className="history-th-amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions.map((t) => (
                  <tr key={t.id} className="history-row">
                    <td className="history-td-date">
                      <div className="history-date-cell">
                        <span className="history-date-main">{formatDate(t.timestamp)}</span>
                        <span className="history-time">{formatTime(t.timestamp)}</span>
                      </div>
                    </td>
                    <td className="history-td-description">
                      {getDescription(t)}
                    </td>
                    <td className="history-td-amount">
                      <span className={`history-amount ${t.isIncoming ? "positive" : "negative"}`}>
                        {t.isIncoming ? "+" : "-"}{t.amount} goonbucks
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
