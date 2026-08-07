import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT to requests
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API responses
client.interceptors.response.use(
  (response) => response.data,

  async (error) => {
    const status = error.response?.status;

    // Session expired
    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.location.href = "/login?expired=true";
    }

    const formattedError = {
      status: status || 500,
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "An unexpected error occurred.",
      errors:
        error.response?.data || null,
    };

    return Promise.reject(formattedError);
  }
);

export default client;