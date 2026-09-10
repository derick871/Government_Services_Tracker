import client from "./api";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user";

export const login = async (credentials) => {
  const { data } = await client.post("/auth/token/", credentials);
  // Backend CustomTokenObtainPairSerializer returns { access, refresh, user }
  if (!data?.access || !data?.user) {
    throw new Error("Invalid login response: missing access or user");
  }
  return data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) throw new Error("No refresh token");

  const { data } = await client.post("/auth/token/refresh/", { refresh });
  localStorage.setItem(TOKEN_KEY, data.access);
  // Optionally data.refresh if rotation enabled
  if (data.refresh) {
    localStorage.setItem(REFRESH_KEY, data.refresh);
  }
  return data;
};

export const saveSession = (data) => {
  if (!data?.access || !data?.user) {
    throw new Error("Cannot save session: invalid data");
  }
  localStorage.setItem(TOKEN_KEY, data.access);
  if (data.refresh) {
    localStorage.setItem(REFRESH_KEY, data.refresh);
  }
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    logout();
    return null;
  }
};

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const isAuthenticated = () => !!localStorage.getItem(TOKEN_KEY);