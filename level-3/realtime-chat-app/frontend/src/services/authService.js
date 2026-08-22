import api from "./api";

// ========================================
// SIGNUP
// POST /api/auth/signup
// ========================================

export const signupUser =
  async (userData) => {
    try {
      const response =
        await api.post(
          "/api/auth/signup",
          userData
        );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Signup failed"
      );
    }
  };


// ========================================
// LOGIN
// POST /api/auth/login
// ========================================

export const loginUser =
  async (email, password) => {
    try {
      const response =
        await api.post(
          "/api/auth/login",
          {
            email,
            password,
          }
        );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Login failed"
      );
    }
  };


// ========================================
// CURRENT USER
// GET /api/auth/me
// ========================================

export const getCurrentUser =
  async () => {
    try {
      const response =
        await api.get(
          "/api/auth/me"
        );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to load user"
      );
    }
  };