import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FilePlus, 
  ArrowRight, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  ChevronRight,
  X,
  Sparkles
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering & Selection state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [recentTrackingRef, setRecentTrackingRef] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Capture trap state / navigation message from ApplyService
  useEffect(() => {
    if (location.state?.newApplication) {
      setRecentTrackingRef(location.state.newApplication);
      // Clean state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/applications/`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            return;
          }
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || `Request failed: ${response.status}`);
        }

        const data = await response.json();
        const records = Array.isArray(data) ? data : data?.results || [];
        setApplications(records);

        // If we arrived with a recent tracking ref from ApplyService, auto-select it if found
        if (recentTrackingRef) {
          const matched = records.find(r => r.tracking_number === recentTrackingRef);
          if (matched) setSelectedApplication(matched);
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [recentTrackingRef]);

  const metrics = useMemo(() => ({
    total: applications.length,
    submitted: applications.filter(i => i.status === "SUBMITTED").length,
    pending: applications.filter(i => ["UNDER_REVIEW", "ACTION_REQUIRED", "VERIFIED"].includes(i.status)).length,
    approved: applications.filter(i => i.status === "APPROVED").length,
    rejected: applications.filter(i => i.status === "REJECTED").length,
  }), [applications]);

  // Filter and search logic
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        (app.tracking_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (app.service_type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (app.county_id?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      if (statusFilter === "ALL") return matchesSearch;
      if (statusFilter === "PENDING") {
        return matchesSearch && ["UNDER_REVIEW", "ACTION_REQUIRED", "VERIFIED"].includes(app.status);
      }
      return matchesSearch && app.status === statusFilter;
    });
  }, [applications, searchQuery, statusFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Securing and fetching your digital records...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-white shadow-lg p-8 text-slate-700 max-w-lg w-full space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xl">!</div>
          <h2 className="font-bold text-xl text-gray-900">Dashboard Unavailable</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        
        {/* Welcome Banner & Action Button */}
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Verified Citizen Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Citizen Dashboard</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Track government applications, view validation outcomes, and initiate new requests seamlessly across county departments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/applyService")}
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <FilePlus size={18} />
            Apply For New Service
            <ArrowRight size={16} />
          </button>
        </section>

        {/* Notice Banner if redirected from ApplyService */}
        {recentTrackingRef && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900">New Application Received</h4>
                <p className="text-xs text-blue-700">Reference number <span className="font-mono font-semibold">{recentTrackingRef}</span> has been successfully logged.</p>
              </div>
            </div>
            <button 
              onClick={() => setRecentTrackingRef(null)} 
              className="text-blue-500 hover:text-blue-700 p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <section>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Total Applications" 
              value={metrics.total} 
              type="info" 
              icon={<FileText className="text-blue-600" size={20} />} 
            />
            <MetricCard 
              title="Pending Review" 
              value={metrics.pending} 
              type="warning" 
              icon={<Clock className="text-amber-600" size={20} />} 
            />
            <MetricCard 
              title="Approved Requests" 
              value={metrics.approved} 
              type="success" 
              icon={<CheckCircle className="text-emerald-600" size={20} />} 
            />
            <MetricCard 
              title="Rejected / Altered" 
              value={metrics.rejected} 
              type="danger" 
              icon={<XCircle className="text-red-600" size={20} />} 
            />
          </div>
        </section>

        {/* Main Application Tracker Section */}
        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header Controls & Filters */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Application Track Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status updates synced from county clearance registries.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search tracking # or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All States</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACTION_REQUIRED">Action Required</option>
                <option value="VERIFIED">Verified</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No records matched your filters</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-6">
                {applications.length === 0 
                  ? "You haven't submitted any service requests yet." 
                  : "Try clearing your search inputs or changing the status filter."}
              </p>
              {applications.length === 0 && (
                <button 
                  onClick={() => navigate("/applyService")} 
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
                >
                  Create First Application <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/75 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tracking Number</th>
                    <th className="px-6 py-4">Service Type</th>
                    <th className="px-6 py-4">County ID / Reference</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((application) => {
                    const isNewest = application.tracking_number === recentTrackingRef;
                    return (
                      <tr 
                        key={application.id || application.tracking_number} 
                        className={`transition-colors group cursor-pointer ${isNewest ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50/85'}`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <td className="px-6 py-4 font-mono font-semibold text-slate-900 flex items-center gap-2">
                          {application.tracking_number}
                          {isNewest && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                              New
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {application.service_type?.replaceAll("_", " ") || "General Service"}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {application.county_id || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={application.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplication(application);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 bg-blue-50 group-hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                          >
                            View Details <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* Application Details Modal / Drawer */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    {selectedApplication.tracking_number}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {selectedApplication.service_type?.replaceAll("_", " ")}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Status Progression</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedApplication.status} />
                  </div>
                </div>
                {selectedApplication.county_id && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">Reference Code</p>
                    <p className="font-mono text-xs font-bold text-slate-800 mt-1">{selectedApplication.county_id}</p>
                  </div>
                )}
              </div>

              {/* Dynamic Metadata Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Application Parameters</h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs text-slate-400">Created Date</span>
                    <span className="font-medium text-slate-800">
                      {selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs text-slate-400">Department</span>
                    <span className="font-medium text-slate-800">County Directorate</span>
                  </div>
                </div>

                {/* Additional raw payload keys if present */}
                {selectedApplication.description && (
                  <div>
                    <span className="block text-xs text-slate-400 mb-1 font-medium">Application Description</span>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedApplication.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-6 border-t border-slate-100 flex gap-3">
              {selectedApplication.status === "APPROVED" && (
                <button 
                  onClick={() => alert("Downloading digital permit/certificate copy...")}
                  className="flex-1 bg-emerald-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> Download Certificate
                </button>
              )}
              <button 
                onClick={() => setSelectedApplication(null)}
                className="flex-1 bg-slate-900 text-white font-semibold text-sm py-3 rounded-xl hover:bg-slate-800 transition"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({ title, value, type = "info", icon }) {
  const typeStyles = { 
    success: "border-l-emerald-500 bg-emerald-50/20", 
    warning: "border-l-amber-500 bg-amber-50/20", 
    danger: "border-l-red-500 bg-red-50/20", 
    info: "border-l-blue-500 bg-blue-50/20" 
  };
  
  return (
    <div className={`rounded-2xl border border-slate-200 border-l-4 bg-white p-6 shadow-sm hover:shadow-md transition-all ${typeStyles[type]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-slate-900">{Number(value || 0).toLocaleString()}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = { 
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200", 
    UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200", 
    ACTION_REQUIRED: "bg-orange-50 text-orange-700 border-orange-200", 
    VERIFIED: "bg-purple-50 text-purple-700 border-purple-200", 
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200", 
    REJECTED: "bg-red-50 text-red-700 border-red-200" 
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${styles[status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status?.replaceAll("_", " ") || "UNKNOWN"}
    </span>
  );
}