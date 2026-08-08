import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  login,
  saveSession,
  logout,
  getCurrentUser,
  isAuthenticated,
} from "../services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    getCurrentUser()
  );

  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const signIn = async (credentials) => {
    const data = await login(credentials);

    saveSession(data);
    setUser(data.user);

    return data;
  };

  const signOut = () => {
    logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}