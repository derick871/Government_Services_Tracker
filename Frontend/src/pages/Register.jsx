import { useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../components/Services/api";

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
        password_confirm: form.confirmPassword,
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phoneNumber,
        county_code: form.countyCode,
      });

      // Registration successful
      navigate("/login?registered=true");

    } catch (err) {
      // Extract precise backend validation 
      const responseData = err.response?.data;
      let message = "Registration failed. Please try again.";

      if (responseData) {
        if (typeof responseData === "object") {
          const firstKey = Object.keys(responseData)[0];
          const firstError = responseData[firstKey];
          message = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (typeof responseData === "string") {
          message = responseData;
        }
      } else {
        message = "Unable to communicate with the server.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      
      {/* Left Column: Form Section */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          
          {/* Header */}
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              Citizen Register
            </h1>
            <p className="mt-2 text-sm text-gray-500">
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
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Names */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium text-gray-700"
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
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium text-gray-700"
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
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
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
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+254*******"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            
            {/* County */}
            <div>
              <label
                htmlFor="countyCode"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                County
              </label>
              <select
                id="countyCode"
                name="countyCode"
                value={form.countyCode}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
                required
              >
                <option value="">Select your county</option>
                <option value="KE-COUNTY-001">Nairobi</option>
                <option value="KE-COUNTY-037">Kakamega</option>
                <option value="KE-COUNTY-027">Mandera</option>
                <option value="KE-COUNTY-034">Kilifi</option>
                <option value="KE-COUNTY-032">Busia</option>
                <option value="KE-COUNTY-014">Kajiado</option>
                <option value="KE-COUNTY-002">Mombasa</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
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
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
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
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
                minLength={8}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
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

      <div className="hidden lg:block relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop"
          alt="County Service Tracker background"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-12">
          <blockquote className="text-white">
            <p className="text-xl font-medium">
              &ldquo;Empowering citizens through transparent, fast, and accessible county services.&rdquo;
            </p>
            <footer className="mt-2 text-sm text-gray-300">County Service Tracker Portal</footer>
          </blockquote>
        </div>
      </div>

    </div>
  );
}