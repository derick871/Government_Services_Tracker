import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [activePanel, setActivePanel] = useState(null);

  const panels = {
    privacy: {
      title: 'Privacy Policy',
      content: 'We collect only the information needed to provide and improve county services. Your information is stored securely, used only for legitimate service purposes, and is not sold to third parties. Contact support to request access to or correction of your information.'
    },
    terms: {
      title: 'Terms of Service',
      content: 'By using the County Government Service Tracker, you agree to provide accurate information and use the system lawfully. Service availability and processing times may vary by department. We may update these terms when necessary to improve the service.'
    },
    support: {
      title: 'Support',
      content: 'Need help? Contact the County Service Desk at support@county.gov or call (555) 010-2025, Monday through Friday, 8:00 AM–5:00 PM. Include your service request number when contacting us.'
    }
  };

  return (
    <>
      <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur text-white text-xs py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Copyright */}
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} County Government Service Tracker.</span>
          <span className="hidden md:inline text-amber-600">|</span>
          <span className="hidden md:inline text-amber-500">All rights reserved.</span>
        </div>

        {/* Center: System Status Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 text-[11px] font-mono">
          <CheckCircle2 size={12} />
          <span>FSM Engine: Operational</span>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-4 text-white">
          {Object.entries(panels).map(([key, panel]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivePanel(key)}
              className="hover:text-amber-200 transition-colors"
            >
              {panel.title}
            </button>
          ))}
        </div>
      </div>
      </footer>

      {activePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4" role="dialog" aria-modal="true" aria-labelledby="footer-panel-title">
          <div className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="footer-panel-title" className="text-lg font-semibold text-amber-200">
                {panels[activePanel].title}
              </h2>
              <button type="button" onClick={() => setActivePanel(null)} className="text-slate-400 hover:text-white" aria-label="Close">
                ×
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{panels[activePanel].content}</p>
            <button type="button" onClick={() => setActivePanel(null)} className="mt-6 rounded bg-amber-500 px-4 py-2 font-medium text-slate-950 hover:bg-amber-400">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}