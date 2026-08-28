import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Search, ArrowRight } from 'lucide-react';

export default function Home({ user }) {
  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck size={14} /> Official County Government Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            County Service Tracker
          </h1>
          <p className="text-lg text-slate-300">
            Access, apply, and monitor government services with complete transparency, speed, and reliability.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg"
                >
                  Sign In <ArrowRight size={18} />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl border border-slate-600 transition-all"
                >
                  Register Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Streamlined Applications</h2>
          <p className="text-sm text-slate-400">
            Submit required details and county documents digitally without standing in physical queues.
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            <Search size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Real-Time FSM Tracking</h2>
          <p className="text-sm text-slate-400">
            Monitor your application state updates step-by-step from submission to final approval or verification.
          </p>
        </div>
      </section>
    </div>
  );
}