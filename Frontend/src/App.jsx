import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/common/Layout"
import Home from "./pages/Home";
import Register from  "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminConsole from "./pages/AdminConsole";
import TrackService from "./pages/TrackService"
import ServiceTracker from "./components/ServiceTracker"; 
import MetricCard from "./components/dashboard/MetricCard";
import EfficiencyTable from "./components/dashboard/EfficiencyTable";

export default function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        {/*public pages - no layout */}
        <Route element={<Layout />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminconsole" element={<AdminConsole />} />
        <Route path="/trackservice" element={<TrackService />} />
        <Route path="/servicetracker" element={<ServiceTracker/>} />
        <Route path="/metriccard" element={<MetricCard/>} />
        <Route path="/efficiencytable" element={<EfficiencyTable/>} />


      </Routes>
    </BrowserRouter>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <ServiceTracker /> 
    </div>
  );
}
