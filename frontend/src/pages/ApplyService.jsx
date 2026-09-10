import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Send } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fallback static definitions mirroring  Home page cards 
const FALLBACK_SERVICES = [
  {
    id: "business-permits",
    title: "Single Business Permits",
    county_id: "REG-BP-01",
    requirements: [
      "Valid National ID / Passport of the Business Owner or Director",
      "Copy of KRA PIN Certificate for the business/entity",
      "Previous year Business Permit (for renewals)",
      "Physical business location details (Plot number, Street, Building)"
    ]
  },
  {
    id: "lands",
    title: "Lands & Property Rates",
    county_id: "REG-LND-02",
    requirements: [
      "Official Land Reference (LR) Number or Plot Number",
      "Registered Title Deed copy",
      "Current Land Rates clearance certificate or statement",
      "Registered Owner's KRA PIN and National ID copy"
    ]
  },
  {
    id: "bursaries",
    title: "County Education Bursaries",
    county_id: "SOC-BUR-03",
    requirements: [
      "Copy of applicant/student National ID or Birth Certificate",
      "Active admission letter and current fee structure from institution",
      "Parent/Guardian National ID copy",
      "Chief's recommendation letter confirming financial vulnerability"
    ]
  },
  {
    id: "health",
    title: "Public Health & Facility Services",
    county_id: "HLT-PUB-04",
    requirements: [
      "Pass medical examination tests from a designated county hospital",
      "Completed food handler application form",
      "Valid National ID or Passport copy",
      "Passport-sized colored photographs (2 copies)"
    ]
  }
];

export default function ApplyService() {
  const { serviceId } = useParams() || {};
  const location = useLocation();
  const navigate = useNavigate();

  const [servicesList, setServicesList] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || "");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successTracking, setSuccessTracking] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/county-notices/`, {
          headers: getAuthHeaders(),
        });
        
        if (!res.ok) throw new Error("Failed to load available county services catalog.");
        const data = await res.json();
        const notices = Array.isArray(data) ? data : data?.results || [];
        
        if (mounted) {
          const combinedList = notices.length > 0 ? notices : FALLBACK_SERVICES;
          setServicesList(combinedList);

          // Resolve selection based on URL param or default to first item
          if (serviceId) {
            setSelectedServiceId(serviceId);
          } else if (combinedList.length > 0) {
            setSelectedServiceId(String(combinedList[0].id));
          }
        }
      } catch (err) {
        if (mounted) {
          // Graceful fallback on network/backend failure so UI doesn't crash
          setServicesList(FALLBACK_SERVICES);
          if (serviceId) setSelectedServiceId(serviceId);
          else if (FALLBACK_SERVICES.length > 0) setSelectedServiceId(String(FALLBACK_SERVICES[0].id));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotices();
    return () => { mounted = false; };
  }, [serviceId]);

  const selectedNotice = useMemo(() => {
    return servicesList.find((item) => String(item.id) === String(selectedServiceId)) || servicesList[0];
  }, [servicesList, selectedServiceId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedServiceId) {
      setError("Please select a government service to apply for.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        service_id: isNaN(selectedServiceId) ? selectedServiceId : Number(selectedServiceId),
        payload_data: {
          description: description,
          service_code: selectedNotice?.county_id || selectedServiceId
        },
      };

      const res = await fetch(`${API_BASE}/applications/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = typeof data === "object" ? Object.values(data).flat().join(" ") : "Submission failed.";
        throw new Error(errorMsg || `Request failed with status ${res.status}`);
      }

      // Capture tracking number if returned, else use mock placeholder generated by timestamp
      const trackingRef = data?.tracking_number || `CNT-${Math.floor(100000 + Math.random() * 900000)}`;
      setSuccessTracking(trackingRef);

      // Brief pause to display confirmation before bouncing to dashboard
      setTimeout(() => {
        navigate("/dashboard", { state: { newApplication: trackingRef } });
      }, 2500);

    } catch (err) {
      setError(err.message || "Unable to submit application.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-600">Loading secure service application portal...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Navigation back */}
        <button 
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home Portal
        </button>

        <header className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={16} /> Official eCitizen-Style Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Departmental Service Application</h1>
          <p className="text-sm text-slate-500 mt-1">Complete the digital form below to instantly log your request into the county tracking engine.</p>
        </header>

        {successTracking ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-4 shadow-sm animate-fadeIn">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
            <h2 className="text-xl font-bold text-emerald-900">Application Submitted Successfully!</h2>
            <p className="text-sm text-emerald-700 max-w-md mx-auto">
              Your tracking reference number is <strong className="font-mono bg-emerald-100 px-2 py-1 rounded text-emerald-900">{successTracking}</strong>. Redirecting you to your tracking dashboard...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Service Metadata Sidebar */}
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {selectedNotice?.county_id || "Active Portfolio"}
                </span>
                <h2 className="text-lg font-bold text-slate-900 pt-1">{selectedNotice?.title || "Select Service"}</h2>
              </div>
              
              {selectedNotice?.requirements?.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Required Documents:</p>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    {selectedNotice.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>

            {/* Form Content Section */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="service_id" className="mb-2 block text-sm font-semibold text-slate-700">Select Portfolio Service</label>
                  <select
                    id="service_id"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    {servicesList.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.title} {svc.county_id ? `(${svc.county_id})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">Application Justification / Details</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={6}
                    placeholder="Provide detailed description, account numbers, location details, or supporting particulars..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => navigate("/")} 
                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Processing Application..." : <>Submit Application <Send size={16} /></>}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

