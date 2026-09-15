import axios from "axios";

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (!configuredUrl) {
    // Local development fallback
    return "http://127.0.0.1:8000/api";
  }

  return configuredUrl
    .trim()
    .replace(/\/+$/, "");
};

const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


client.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
