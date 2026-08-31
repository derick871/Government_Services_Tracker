import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Search, ArrowRight } from 'lucide-react';

export default function Home({ user }) {
  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-2xl bg-white border border-gov-border p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <ShieldCheck size={14} /> Official County Government Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            County Service Tracker
          </h1>
          <p className="text-lg text-gray-500">
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
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg border border-slate-700 transition-all"
                >
                  Sign In <ArrowRight size={18} />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg border border-slate-700 transition-all"
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
        <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-3 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Streamlined Applications</h2>
          <p className="text-sm text-slate-600">
            Submit required details and county documents digitally without standing in physical queues.
          </p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-3 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Search size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Real-Time Tracking</h2>
          <p className="text-sm text-slate-600">
            Monitor your application state updates step-by-step from submission to final approval or verification.
          </p>
        </div>
      </section>
    </div>
  );
}