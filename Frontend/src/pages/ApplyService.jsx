import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getServices, createApplication } from "../components/Services/Services";

export default function ApplyService() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [form, setForm] = useState({
    county_id: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadService = async () => {
      try {
        setLoading(true);
        setError("");
        const services = await getServices();
        const selected = services.find(
          (item) => String(item.id) === String(serviceId)
        );

        if (!selected) {
          throw new Error("Government service not found.");
        }

        if (mounted) setService(selected);
      } catch (err) {
        if (mounted) setError(err.message || "Unable to load service.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadService();
    return () => { mounted = false; };
  }, [serviceId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      // Map frontend elements cleanly to backend expectation
      const payload = {
        county_id: form.county_id,
        service_id: serviceId,
        payload_data: {
          description: form.description,
        },
      };

      const application = await createApplication(payload);

      if (!application?.tracking_number) {
        throw new Error("Application submitted, but no tracking reference was returned.");
      }

      navigate(`/track/${application.tracking_number}`);
    } catch (err) {
      setError(err.message || "Unable to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="h-80 rounded-2xl bg-white" />
            <div className="h-80 rounded-2xl bg-white lg:col-span-2" />
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-bold text-red-800">Service unavailable</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Application</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Apply for a service</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{service.title || service.name}</h2>
            <p className="mt-3 text-sm text-slate-500">{service.description || "Complete request below."}</p>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="county_id" className="mb-2 block text-sm font-semibold text-slate-700">County ID / Code</label>
                <input
                  id="county_id"
                  name="county_id"
                  value={form.county_id}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 047"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">Application Details</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={7}
                  placeholder="Provide required information..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => navigate(-1)} className="rounded-xl border px-6 py-3 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600">
                  {submitting ? "Submitting..." : "Submit application"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}