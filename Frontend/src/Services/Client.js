import axios from "axios";

const client = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api",

  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
client.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/login";

      return Promise.reject({
        status: 401,
        message: "Session expired. Please login again.",
      });
    }

    return Promise.reject({
      status: status || 500,
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Unable to communicate with the server.",
    });
  }
);

export default client;