import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
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

// Optional: protect auth

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* === Public - NO layout === */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* === Protected - WITH AppLayout (uses Outlet) === */}
          <Route
            element={
                <AppLayout />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applyservice" element={<ApplyService />} />
            <Route path="/trackservice" element={<TrackService />} />
            <Route path="/paymentpage" element={<PaymentPage />} />
            
            {/* Role-based - you can add another guard inside */}
            <Route path="/adminconsole" element={<AdminConsole />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}