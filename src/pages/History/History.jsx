import Navbar from "../../components/Navbar/Navbar.jsx";
import { History as HistoryIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import "./History.css";

export default function HistoryPage({
  currentUser,
  getUserTransactions,
  handleLogout,
}) {
  const transactions = getUserTransactions();

  return (
    <div className="history-page">
      <Navbar handleLogout={handleLogout} />

      <div className="history-container">
        <div className="history-card">

          <h2 className="history-title">Transaction History</h2>

          {transactions.length === 0 ? (
            <div className="history-empty">
              <HistoryIcon className="history-empty-icon" />
              <p className="history-empty-text">No transactions yet</p>
              <p className="history-empty-sub">
                Start sending money to see your transaction history.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {transactions.map((t) => (
                <div key={t.id} className="history-item">

                  <div className="history-item-top">
                    <div className="history-left">
                      <div
                        className={`history-icon-circle ${
                          t.from === currentUser.id ? "circle-red" : "circle-green"
                        }`}
                      >
                        {t.from === currentUser.id ? (
                          <ArrowUpRight className="history-arrow" />
                        ) : (
                          <ArrowDownLeft className="history-arrow" />
                        )}
                      </div>

                      <div>
                        <p className="history-label">
                          {t.from === currentUser.id
                            ? `Sent to ${t.toUsername}`
                            : `Received from ${t.fromUsername}`}
                        </p>
                        <p className="history-date">
                          {new Date(t.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <p
                      className={`history-amount ${
                        t.from === currentUser.id ? "amount-red" : "amount-green"
                      }`}
                    >
                      {t.from === currentUser.id ? "-" : "+"}${t.amount.toFixed(2)}
                    </p>
                  </div>

                  {t.note && (
                    <div className="history-note">
                      <p><span className="note-bold">Note:</span> {t.note}</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
