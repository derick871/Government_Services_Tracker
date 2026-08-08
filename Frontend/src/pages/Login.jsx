import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  login,
  saveSession,
} from '../components/auth'

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form fields
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Login user
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(form);

      // Save JWT and user information
      saveSession(response);

      const user = response.user;

      // Redirect based on role
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "OFFICER") {
        navigate("/officer");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      setError(
        error.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">

          {/* Header */}
          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-slate-800">
              Citizen Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your county services
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />

            </div>

            {/* Login Button */}
            <button
              type="submit"
              onclick={() => navigate("/dashboard")}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
              
            </button>

          </form>

          {/* Register */}
          <div className="mt-6 text-center">

            <p className="text-sm text-slate-600">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Register
              </button>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}