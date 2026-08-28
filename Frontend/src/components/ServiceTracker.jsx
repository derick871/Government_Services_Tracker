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