import { useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function useAuth(requiredRoles = []) {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const hasAccess = requiredRoles.length === 0 || context.hasRole(requiredRoles);
  const checkRole = useCallback((roles) => context.hasRole(roles), [context]);

  return {
    ...context,
    hasAccess,
    checkRole
  };
}