import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:6000";

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [token, setToken] =
    useState(() =>
      localStorage.getItem("token")
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ========================================
  // LOAD CURRENT USER
  // ========================================

  useEffect(() => {
    const loadCurrentUser =
      async () => {
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await axios.get(
              `${API_URL}/api/auth/me`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          setUser(
            response.data.data
          );
        } catch (error) {
          console.error(
            "LOAD USER ERROR:",
            error
          );

          localStorage.removeItem(
            "token"
          );

          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    loadCurrentUser();
  }, [token]);

  // ========================================
  // SIGNUP
  // ========================================

  const signup = async (
    formData
  ) => {
    try {
      setError("");

      const response =
        await axios.post(
          `${API_URL}/api/auth/signup`,
          formData
        );

      return response.data;
    } catch (error) {
      const message =
        error.response?.data
          ?.message ||
        "Signup failed";

      setError(message);

      throw new Error(message);
    }
  };

  // ========================================
  // LOGIN
  // ========================================

  const login = async (
    email,
    password
  ) => {
    try {
      setError("");

      const response =
        await axios.post(
          `${API_URL}/api/auth/login`,
          {
            email,
            password,
          }
        );

      const {
        token: newToken,
        user: loggedInUser,
      } = response.data;

      localStorage.setItem(
        "token",
        newToken
      );

      setToken(newToken);

      if (loggedInUser) {
        setUser(loggedInUser);
      }

      return response.data;
    } catch (error) {
      const message =
        error.response?.data
          ?.message ||
        "Login failed";

      setError(message);

      throw new Error(message);
    }
  };

  // ========================================
  // LOGOUT
  // ========================================

  const logout = () => {
    if (user?.id) {
      localStorage.removeItem(`selectedChatId_${user.id}`);
    }
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setError("");
  };

  // ========================================
  // UPDATE USER LOCALLY
  // ========================================

  const updateCurrentUser = (
    updatedUser
  ) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      signup,
      login,
      logout,
      updateCurrentUser,
      isAuthenticated:
        Boolean(user && token),
      isAdmin:
        user?.role === "ADMIN",
    }),
    [
      user,
      token,
      loading,
      error,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}