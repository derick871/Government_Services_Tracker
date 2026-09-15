import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import useAuth from "./hooks/useAuth";
import AppLayout from "./components/common/Layout";

// Public pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

// Protected pages
import Dashboard from "./pages/Dashboard";
import ApplyService from "./pages/ApplyService";
import AdminConsole from "./pages/AdminConsole";
import TrackService from "./pages/TrackService";
import PaymentPage from "./pages/Payments";

function AuthLoading() {
  return <div className="min-h-screen bg-slate-950" aria-label="Loading" />;
}

function RequireAuth() {
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RequireRole({ roles }) {
  const { isAuthenticating, hasRole } = useAuth();

  if (isAuthenticating) {
    return <AuthLoading />;
  }

  if (!hasRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return <AuthLoading />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* === Public - NO layout === */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

          {/* Dashboard is public; protected actions remain behind RequireAuth. */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/applyservice/:serviceId?" element={<ApplyService />} />
              <Route path="/trackservice" element={<TrackService />} />
              <Route path="/paymentpage" element={<PaymentPage />} />
              <Route element={<RequireRole roles={["ADMIN", "OFFICER"]} />}>
                <Route path="/adminconsole" element={<AdminConsole />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}