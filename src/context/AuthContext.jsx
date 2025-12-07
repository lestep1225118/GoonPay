import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5005";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("gp_token");
    if (!storedToken) {
      setAuthLoading(false);
      return;
    }

    setToken(storedToken);

    fetch(`${API_BASE}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((user) => {
        setCurrentUser(user);
      })
      .catch(() => {
        localStorage.removeItem("gp_token");
        setToken(null);
        setCurrentUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Login failed" };
      }

      setToken(data.token);
      localStorage.setItem("gp_token", data.token);

      setCurrentUser(data.user);

      return { ok: true };
    } catch (err) {
      console.error("Login error:", err);
      return { ok: false, error: "Network error during login" };
    }
  };
  const signup = async ({ username, email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Signup failed" };
      }

      return {
        ok: true,
        message: data.message || "Signup successful. Please log in.",
      };
    } catch (err) {
      console.error("Signup error:", err);
      return { ok: false, error: "Network error during signup" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("gp_token");
  };

  const value = {
    currentUser,
    setCurrentUser,
    token,
    authLoading,
    login,
    signup,
    logout,
    API_BASE,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
