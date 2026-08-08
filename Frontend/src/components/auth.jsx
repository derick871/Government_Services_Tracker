import client from "./Services/Client";

// Login
export const login = async (credentials) => {
  return client.post(
    "/auth/login/",
    credentials
  );
};

// Register
export const register = async (userData) => {
  return client.post(
    "/auth/register/",
    userData
  );
};

// Refresh token
export const refreshToken = async () => {
  const refresh =
    localStorage.getItem("refresh_token");

  if (!refresh) {
    throw new Error("No refresh token found.");
  }

  const response = await client.post(
    "/auth/refresh/",
    { refresh }
  );

  if (response.access) {
    localStorage.setItem(
      "access_token",
      response.access
    );
  }

  return response;
};

// Save session
export const saveSession = (data) => {
  if (data.access) {
    localStorage.setItem(
      "access_token",
      data.access
    );
  }

  if (data.refresh) {
    localStorage.setItem(
      "refresh_token",
      data.refresh
    );
  }

  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }
};

// Get current user
export const getCurrentUser = () => {
  const user =
    localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

// Check authentication
export const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem("access_token")
  );
};

// Logout
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};