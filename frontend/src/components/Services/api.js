import axios from "axios";

const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true, // Browser sends HttpOnly cookies automatically
});

// No request interceptor needed. Cookie is sent by browser, not by JS.
// No Authorization header injection needed if backend reads cookie.

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Prevent redirect loop on auth pages themselves
    const isAuthRequest = 
      error.config?.url?.includes("/auth/token") || 
      error.config?.url?.includes("/auth/me") ||
      error.config?.url?.includes("/auth/logout");

    if (error.response?.status === 401 && !isAuthRequest) {
      // Don't clear localStorage, don't hard redirect here.
      // Let AuthProvider handle it via /me or refresh logic
      // This avoids your infinite redirect bug
      console.warn("Session expired");
    }

    return Promise.reject(error);
  }
);

export default client;