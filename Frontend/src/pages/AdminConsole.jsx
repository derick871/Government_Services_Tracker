import React, { useState, useEffect } from 'react';

export default function AdminConsole() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch unreviewed or all applications from the backend
  useEffect(() => {
    fetch('/api/admin/applications')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch admin dashboard records.');
        return res.json();
      })
      .then((data) => {
        setApplications(data); 
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Action Handler: What happens when an admin hits "Review"
  const handleReview = (id) => {
    console.log(`Navigating to review portal or opening workflow  for application: ${id}`);
  };

  // Defensive Loading & Error States
  if (loading) return <div className="p-8 text-slate-600 animate-pulse font-medium">Loading admin console records...</div>;
  if (error) return <div className="p-8 text-red-600 font-semibold">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-750">Admin Console</h1>
          <p className="mt-2 text-sm text-gray-500">
            Overview of submitted county service applications requiring review.
          </p>
        </div>
      </div>

      <div className="shadow border border-slate-200 rounded-lg overflow-hidden bg-slate-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-amber-500">Reference</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-amber-500">Applicant Name</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-amber-500">Status</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-amber-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-white">
                  No applications pending review.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-400 transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{app.reference || app.id}</td>
                  <td className="p-4 text-sm text-white">{app.applicantName}</td>
                  <td className="p-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${app.status === 'Pending' || app.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' : ''}
                      ${app.status === 'Approved' || app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                      ${app.status === 'Rejected' || app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button 
                      onClick={() => handleReview(app.id)}
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-md text-xs transition shadow-sm"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}