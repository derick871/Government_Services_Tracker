import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const PUBLIC_ROUTES = ["/auth/register", "/auth/login", "/auth/token", "/services"];

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const getValidToken = () => {
  let token = localStorage.getItem("access_token") || localStorage.getItem("access");
  if (!token || token === "null" || token === "undefined" || token.includes("object Object")) {
    return null;
  }

  if (token.startsWith("{")) {
    try {
      const parsed = JSON.parse(token);
      return parsed.access || parsed.access_token || parsed.token || null;
    } catch (e) {
      return null;
    }
  }

  return token;
};

client.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_ROUTES.some((route) => config.url?.includes(route));
    if (!isPublic) {
      const token = getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;