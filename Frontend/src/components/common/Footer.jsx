import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur text-slate-400 text-xs py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Copyright */}
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} County Government Service Tracker.</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-500">All rights reserved.</span>
        </div>

        {/* Center: System Status Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 text-[11px] font-mono">
          <CheckCircle2 size={12} />
          <span>FSM Engine: Operational</span>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-4 text-slate-400">
          <a href="#privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-200 transition-colors">Terms of Service</a>
          <a href="#contact" className="hover:text-slate-200 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}