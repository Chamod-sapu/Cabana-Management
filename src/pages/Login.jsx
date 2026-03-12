import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Info,
  Loader2,
  Waves,
} from "lucide-react";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, { keepSignedIn });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-charcoal transition-colors duration-300">
      {/* ─── Left Panel: Resort Image ─────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[52%] overflow-hidden">
        {/* Background image */}
        <img
          src="/login-bg.png"
          alt="Azure Horizon Resorts"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-slate-900/10 dark:from-charcoal/90 dark:via-charcoal/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/20 dark:to-charcoal/30" />

        {/* Bottom content */}
        <div className="relative flex flex-col justify-end h-full p-10 pb-12">
          <div className="space-y-4 max-w-md">
            {/* Brand icon + name */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Waves size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Azure Horizon Resorts
              </h2>
            </div>

            <p className="text-[15px] leading-relaxed text-white/80 font-medium italic">
              "Experience excellence in hospitality. Our Cabana Management
              System ensures every guest receives the ultimate luxury
              experience."
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Login Form ──────────────────────────────────── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 py-12 sm:px-12 bg-white dark:bg-charcoal">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary dark:bg-electric-blue text-white shadow-lg shadow-primary/20 dark:shadow-electric-blue/20">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Sign in to your staff account to manage cabanas
              </p>
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 py-3.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary dark:border-neon-blue">
            <Info size={16} className="text-primary dark:text-neon-blue flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              New security protocols are now active for all personnel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-neon-blue/30 focus:border-primary dark:focus:border-neon-blue transition-all"
                  placeholder="name@hotel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-neon-blue hover:opacity-80 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-neon-blue/30 focus:border-primary dark:focus:border-neon-blue transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Keep me signed in */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={keepSignedIn}
                onClick={() => setKeepSignedIn(!keepSignedIn)}
                className={`h-[18px] w-[18px] rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  keepSignedIn
                    ? "bg-primary dark:bg-neon-blue border-primary dark:border-neon-blue"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400"
                }`}
              >
                {keepSignedIn && (
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 4l3 3 5-6" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400 select-none cursor-pointer" onClick={() => setKeepSignedIn(!keepSignedIn)}>
                Keep me signed in
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50">
                <Shield size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-rose-600 dark:text-neon-rose">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-primary dark:bg-electric-blue text-white font-bold text-sm py-3.5 shadow-lg shadow-primary/20 dark:shadow-electric-blue/40 hover:shadow-xl hover:shadow-primary/25 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              <span>Sign In to Dashboard</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <Shield size={11} />
              <span className="font-bold uppercase tracking-wider">
                Authorized Personnel Only
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
              <button
                type="button"
                className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </button>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <button
                type="button"
                className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
