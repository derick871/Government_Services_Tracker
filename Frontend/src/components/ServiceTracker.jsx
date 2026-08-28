import React, { useState, useEffect } from 'react';

export default function ServiceTracker() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/services");

      if (!response.ok) {
        throw new Error(
          `Unable to load services (${response.status})`
        );
      }

      const payload = await response.json();

      const records = Array.isArray(payload)
        ? payload
        : payload?.results || [];

      setServices(records);
    } catch (err) {
      console.error("Services error:", err);

      setError(
        err.message || "Unable to load available services."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                <div className="mt-5 h-5 w-3/4 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                <div className="mt-6 h-10 rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load services
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={fetchServices}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <section className="mb-8">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-blue-900 p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
              County Services
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
              What service do you need?
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Browse available county services, submit an
              application and track its progress from your
              dashboard.
            </p>
          </div>
        </section>

        {/* Service count */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Available services
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {services.length} service
              {services.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {/* Empty state */}
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="font-semibold text-slate-800">
              No services available
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no services available for
              application.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ServiceCard({ service }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 3v5h5"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="mt-5 flex-1">
        <h3 className="font-semibold text-slate-900">
          {service.name}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {service.description ||
            "Apply for this county service online and track your application."}
        </p>
      </div>

      {/* Action */}
      <Link
        to={`/apply/${service.id}`}
        className="mt-6 flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        Apply for service
      </Link>
    </article>
  );
}