import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar/Navbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Dashboard.css";

export default function Dashboard({
  currentUser: _ignoredCurrentUserProp,
  getUserTransactions,
  handleLogout,
}) {
  const { currentUser, token, API_BASE } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState("");

  const transactions = getUserTransactions ? getUserTransactions() : [];

  useEffect(() => {
    if (!token) {
      setClasses([]);
      setLoadingClasses(false);
      return;
    }

    const fetchClasses = async () => {
      setLoadingClasses(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data.error || "Failed to load classes");
        }
        setClasses(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Dashboard classes error:", err);
        setError(err.message || "Failed to load classes");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [token, API_BASE]);

  const selectedClass =
    classes.length > 0 && selectedIndex >= 0 && selectedIndex < classes.length
      ? classes[selectedIndex]
      : null;

  const handleClassChange = (e) => {
    setSelectedIndex(Number(e.target.value));
  };

  const handleGoToClass = () => {
    if (!selectedClass) return;
    navigate(`/classes/${selectedClass.classId || selectedClass.id}`);
  };

  const recentTxs = transactions.slice(0, 5);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div className="dashboard-page">
      <Navbar handleLogout={handleLogout} />

      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h2>Welcome, {currentUser?.username || "Goon"}</h2>
            <p>
              Track your GoonBucks in each class and jump straight into your
              class marketplace.
            </p>
          </div>
        </header>

        {error && <div className="dashboard-error">{error}</div>}

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <h3>Your Class Balances</h3>

            {loadingClasses ? (
              <p className="dashboard-empty">Loading your classes...</p>
            ) : classes.length === 0 ? (
              <div className="dashboard-empty">
                <p>You&apos;re not in any classes yet.</p>
                <p className="dashboard-empty-sub">
                  Join a class with a code or create one from the Classes tab.
                </p>
                <button
                  className="dashboard-primary-btn"
                  onClick={() => navigate("/classes")}
                >
                  Go to Classes
                </button>
              </div>
            ) : (
              <>
                <div className="dashboard-class-selector">
                  <label htmlFor="classSelect">Selected class</label>
                  <select
                    id="classSelect"
                    value={selectedIndex}
                    onChange={handleClassChange}
                  >
                    {classes.map((c, idx) => (
                      <option key={c.classId || c.id} value={idx}>
                        {c.name} {c.code ? `(${c.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClass && (
                  <div className="dashboard-balance-card">
                    <div className="dashboard-balance-main">
                      <p className="dashboard-balance-label">
                        GoonBucks in this class
                      </p>
                      <p className="dashboard-balance-value">
                        {selectedClass.balance ?? 0}
                      </p>
                    </div>
                    <p className="dashboard-balance-classname">
                      {selectedClass.name}
                    </p>
                    <button
                      className="dashboard-primary-btn"
                      onClick={handleGoToClass}
                    >
                      Go to this class
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="dashboard-card">
            <h3>Recent GoonBucks Activity</h3>
            {recentTxs.length === 0 ? (
              <p className="dashboard-empty">
                No recent GoonBucks activity yet.
              </p>
            ) : (
              <ul className="dashboard-tx-list">
                {recentTxs.map((t) => {
                  const incoming = t.to === currentUser?.id;
                  const sign = incoming ? "+" : "-";
                  const amountClass = incoming
                    ? "dashboard-amount positive"
                    : "dashboard-amount negative";

                  return (
                    <li key={t.id} className="dashboard-tx-item">
                      <span className={amountClass}>
                        {sign}
                        {t.amount} GB
                      </span>
                      <div className="dashboard-tx-text">
                        <p className="dashboard-tx-primary">
                          {t.type === "purchase"
                            ? incoming
                              ? "Sale"
                              : "Purchase"
                            : t.type === "reward"
                            ? incoming
                              ? "Class reward received"
                              : "Class reward sent"
                            : incoming
                            ? "GoonBucks received"
                            : "GoonBucks sent"}{" "}
                          {t.className && (
                            <span className="dashboard-class-tag">
                              {t.className}
                              {t.classCode ? ` (${t.classCode})` : ""}
                            </span>
                          )}
                        </p>
                        <p className="dashboard-tx-secondary">
                          {t.note || "No note provided"}
                        </p>
                      </div>
                      <div className="dashboard-tx-meta">
                        <span className="dashboard-tx-date">
                          {formatDate(t.timestamp)}
                        </span>
                        {incoming && t.fromUsername && (
                          <span className="dashboard-tx-party">
                            from {t.fromUsername}
                          </span>
                        )}
                        {!incoming && t.toUsername && (
                          <span className="dashboard-tx-party">
                            to {t.toUsername}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              className="dashboard-secondary-btn"
              onClick={() => navigate("/history")}
            >
              View full history
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
