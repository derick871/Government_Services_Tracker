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

export default function ApplicationCard({
  application,
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h3 className="font-semibold text-slate-800">
            {application.service_type}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {application.tracking_number}
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {application.status}
        </span>

      </div>

      <Link
        to={`/track/${application.tracking_number}`}
        className="mt-4 inline-block text-sm font-semibold text-blue-600"
      >
        View application
      </Link>

    </div>
  );
}