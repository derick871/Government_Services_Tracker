import {
  createContext,
  useState,
} from "react";

export const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "info") => {
    setAlert({
      message,
      type,
    });
  };

  const clearAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider
      value={{
        alert,
        showAlert,
        clearAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

