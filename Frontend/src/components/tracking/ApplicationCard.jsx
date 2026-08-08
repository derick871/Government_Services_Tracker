import { Link } from "react-router-dom";

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