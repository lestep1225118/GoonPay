import React from "react";
import Navbar from "../../components/Navbar/Navbar.jsx";
import "./History.css";

export default function HistoryPage({
  currentUser,
  getUserTransactions,
  handleLogout,
}) {
  const txs = getUserTransactions() || [];

  // All outgoing payments: purchases, rewards you sent, manual transfers
  const outgoing = txs.filter((t) => t.from === currentUser.id);

  // All incoming GoonBucks: rewards received, sales, transfers to you
  const received = txs.filter((t) => t.to === currentUser.id);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const labelForOutgoing = (t) => {
    switch (t.type) {
      case "purchase":
        return "Purchase";
      case "reward":
        return "Reward sent";
      case "transfer":
      default:
        return "GoonBucks sent";
    }
  };

  const labelForIncoming = (t) => {
    switch (t.type) {
      case "purchase":
        return "Sale";
      case "reward":
        return "Class reward";
      case "transfer":
      default:
        return "GoonBucks received";
    }
  };

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

        <div className="history-grid">
          <section className="history-card">
            <h3>GoonBucks Spent (All Outgoing)</h3>
            {outgoing.length === 0 ? (
              <p className="history-empty">
                You haven&apos;t sent any GoonBucks yet.
              </p>
            ) : (
              <ul className="history-list">
                {outgoing.map((t) => (
                  <li key={t.id} className="history-item">
                    <div className="history-item-main">
                      <span className="history-amount negative">
                        -{t.amount} GB
                      </span>
                      <div className="history-text">
                        <p className="history-line-primary">
                          {labelForOutgoing(t)}{" "}
                          {t.listingTitle && t.type === "purchase"
                            ? `- ${t.listingTitle}`
                            : ""}
                          {t.className && (
                            <span className="history-class-tag">
                              {t.className}
                              {t.classCode ? ` (${t.classCode})` : ""}
                            </span>
                          )}
                        </p>
                        <p className="history-line-secondary">
                          {t.note || "No note provided"}
                        </p>
                      </div>
                    </div>
                    <div className="history-meta">
                      <span className="history-date">
                        {formatDate(t.timestamp)}
                      </span>
                      {t.toUsername && (
                        <span className="history-party">
                          to {t.toUsername}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="history-card">
            <h3>GoonBucks Received (All Sources)</h3>
            {received.length === 0 ? (
              <p className="history-empty">
                You haven&apos;t received any GoonBucks yet.
              </p>
            ) : (
              <ul className="history-list">
                {received.map((t) => (
                  <li key={t.id} className="history-item">
                    <div className="history-item-main">
                      <span className="history-amount positive">
                        +{t.amount} GB
                      </span>
                      <div className="history-text">
                        <p className="history-line-primary">
                          {labelForIncoming(t)}{" "}
                          {t.listingTitle && t.type === "purchase"
                            ? `- ${t.listingTitle}`
                            : ""}
                          {t.className && (
                            <span className="history-class-tag">
                              {t.className}
                              {t.classCode ? ` (${t.classCode})` : ""}
                            </span>
                          )}
                        </p>
                        <p className="history-line-secondary">
                          {t.note || "No note provided"}
                        </p>
                      </div>
                    </div>
                    <div className="history-meta">
                      <span className="history-date">
                        {formatDate(t.timestamp)}
                      </span>
                      {t.fromUsername && (
                        <span className="history-party">
                          from {t.fromUsername}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
