import axios from "axios";

const rawBaseURL = (
  import.meta.env.VITE_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  "https://government-services-tracker-7.onrender.com"
);

const baseURL = rawBaseURL.replace(/\/$/, "").replace(/\/api$/, "");

console.log("API Base:", baseURL);

const client = axios.create({
  baseURL,
  withCredentials: false, 
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

let refreshRequest = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.includes("/auth/");

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ??= client.post("/api/auth/refresh/").finally(() => {
        refreshRequest = null;
      });
      await refreshRequest;
      return client(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return Promise.reject(refreshError);
    }
  }
);

export default client;