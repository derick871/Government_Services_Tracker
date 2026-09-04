import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth"

import {
  login,
  saveSession,
} from '../components/auth'

export default function Login() {
  const{signIn} = useAuth();

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
      const data = await signIn(form); // signIn already does saveSession + setUser
      const role = data?.user?.role;

      // Redirect based on role
      if (!role) throw new Error("No role returned from server");

      if (role === "ADMIN") navigate("/admin");
      else if (role === "OFFICER") navigate("/officer");
      else navigate("/dashboard");


    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">

          {/* Header */}
          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-gray-900">
              Citizen Login
            </h1>

            <p className="mt-2 text-sm text-gray-500">
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
                  className="mb-2 block text-sm font-medium text-gray-500"
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
                  className="w-full rounded-lg border border-gov-border p-3 outline-none focus:border-gov-blue focus:ring-2 focus:ring-blue-100"
                required
              />

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-500"
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
                  className="w-full rounded-lg border border-gov-border p-3 outline-none focus:border-gov-blue focus:ring-2 focus:ring-blue-100"
                required
              />

            </div>

            {/* Login Button */}
            <button
              type="submit"
              onclick={() => navigate("/dashboard")}
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 p-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
              
            </button>

          </form>

          {/* Register */}
          <div className="mt-6 text-center">

            <p className="text-sm text-gray-500">
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