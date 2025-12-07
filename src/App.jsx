import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";

import Login from "./pages/Login/Login.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Send from "./pages/Send/Send.jsx";
import HistoryPage from "./pages/History/History.jsx";
import Profile from "./pages/Profile/Profile.jsx";

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
  const [sendForm, setSendForm] = useState({
    recipient: "",
    amount: "",
    note: "",
  });
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  // Load transactions if have token
  useEffect(() => {
    if (!token) {
      setTransactions([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/transactions/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch history");
          return;
        }

        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    loadHistory();
  }, [token, API_BASE]);

  const handleSendMoney = async () => {
    if (!currentUser || !token) return;

    setSendError("");
    setSendSuccess("");

    const amount = parseFloat(sendForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setSendError("Please enter a valid amount");
      return;
    }

    try
    {
      const res = await fetch(`${API_BASE}/api/transactions/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: sendForm.recipient,
          amount,
          note: sendForm.note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendError(data.error || "Failed to send rewards");
        return;
      }

      setSendSuccess(data.message || "Reward transfer complete");
      setSendForm({ recipient: "", amount: "", note: "" });
      
      // Play sound effect
      try {
        const audio = new Audio('/goon.mp3');
        audio.volume = 0.7;
        audio.play().catch(err => {
          console.error('Audio play failed:', err);
        });
      } catch (err) {
        console.error('Audio creation failed:', err);
      }

      const historyRes = await fetch(
        `${API_BASE}/api/transactions/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (historyRes.ok) {
        const history = await historyRes.json();
        setTransactions(history);
      }

      // refresh current user balance
      const meRes = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const user = await meRes.json();
        setCurrentUser(user);
      }
    } catch (err) {
      console.error("Send error:", err);
      setSendError("Something went wrong while sending rewards");
    }
  };

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
            path="/send"
            element={
              <Send
                currentUser={currentUser}
                sendForm={sendForm}
                setSendForm={setSendForm}
                handleSendMoney={handleSendMoney}
                error={sendError}
                success={sendSuccess}
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
