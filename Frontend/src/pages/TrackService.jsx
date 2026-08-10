import React, { useState, useEffect } from 'react';

// 1. Define standard, sequential workflow steps
const WORKFLOW_STEPS = [
  { id: 'SUBMITTED', label: 'Submitted' },
  { id: 'UNDER_REVIEW', label: 'Under Review' },
  { id: 'FINALIZED', label: 'Finalized' } // Merged terminal state
];

export default function TrackService({ applicationId = "123" }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Fetch data from backend on mount or when id changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/applications/${applicationId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load tracking data.');
        return res.json();
      })
      .then((data) => {
        setApplication(data); 
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [applicationId]);

  // Handle asynchronous UI states defensively
  if (loading) return <div className="p-8 text-white animate-pulse">Loading tracking history...</div>;
  if (error) return <div className="p-8 text-red-500 font-medium">Error: {error}</div>;
  if (!application) return <div className="p-8 text-white">No application data found.</div>;

  const status = application.currentStatus; 
  
  // Map real terminal states back to our visual pipeline step index
  let currentStepIndex = 0;
  if (status === 'UNDER_REVIEW') currentStepIndex = 1;
  if (status === 'APPROVED' || status === 'REJECTED') currentStepIndex = 2;

  return (
    <div className="max-w-xl p-8 bg-slate-700 rounded-xl shadow-sm border border-slate-100">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Track Application</h1>
        <p className="text-sm text-slate-500 mt-1">ID: #{applicationId}</p>
      </header>

      <div className="relative pl-4 space-y-6 border-l-2 border-slate-200 ml-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          // Dynamically overwrite label if the terminal state is a rejection
          let stepLabel = step.label;
          if (step.id === 'FINALIZED' && status === 'REJECTED') {
            stepLabel = 'Rejected';
          } else if (step.id === 'FINALIZED' && status === 'APPROVED') {
            stepLabel = 'Approved';
          }

          return (
            <div key={step.id} className="relative flex items-center group">
              {/* Timeline Node Ring/Dot */}
              <div 
                className={`absolute -left-[25px] w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-300
                  ${isCompleted ? 'bg-green-600 text-white' : ''}
                  ${isCurrent && status === 'REJECTED' ? 'bg-red-600 text-white animate-scale' : ''}
                  ${isCurrent && status !== 'REJECTED' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-200 text-slate-600' : ''}
                `}
              >
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Step Meta Context */}
              <div className="ml-6">
                <p className={`font-semibold text-base transition-colors
                  ${isCurrent && status === 'REJECTED' ? 'text-red-600' : ''}
                  ${isCurrent && status !== 'REJECTED' ? 'text-blue-600' : ''}
                  ${isCompleted ? 'text-success-800' : 'text-green-400'}
                `}>
                  {stepLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}