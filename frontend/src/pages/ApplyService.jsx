import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Send } from "lucide-react";
import client from "../components/Services/api";

// Fallback static definitions mirroring county portfolio cards
const FALLBACK_SERVICES = [
  {
    id: "1",
    title: "Single Business Permits",
    county_id: "REG-BP-01",
    requirements: [
      "Valid National ID / Passport of the Business Owner or Director",
      "Copy of KRA PIN Certificate for the business/entity",
      "Previous year Business Permit (for renewals)",
      "Physical business location details (Plot number, Street, Building)"
    ],
    fields: [
      { name: "business_name", label: "Business Legal Name", type: "text", required: true, placeholder: "e.g. Acme Enterprises Ltd" },
      { name: "kra_pin", label: "Business KRA PIN", type: "text", required: true, placeholder: "e.g. P051234567X" },
      { name: "physical_location", label: "Physical Location Details", type: "text", required: true, placeholder: "Plot Number, Street, Building Name" },
      { name: "nature_of_business", label: "Nature of Business / Activity", type: "text", required: true, placeholder: "e.g. Retail Shop, Wholesale, Consultancy" },
    ]
  },
  {
    id: "2",
    title: "Lands & Property Rates",
    county_id: "REG-LND-02",
    requirements: [
      "Official Land Reference (LR) Number or Plot Number",
      "Registered Title Deed copy",
      "Current Land Rates clearance certificate or statement",
      "Registered Owner's KRA PIN and National ID copy"
    ],
    fields: [
      { name: "lr_number", label: "Land Reference (LR) / Plot Number", type: "text", required: true, placeholder: "e.g. Nairobi/Block 91/124" },
      { name: "owner_id_number", label: "Registered Owner ID / Passport Number", type: "text", required: true, placeholder: "e.g. 12345678" },
      { name: "owner_kra_pin", label: "Registered Owner KRA PIN", type: "text", required: true, placeholder: "e.g. A001234567Y" },
      { name: "rates_account", label: "Current Rates Account Number", type: "text", required: false, placeholder: "Optional billing account reference" },
    ]
  },
  {
    id: "3",
    title: "County Education Bursaries",
    county_id: "SOC-BUR-03",
    requirements: [
      "Copy of applicant/student National ID or Birth Certificate",
      "Active admission letter and current fee structure from institution",
      "Parent/Guardian National ID copy",
      "Chief's recommendation letter confirming financial vulnerability"
    ],
    fields: [
      { name: "student_full_name", label: "Student Full Name", type: "text", required: true, placeholder: "As per ID or Birth Certificate" },
      { name: "institution_name", label: "Learning Institution Name", type: "text", required: true, placeholder: "e.g. University of Nairobi / High School" },
      { name: "admission_number", label: "Admission / Registration Number", type: "text", required: true, placeholder: "e.g. REG/2026/001" },
      { name: "ward_location", label: "County Ward / Constituency", type: "text", required: true, placeholder: "e.g. Kilimani Ward" },
    ]
  },
  {
    id: "4",
    title: "Public Health & Facility Services",
    county_id: "HLT-PUB-04",
    requirements: [
      "Pass medical examination tests from a designated county hospital",
      "Completed food handler application form",
      "Valid National ID or Passport copy",
      "Passport-sized colored photographs (2 copies)"
    ],
    fields: [
      { name: "facility_name", label: "Establishment / Facility Name", type: "text", required: true, placeholder: "e.g. Sunshine Restaurant & Bakery" },
      { name: "applicant_id", label: "Applicant National ID / Passport Number", type: "text", required: true, placeholder: "e.g. 87654321" },
      { name: "medical_cert_no", label: "Designated Hospital Medical Exam Cert No.", type: "text", required: true, placeholder: "e.g. MED-2026-9988" },
      { name: "health_category", label: "Health Certificate Category", type: "text", required: true, placeholder: "e.g. Food Handler / Public Premises Hygiene" },
    ]
  }
];

export default function ApplyService() {
  const { serviceId } = useParams() || {};
  const navigate = useNavigate();

  const [servicesList, setServicesList] = useState(FALLBACK_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || "1");
  const [formData, setFormData] = useState({});
  const [generalDescription, setGeneralDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await client.get("/county-notices/");
        const notices = Array.isArray(data) ? data : data?.results || [];

        if (mounted && notices.length > 0) {
          const combinedList = notices.map(svc => {
            const fallbackMatch = FALLBACK_SERVICES.find(f => String(f.id) === String(svc.id) || f.county_id === svc.county_id);
            return {
              ...svc,
              requirements: svc.requirements || fallbackMatch?.requirements || [],
              fields: svc.fields || fallbackMatch?.fields || [
                { name: "details", label: "Application Details", type: "text", required: true, placeholder: "Provide information..." }
              ]
            };
          });
          setServicesList(combinedList);
        }
      } catch {
        if (mounted) {
          setServicesList(FALLBACK_SERVICES);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          if (serviceId) {
            setSelectedServiceId(serviceId);
          }
        }
      }
    };

    fetchNotices();
    return () => { mounted = false; };
  }, [serviceId]);

  const selectedNotice = useMemo(() => {
    return servicesList.find((item) => String(item.id) === String(selectedServiceId)) || servicesList[0];
  }, [servicesList, selectedServiceId]);

  useEffect(() => {
    if (selectedNotice?.fields) {
      const initialFields = {};
      selectedNotice.fields.forEach(field => {
        initialFields[field.name] = "";
      });
      setFormData(initialFields);
      setGeneralDescription("");
    }
  }, [selectedNotice]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

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
        service_id: Number(selectedServiceId),
        payload_data: {
          ...formData,
          description: generalDescription,
          service_code: selectedNotice?.county_id || "REG-BP-01",
          service_title: selectedNotice?.title || "General Application"
        },
      };

      const { data } = await client.post("/applications/", payload);

      const trackingNum = data.tracking_number || `REG-${Math.floor(100000 + Math.random() * 900000)}`;

      // Redirect directly to the Payment Page, passing application metadata in state
      navigate("/paymentpage", {
        state: {
          trackingNumber: trackingNum,
          applicationId: data.id || trackingNum,
          serviceTitle: selectedNotice?.title,
          serviceCode: selectedNotice?.county_id
        }
      });

    } catch (err) {
      setError(err.message || "Failed to submit application.");
    } finally {
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
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard Portal
        </button>

        <header className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={16} /> Official eCitizen-Style Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Departmental Service <span className="text-amber-500">Application</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Complete the digital form below customized for your selected county service.</p>
        </header>

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
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Required Information & Docs:</p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  {selectedNotice.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Dynamic Form Content Section */}
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-medium"
                >
                  {servicesList.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.title} {svc.county_id ? `(${svc.county_id})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Render Service-Specific Custom Inputs */}
              {selectedNotice?.fields?.length > 0 && (
                <div className="space-y-4 pt-2 pb-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">Service-Specific Particulars</h3>
                  {selectedNotice.fields.map((field) => (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="mb-1.5 block text-sm font-semibold text-slate-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        id={field.name}
                        type={field.type || "text"}
                        required={field.required}
                        value={formData[field.name] || ""}
                        placeholder={field.placeholder || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">Additional Information / Supporting Notes</label>
                <textarea
                  id="description"
                  value={generalDescription}
                  onChange={(e) => setGeneralDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide any additional information/instructions"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Processing Application..." : <>Proceed to Payment <Send size={16} /></>}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}