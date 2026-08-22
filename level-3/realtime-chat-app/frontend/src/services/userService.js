import api from "./api";

// ========================================
// GET ALL USERS
// GET /api/users
// ========================================
export const getUsers = async () => {
  try {
    const response = await api.get("/api/users");
    return response.data.data || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Unable to load users",
      { cause: error }
    );
  }
};
