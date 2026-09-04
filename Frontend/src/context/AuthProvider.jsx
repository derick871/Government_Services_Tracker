import { createContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { login as apiLogin, saveSession, logout as clearStorage, getCurrentUser, refreshToken } from "../services/auth";
import client from "../services/api";

export const AuthContext = createContext(null);

const ROLE = {
  ADMIN: "ADMIN",
  OFFICER: "OFFICER",
  CITIZEN: "CITIZEN",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const refreshPromiseRef = useRef(null);

  // 1. Bootstrap session
  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) setUser(stored);
    setIsInitializing(false);
  }, []);

  // 2. Single-flight refresh token
  const handleRefresh = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = refreshToken()
      .catch(() => {
        clearStorage();
        setUser(null);
        throw new Error("Session expired");
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, []);

  // 3. Axios interceptor for 401
  useEffect(() => {
    const interceptor = client.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          try {
            const { access } = await handleRefresh();
            original.headers.Authorization = `Bearer ${access}`;
            return client(original);
          } catch {
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => client.interceptors.response.eject(interceptor);
  }, [handleRefresh]);

  // 4. Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback(async (credentials) => {
    setIsAuthenticating(true);
    try {
      const data = await apiLogin(credentials);
      saveSession(data);
      setUser(data.user);
      return data.user;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const signOut = useCallback(() => {
    clearStorage();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading: isInitializing || isAuthenticating,
    isInitializing,
    isAuthenticated: !!user,
    role: user?.role || null,
    isAdmin: user?.role === ROLE.ADMIN,
    isOfficer: user?.role === ROLE.OFFICER,
    isCitizen: !user?.role || user?.role === ROLE.CITIZEN,
    hasRole: (roles) => roles.includes(user?.role),
    countyCode: user?.county_code || null,
    signIn,
    signOut,
    refresh: handleRefresh,
  }), [user, isInitializing, isAuthenticating, signIn, signOut, handleRefresh]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Restoring session...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}