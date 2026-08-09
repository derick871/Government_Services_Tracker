import { useEffect, useMemo, useState } from "react";
import { getApplications } from "../Services/Services";

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch citizen applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getApplications();

        // Support both array and paginated API responses
        const records = Array.isArray(data)
          ? data
          : data?.results || [];

        setApplications(records);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err.message || "Failed to load dashboard data."
        );
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
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      <div className="mx-auto max-w-7xl space-y-8">

        {/* Welcome banner */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Citizen Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Welcome back to your County Portal.
            Manage your services cleanly online.
          </p>
        </section>

        {/* Metrics */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Application Statistics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of your submitted county services.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <MetricCard
              title="Submitted"
              value={metrics.submitted}
              type="info"
            />

            <MetricCard
              title="Under Review"
              value={metrics.pending}
              type="warning"
            />

            <MetricCard
              title="Approved"
              value={metrics.approved}
              type="success"
            />

            <MetricCard
              title="Rejected"
              value={metrics.rejected}
              type="danger"
            />

          </div>
        </section>

        {/* Application list */}
        <section className="rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Recent Applications
            </h2>
          </div>

          {applications.length === 0 ? (
            <p className="text-slate-500">
              You have no applications yet.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-4">
                      Tracking Number
                    </th>

                    <th className="p-4">
                      Service
                    </th>

                    <th className="p-4">
                      County
                    </th>

                    <th className="p-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="p-4 font-medium">
                        {application.tracking_number}
                      </td>

                      <td className="p-4">
                        {application.service_type}
                      </td>

                      <td className="p-4">
                        {application.county_id}
                      </td>

                      <td className="p-4">
                        <StatusBadge
                          status={application.status}
                        />
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
function MetricCard({
  title,
  value,
  type = "info",
}) {
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
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {Number(value).toLocaleString()}
      </p>
    </div>
  );
}


// Application status badge
function StatusBadge({ status }) {
  const styles = {
    SUBMITTED:
      "bg-blue-100 text-blue-700",

    UNDER_REVIEW:
      "bg-amber-100 text-amber-700",

    ACTION_REQUIRED:
      "bg-orange-100 text-orange-700",

    VERIFIED:
      "bg-purple-100 text-purple-700",

    APPROVED:
      "bg-green-100 text-green-700",

    REJECTED:
      "bg-red-100 text-red-700",
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
      {status?.replaceAll("_", " ") || "UNKNOWN"}
    </span>
  );
}