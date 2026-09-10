import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default function ApplyService() {
  const { serviceId } = useParams?.() || {};
  const navigate = useNavigate();

  const [servicesList, setServicesList] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || "");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/county-notices/`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load available county services.");
        const data = await res.json();
        const notices = Array.isArray(data) ? data : data?.results || [];
        if (mounted) {
          setServicesList(notices);
          if (!selectedServiceId && notices.length > 0) {
            setSelectedServiceId(String(notices[0].id));
          }
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotices();
    return () => { mounted = false; };
  }, []);

  const selectedNotice = useMemo(() => {
    return servicesList.find((item) => String(item.id) === String(selectedServiceId));
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
        service_id: Number(selectedServiceId),
        payload_data: {
          description: description,
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

      if (!data?.tracking_number) {
        throw new Error("Application submitted, but no tracking reference was returned.");
      }

      // Redirect back to dashboard; backend state is instantly synchronized
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Loading service application portal...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Citizen Portal</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Apply for a County Service</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Service Metadata Sidebar */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{selectedNotice?.title || "Select a Service"}</h2>
            <p className="text-sm text-slate-500">
              {selectedNotice ? `County Code: ${selectedNotice.county_id}` : "Choose a service from the options to view metadata."}
            </p>
            {selectedNotice?.requirements?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Requirements:</p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
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
                <label htmlFor="service_id" className="mb-2 block text-sm font-semibold text-slate-700">Select Service Offering</label>
                <select
                  id="service_id"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  {servicesList.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.title} ({svc.county_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">Application Details / Comments</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  placeholder="Provide necessary background details or justification for your request..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => navigate(-1)} className="rounded-xl border px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}