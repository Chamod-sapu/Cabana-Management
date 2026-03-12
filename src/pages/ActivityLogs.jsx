import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Search,
  Download,
  RotateCcw,
  Filter,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
  Activity,
  User,
  Loader2,
  Monitor,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const ACTION_TYPES = [
  "All Actions",
  "CREATE_BOOKING",
  "DELETE_BOOKING",
  "CHECKOUT_BOOKING",
  "REGISTER_GUEST",
  "UPDATE_CABANA_CONFIG",
  "CREATE_USER",
  "UPDATE_USER",
  "ACTIVATE_SYSTEM",
  "DEACTIVATE_SYSTEM",
];

const DATE_RANGES = [
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "All Time", value: "all" },
];

const USER_ROLES = ["All Roles", "SUPER_USER", "ADMIN", "USER"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Action badge styling config
function getActionStyle(action) {
  const map = {
    DEACTIVATE_SYSTEM: {
      bg: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-neon-rose dark:border-neon-rose/30",
      icon: "▲",
      label: "System Deactivated",
      priority: "high",
    },
    ACTIVATE_SYSTEM: {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-neon-green dark:border-neon-green/30",
      icon: "✓",
      label: "System Activated",
      priority: "high",
    },
    CREATE_BOOKING: {
      bg: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-neon-blue dark:border-neon-blue/30",
      label: "Booking Created",
      priority: "normal",
    },
    DELETE_BOOKING: {
      bg: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-neon-rose dark:border-neon-rose/30",
      label: "Booking Deleted",
      priority: "normal",
    },
    CHECKOUT_BOOKING: {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-neon-green dark:border-neon-green/30",
      label: "Checkout Complete",
      priority: "normal",
    },
    REGISTER_GUEST: {
      bg: "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/50",
      label: "Guest Registered",
      priority: "normal",
    },
    UPDATE_CABANA_CONFIG: {
      bg: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50",
      label: "Config Updated",
      priority: "normal",
    },
    CREATE_USER: {
      bg: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50",
      icon: "★",
      label: "Admin Added",
      priority: "high",
    },
    UPDATE_USER: {
      bg: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-neon-blue dark:border-neon-blue/30",
      label: "User Updated",
      priority: "normal",
    },
  };
  return (
    map[action] || {
      bg: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      label: action?.replace(/_/g, " ") || "Unknown",
      priority: "normal",
    }
  );
}

function getRoleBadge(role) {
  const map = {
    SUPER_USER: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    ADMIN: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400",
    USER: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    STAFF: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return map[role] || map.USER;
}

// ─── Details Modal ────────────────────────────────────────────────────────────
function DetailsModal({ log, onClose }) {
  if (!log) return null;

  const style = getActionStyle(log.action);
  const meta = log.metadata || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-primary" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Log Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Action badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${style.bg}`}
            >
              {style.icon && <span>{style.icon}</span>}
              {style.label}
            </span>
            <span className="text-xs text-slate-400">{fmtDate(log.created_at)} {fmtTime(log.created_at)}</span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                Actor
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {log.actor_name || "Unknown"}
              </p>
              <p className="text-[11px] text-slate-400">{log.actor_role || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                Entity
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {log.entity_type || "—"}
              </p>
              <p className="text-[11px] text-slate-400">ID: {log.entity_id || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                Source IP
              </p>
              <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                {log.source_ip || "—"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                Log ID
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all">
                {log.id}
              </p>
            </div>
          </div>

          {/* Metadata */}
          {Object.keys(meta).length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                Metadata
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(meta).map(([key, val]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-slate-400 flex-shrink-0">{key}:</span>
                    <span className="break-all">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "all", label: "All Logs", icon: Activity },
  { id: "high", label: "High Priority", icon: AlertTriangle },
  { id: "security", label: "Security Events", icon: ShieldAlert },
  { id: "mine", label: "My Activity", icon: User },
];

function ActivityLogs() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [detailLog, setDetailLog] = useState(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [dateRange, setDateRange] = useState("30d");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    actionFilter: "All Actions",
    dateRange: "30d",
    roleFilter: "All Roles",
  });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({ search, actionFilter, dateRange, roleFilter });
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setActionFilter("All Actions");
    setDateRange("30d");
    setRoleFilter("All Roles");
    setAppliedFilters({
      search: "",
      actionFilter: "All Actions",
      dateRange: "30d",
      roleFilter: "All Roles",
    });
    setPage(1);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    let result = logs;

    // Tab filtering
    if (activeTab === "high") {
      result = result.filter((l) => {
        const s = getActionStyle(l.action);
        return s.priority === "high";
      });
    } else if (activeTab === "security") {
      result = result.filter((l) =>
        ["ACTIVATE_SYSTEM", "DEACTIVATE_SYSTEM", "CREATE_USER", "UPDATE_USER"].includes(l.action)
      );
    } else if (activeTab === "mine") {
      result = result.filter((l) => l.actor_id === profile?.id);
    }

    // Search
    const q = appliedFilters.search.toLowerCase();
    if (q) {
      result = result.filter(
        (l) =>
          l.actor_name?.toLowerCase().includes(q) ||
          l.entity_id?.toLowerCase().includes(q) ||
          l.source_ip?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q) ||
          l.entity_type?.toLowerCase().includes(q)
      );
    }

    // Action type
    if (appliedFilters.actionFilter !== "All Actions") {
      result = result.filter((l) => l.action === appliedFilters.actionFilter);
    }

    // Role
    if (appliedFilters.roleFilter !== "All Roles") {
      result = result.filter((l) => l.actor_role === appliedFilters.roleFilter);
    }

    // Date range
    if (appliedFilters.dateRange !== "all") {
      const now = new Date();
      const msMap = {
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
        "90d": 90 * 24 * 60 * 60 * 1000,
      };
      const cutoff = new Date(now - (msMap[appliedFilters.dateRange] || msMap["30d"]));
      result = result.filter((l) => new Date(l.created_at) >= cutoff);
    }

    return result;
  }, [logs, activeTab, appliedFilters, profile?.id]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Timestamp", "User", "Role", "Action", "Entity Type", "Entity ID", "Source IP"];
    const rows = filteredLogs.map((l) => [
      new Date(l.created_at).toISOString(),
      l.actor_name || "",
      l.actor_role || "",
      l.action || "",
      l.entity_type || "",
      l.entity_id || "",
      l.source_ip || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Details Modal */}
      <DetailsModal log={detailLog} onClose={() => setDetailLog(null)} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Activity &amp; Audit Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Review secure audit trails and system-wide administrative events.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary dark:bg-electric-blue text-white text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-electric-blue/40 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-wider"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end">
          {/* Search */}
          <div className="xl:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="User, Entity ID, or IP..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-medium text-slate-900 dark:text-white"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a} value={a}>
                  {a === "All Actions" ? a : a.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-medium text-slate-900 dark:text-white"
            >
              {DATE_RANGES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Role */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              User Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-medium text-slate-900 dark:text-white"
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r === "All Roles" ? r : r.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="xl:col-span-2 flex gap-2">
            <button
              onClick={resetFilters}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Filter size={13} />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Timestamp
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  User
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Action
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Entity
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Source IP / Device
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Activity size={32} strokeWidth={1.5} />
                      <p className="text-sm font-medium">No activity logs found.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                paginatedLogs.map((log) => {
                  const style = getActionStyle(log.action);
                  const initials = getInitials(log.actor_name);
                  const roleColor = getRoleBadge(log.actor_role);
                  const isHighPriority = style.priority === "high";

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors ${
                        isHighPriority ? "bg-amber-50/30 dark:bg-amber-900/10" : ""
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {fmtDate(log.created_at)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {fmtTime(log.created_at)}
                        </p>
                      </td>

                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              log.actor_role === "SUPER_USER"
                                ? "bg-primary/10 text-primary"
                                : log.actor_role === "ADMIN"
                                ? "bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {log.actor_name || "Unknown"}
                            </p>
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${roleColor}`}
                            >
                              {log.actor_role || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.bg}`}
                        >
                          {style.icon && <span className="text-[10px]">{style.icon}</span>}
                          {style.label}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {log.entity_type || "—"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          ID: {log.entity_id ? log.entity_id.toString().slice(0, 12) : "—"}
                        </p>
                      </td>

                      {/* Source IP / Device */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                          {log.source_ip || "—"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Monitor size={10} />
                          {log.source_ip ? "Browser" : "System"}
                        </p>
                      </td>

                      {/* Details */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setDetailLog(log)}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {filteredLogs.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {Math.min(page * PAGE_SIZE, filteredLogs.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {filteredLogs.length.toLocaleString()}
              </span>{" "}
              entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="px-1 text-xs text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      p === page
                        ? "bg-primary text-white shadow"
                        : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Cabana System Management. Audit Trails are stored for 2
          years. Compliance Code:{" "}
          <span className="text-primary font-medium">PCI-DSS Level 2</span>.
        </p>
      </div>
    </div>
  );
}

export default ActivityLogs;
