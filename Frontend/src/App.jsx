import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from  "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminConsole from "./pages/AdminConsole";
import TrackService from "./pages/TrackService"

export default function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminconsole" element={<AdminConsole />} />
        <Route path="/trackservice" element={<TrackService />} />
      </Routes>
    </BrowserRouter>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 2. Place it here like a custom HTML tag */}
      <ServiceTracker /> 
    </div>
  );
}
