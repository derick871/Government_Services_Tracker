import { useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../services/client";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    countyCode: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Register user
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Check passwords
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await client.post("/auth/register/", {
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phoneNumber,
        county_code: form.countyCode,
      });

      // Registration successful
      navigate("/login?registered=true");

    } catch (error) {
      const message =
        error.message ||
        "Registration failed. Please try again.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">

      <div className="w-full max-w-lg">

        <div className="rounded-xl bg-white p-8 shadow-lg">

          {/* Header */}
          <div className="mb-8 text-center">

            <h1 className="text-3xl font-bold text-slate-800">
              Citizen Register
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create your County Service Tracker account
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Names */}
            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

            </div>

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="citizen@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />

            </div>

            {/* Phone */}
            <div>

              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone Number
              </label>

              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="0712345678"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* County */}
            <div>

              <label
                htmlFor="countyCode"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                County
              </label>

              <select
                id="countyCode"
                name="countyCode"
                value={form.countyCode}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 bg-white p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                <option value="">
                  Select your county
                </option>

                <option value="KE-COUNTY-047">
                  Nairobi
                </option>

                <option value="KE-COUNTY-037">
                  Kakamega
                </option>
              </select>

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                minLength={8}
              />

            </div>

            {/* Confirm Password */}
            <div>

              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                minLength={8}
              />

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-amber-500 p-3 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          {/* Login link */}
          <div className="mt-6 text-center">

            <p className="text-sm text-slate-600">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Login
              </button>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}