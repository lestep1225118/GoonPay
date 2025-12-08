import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";

import Login from "./pages/Login/Login.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import HistoryPage from "./pages/History/History.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import ClassesPage from "./pages/Classes/Classes.jsx";
import ClassDetailPage from "./pages/ClassDetail/ClassDetail.jsx";

import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const {
    currentUser,
    setCurrentUser,
    token,
    authLoading,
    logout,
    API_BASE,
  } = useAuth();

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!token) {
      setTransactions([]);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to load transactions:", data);
          return;
        }
        setTransactions(data);
      } catch (err) {
        console.error("Error loading transactions:", err);
      }
    };

    fetchTransactions();
  }, [token, API_BASE]);

  const getUserTransactions = () => {
    if (!currentUser) return [];

    return transactions.map((t) => ({
      id: t._id || t.id,
      from: t.from?._id || t.from,
      to: t.to?._id || t.to,
      amount: t.amount,
      note: t.note,
      timestamp: t.timestamp,
      fromUsername: t.from?.username || t.fromUsername,
      toUsername: t.to?.username || t.toUsername,
      type: t.type || "transfer",
      className: t.class?.name,
      classCode: t.class?.code,
      listingTitle: t.listing?.title,
    }));
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {!currentUser && (
        <>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}

      {currentUser && (
        <>
          <Route
            path="/"
            element={
              <Dashboard
                currentUser={currentUser}
                getUserTransactions={getUserTransactions}
                handleLogout={logout}
              />
            }
          />

          <Route
            path="/history"
            element={
              <HistoryPage
                currentUser={currentUser}
                getUserTransactions={getUserTransactions}
                handleLogout={logout}
              />
            }
          />

          <Route
            path="/classes"
            element={<ClassesPage handleLogout={logout} />}
          />

          <Route
            path="/classes/:classId"
            element={<ClassDetailPage handleLogout={logout} />}
          />

          <Route
            path="/profile"
            element={
              <Profile
                currentUser={currentUser}
                getUserTransactions={getUserTransactions}
                handleLogout={logout}
              />
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}
