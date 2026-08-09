import client from "./client";

export const login = async (credentials) => {
  return client.post("/auth/login/", credentials);
};

export const refreshToken = async (refresh) => {
  return client.post("/auth/refresh/", {
    refresh,
  });
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem("access_token")
  );
};

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