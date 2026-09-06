import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/common/Layout"
import { AuthProvider } from "./context/AuthProvider";
import Home from "./pages/Home";
import Register from  "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplyService from "./pages/ApplyService";
import AdminConsole from "./pages/AdminConsole";
import TrackService from "./pages/TrackService"
import PaymentPage from "./pages/Payments";

export default function App() {
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Routes wrapped with the common Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applyservice" element={<ApplyService />} />
            <Route path="/adminconsole" element={<AdminConsole />} />
            <Route path="/trackservice" element={<TrackService />} />
            <Route path="/paymentpage" element={<PaymentPage />} />
          </Route>

          {/* Standalone pages without the layout (e.g., Auth screens) */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}