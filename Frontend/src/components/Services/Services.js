import api from "./Client";

// Get citizen applications
export const getApplications = () => {
  return api.get("/applications/");
};

// Get one application
export const getApplication = (trackingNumber) => {
  return api.get(
    `/applications/${trackingNumber}/`
  );
};

// Create application
export const createApplication = (data) => {
  return api.post("/applications/", data);
};

// Update application status
export const updateApplicationStatus = (
  applicationId,
  status,
  comment = ""
) => {
  return api.patch(
    `/applications/${applicationId}/status/`,
    {
      status,
      comment,
    }
  );
};