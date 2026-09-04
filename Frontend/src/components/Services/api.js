import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Routes that should NEVER get an Authorization header
const PUBLIC_ROUTES = ["/auth/register", "/auth/login", "/auth/token", "/services"];

const Client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// --- Request Interceptor ---
Client.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_ROUTES.some((route) => config.url?.includes(route));
    
    if (!isPublic) {
      const token = localStorage.getItem("access_token");
      if (token && token !== "null" && token !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Auto-refresh + logout ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

Client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return Client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem("access_token", data.access);
        Client.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        processQueue(null, data.access);
        return Client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// --- API Methods ---
export const getServices = () => Client.get("/services/").then((r) => r.data);
export const getApplications = () => Client.get("/applications/").then((r) => r.data);
export const getApplication = (trackingNumber) => Client.get(`/applications/${trackingNumber}/`).then((r) => r.data);
export const getApplicationByTrackingNumber = getApplication;
export const createApplication = (data) => Client.post("/applications/", data).then((r) => r.data);
export const updateApplicationStatus = (id, status, comment = "") => Client.patch(`/applications/${id}/status/`, { status, comment }).then((r) => r.data);

export default Client;