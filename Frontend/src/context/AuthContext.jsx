import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  login,
  saveSession,
  logout,
  getCurrentUser,
} from "../components/Services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Restore session once
  useEffect(() => {
    try {
      const stored = getCurrentUser();
      if (stored) setUser(stored);
    } catch {
      logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (credentials) => {
    const data = await login(credentials);

    if (!data?.user || !data?.access) {
      throw new Error("Invalid login response from server");
    }

    saveSession(data);
    setUser(data.user);
    return data;
  }, []);

  const signOut = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      role: user?.role || null,
      countyCode: user?.county_code || null,
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
}