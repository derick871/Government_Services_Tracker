import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createApplication
} from "../components/Services/Services";

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
          (item) =>
            String(item.id) ===
            String(serviceId)
        );

        if (!selected) {
          throw new Error(
            "Government service not found."
          );
        }

        if (mounted) {
          setService(selected);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.message ||
              "Unable to load service."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadService();

    return () => {
      mounted = false;
    };
  }, [serviceId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const application =
        await createApplication({
          service_id: serviceId,
          ...form,
        });

      if (!application?.tracking_number) {
        throw new Error(
          "Application submitted, but no tracking reference was returned."
        );
      }

      navigate(
        `/track/${application.tracking_number}`
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to submit application."
      );
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
          <h1 className="text-xl font-bold text-red-800">
            Service unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

}