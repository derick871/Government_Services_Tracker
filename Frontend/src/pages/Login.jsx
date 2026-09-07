import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import useAuth from "../hooks/useAuth";
import loginBg from "../assets/login-bg.png"

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() ||!form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await signIn(form);
      const role = data?.user?.role || data?.role;

      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "OFFICER") navigate("/officer", { replace: true });
      else navigate("/dashboard", { replace: true });

    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left - Branding - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-white">
       <img
        src={loginBg}
        alt="County services background"
        className="absolute inset-0 w-full h-full object-cover opacity-100"
      />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C75]/90 to-slate-900/90" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-slate-900 font-bold">C</div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
              Welcome<br/>Back
            </h1>
            <p className="text-gray-300 max-w-md text-[15px] leading-relaxed">
              Securely access county services, track applications, and manage your citizen profile in one place.
            </p>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} County Government. All rights reserved.</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex w-full lg:w-[45%] items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Citizen Login</h2>
            <p className="mt-2 text-sm text-gray-500">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#0F4C75] focus:ring-4 focus:ring-[#0F4C75]/10"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-blue-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 pr-11 text-sm outline-none transition focus:border-[#0F4C75] focus:ring-4 focus:ring-[#0F4C75]/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F4C75] text-white text-sm font-semibold transition hover:bg-[#123d5a] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[#0F4C75] hover:underline">
              Create account
            </Link>
          </p>

          <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed">
            By signing in, you agree to our <Link to="/terms" className="underline hover:text-slate-600">Terms</Link> and <Link to="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}