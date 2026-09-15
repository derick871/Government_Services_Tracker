import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import client from "../components/Services/api";

export const AuthContext = createContext(null);

const ROLE = {
  ADMIN: "ADMIN",
  OFFICER: "OFFICER",
  CITIZEN: "CITIZEN",
};

const initialState = {
  user: null,
  isAuthenticating: true,
  alert: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isAuthenticating: true };
    case "AUTH_SUCCESS":
      return { ...state, user: action.user, isAuthenticating: false };
    case "AUTH_FAILURE":
      return { ...state, user: null, isAuthenticating: false };
    case "ALERT_SET":
      return { ...state, alert: action.alert };
    case "SIGNED_OUT":
      return { ...state, user: null, isAuthenticating: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { user, isAuthenticating, alert } = state;

  const showAlert = useCallback((message, type = "info") => {
    dispatch({ type: "ALERT_SET", alert: { message, type } });
  }, []);

  const clearAlert = useCallback(() => {
    dispatch({ type: "ALERT_SET", alert: null });
  }, []);

  const loadCurrentUser = useCallback(async () => {
    try {
      const { data } = await client.get("/auth/me/");
      dispatch({ type: "AUTH_SUCCESS", user: data });
    } catch {
      dispatch({ type: "AUTH_FAILURE" });
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const signIn = useCallback(async ({ email, password }) => {
    dispatch({ type: "AUTH_START" });

    try {
      const { data } = await client.post("/auth/token/", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!data?.user) {
        throw new Error("Invalid authentication response.");
      }

      dispatch({ type: "AUTH_SUCCESS", user: data.user });

      return data.user;
    } catch (err) {
      const backendError = err.response?.data;

      let message =
        backendError?.detail ||
        backendError?.non_field_errors?.[0] ||
        backendError?.email?.[0] ||
        backendError?.password?.[0] ||
        "Unable to sign in. Please check your credentials.";

      if (err.code === "ERR_NETWORK") {
        message =
          "Unable to connect to the authentication server. Please try again.";
      }

      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await client.post("/auth/logout/");
    } finally {
      dispatch({ type: "SIGNED_OUT" });
    }
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!user?.role) return false;

      const roleList = Array.isArray(roles)
        ? roles
        : [roles];

      return roleList.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthenticating,

      role: user?.role || null,
      countyCode: user?.county_code || null,

      isAdmin: user?.role === ROLE.ADMIN,
      isOfficer: user?.role === ROLE.OFFICER,
      isCitizen: user?.role === ROLE.CITIZEN,

      hasRole,

      signIn,
      signOut,

      alert,
      showAlert,
      clearAlert,
    }),
    [
      user,
      isAuthenticating,
      hasRole,
      signIn,
      signOut,
      alert,
      showAlert,
      clearAlert,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}