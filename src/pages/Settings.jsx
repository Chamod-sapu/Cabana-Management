import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { supabase } from "../lib/supabase.js";
import { 
  Settings as SettingsIcon, 
  Power, 
  Moon, 
  Sun,
  Monitor,
  ShieldCheck
} from "lucide-react";

function Settings() {
  const { systemActive, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [pending, setPending] = useState(false);
  const [current, setCurrent] = useState(systemActive);

  useEffect(() => {
    setCurrent(systemActive);
  }, [systemActive]);

  const toggleSystem = async () => {
    if (profile?.role !== "SUPER_USER") return;
    setPending(true);
    await supabase
      .from("system_settings")
      .update({ is_active: !current })
      .eq("id", 1);
    
    // Log activity
    await supabase.from("activity_logs").insert([{
      actor_id: profile?.id,
      actor_name: profile?.full_name,
      actor_role: profile?.role,
      action: !current ? "ACTIVATE_SYSTEM" : "DEACTIVATE_SYSTEM",
      entity_type: "SYSTEM",
      entity_id: "global",
      metadata: { new_status: !current }
    }]);

    setCurrent(!current);
    setPending(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-primary" />
          System Settings
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
          Control global settings, visual appearances, and system-wide parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
            <Monitor size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appearance</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">System Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark visual themes.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    theme === "light"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Sun size={16} className={theme === "light" ? "text-amber-500" : ""} />
                  <span className="text-xs font-bold uppercase tracking-wider">Light</span>
                </button>
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    theme === "dark"
                      ? "bg-slate-900 text-white shadow-lg border border-slate-700 shadow-neon-blue/20"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Moon size={16} className={theme === "dark" ? "text-neon-blue" : ""} />
                  <span className="text-xs font-bold uppercase tracking-wider">Dark</span>
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Preview</p>
              <div className="grid grid-cols-2 gap-3">
                <div className={`aspect-video rounded-lg border-2 flex items-center justify-center ${theme === 'light' ? 'border-primary bg-white' : 'border-slate-200 bg-white'}`}>
                   <Sun size={20} className="text-amber-500" />
                </div>
                <div className={`aspect-video rounded-lg border-2 flex items-center justify-center ${theme === 'dark' ? 'border-primary bg-slate-900' : 'border-slate-800 bg-slate-900'}`}>
                   <Moon size={20} className="text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Control Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
            <ShieldCheck size={18} className="text-rose-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">System Control</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enable/Disable system-wide operations.</p>
              </div>
              <button
                onClick={toggleSystem}
                disabled={pending || profile?.role !== "SUPER_USER"}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
                  current ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    current ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Power size={14} />
                <p className="text-[11px] font-bold uppercase tracking-widest">Global Switch</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {current 
                  ? "The system is currently OPERATIONAL. Staff and guests can perform all actions."
                  : "The system is currently in MAINTENANCE. Only SuperUsers can access administration pages."
                }
              </p>
              {profile?.role !== "SUPER_USER" && (
                <p className="text-[10px] text-rose-500 font-bold italic pt-1">
                  * Requires SuperUser authorization
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="pt-8 text-center">
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          CabanaOS v2.4.1 — Enterprise Edition
        </p>
      </div>
    </div>
  );
}

export default Settings;


