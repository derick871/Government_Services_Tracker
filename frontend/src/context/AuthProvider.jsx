import { createContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import client from "../components/Services/api";

export const AuthContext = createContext(null);

const ROLE = {
  ADMIN: "ADMIN",
  OFFICER: "OFFICER",
  CITIZEN: "CITIZEN",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [alert, setAlert] = useState(null);
  const refreshPromiseRef = useRef(null);

  // Bootstrap session check on initial load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await client.get("/auth/me/");
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    restoreSession();
  }, []);

  // Single-flight token refresh mechanism
  const handleRefresh = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = client
      .post("/auth/token/refresh/")
      .then(() => true)
      .catch((err) => {
        setUser(null);
        throw err;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, []);

  // Axios 401 response interceptor for automatic token refresh retry
  useEffect(() => {
    const interceptor = client.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;

        const isAuthEndpoint = original.url?.includes("/auth/token");
        const isMeEndpoint = original.url?.includes("/auth/me");

        if (error.response?.status === 401 && !original._retry && !isAuthEndpoint && !isMeEndpoint) {
          original._retry = true;
          try {
            await handleRefresh();
            return client(original); // Retry original request with new cookie
          } catch (refreshError) {
            setUser(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => client.interceptors.response.eject(interceptor);
  }, [handleRefresh]);

  const showAlert = useCallback((message, type = "info") => {
    setAlert({ message, type });
  }, []);

  const clearAlert = useCallback(() => setAlert(null), []);

  const signIn = useCallback(async (credentials) => {
    setIsAuthenticating(true);
    try {
      const { data } = await client.post("/auth/token/", {
        email: credentials.email, 
        password: credentials.password,
      });

      const userData = data?.user;
      if (!userData) {
        throw new Error("Invalid login response structure from server");
      }

      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.email?.[0] || err.message || "Invalid credentials.";
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await client.post("/auth/logout/"); // Fixed double /api prefix bug
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    alert,
    showAlert,
    clearAlert,
    isLoading: isInitializing || isAuthenticating,
    isInitializing,
    isAuthenticating,
    isAuthenticated: !!user,
    role: user?.role || null,
    countyCode: user?.county_code || null,
    isAdmin: user?.role === ROLE.ADMIN,
    isOfficer: user?.role === ROLE.OFFICER,
    isCitizen: user?.role === ROLE.CITIZEN,
    hasRole: (roles) => {
      if (!user?.role) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    signIn,
    signOut,
    refresh: handleRefresh,
  }), [user, isInitializing, isAuthenticating, alert, showAlert, clearAlert, signIn, signOut, handleRefresh]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Restoring session...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}