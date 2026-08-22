import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:6000";

const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT automatically
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized token
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
      const currentPath =
        window.location.pathname;

      localStorage.removeItem(
        "token"
      );

      if (
        currentPath !== "/login" &&
        currentPath !== "/signup"
      ) {
        window.location.href =
          "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;