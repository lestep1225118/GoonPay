import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/Navbar/Navbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Classes.css";

export default function ClassesPage({ handleLogout }) {
  const { token, API_BASE, currentUser } = useAuth();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [joinCode, setJoinCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setClasses([]);
      setLoading(false);
      return;
    }

    const fetchClasses = async () => {
      setLoading(true);
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
      } catch (err) {
        console.error("Fetch classes error:", err);
        setError(err.message || "Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [token, API_BASE]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/classes/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to join class");
      }

      setClasses((prev) => [...prev, data]);
      setJoinCode("");
    } catch (err) {
      console.error("Join class error:", err);
      setError(err.message || "Failed to join class");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setError("");
    setCreating(true);

    try {
      const res = await fetch(`${API_BASE}/api/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to create class");
      }

      // treat creator as professor 
      setClasses((prev) => [
        ...prev,
        {
          classId: data.id,
          name: data.name,
          description: data.description,
          role: "professor",
          balance: 0,
          code: data.code,
          professor: currentUser?.id,
        },
      ]);

      setCreateName("");
      setCreateDescription("");
    } catch (err) {
      console.error("Create class error:", err);
      setError(err.message || "Failed to create class");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenClass = (id) => {
    navigate(`/classes/${id}`);
  };

  return (
    <div className="classes-page">
      <Navbar handleLogout={handleLogout} />

      <div className="classes-container">
        <div className="classes-main">
          <h2 className="classes-title">My Classes</h2>
          <p className="classes-subtitle">
            View and manage the classes you belong to.
          </p>

          {loading ? (
            <div className="classes-empty">Loading classes...</div>
          ) : classes.length === 0 ? (
            <div className="classes-empty">
              <p>You&apos;re not in any classes yet.</p>
              <p className="classes-empty-sub">
                Join a class with a code or create a new one to get started.
              </p>
            </div>
          ) : (
            <div className="classes-list">
              {classes.map((c) => (
                <button
                  key={c.classId || c.id}
                  className="classes-item"
                  onClick={() => handleOpenClass(c.classId || c.id)}
                >
                  <div className="classes-item-header">
                    <h3>{c.name}</h3>
                    <span className={`classes-role-badge role-${c.role}`}>
                      {c.role}
                    </span>
                  </div>
                  {c.description && (
                    <p className="classes-item-desc">{c.description}</p>
                  )}
                  <div className="classes-item-footer">
                    <span className="classes-item-balance">
                      Balance in this class:{" "}
                      <strong>{c.balance ?? 0} GoonBucks</strong>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {error && <div className="classes-error">{error}</div>}
        </div>

        <div className="classes-side">
          <div className="classes-card">
            <h3>Join a Class</h3>
            <p className="classes-card-sub">
              Enter a class code from your professor to join.
            </p>
            <form onSubmit={handleJoin} className="classes-form">
              <label className="classes-label">Class Code</label>
              <input
                type="text"
                className="classes-input"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
              />
              <button type="submit" className="classes-btn">
                Join Class
              </button>
            </form>
          </div>

          <div className="classes-card">
            <h3>Create a Class</h3>
            <p className="classes-card-sub">
              Become a professor and start rewarding students.
            </p>
            <form onSubmit={handleCreate} className="classes-form">
              <label className="classes-label">Class Name</label>
              <input
                type="text"
                className="classes-input"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Intro to GoonPay"
              />

              <label className="classes-label">
                Description <span className="classes-optional">(optional)</span>
              </label>
              <textarea
                className="classes-input"
                rows="3"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Describe your class..."
              ></textarea>

              <button
                type="submit"
                className="classes-btn"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Class"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
