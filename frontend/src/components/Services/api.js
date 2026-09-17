import axios from "axios";

const baseURL = (
  import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL ||
  "https://government-services-tracker-6.onrender.com/api"

  // console.log(VITE_API_URL)

).replace(/\/$/, "");

const client = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
);

let refreshRequest = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.startsWith("/auth/");

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ??= client.post("/auth/refresh/").finally(() => {
        refreshRequest = null;
      });
      await refreshRequest;
      return client(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default client;