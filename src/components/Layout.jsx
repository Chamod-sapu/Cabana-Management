import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/bookings", label: "Bookings", icon: "event" },
  { to: "/billing", label: "Billing", icon: "receipt_long" },
  { to: "/cabanas", label: "Cabanas", icon: "holiday_village" },
  { to: "/guests", label: "Guests", icon: "groups" },
  { to: "/users", label: "Users", icon: "group_add", roles: ["SUPER_USER", "ADMIN"] },
  { to: "/logs", label: "Activity Logs", icon: "fact_check", roles: ["SUPER_USER"] },
  { to: "/settings", label: "Settings", icon: "settings", roles: ["SUPER_USER"] }
];

function Layout() {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNav = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-charcoal text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-md px-6 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <h2 className="text-xl font-black leading-tight tracking-tighter text-slate-900 dark:text-white uppercase">
              <span className="text-primary dark:text-neon-blue">Cabana</span> Management
            </h2>
          </button>
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {filteredNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "text-xs font-bold uppercase tracking-widest pb-1 border-b-2 border-transparent transition-all",
                    isActive
                      ? "text-primary dark:text-neon-blue border-primary dark:border-neon-blue drop-shadow-[0_0_8px_rgba(43,134,255,0.4)]"
                      : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-neon-blue"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={logout}
            className="hidden sm:inline-flex min-w-[96px] items-center justify-center gap-2 rounded-lg h-9 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <span className="material-symbols-outlined text-sm">Logout</span>
          </button>
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden text-xs font-bold">
            {profile?.full_name
              ? profile.full_name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
              : "SU"}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

