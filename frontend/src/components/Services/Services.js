import api from "./api";

// Fetch all available govt services
export const getServices = async () => {
  const response = await api.get("/services/");
  return response.data;
};

// Get all citizen applications
export const getApplications = async () => {
  const response = await api.get("/applications/");
  return response.data;
};

// Get a single application by tracking number
export const getApplication = async (trackingNumber) => {
  const response = await api.get(`/applications/${trackingNumber}/`);
  return response.data;
};

export const getApplicationByTrackingNumber = getApplication;

// Create a new government service application
export const createApplication = async (data) => {
  const response = await api.post("/applications/", data);
  return response.data;
};

// Update application status
export const updateApplicationStatus = async (applicationId, status, comment = "") => {
  const response = await api.patch(`/applications/${applicationId}/status/`, {
    status,
    comment,
  });
  return response.data;
};