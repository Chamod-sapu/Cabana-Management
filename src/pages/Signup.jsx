import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Signup() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
    } catch (err) {
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left visual panel (shared style with Login) */}
        <div className="relative hidden md:block md:w-1/2">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/20" />

          <div className="relative flex flex-col justify-between h-full p-10 text-white">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur">
                <span className="material-symbols-outlined text-xl">holiday_village</span>
                <span className="text-sm font-medium tracking-wide">
                  Azure Horizon Resorts
                </span>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <p className="text-sm font-medium tracking-[0.25em] uppercase text-slate-200">
                Staff Access Portal
              </p>
              <p className="text-base leading-relaxed text-slate-100/90">
                Create a secure staff account to manage guests, cabanas, and billing
                operations with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Right auth panel */}
        <div className="w-full md:w-1/2 px-6 py-8 sm:px-10 sm:py-12 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">person_add</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Create Staff Account
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Set up secure access to the cabana management dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wide text-slate-600">
                  Work Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="name@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wide text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wide text-slate-600">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-semibold text-sm py-3 shadow-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading && (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Create Account</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            <div className="flex flex-col items-center gap-2 text-[11px] text-slate-400">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  Sign in
                </Link>
              </p>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">shield_person</span>
                  <span>Authorized personnel only</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <button type="button" className="hover:text-slate-500">
                  Privacy Policy
                </button>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <button type="button" className="hover:text-slate-500">
                  Help Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

