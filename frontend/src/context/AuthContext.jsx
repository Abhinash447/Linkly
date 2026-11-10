import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api.js";

const AuthContext = createContext(null);
const USER_STORAGE_KEY = "user";
export const useAuth = () => useContext(AuthContext);

function getStoredUser() {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    if (user && typeof user.email === "string") {
      return user;
    }
  } catch {
    // Discard malformed cached session data and let /auth/me verify the token.
  }

  localStorage.removeItem(USER_STORAGE_KEY);
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      setLoading(false);
      return;
    }

    api("/auth/me")
      .then((data) => {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      })
      .catch((error) => {
        if (error.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
        // Keep the cached user and token when the server is temporarily unavailable.
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    saveSession(
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    );
  };

  const signup = async (form) => {
    saveSession(
      await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      }),
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
