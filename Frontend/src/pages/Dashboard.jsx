import { useEffect, useMemo, useState } from "react";

// Assuming your service utility is exported or fetch is wrapped here.
// If you use a centralized API module, adjust this import.
const API_URL = "http://127.0.0.1:8000/api/applications/";

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch citizen applications with JWT Authentication header support
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access");

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const contentType = response.headers.get("content-type");

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/login"; // Redirect on expiration
            return;
          }

          let message = `Request failed with status ${response.status}`;
          if (contentType?.includes("application/json")) {
            const data = await response.json();
            message = data.detail || data.message || message;
          }
          throw new Error(message);
        }

        const data = await response.json();

        // Support both array and paginated API responses
        const records = Array.isArray(data)
          ? data
          : data?.results || [];

        setApplications(records);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  // Calculate dashboard statistics
  const metrics = useMemo(() => {
    return {
      submitted: applications.filter(
        (item) => item.status === "SUBMITTED"
      ).length,

      pending: applications.filter(
        (item) =>
          item.status === "UNDER_REVIEW" ||
          item.status === "ACTION_REQUIRED" ||
          item.status === "VERIFIED"
      ).length,

      approved: applications.filter(
        (item) => item.status === "APPROVED"
      ).length,

      rejected: applications.filter(
        (item) => item.status === "REJECTED"
      ).length,
    };
  }, [applications]);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-500 animate-pulse text-lg font-medium">
            Loading dashboard data...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="mx-auto max-w-lg w-full">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-md text-red-700">
            <h2 className="font-bold text-lg mb-2">Unable to load dashboard</h2>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Welcome banner */}
        <section className="rounded-xl bg-slate-800 p-6 shadow-sm border border-slate-700">
          <h1 className="text-3xl font-bold text-amber-400">
            Citizen Dashboard
          </h1>
          <p className="mt-2 text-slate-300">
            Welcome back to your County Portal. Manage your services cleanly online.
          </p>
        </section>

        {/* Metrics */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Application Statistics
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Overview of your submitted county services.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Submitted" value={metrics.submitted} type="info" />
            <MetricCard title="Under Review" value={metrics.pending} type="warning" />
            <MetricCard title="Approved" value={metrics.approved} type="success" />
            <MetricCard title="Rejected" value={metrics.rejected} type="danger" />
          </div>
        </section>

        {/* Application list */}
        <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              Recent Applications
            </h2>
          </div>

          {applications.length === 0 ? (
            <p className="text-slate-500 py-4 text-center">
              You have no applications yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Tracking Number</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">County</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((application) => (
                    <tr
                      key={application.id || application.tracking_number}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-slate-900">
                        {application.tracking_number || "N/A"}
                      </td>
                      <td className="p-4">
                        {application.service_type || application.service || "General Service"}
                      </td>
                      <td className="p-4">
                        {application.county_id || application.county || "N/A"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={application.status} />
                      </td>
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

// Reusable metric card
function MetricCard({ title, value, type = "info" }) {
  const typeStyles = {
    success: "border-l-green-500",
    warning: "border-l-amber-500",
    danger: "border-l-red-500",
    info: "border-l-blue-500",
  };

  return (
    <div
      className={`
        rounded-xl
        border
        border-slate-200
        border-l-4
        bg-white
        p-6
        shadow-sm
        transition
        hover:-translate-y-1
        hover:shadow-md
        ${typeStyles[type]}
      `}
    >
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}

// Application status badge
function StatusBadge({ status }) {
  const styles = {
    SUBMITTED: "bg-blue-100 text-blue-700",
    UNDER_REVIEW: "bg-amber-100 text-amber-700",
    ACTION_REQUIRED: "bg-orange-100 text-orange-700",
    VERIFIED: "bg-purple-100 text-purple-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${styles[status] || "bg-slate-100 text-slate-600"}
      `}
    >
      {status ? status.replaceAll("_", " ") : "UNKNOWN"}
    </span>
  );
}