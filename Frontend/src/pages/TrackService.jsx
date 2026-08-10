import React, { useEffect, useState } from "react";
import {
  getApplicationByTrackingNumber,
} from "../services/services";

const WORKFLOW_STEPS = [
  {
    id: "SUBMITTED",
    label: "Submitted",
  },
  {
    id: "UNDER_REVIEW",
    label: "Under Review",
  },
  {
    id: "FINALIZED",
    label: "Finalized",
  },
];

export default function TrackService({
  trackingNumber,
}) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trackingNumber) {
      setError("Tracking number is required.");
      setLoading(false);
      return;
    }

    const loadApplication = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getApplicationByTrackingNumber(
            trackingNumber
          );

        setApplication(data);
      } catch (err) {
        console.error(
          "Tracking request failed:",
          err
        );

        setError(
          err.message ||
            "Unable to load application tracking data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [trackingNumber]);

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-slate-600">
          Loading tracking information...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Unable to load application
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // Empty state
  if (!application) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-slate-600">
          No application found.
        </p>
      </div>
    );
  }

  const status = application.status;

  // Determine visual step
  let currentStepIndex = 0;

  if (status === "UNDER_REVIEW") {
    currentStepIndex = 1;
  }

  if (
    status === "VERIFIED" ||
    status === "APPROVED" ||
    status === "REJECTED"
  ) {
    currentStepIndex = 2;
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Track Application
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Tracking Number:
          <span className="ml-2 font-semibold text-slate-700">
            {application.tracking_number}
          </span>
        </p>
      </div>

      {/* Application details */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          title="County"
          value={application.county_id}
        />

        <InfoCard
          title="Service"
          value={application.service_type}
        />

        <InfoCard
          title="Current Status"
          value={status.replaceAll("_", " ")}
        />
      </div>

      {/* Timeline */}
      <div>
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Application Progress
        </h2>

        <div className="relative ml-4 space-y-8 border-l-2 border-slate-200 pl-6">
          {WORKFLOW_STEPS.map(
            (step, index) => {
              const isCompleted =
                index < currentStepIndex;

              const isCurrent =
                index === currentStepIndex;

              let label = step.label;

              if (
                step.id === "FINALIZED" &&
                status === "APPROVED"
              ) {
                label = "Approved";
              }

              if (
                step.id === "FINALIZED" &&
                status === "REJECTED"
              ) {
                label = "Rejected";
              }

              return (
                <div
                  key={step.id}
                  className="relative flex items-center"
                >
                  {/* Timeline node */}
                  <div
                    className={`
                      absolute -left-[39px]
                      flex h-7 w-7 items-center
                      justify-center rounded-full
                      text-xs font-bold
                      transition-all
                      ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : ""
                      }
                      ${
                        isCurrent &&
                        status === "REJECTED"
                          ? "bg-red-600 text-white ring-4 ring-red-100"
                          : ""
                      }
                      ${
                        isCurrent &&
                        status !== "REJECTED"
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : ""
                      }
                      ${
                        !isCompleted &&
                        !isCurrent
                          ? "bg-slate-200 text-slate-500"
                          : ""
                      }
                    `}
                  >
                    {isCompleted
                      ? "✓"
                      : index + 1}
                  </div>

                  {/* Step text */}
                  <div>
                    <p
                      className={`
                        font-semibold
                        ${
                          isCurrent &&
                          status === "REJECTED"
                            ? "text-red-600"
                            : ""
                        }
                        ${
                          isCurrent &&
                          status !== "REJECTED"
                            ? "text-blue-600"
                            : ""
                        }
                        ${
                          isCompleted
                            ? "text-green-700"
                            : ""
                        }
                        ${
                          !isCompleted &&
                          !isCurrent
                            ? "text-slate-400"
                            : ""
                        }
                      `}
                    >
                      {label}
                    </p>

                    {isCurrent && (
                      <p className="mt-1 text-sm text-slate-500">
                        Current application status
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Status logs */}
      {application.logs?.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Status History
          </h2>

          <div className="space-y-3">
            {application.logs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="font-medium text-slate-800">
                  {log.from_state} →{" "}
                  {log.to_state}
                </p>

                {log.comment && (
                  <p className="mt-1 text-sm text-slate-500">
                    {log.comment}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  {new Date(
                    log.timestamp
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value || "N/A"}
      </p>
    </div>
  );
}