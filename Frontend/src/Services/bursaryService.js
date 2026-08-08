import {
  getApplications,
  createApplication,
  getApplication,
} from "./applications";

// Get bursary applications
export const getBursaryApplications = async () => {
  const applications = await getApplications();

  return applications.filter(
    (application) =>
      application.service_type === "BURSARY"
  );
};

// Submit bursary application
export const submitBursaryApplication = async (
  data
) => {
  return createApplication({
    county_id: data.county_id,
    service_type: "BURSARY",
    payload_data: data.payload_data,
  });
};

// Check bursary status
export const checkBursaryStatus = async (
  trackingNumber
) => {
  return getApplication(trackingNumber);
};