import { Link } from "react-router-dom";

const STATUS_STYLES = {
  SUBMITTED: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  ACTION_REQUIRED: {
    label: "Action Required",
    className: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  VERIFIED: {
    label: "Verified",
    className: "bg-purple-50 text-purple-700 ring-purple-100",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 ring-red-100",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-50 text-green-700 ring-green-100",
  },
};
function getStatus(status) {
  const normalizedStatus = status?.toUpperCase();

  return (
    STATUS_STYLES[normalizedStatus] || {
      label: status || "Unknown",
      className: "bg-slate-50 text-slate-600 ring-slate-100",
    }
  );
}


  export default function ApplicationCard({ application }) {
  if (!application) return null;

  const {
    tracking_number,
    service_type,
    service,
    status,
    county_id,
    created_at,
  } = application;

  const statusInfo = getStatus(status);

  const serviceName =
    service_type ||
    service?.name ||
    "Government Service";

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString()
    : null;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {/* Service icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 3v5h5"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">
              {serviceName}
            </h3>

            <p className="mt-1 truncate text-xs text-slate-500">
              Ref: {tracking_number || "Not available"}
            </p>
          </div>
        </div>

        {/* Status */}
        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Meta information */}
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            County
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {county_id || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Submitted
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {formattedDate || "N/A"}
          </p>
        </div>
      </div>

      {/* Action */}
      <Link
        to={`/track/${tracking_number}`}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Track application

        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>
    </article>
  );
  }