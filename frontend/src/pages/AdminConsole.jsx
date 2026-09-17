import React, { useEffect, useState } from "react";
import client from "../components/Services/api";

export default function AdminConsole() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminAuthenticated, setAdminAuthenticated] = useState(
    sessionStorage.getItem("adminAuthenticated") === "true"
  );
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

  const handleAdminLogin = (event) => {
    event.preventDefault();

    if (password === adminPassword) {
      sessionStorage.setItem("adminAuthenticated", "true");
      setAdminAuthenticated(true);
      setLoginError("");
      return;
    }

    setLoginError("Invalid administrator password.");
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await client.get("/applications/");
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : [];

        setApplications(records);
      } catch (err) {
        console.error("Admin applications error:", err);
        setError(err.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusChange = async (application, status) => {
    if (!application.id || status === application.status) return;

    try {
      setUpdatingId(application.id);
      setError("");
      const { data } = await client.patch(`/applications/${application.id}/`, {
        status,
      });

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? { ...item, ...data, status } : item
        )
      );
    } catch (err) {
      console.error("Application status update error:", err);
      setError(err.response?.data?.detail || err.message || "Failed to update application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "bg-amber-100 text-amber-800";

      case "APPROVED":
      case "VERIFIED":
      case "FINALIZED":
        return "bg-green-100 text-green-800";

      case "REJECTED":
        return "bg-red-100 text-red-800";

      case "ACTION_REQUIRED":
        return "bg-blue-100 text-blue-800";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-600 animate-pulse font-medium">
        Loading admin console records...
      </div>
    );
  }

  if (!adminAuthenticated) {
    return (
      <div className="mx-auto max-w-md p-6 md:p-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-500">Enter the administrator password to continue.</p>
          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Administrator password"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-700">
            Unable to load applications
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Admin Console
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Overview of submitted county service applications requiring review.
        </p>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-100">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Reference
                </th>

                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Applicant
                </th>

                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>

                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {applications.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-center text-sm text-slate-500"
                  >
                    No applications pending review.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const reference =
                    app.tracking_number ||
                    app.reference ||
                    app.id;

                  const applicant =
                    app.applicant_name ||
                    app.applicantName ||
                    app.user?.full_name ||
                    app.user?.email ||
                    "Unknown Applicant";

                  const status =
                    app.status || "UNKNOWN";

                  return (
                    <tr
                      key={app.id || reference}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="p-4 text-sm font-medium text-slate-900">
                        {reference}
                      </td>

                      <td className="p-4 text-sm text-slate-700">
                        {applicant}
                      </td>

                      <td className="p-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            status
                          )}`}
                        >
                          {status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <select
                          value={status}
                          disabled={updatingId === app.id}
                          onChange={(event) => handleStatusChange(app, event.target.value)}
                          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="ACTION_REQUIRED">Action Required</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="FINALIZED">Finalized</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}