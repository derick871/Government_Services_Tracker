// Get all citizen applications (supports admin or user scope depending on backend)
export const getApplications = async () => {
  const response = await api.get("/applications/");
  return response.data;
};

// Get a single application by tracking number (aliases getApplication for clarity)
export const getApplication = async (trackingNumber) => {
  const response = await api.get(`/applications/${trackingNumber}/`);
  return response.data;
};

// Explicit alias to match your TrackService component import requirement
export const getApplicationByTrackingNumber = getApplication;

// Create a new government service application
export const createApplication = async (data) => {
  const response = await api.post("/applications/", data);
  return response.data;
};

// Update application status (Admin workflow action)
export const updateApplicationStatus = async (
  applicationId,
  status,
  comment = ""
) => {
  const response = await api.patch(
    `/applications/${applicationId}/status/`,
    {
      status,
      comment,
    }
  );
  return response.data;
};
