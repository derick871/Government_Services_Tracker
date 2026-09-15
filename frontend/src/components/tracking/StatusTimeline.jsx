// src/components/StatusTimeline.jsx

const STEPS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "VERIFIED",
  "APPROVED",
];

const LABELS = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACTION_REQUIRED: "Action Required",
  VERIFIED: "Verified",
  APPROVED: "Approved",
};

export default function StatusTimeline({
  currentStatus,
}) {
  const normalizedStatus =
    String(currentStatus || "")
      .toUpperCase();

  /*
   * Rejected is a terminal state that doesn't
   * belong to the normal approval progression.
   */
  if (normalizedStatus === "REJECTED") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
            !
          </div>

          <div>
            <p className="font-semibold text-red-800">
              Application Rejected
            </p>

            <p className="mt-0.5 text-xs text-red-600">
              Please review the application feedback.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex =
    STEPS.indexOf(normalizedStatus);

  return (
    <div className="space-y-4">

      {STEPS.map((step, index) => {
        const completed =
          currentIndex >= 0 &&
          index <= currentIndex;

        const current =
          index === currentIndex;

        return (
          <div
            key={step}
            className="flex items-center gap-3"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                completed
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {index + 1}
            </div>

            <span
              className={
                current
                  ? "font-bold text-blue-700"
                  : completed
                    ? "font-semibold text-slate-700"
                    : "text-slate-500"
              }
            >
              {LABELS[step]}
            </span>
          </div>
        );
      })}

    </div>
  );
}
