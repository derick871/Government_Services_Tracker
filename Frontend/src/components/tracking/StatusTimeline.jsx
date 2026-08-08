const steps = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACTION_REQUIRED",
  "VERIFIED",
  "APPROVED",
];

export default function StatusTimeline({
  currentStatus,
}) {
  const currentIndex =
    steps.indexOf(currentStatus);

  return (
    <div className="space-y-4">

      {steps.map((step, index) => {

        const completed =
          index <= currentIndex;

        return (
          <div
            key={step}
            className="flex items-center gap-3"
          >
            <div
              className={`
                flex h-8 w-8 items-center
                justify-center rounded-full
                text-sm font-bold
                ${
                  completed
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }
              `}
            >
              {index + 1}
            </div>

            <span
              className={
                completed
                  ? "font-semibold text-blue-700"
                  : "text-slate-500"
              }
            >
              {step.replaceAll("_", " ")}
            </span>
          </div>
        );
      })}

    </div>
  );
}