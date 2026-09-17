import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Search, ArrowRight, Building2, Activity, GraduationCap, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Track which service's "Learn More" section is currently expanded
  const [expandedService, setExpandedService] = useState(null);

  const toggleLearnMore = (serviceKey) => {
    setExpandedService(expandedService === serviceKey ? null : serviceKey);
  };

  // Handle application clicks with automated auth guard logic
  const handleApplyClick = (serviceRoute) => {
    if (!user) {
      // Redirect to login first, then pass state to redirect back or just prompt sign-in
      navigate('/login', { state: { from: '/apply-service', serviceRoute } });
    } else {
      navigate('/apply-service', { state: { serviceRoute } });
    }
  };

  // NTSA service catalogue. Keep these field names aligned with ApplyServices so
  // the same metadata can drive validation and the application form.
  const services = [
    {
      key: 'business-permits', title: 'Business Permits', icon: <Building2 className="w-6 h-6 text-indigo-600" />, bgIcon: 'bg-indigo-500/10',
      shortDesc: 'Apply for or renew a county business permit.', route: '/applications/business-permits',
      fullDetails: { requirements: ['National ID or passport', 'Business registration certificate', 'Physical business address', 'Previous permit for renewals'], fields: ['applicantName', 'idNumber', 'businessName', 'businessType', 'businessLocation', 'phoneNumber'], processingTime: '1 - 3 Working Days', fees: 'Prescribed county business permit fee.' }
    },
    {
      key: 'health-services', title: 'Health Services', icon: <Activity className="w-6 h-6 text-rose-600" />, bgIcon: 'bg-rose-500/10',
      shortDesc: 'Access county health services and submit service requests.', route: '/applications/health-services',
      fullDetails: { requirements: ['National ID or passport', 'Referral letter where applicable', 'Relevant medical records', 'Appointment details'], fields: ['applicantName', 'idNumber', 'serviceType', 'facility', 'preferredDate', 'phoneNumber'], processingTime: 'Subject to facility availability', fees: 'Fees vary by health service and facility.' }
    },
    {
      key: 'bursaries', title: 'Education Bursaries', icon: <GraduationCap className="w-6 h-6 text-teal-600" />, bgIcon: 'bg-teal-500/10',
      shortDesc: 'Apply for county education bursary support.', route: '/applications/bursaries',
      fullDetails: { requirements: ['Student National ID or birth certificate', 'Parent or guardian National ID', 'Proof of residence', 'School admission or fee statement'], fields: ['studentName', 'studentIdNumber', 'institutionName', 'courseOrClass', 'guardianName', 'phoneNumber'], processingTime: '14 - 30 Working Days', fees: 'No application fee.' }
    },
    {
      key: 'land-services', title: 'Land Services', icon: <MapPin className="w-6 h-6 text-lime-600" />, bgIcon: 'bg-lime-500/10',
      shortDesc: 'Submit requests for county land and property services.', route: '/applications/land-services',
      fullDetails: { requirements: ['National ID or passport', 'Proof of ownership or occupancy', 'Property reference details', 'Relevant survey documents'], fields: ['applicantName', 'idNumber', 'parcelNumber', 'serviceType', 'propertyLocation', 'phoneNumber'], processingTime: '7 - 21 Working Days', fees: 'Prescribed county land-service fee.' }
    },
    {
      key: 'vehicle-registration', title: 'Vehicle Registration', icon: <Building2 className="w-6 h-6 text-amber-600" />, bgIcon: 'bg-amber-500/10',
      shortDesc: 'Register a new vehicle and obtain its registration details.', route: '/applications/vehicle-registration',
      fullDetails: { requirements: ['National ID or passport', 'KRA PIN certificate', 'Invoice or customs entry documents', 'Import declaration form (where applicable)'], fields: ['ownerName', 'idNumber', 'kraPin', 'vehicleMake', 'vehicleModel', 'chassisNumber', 'engineNumber'], processingTime: '3 - 7 Working Days', fees: 'Prescribed NTSA registration fee; varies by vehicle type.' }
    },
    {
      key: 'vehicle-transfer', title: 'Transfer of Vehicle Ownership', icon: <ArrowRight className="w-6 h-6 text-blue-600" />, bgIcon: 'bg-blue-500/10',
      shortDesc: 'Submit a digital application to transfer ownership of a vehicle.', route: '/applications/vehicle-transfer',
      fullDetails: { requirements: ['Original logbook or e-logbook details', 'Buyer and seller National IDs', 'Buyer and seller KRA PINs', 'Valid insurance certificate'], fields: ['buyerName', 'sellerName', 'buyerIdNumber', 'sellerIdNumber', 'registrationNumber', 'saleAmount'], processingTime: '1 - 3 Working Days', fees: 'Prescribed NTSA transfer fee based on engine capacity.' }
    },
    {
      key: 'driving-licence', title: 'Driving Licence Services', icon: <Activity className="w-6 h-6 text-emerald-600" />, bgIcon: 'bg-emerald-500/10',
      shortDesc: 'Apply for a provisional licence, renew a licence, or request a smart driving licence.', route: '/applications/driving-licence',
      fullDetails: { requirements: ['National ID or passport', 'Existing licence for renewal or replacement', 'Current passport photo where required', 'Medical certificate for applicable classes'], fields: ['applicantName', 'idNumber', 'licenceNumber', 'licenceClass', 'serviceType', 'phoneNumber'], processingTime: 'Same day to 7 Working Days', fees: 'Prescribed NTSA fee; depends on licence service and validity period.' }
    },
    {
      key: 'driving-test', title: 'Driving Test Booking', icon: <GraduationCap className="w-6 h-6 text-purple-600" />, bgIcon: 'bg-purple-500/10',
      shortDesc: 'Book a driving test at an available NTSA test centre.', route: '/applications/driving-test',
      fullDetails: { requirements: ['Provisional driving licence', 'National ID or passport', 'Driving school completion details'], fields: ['applicantName', 'idNumber', 'licenceClass', 'testCentre', 'preferredDate', 'phoneNumber'], processingTime: 'Subject to test-centre availability', fees: 'Prescribed NTSA driving test fee.' }
    },
    {
      key: 'vehicle-inspection', title: 'Vehicle Inspection', icon: <Search className="w-6 h-6 text-orange-600" />, bgIcon: 'bg-orange-500/10',
      shortDesc: 'Request inspection for transfer, importation, change of particulars, or roadworthiness.', route: '/applications/vehicle-inspection',
      fullDetails: { requirements: ['National ID or passport', 'Original logbook or customs documents', 'Valid insurance certificate', 'Inspection booking details'], fields: ['ownerName', 'idNumber', 'registrationNumber', 'inspectionType', 'inspectionCentre', 'preferredDate'], processingTime: 'Subject to inspection-centre availability', fees: 'Prescribed NTSA inspection fee.' }
    },
    {
      key: 'duplicate-logbook', title: 'Duplicate Logbook', icon: <FileText className="w-6 h-6 text-red-600" />, bgIcon: 'bg-red-500/10',
      shortDesc: 'Request a replacement logbook for a lost, damaged, or defaced document.', route: '/applications/duplicate-logbook',
      fullDetails: { requirements: ['National ID or passport', 'Police abstract for a lost logbook', 'Statutory declaration where required', 'Vehicle registration details'], fields: ['ownerName', 'idNumber', 'registrationNumber', 'reason', 'policeAbstractNumber'], processingTime: '7 - 14 Working Days', fees: 'Prescribed NTSA duplicate-logbook fee.' }
    },
    {
      key: 'psv-licensing', title: 'PSV Licensing & Badges', icon: <ShieldCheck className="w-6 h-6 text-cyan-600" />, bgIcon: 'bg-cyan-500/10',
      shortDesc: 'Apply for PSV licences, driver badges, and conductors’ certificates.', route: '/applications/psv-licensing',
      fullDetails: { requirements: ['National ID or passport', 'Valid driving licence', 'Certificate of good conduct', 'Medical certificate and passport photo'], fields: ['applicantName', 'idNumber', 'licenceNumber', 'psvClass', 'vehicleRegistration', 'phoneNumber'], processingTime: '7 - 14 Working Days', fees: 'Prescribed NTSA PSV licensing fee.' }
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
            County <span className='text-amber-500'>Service </span> Tracker
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
                  className="inline-flex items-center gap-2 bg-blue-800 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md"
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Available County <span className='text-amber-500'>Service </span></h2>
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