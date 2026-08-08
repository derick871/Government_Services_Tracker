import axios from "axios";

const Client = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api",

  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

// Return response data
api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      window.location.href = "/login";
    }

    return Promise.reject({
      status: status || 500,
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to communicate with the server.",
    });
  }
);

export default Client;