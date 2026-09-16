import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import useAuth from "../hooks/useAuth";
import loginBg from "../assets/login-bg.png";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await signIn({
        email,
        password: form.password,
      });

      switch (user?.role) {
        case "ADMIN":
          navigate("/adminconsole", { replace: true });
          break;

        case "OFFICER":
          navigate("/dashboard", { replace: true });
          break;

        case "CITIZEN":
        default:
          navigate("/dashboard", { replace: true });
          break;
      }
    } catch (error) {
      setError(
        error.message ||
          "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-0 lg:p-8">
      <div className="w-full min-h-screen lg:min-h-[720px] lg:max-w-6xl lg:rounded-2xl lg:overflow-hidden lg:shadow-2xl bg-white grid lg:grid-cols-[1.1fr_0.9fr]">

        {/* Branding */}
        <section className="hidden lg:flex relative overflow-hidden">
          <img
            src={loginBg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C75]/95 via-[#123D5A]/90 to-slate-950/95" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 text-white">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0F4C75] text-xl font-black shadow-lg">
                C
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                  County Service Tracker
                </p>
              </div>
            </div>

            <div className="max-w-lg">
              <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight">
                Welcome
                <br />
                back.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-blue-100/80">
                Securely access county services, track applications,
                monitor requests, and manage your citizen profile from
                one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-blue-100/80">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">
                  Secure access
                </span>

                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">
                  Service tracking
                </span>

                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">
                  Citizen portal
                </span>
              </div>
            </div>

            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} County Government. All rights reserved.
            </p>
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#0F4C75]">
                Citizen Portal
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your email and password to continue.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span className="mt-0.5 font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0F4C75] focus:ring-4 focus:ring-[#0F4C75]/10 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#0F4C75] hover:text-[#123D5A] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0F4C75] focus:ring-4 focus:ring-[#0F4C75]/10 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((visible) => !visible)
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F4C75] text-sm font-bold text-white shadow-sm transition hover:bg-[#123D5A] focus:outline-none focus:ring-4 focus:ring-[#0F4C75]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">
                New to the portal?
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/register"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-[#0F4C75] transition hover:border-[#0F4C75] hover:bg-slate-50"
            >
              Create citizen account
            </Link>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By signing in, you agree to use the County Service Tracker
              responsibly and keep your account credentials secure.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}