import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../../components/Navbar/Navbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Users,
  ArrowLeft,
  Coins,
  Gift,
  Trash2,
  ShoppingBag,
  ShoppingCart,
  ShieldPlus,
} from "lucide-react";
import "./ClassDetail.css";

export default function ClassDetailPage({ handleLogout }) {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { token, API_BASE, currentUser } = useAuth();

  const [classInfo, setClassInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rewardAmounts, setRewardAmounts] = useState({});
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
  });
  const [savingListing, setSavingListing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingClass, setDeletingClass] = useState(false);

  const isStaff =
    classInfo && (classInfo.role === "professor" || classInfo.role === "ta");
  const isStudent = classInfo && classInfo.role === "student";
  const isProfessor = classInfo && classInfo.role === "professor";

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const classRes = await fetch(`${API_BASE}/api/classes/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const classData = await classRes.json().catch(() => ({}));
        if (!classRes.ok) {
          throw new Error(classData.error || "Failed to load class");
        }
        setClassInfo(classData);

        const listingsRes = await fetch(
          `${API_BASE}/api/classes/${classId}/listings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const listingsData = await listingsRes.json().catch(() => []);
        if (!listingsRes.ok) {
          throw new Error(listingsData.error || "Failed to load marketplace");
        }
        setListings(listingsData);

        if (classData.role === "professor" || classData.role === "ta") {
          const membersRes = await fetch(
            `${API_BASE}/api/classes/${classId}/members`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const membersData = await membersRes.json().catch(() => []);
          if (membersRes.ok) {
            setMembers(membersData);
          }
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("Class detail fetch error:", err);
        setError(err.message || "Failed to load class");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, token, API_BASE]);

  const handleRewardChange = (membershipId, value) => {
    setRewardAmounts((prev) => ({
      ...prev,
      [membershipId]: value,
    }));
  };

  const handleSendReward = async (membershipId) => {
    const raw = rewardAmounts[membershipId];
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) return;

    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/classes/${classId}/members/${membershipId}/reward`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reward");
      }

      setMembers((prev) =>
        prev.map((m) =>
          m.membershipId === membershipId
            ? { ...m, balance: data.newBalance }
            : m
        )
      );

      setRewardAmounts((prev) => ({
        ...prev,
        [membershipId]: "",
      }));
    } catch (err) {
      console.error("Reward error:", err);
      setError(err.message || "Failed to send reward");
    } finally {
      setActionLoading(false);
    }
  };

  const handleKick = async (membershipId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/classes/${classId}/members/${membershipId}/kick`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to kick member");
      }

      setMembers((prev) =>
        prev.filter((m) => m.membershipId !== membershipId)
      );
    } catch (err) {
      console.error("Kick error:", err);
      setError(err.message || "Failed to kick member");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async (membershipId) => {
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/classes/${classId}/members/${membershipId}/promote`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to promote member");
      }

      setMembers((prev) =>
        prev.map((m) =>
          m.membershipId === membershipId ? { ...m, role: "ta" } : m
        )
      );
    } catch (err) {
      console.error("Promote error:", err);
      setError(err.message || "Failed to promote member");
    } finally {
      setActionLoading(false);
    }
  };

  const handleListingFormChange = (field, value) => {
    setListingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!listingForm.title.trim() || !listingForm.description.trim()) return;
    const price = Number(listingForm.price);
    if (!Number.isFinite(price) || price <= 0) return;

    setSavingListing(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/classes/${classId}/listings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: listingForm.title.trim(),
            description: listingForm.description.trim(),
            price,
            imageUrl: listingForm.imageUrl.trim() || undefined,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      setListings((prev) => [
        {
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          createdBy: {
            id: currentUser?.id,
            username: currentUser?.username,
          },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setListingForm({
        title: "",
        description: "",
        price: "",
        imageUrl: "",
      });
    } catch (err) {
      console.error("Create listing error:", err);
      setError(err.message || "Failed to create listing");
    } finally {
      setSavingListing(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Remove this listing?")) return;

    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/classes/${classId}/listings/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete listing");
      }
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (err) {
      console.error("Delete listing error:", err);
      setError(err.message || "Failed to delete listing");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurchase = async (listingId) => {
    if (!window.confirm("Spend your GoonBucks on this item?")) return;

    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/classes/${classId}/listings/${listingId}/purchase`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Purchase failed");
      }

      setClassInfo((prev) =>
        prev ? { ...prev, balance: data.newBalance } : prev
      );
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.message || "Purchase failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this class? This will remove the class, all memberships, and marketplace data."
      )
    ) {
      return;
    }

    setDeletingClass(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/classes/${classId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete class");
      }
      navigate("/classes");
    } catch (err) {
      console.error("Delete class error:", err);
      setError(err.message || "Failed to delete class");
    } finally {
      setDeletingClass(false);
    }
  };

  if (loading) {
    return (
      <div className="class-detail-page">
        <Navbar handleLogout={handleLogout} />
        <div className="class-detail-container">
          <p>Loading class...</p>
        </div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="class-detail-page">
        <Navbar handleLogout={handleLogout} />
        <div className="class-detail-container">
          <p>Class not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="class-detail-page">
      <Navbar handleLogout={handleLogout} />

      <div className="class-detail-container">
        <div className="class-detail-header-row">
          <button
            className="class-back-btn"
            onClick={() => navigate("/classes")}
          >
            <ArrowLeft className="class-back-icon" />
            Back to Classes
          </button>

          {isProfessor && (
            <button
              className="class-delete-btn"
              onClick={handleDeleteClass}
              disabled={deletingClass}
            >
              {deletingClass ? "Deleting..." : "Delete Class"}
            </button>
          )}
        </div>

        <div className="class-header">
          <div>
            <h2 className="class-title">{classInfo.name}</h2>
            {classInfo.description && (
              <p className="class-subtitle">{classInfo.description}</p>
            )}

            <div className="class-code-row">
              <span>Class Code:</span>
              <strong>{classInfo.code}</strong>
            </div>
          </div>
          <div className="class-role-badge-wrapper">
            <span className={`class-role-badge role-${classInfo.role}`}>
              {classInfo.role}
            </span>
            {isStudent && (
              <div className="class-balance">
                <Coins className="class-balance-icon" />
                <span>{classInfo.balance} GoonBucks in this class</span>
              </div>
            )}
          </div>
        </div>

        {error && <div className="class-error">{error}</div>}

        <div className="class-content-grid">
          {isStaff && (
            <div className="class-members-card">
              <div className="class-card-header">
                <Users className="class-card-icon" />
                <div>
                  <h3>Class Members</h3>
                  <p>Reward students, promote TAs, and manage your roster.</p>
                </div>
              </div>

              {members.length === 0 ? (
                <p className="class-empty-text">
                  No members found in this class.
                </p>
              ) : (
                <div className="class-members-list">
                  {members.map((m) => (
                    <div key={m.membershipId} className="class-member-row">
                      <div className="class-member-main">
                        <p className="class-member-name">
                          {m.username}{" "}
                          {m.userId === currentUser?.id && (
                            <span className="class-tag">You</span>
                          )}
                        </p>
                        <p className="class-member-role">{m.role}</p>
                      </div>
                      <div className="class-member-balance">
                        <span>{m.balance} GB</span>
                      </div>
                      <div className="class-member-actions">
                        {/* Reward only students */}
                        {m.role === "student" && (
                          <>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              placeholder="Amount"
                              value={rewardAmounts[m.membershipId] || ""}
                              onChange={(e) =>
                                handleRewardChange(
                                  m.membershipId,
                                  e.target.value
                                )
                              }
                              className="class-reward-input"
                            />
                            <button
                              className="class-reward-btn"
                              onClick={() =>
                                handleSendReward(m.membershipId)
                              }
                              disabled={actionLoading}
                            >
                              <Gift className="class-reward-icon" />
                              Reward
                            </button>
                          </>
                        )}

                        {/* Promote student to TA (professor only) */}
                        {isProfessor && m.role === "student" && (
                          <button
                            className="class-promote-btn"
                            onClick={() => handlePromote(m.membershipId)}
                            disabled={actionLoading}
                          >
                            <ShieldPlus className="class-promote-icon" />
                            TA
                          </button>
                        )}

                        {m.role !== "professor" && (
                          <button
                            className="class-kick-btn"
                            onClick={() => handleKick(m.membershipId)}
                            disabled={actionLoading}
                          >
                            <Trash2 className="class-kick-icon" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="class-market-card">
            <div className="class-card-header">
              <ShoppingBag className="class-card-icon" />
              <div>
                <h3>Class Marketplace</h3>
                <p>
                  {isStudent
                    ? "Spend your GoonBucks on rewards."
                    : "Create items students can buy with GoonBucks."}
                </p>
              </div>
            </div>

            {isStaff && (
              <form
                className="class-listing-form"
                onSubmit={handleCreateListing}
              >
                <div className="class-form-row">
                  <div className="class-form-field">
                    <label>Title</label>
                    <input
                      type="text"
                      value={listingForm.title}
                      onChange={(e) =>
                        handleListingFormChange("title", e.target.value)
                      }
                      placeholder="Reward name"
                    />
                  </div>
                  <div className="class-form-field">
                    <label>Price (GB)</label>
                    <input
                      type="number"
                      min="1"
                      value={listingForm.price}
                      onChange={(e) =>
                        handleListingFormChange("price", e.target.value)
                      }
                      placeholder="100"
                    />
                  </div>
                </div>
                <div className="class-form-field">
                  <label>Description</label>
                  <textarea
                    rows="2"
                    value={listingForm.description}
                    onChange={(e) =>
                      handleListingFormChange("description", e.target.value)
                    }
                    placeholder="Describe what the student receives..."
                  ></textarea>
                </div>
                <div className="class-form-field">
                  <label>Image URL (Optional)</label>
                  <input
                    type="text"
                    value={listingForm.imageUrl}
                    onChange={(e) =>
                      handleListingFormChange("imageUrl", e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="submit"
                  className="class-create-listing-btn"
                  disabled={savingListing}
                >
                  {savingListing ? "Saving..." : "Create Listing"}
                </button>
              </form>
            )}

            {listings.length === 0 ? (
              <p className="class-empty-text">
                No items in the marketplace yet.
              </p>
            ) : (
              <div className="class-listings-grid">
                {listings.map((item) => (
                  <div key={item.id} className="class-listing-card">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="class-listing-image"
                      />
                    )}
                    <div className="class-listing-body">
                      <h4>{item.title}</h4>
                      <p className="class-listing-desc">
                        {item.description}
                      </p>
                      <div className="class-listing-meta">
                        <span className="class-listing-price">
                          {item.price} GoonBucks
                        </span>
                        {item.createdBy && (
                          <span className="class-listing-seller">
                            by {item.createdBy.username}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="class-listing-actions">
                      {isStudent && (
                        <button
                          className="class-buy-btn"
                          onClick={() => handlePurchase(item.id)}
                          disabled={actionLoading}
                        >
                          <ShoppingCart className="class-buy-icon" />
                          Buy
                        </button>
                      )}
                      {isStaff && (
                        <button
                          className="class-delete-listing-btn"
                          onClick={() => handleDeleteListing(item.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="class-kick-icon" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
