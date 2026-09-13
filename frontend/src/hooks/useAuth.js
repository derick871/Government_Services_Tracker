import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function useAuth(requiredRoles = []) {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const hasAccess = requiredRoles.length === 0 || context.hasRole(requiredRoles);

  return {
    ...context,
    hasAccess,
    // Helper to use in pages instead of throwing
    checkRole: (roles) => context.hasRole(roles)
  };
}