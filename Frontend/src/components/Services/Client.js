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

// Add JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "access_token"
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
client.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Something went wrong.";

    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href =
          "/login?expired=true";
      }
    }

    return Promise.reject({
      status: status || 500,
      message,
      errors: error.response?.data || null,
    });
  }
);

export default client;