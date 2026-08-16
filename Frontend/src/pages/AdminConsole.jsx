import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/applications/";

export default function AdminConsole() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access");

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        });

        const contentType = response.headers.get("content-type");

        if (!response.ok) {
          let message = `Request failed with status ${response.status}`;

          if (contentType?.includes("application/json")) {
            const data = await response.json();
            message = data.detail || data.message || message;
          } else {
            const text = await response.text();
            console.error("Server returned:", text.substring(0, 300));
          }

          throw new Error(message);
        }

        if (!contentType?.includes("application/json")) {
          const text = await response.text();

          console.error("Expected JSON but received:", text.substring(0, 300));

          throw new Error(
            "The server returned HTML instead of JSON. Check the API URL and Django routes."
          );
        }

        const data = await response.json();


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

  const handleReview = (application) => {
    console.log(
      "Reviewing application:",
      application.tracking_number || application.id
    );

    // Add navigation here later
    // navigate(`/admin/applications/${application.id}`);
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
                        <button
                          type="button"
                          onClick={() => handleReview(app)}
                          className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
                        >
                          Review
                        </button>
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