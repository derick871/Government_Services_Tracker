import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Search, ArrowRight, Building2, Activity, GraduationCap, MapPin, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export default function Home({ user }) {
  const navigate = useNavigate();
  
  // Track which service's "Learn More" section is currently expanded
  const [expandedService, setExpandedService] = useState(null);

  const toggleLearnMore = (serviceKey) => {
    setExpandedService(expandedService === serviceKey ? null : serviceKey);
  };

  // Handle application clicks with automated auth guard logic
  const handleApplyClick = (serviceRoute) => {
    if (!user) { 
      // Redirect to login first, then pass state to redirect back or just prompt sign-in
      navigate('/login', { state: { from: serviceRoute } });
    } else {
      navigate(serviceRoute);
    }
  };

  const services = [
    {
      key: 'permits',
      title: 'Business & Trade Permits',
      icon: <Building2 className="w-6 h-6 text-amber-600" />,
      bgIcon: 'bg-amber-500/10',
      shortDesc: 'Apply for single business permits, renewal, and regulatory compliance documents.',
      fullDetails: {
        requirements: [
          'Copy of National ID / Passport',
          'KRA PIN Certificate',
          'Previous year permit (for renewals)',
          'Fire safety and health clearance certificate'
        ],
        processingTime: '3 - 5 Working Days',
        fees: 'Varies based on business classification and location zone.'
      },
      route: '/applications/permits'
    },
    {
      key: 'health',
      title: 'Health Services & Food Handlers',
      icon: <Activity className="w-6 h-6 text-emerald-600" />,
      bgIcon: 'bg-emerald-500/10',
      shortDesc: 'Secure food handler certificates, public health licenses, and facility inspections.',
      fullDetails: {
        requirements: [
          'Medical examination report from an approved county hospital',
          'Passport-sized photo',
          'National ID card copy'
        ],
        processingTime: '2 - 3 Working Days',
        fees: 'Standard county medical test and certificate fee applies.'
      },
      route: '/applications/health'
    },
    {
      key: 'bursaries',
      title: 'Education Bursaries',
      icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
      bgIcon: 'bg-blue-500/10',
      shortDesc: 'Apply for ward-based secondary, tertiary, and university education financial support.',
      fullDetails: {
        requirements: [
          'Duly filled county bursary application form',
          'Copy of student school/university ID and admission letter',
          'Parent/Guardian National ID copy',
          'Proof of residency within the sub-county/ward'
        ],
        processingTime: 'Subject to board review cycles per financial year',
        fees: 'Free Application'
      },
      route: '/applications/bursaries'
    },
    {
      key: 'land',
      title: 'Land & Rates Services',
      icon: <MapPin className="w-6 h-6 text-purple-600" />,
      bgIcon: 'bg-purple-500/10',
      shortDesc: 'Check land parcel rates clearance, search histories, and physical planning requests.',
      fullDetails: {
        requirements: [
          'Title deed or allotment letter copy',
          'Most recent land rates clearance certificate (if applicable)',
          'Owner identification documents'
        ],
        processingTime: '1 - 2 Working Days for clearances',
        fees: 'Based on official county land valuation tables.'
      },
      route: '/applications/land'
    }
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/25">
            <ShieldCheck size={14} /> Official County Government Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            County Service Tracker
          </h1>
          <p className="text-lg text-slate-600">
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
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md"
                >
                  Sign In <ArrowRight size={18} />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md"
                >
                  Register Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Services  (Permits, Health, Bursaries, Land) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Available County Services</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Select a service category below to review documentation guidelines, learn more, or initiate your application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const isExpanded = expandedService === service.key;

            return (
              <div 
                key={service.key} 
                className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-md flex flex-col justify-between transition-all hover:border-slate-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${service.bgIcon} flex items-center justify-center font-bold`}>
                      {service.icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                      County Portal
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mt-4">{service.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {service.shortDesc}
                  </p>

                  {/* Expandable Information Drawer */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-sm text-slate-700 animate-fadeIn">
                      <div>
                        <strong className="text-slate-900 block mb-1">Required Documents:</strong>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600">
                          {service.fullDetails.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span><strong>Turnaround:</strong> {service.fullDetails.processingTime}</span>
                        <span><strong>Cost:</strong> {service.fullDetails.fees}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggleLearnMore(service.key)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {isExpanded ? 'Show Less' : 'Learn More'}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <button
                    onClick={() => handleApplyClick(service.route)}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
                  >
                    Apply Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Grid Overview (Tracking & Streamlined Process) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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