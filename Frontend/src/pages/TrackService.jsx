 import React, { useEffect, useState } from "react";
import { getApplicationByTrackingNumber } from "../components/Services/Services";
import { TRACKING_STEPS } from "../components/Services/constant";

export default function TrackService({ trackingNumber: propTrackingNumber }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resolveTrackingNumber = () => {
    if (propTrackingNumber?.trim()) return propTrackingNumber.trim().toUpperCase();
    const params = new URLSearchParams(window.location.search);
    return params.get("tracking")?.trim().toUpperCase() || "";
  };

  useEffect(() => {
    const trackingNumber = resolveTrackingNumber();
    if (!trackingNumber) {
      setError("Please provide a valid tracking reference.");
      setLoading(false);
      return;
    }

    const loadApplication = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getApplicationByTrackingNumber(trackingNumber);
        if (!data) throw new Error("Application not found.");
        setApplication(data);
      } catch (err) {
        setError(err?.message || "Unable to retrieve tracking data.");
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [propTrackingNumber]);

  if (loading) return <div className="p-6 text-slate-600 animate-pulse">Loading progress details...</div>;
  if (error) return <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>;
  if (!application) return <div className="p-6 text-slate-600">Enter a tracking number to monitor your service request.</div>;

  const currentStatus = (application.status || "SUBMITTED").toUpperCase();

  // Determine active step index for multi-state government workflow
  const getStepIndex = (status) => {
    if (["SUBMITTED"].includes(status)) return 0;
    if (["UNDER_REVIEW", "ACTION_REQUIRED"].includes(status)) return 1;
    if (["VERIFIED"].includes(status)) return 2;
    if (["APPROVED", "REJECTED", "FINALIZED"].includes(status)) return 3;
    return 0;
  };

  const currentStepIndex = getStepIndex(currentStatus);

  return (
    <div className="rounded-xl bg-white p-6 md:p-8 shadow-sm border border-slate-200 max-w-4xl mx-auto">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Service Progress Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tracking Reference: <span className="font-semibold text-slate-800">{application.tracking_number}</span>
        </p>
      </div>

      {/* Service Meta Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <InfoCard title="Service Type" value={application.service_type || application.service?.name} />
        <InfoCard title="County Office" value={application.county_id} />
        <InfoCard title="Live Status" value={currentStatus.replaceAll("_", " ")} highlight />
      </div>

      {/* Multi-State Timeline Progress Flow */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Workflow Milestones</h2>
        <div className="relative ml-4 space-y-8 border-l-2 border-slate-200 pl-6">
          {TRACKING_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isRejected = isCurrent && currentStatus === "REJECTED";

            return (
              <div key={step.id} className="relative flex items-start">
                <div
                  className={`absolute -left-[37px] flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isRejected
                      ? "bg-red-600 text-white ring-4 ring-red-100"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>

                <div>
                  <p className={`font-semibold ${isCurrent ? "text-blue-600 text-base" : "text-slate-700"}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      Currently On Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value, highlight }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className={`mt-1 font-semibold ${highlight ? "text-blue-600" : "text-slate-800"}`}>{value || "N/A"}</p>
    </div>
  );
}
