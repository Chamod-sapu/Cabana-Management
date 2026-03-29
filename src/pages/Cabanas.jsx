import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  TrendingUp,
  CheckCircle,
  Wrench,
  DollarSign,
  Building2,
  Save,
  X,
  Loader2,
  AlertTriangle,
  BarChart3,
  CalendarCheck,
} from "lucide-react";

// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Cabana Card Component ────────────────────────────────────────────────────
function CabanaCard({ cabana, editData, onChange }) {
  const isActive = editData.is_active;
  const isMaintenance = !isActive;

  return (
    <div
      className={`relative rounded-2xl border-2 p-5 transition-all duration-300 ${
        isMaintenance
          ? "border-primary/30 bg-primary/[0.02] dark:bg-primary/[0.04] shadow-sm"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md dark:hover:shadow-neon"
      }`}
    >
      {/* Header & Name Edit */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => onChange(cabana.id, "name", e.target.value)}
            className={`w-full bg-transparent border-none p-0 text-base font-extrabold tracking-tight focus:ring-0 ${
              isMaintenance ? "text-primary" : "text-slate-900 dark:text-white"
            }`}
            placeholder="Cabana Name"
          />
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
            isMaintenance
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          }`}
        >
          {isMaintenance ? "Maintenance" : "Active"}
        </span>
      </div>

      {/* Rate inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Hourly
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={editData.base_rate_hour}
                onChange={(e) =>
                  onChange(cabana.id, "base_rate_hour", parseFloat(e.target.value) || 0)
                }
                className={`w-full pl-7 pr-3 py-2 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  isMaintenance
                    ? "bg-primary/5 border border-primary/20 text-slate-700 dark:text-slate-200 dark:bg-primary/10"
                    : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Daily
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={editData.base_rate_day}
                onChange={(e) =>
                  onChange(cabana.id, "base_rate_day", parseFloat(e.target.value) || 0)
                }
                className={`w-full pl-7 pr-3 py-2 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  isMaintenance
                    ? "bg-primary/5 border border-primary/20 text-slate-700 dark:text-slate-200 dark:bg-primary/10"
                    : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                }`}
              />
            </div>
          </div>
        </div>

        {/* System Fixed Component display */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            System Charge (10%)
          </label>
          <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Service Tax</span>
            <span className="text-emerald-500">+${(editData.base_rate_day * 0.1).toFixed(2)}/day</span>
          </div>
        </div>
      </div>

      {/* Operational status toggle */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          {isMaintenance ? (
            <>
              Repairing{" "}
              <Wrench size={12} className="text-amber-500" />
            </>
          ) : (
            "Operational"
          )}
        </span>
        <Toggle
          checked={isActive}
          onChange={(val) => onChange(cabana.id, "is_active", val)}
        />
      </div>
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-neon-green",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-neon-blue",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center gap-4 shadow-sm">
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className={`text-2xl font-black tracking-tight ${color === 'blue' ? 'text-slate-900 dark:text-neon-blue' : color === 'emerald' ? 'text-slate-900 dark:text-neon-green' : 'text-slate-900 dark:text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function Cabanas() {
  const { profile } = useAuth();
  const [cabanas, setCabanas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editMap, setEditMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalMultiplier, setGlobalMultiplier] = useState("");
  const [toast, setToast] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: cabanasData }, { data: bookingsData }] =
        await Promise.all([
          supabase
            .from("cabanas")
            .select("*")
            .order("id", { ascending: true }),
          supabase
            .from("bookings")
            .select("cabana_id, status, start_time, end_time")
            .eq("status", "CONFIRMED"),
        ]);

      setCabanas(cabanasData || []);
      setBookings(bookingsData || []);

      // Init edit map from current DB values
      const map = {};
      (cabanasData || []).forEach((c) => {
        map[c.id] = {
          name: c.name,
          base_rate_hour: c.base_rate_hour,
          base_rate_day: c.base_rate_day,
          is_active: c.is_active,
        };
      });
      setEditMap(map);
      setHasChanges(false);
    } catch (err) {
      console.error("Error loading cabanas:", err);
      showToast("Failed to load cabana data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle field change
  const handleFieldChange = (cabanaId, field, value) => {
    setEditMap((prev) => ({
      ...prev,
      [cabanaId]: { ...prev[cabanaId], [field]: value },
    }));
    setHasChanges(true);
  };

  // Apply global multiplier
  const applyMultiplier = () => {
    const pct = parseFloat(globalMultiplier);
    if (isNaN(pct) || pct === 0) return;

    const factor = 1 + pct / 100;
    setEditMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = {
          ...next[id],
          base_rate_hour: Math.round(next[id].base_rate_hour * factor * 100) / 100,
          base_rate_day: Math.round(next[id].base_rate_day * factor * 100) / 100,
        };
      });
      return next;
    });
    setHasChanges(true);
    showToast(`Applied ${pct > 0 ? "+" : ""}${pct}% rate adjustment across all cabanas.`);
  };

  // Cancel changes
  const handleCancel = () => {
    const map = {};
    cabanas.forEach((c) => {
      map[c.id] = {
        name: c.name,
        base_rate_hour: c.base_rate_hour,
        base_rate_day: c.base_rate_day,
        is_active: c.is_active,
      };
    });
    setEditMap(map);
    setGlobalMultiplier("");
    setHasChanges(false);
    showToast("Changes discarded.");
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(editMap).map(([id, data]) =>
        supabase
          .from("cabanas")
          .update({
            name: data.name,
            base_rate_hour: data.base_rate_hour,
            base_rate_day: data.base_rate_day,
            is_active: data.is_active,
          })
          .eq("id", parseInt(id))
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(errors.map((e) => e.error.message).join(", "));
      }

      // Log activity
      await supabase.from("activity_logs").insert([
        {
          actor_id: profile?.id,
          actor_name: profile?.full_name,
          actor_role: profile?.role,
          action: "UPDATE_CABANA_CONFIG",
          entity_type: "CABANA",
          metadata: { changes: editMap },
        },
      ]);

      showToast("Cabana configuration saved successfully!");
      await loadData();
    } catch (err) {
      console.error("Save error:", err);
      showToast(err.message || "Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Computed summary stats
  const summary = useMemo(() => {
    const entries = Object.values(editMap);
    const available = entries.filter((e) => e.is_active).length;
    const maintenance = entries.filter((e) => !e.is_active).length;
    const avgDay =
      entries.length > 0
        ? entries.reduce((s, e) => s + e.base_rate_day, 0) / entries.length
        : 0;

    // Occupancy: how many active cabanas currently have a CONFIRMED booking spanning right now
    const now = new Date();
    const activeCabanaIds = cabanas
      .filter((c) => editMap[c.id]?.is_active)
      .map((c) => c.id);
      
    const occupiedIds = new Set(
      bookings
        .filter((b) => {
          const start = new Date(b.start_time);
          const end = new Date(b.end_time);
          return now >= start && now <= end;
        })
        .map((b) => b.cabana_id)
    );
    
    const occupied = activeCabanaIds.filter((id) => occupiedIds.has(id)).length;
    // Overriding the previous "available" calculation to be truly unoccupied active cabanas
    const realAvailable = activeCabanaIds.filter((id) => !occupiedIds.has(id)).length;
    const occupancy =
      activeCabanaIds.length > 0
        ? Math.round((occupied / activeCabanaIds.length) * 100)
        : 0;

    return { 
      available: realAvailable, 
      maintenance, 
      avgDay: avgDay + (avgDay * 0.1), // Adjusted for service charge for summary
      occupancy 
    };
  }, [editMap, cabanas, bookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2">
          <span className="hover:text-primary cursor-pointer transition-colors">Settings</span>
          <span>›</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">Cabana Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Cabana Rate &amp; Status Configuration
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Manage operational status and pricing for the resort's premium poolside units.
        </p>
      </div>

      {/* Main config panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Global Adjustments header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Global Adjustments
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Apply pricing changes to all cabanas simultaneously.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-primary whitespace-nowrap">
              Global Rate Multiplier
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={applyMultiplier}
                className="h-10 w-10 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors border-r border-slate-200 dark:border-slate-700"
                title="Apply multiplier"
              >
                <TrendingUp size={16} />
              </button>
              <input
                type="text"
                value={globalMultiplier}
                onChange={(e) => setGlobalMultiplier(e.target.value)}
                placeholder="+15"
                className="w-20 h-10 px-2 text-center text-sm font-semibold bg-transparent focus:outline-none text-slate-900 dark:text-white"
              />
              <span className="h-10 w-10 flex items-center justify-center text-sm font-bold text-slate-400 border-l border-slate-200 dark:border-slate-700">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Cabana Cards Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {cabanas.map((cabana) => (
              <CabanaCard
                key={cabana.id}
                cabana={cabana}
                editData={editMap[cabana.id] || {
                  name: cabana.name,
                  base_rate_hour: cabana.base_rate_hour,
                  base_rate_day: cabana.base_rate_day,
                  is_active: cabana.is_active,
                }}
                onChange={handleFieldChange}
              />
            ))}
            {cabanas.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building2
                  size={40}
                  className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
                />
                <p className="text-sm font-medium text-slate-400">
                  No cabanas configured yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={handleCancel}
            disabled={!hasChanges || saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={14} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Operational Summary */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-4">
          Operational Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard
            icon={CheckCircle}
            label="Available"
            value={`${summary.available} Unit${summary.available !== 1 ? "s" : ""}`}
            color="emerald"
          />
          <SummaryCard
            icon={Wrench}
            label="Maintenance"
            value={`${summary.maintenance} Unit${summary.maintenance !== 1 ? "s" : ""}`}
            color="amber"
          />
          <SummaryCard
            icon={DollarSign}
            label="Avg. Revenue Flow"
            value={`$${Math.round(summary.avgDay)}/day`}
            color="blue"
          />
          <SummaryCard
            icon={BarChart3}
            label="Occupancy Rate"
            value={`${summary.occupancy}%`}
            color="violet"
          />
        </div>
      </div>
    </div>
  );
}

export default Cabanas;
