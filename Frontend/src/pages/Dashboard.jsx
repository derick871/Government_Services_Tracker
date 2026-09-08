import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus, ArrowRight } from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"}/applications/`;

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
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
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, []);

  const metrics = useMemo(() => ({
    submitted: applications.filter(i => i.status === "SUBMITTED").length,
    pending: applications.filter(i => ["UNDER_REVIEW", "ACTION_REQUIRED", "VERIFIED"].includes(i.status)).length,
    approved: applications.filter(i => i.status === "APPROVED").length,
    rejected: applications.filter(i => i.status === "REJECTED").length,
  }), [applications]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6 flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading dashboard data...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 max-w-lg w-full">
          <h2 className="font-bold text-lg mb-2">Unable to load dashboard</h2>
          <p className="text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Welcome banner + BUTTON */}
        <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Citizen Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back to your County Portal. Manage your services online.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/applyService")}
            className="inline-flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 whitespace-nowrap"
          >
            <FilePlus size={18} />
            Apply for Service
            <ArrowRight size={16} />
          </button>
        </section>

        {/* Metrics */}
        <section>
          <h2 className="text-xl font-bold text-gray-800">Application Statistics</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            <MetricCard title="Submitted" value={metrics.submitted} type="info" />
            <MetricCard title="Under Review" value={metrics.pending} type="warning" />
            <MetricCard title="Approved" value={metrics.approved} type="success" />
            <MetricCard title="Rejected" value={metrics.rejected} type="danger" />
          </div>
        </section>

        {/* Application list */}
        <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
            {applications.length > 0 && (
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">{applications.length} total</span>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You have no applications yet.</p>
              <button onClick={() => navigate("/applyService")} className="text-sm font-semibold text-[#0A1931] border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Create First Application</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b bg-slate-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="p-4">Tracking Number</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">County</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{application.tracking_number}</td>
                      <td className="p-4">{application.service_type || "General Service"}</td>
                      <td className="p-4">{application.county || "N/A"}</td>
                      <td className="p-4"><StatusBadge status={application.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({ title, value, type = "info" }) {
  const typeStyles = { success: "border-l-green-500", warning: "border-l-amber-500", danger: "border-l-red-500", info: "border-l-blue-500" };
  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition ${typeStyles[type]}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{Number(value || 0).toLocaleString()}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = { SUBMITTED: "bg-blue-100 text-blue-700", UNDER_REVIEW: "bg-amber-100 text-amber-700", ACTION_REQUIRED: "bg-orange-100 text-orange-700", VERIFIED: "bg-purple-100 text-purple-700", APPROVED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700" };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-500"}`}>{status?.replaceAll("_", " ") || "UNKNOWN"}</span>;
}