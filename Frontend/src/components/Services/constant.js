export const WORKFLOW_STATES = {
  SUBMITTED: { label: "Submitted", step: 1, color: "blue" },
  UNDER_REVIEW: { label: "Under Review", step: 2, color: "amber" },
  ACTION_REQUIRED: { label: "Action Required", step: 2, color: "orange" },
  VERIFIED: { label: "Verified", step: 3, color: "purple" },
  APPROVED: { label: "Approved", step: 4, color: "green" },
  REJECTED: { label: "Rejected", step: 4, color: "red" },
  FINALIZED: { label: "Finalized", step: 4, color: "emerald" },
};

export const TRACKING_STEPS = [
  { id: "SUBMITTED", label: "Application Submitted" },
  { id: "UNDER_REVIEW", label: "Under Review / Processing" },
  { id: "VERIFIED", label: "Compliance Verified" },
  { id: "FINALIZED", label: "Final Outcome (Approved/Rejected)" },
];
