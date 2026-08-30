import axios from "axios";

// Standardized Axios instance configuration for the backend
const Client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT tokens if available in local storage
Client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Fetch all available published county services/notices
export const getServices = async () => {
  const response = await api.get("/services/");
  return response.data;
};

// Get all citizen applications (supports admin/officer scopes securely)
export const getApplications = async () => {
  const response = await api.get("/applications/");
  return response.data;
};

// Get a single application by its unique tracking code
export const getApplication = async (trackingNumber) => {
  const response = await api.get(`/applications/${trackingNumber}/`);
  return response.data;
};

// Alias to match component expectation
export const getApplicationByTrackingNumber = getApplication;

// Submit a new citizen service request payload
export const createApplication = async (data) => {
  const response = await api.post("/applications/", data);
  return response.data;
};

// Update workflow lifecycle status (Restricted to officers/admins)
export const updateApplicationStatus = async (applicationId, status, comment = "") => {
  const response = await api.patch(`/applications/${applicationId}/status/`, {
    status,
    comment,
  });
  return response.data;
};

export default Client;