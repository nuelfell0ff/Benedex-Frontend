import axios from "axios";

// Dynamically set Gateway target while keeping the /api path base intact
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")}/api`
    : "https://benedex.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Injects JWT Token cleanly)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Strictly handles planned maintenance without breaking on cold boots)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isExplicitMaintenance = error.response?.data?.maintenance === true;

    // Only redirect to maintenance if the API explicitly flags a maintenance state
    if (status === 503 && isExplicitMaintenance) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (user?.role !== "admin") {
        window.location.href = "/maintenance";
      }
    }

    return Promise.reject(error);
  }
);

export default API;