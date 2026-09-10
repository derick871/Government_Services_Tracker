import client from "./api";

// Get permits
export const getPermits = async (
  params = {}
) => {
  return client.get("/permits/", {
    params,
  });
};

// Get permit
export const getPermitById = async (
  permitId
) => {
  return client.get(
    `/permits/${permitId}/`
  );
};

// Create permit
export const createPermit = async (
  permitData
) => {
  return client.post(
    "/permits/",
    permitData
  );
};

// Upload permit document
export const uploadPermitDocument = async (
  permitId,
  formData
) => {
  return client.post(
    `/permits/${permitId}/documents/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};