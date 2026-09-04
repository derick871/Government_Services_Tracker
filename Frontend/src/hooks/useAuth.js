import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function useAuth(requiredRoles = []) {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");

  if (requiredRoles.length && !context.hasRole(requiredRoles)) {
    throw new Error(`Unauthorized: requires ${requiredRoles.join(",")}`);
  }
  return context;
}