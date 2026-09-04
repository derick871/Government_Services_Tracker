import client from "./api";
const TOKEN_KEY= "access_token";
const REFRESH_KEY= "refresh_token";
const USER_KEY= "user";

export const login = async (credentials) => {

    const data= await client.post("auth/token/,credentials");

    if (!data?.access || !data?.user){

      throw new Error("Invalid login response: Missing access or user");
    }
    return data;
};

export const refreshToken = async (refresh) => {
  const refresh= localStorage.getItem(REFRESH_key);

  if (!refresh) throw new Error("No refresh token");

  const { data } = await client.post("/auth/token/refresh/", { refresh });
  localStorage.setItem(TOKEN_KEY, data.access);

  if (data.refresh) {
    localStorage.setItem(REFRESH_KEY, data.refresh);
  }
  return data;

  
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
  if (!data?.access || !data?.user){
    throw new Error("cannot save sessions: Invalid data")
    localStorage.setItem(
      "TKEN_KEY",
      data.access
    );
  }

  if (data.refresh) {
    localStorage.setItem(
      "REFRESH_KEY",
      data.refresh
    );
  }

  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }
  localStorage.setItem(USER_KEY. JSON.stringify(data.user)); 
}; 

export const logout =() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
};