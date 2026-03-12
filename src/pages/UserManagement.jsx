import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  UserPlus,
  Edit,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  SlidersHorizontal,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Save,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_USERS = 5;
const ROLES = ["SUPER_USER", "ADMIN", "USER"];

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

function roleBadge(role) {
  const map = {
    SUPER_USER: {
      bg: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
      label: "Super User",
    },
    ADMIN: {
      bg: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400",
      label: "Admin",
    },
    USER: {
      bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      label: "User",
    },
  };
  const r = map[role] || map.USER;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.bg}`}
    >
      {r.label}
    </span>
  );
}

// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-primary dark:bg-neon-green" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Add/Edit User Modal ──────────────────────────────────────────────────────
function UserModal({ open, onClose, onSave, saving, editUser, currentUserRole }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "USER",
    password: "",
  });

  useEffect(() => {
    if (editUser) {
      setForm({
        full_name: editUser.full_name || "",
        email: editUser.email || "",
        role: editUser.role || "USER",
        password: "",
      });
    } else {
      setForm({ full_name: "", email: "", role: "USER", password: "" });
    }
  }, [editUser, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) return;
    if (!editUser && !form.password) return;
    onSave(form, editUser);
  };

  if (!open) return null;

  const isEdit = !!editUser;
  const allowedRoles = currentUserRole === "SUPER_USER" ? ROLES : ["ADMIN", "USER"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {isEdit ? (
              <Edit size={18} className="text-primary" />
            ) : (
              <UserPlus size={18} className="text-primary" />
            )}
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit User" : "Add New User"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. user@resort.com"
              disabled={isEdit}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-60"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters"
                minLength={6}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Role
            </label>
            <div className="flex gap-2">
              {allowedRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                    form.role === r
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {r.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.full_name.trim() || !form.email.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving
                ? "Saving..."
                : isEdit
                ? "Update User"
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function UserManagement() {
  const { profile, role, systemActive } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemStatus, setSystemStatus] = useState(systemActive);
  const [togglingSystem, setTogglingSystem] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setSystemStatus(systemActive);
  }, [systemActive]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // User counts
  const userCount = users.length;
  const licensePercent = Math.round((userCount / MAX_USERS) * 100);

  // Toggle system
  const handleToggleSystem = async () => {
    setTogglingSystem(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ is_active: !systemStatus, updated_at: new Date().toISOString() })
        .eq("id", 1);

      if (error) throw error;

      setSystemStatus(!systemStatus);

      // Log activity
      await supabase.from("activity_logs").insert([
        {
          actor_id: profile?.id,
          actor_name: profile?.full_name,
          actor_role: profile?.role,
          action: systemStatus ? "DEACTIVATE_SYSTEM" : "ACTIVATE_SYSTEM",
          entity_type: "SYSTEM",
          entity_id: "1",
        },
      ]);

      showToast(
        systemStatus
          ? "System deactivated. Only Super Users can access."
          : "System activated. All users can access."
      );
    } catch (err) {
      console.error("Toggle error:", err);
      showToast("Failed to toggle system status.", "error");
    } finally {
      setTogglingSystem(false);
    }
  };

  // Create user
  const handleSaveUser = async (form, existingUser) => {
    setSaving(true);
    try {
      if (existingUser) {
        // Update profile role and name
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: form.full_name,
            role: form.role,
          })
          .eq("id", existingUser.id);

        if (error) throw error;

        await supabase.from("activity_logs").insert([
          {
            actor_id: profile?.id,
            actor_name: profile?.full_name,
            actor_role: profile?.role,
            action: "UPDATE_USER",
            entity_type: "PROFILE",
            entity_id: existingUser.id,
            metadata: { updated_name: form.full_name, updated_role: form.role },
          },
        ]);

        showToast(`${form.full_name}'s profile updated successfully!`);
      } else {
        // Check license limit
        if (userCount >= MAX_USERS) {
          showToast("User limit reached (5/5). Cannot add more users.", "error");
          setSaving(false);
          return;
        }

        // Create auth user via Supabase signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Insert profile
          const { error: profileError } = await supabase.from("profiles").insert([
            {
              id: authData.user.id,
              email: form.email,
              full_name: form.full_name,
              role: form.role,
            },
          ]);

          if (profileError) throw profileError;

          await supabase.from("activity_logs").insert([
            {
              actor_id: profile?.id,
              actor_name: profile?.full_name,
              actor_role: profile?.role,
              action: "CREATE_USER",
              entity_type: "PROFILE",
              entity_id: authData.user.id,
              metadata: { email: form.email, role: form.role },
            },
          ]);

          showToast(`${form.full_name} created successfully!`);
        }
      }

      setShowModal(false);
      setEditUser(null);
      await loadUsers();
    } catch (err) {
      console.error("Save user error:", err);
      showToast(err.message || "Failed to save user.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
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

      {/* Modal */}
      <UserModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditUser(null);
        }}
        onSave={handleSaveUser}
        saving={saving}
        editUser={editUser}
        currentUserRole={role}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Control system access and global configuration parameters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Account usage badge */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
              Account Usage
            </p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Users Created:{" "}
              <span className="text-primary">
                {userCount}/{MAX_USERS}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              setEditUser(null);
              setShowModal(true);
            }}
            disabled={userCount >= MAX_USERS}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} />
            Add New User
          </button>
        </div>
      </div>

      {/* Global System Activation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {/* Icon placeholder */}
          <div className="hidden md:flex h-24 w-28 rounded-2xl bg-primary/5 items-center justify-center flex-shrink-0">
            <SlidersHorizontal size={40} className="text-primary/40" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Global System Activation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              When deactivated, all booking and billing operations are paused across the
              entire resort.{" "}
              <span className="text-primary font-medium cursor-pointer hover:underline">
                This action requires Super User authorization.
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              System Status:{" "}
              <span
                className={`${
                  systemStatus ? "text-emerald-500 dark:text-neon-green" : "text-rose-500 dark:text-neon-rose"
                } font-extrabold`}
              >
                {systemStatus ? "ACTIVE" : "INACTIVE"}
              </span>
            </p>
            <Toggle
              checked={systemStatus}
              onChange={handleToggleSystem}
              disabled={togglingSystem || role !== "SUPER_USER"}
            />
          </div>
        </div>
      </div>

      {/* Lower grid: Users table + sidebar cards */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* System Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              System Users
            </h2>
            <span className="text-xs italic text-slate-400">
              Showing {userCount} active account{userCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <Loader2
                        size={24}
                        className="animate-spin text-primary mx-auto"
                      />
                    </td>
                  </tr>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-slate-400 text-sm"
                    >
                      No users found. Create one above.
                    </td>
                  </tr>
                )}
                {!loading &&
                  users.map((user) => {
                    const initials = getInitials(user.full_name);
                    const initialsColor =
                      user.role === "SUPER_USER"
                        ? "bg-primary/10 text-primary"
                        : user.role === "ADMIN"
                        ? "bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${initialsColor}`}
                            >
                              {initials}
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {user.full_name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">{roleBadge(user.role)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setEditUser(user);
                              setShowModal(true);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                            title="Edit user"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Pending Approvals */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck size={18} className="text-primary" />
              <h3 className="text-base font-extrabold text-primary tracking-tight">
                Pending Approvals
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Admins have requested more than the default {MAX_USERS}-user
              limit. Super User approval is required for these requests.
            </p>

            {/* Placeholder request since we don't have a real approval queue table */}
            {userCount >= MAX_USERS ? (
              <div className="bg-primary/[0.03] border border-primary/15 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      New Seat Request
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pending approval
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">
                    New Seat
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-110 transition-all">
                    Approve
                  </button>
                  <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    Deny
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle
                  size={28}
                  className="mx-auto text-emerald-400 mb-2"
                />
                <p className="text-xs text-slate-400 font-medium">
                  No pending requests
                </p>
              </div>
            )}

            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 text-center mt-4">
              {userCount >= MAX_USERS ? "1 Request Outstanding" : "0 Requests Outstanding"}
            </p>
          </div>

          {/* License Utilization */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              License Utilization
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  User Licenses
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {licensePercent}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    licensePercent >= 100
                      ? "bg-rose-500"
                      : licensePercent >= 80
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(licensePercent, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                Standard Admin accounts are limited to {MAX_USERS} seats. Additional seats
                require a Tier-2 Subscription upgrade.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="font-semibold text-primary">CabanaOS v2.4.1</span>
          <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <span>Built for Hospitality Excellence</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="hover:text-primary cursor-pointer transition-colors">
            Privacy Policy
          </span>
          <span className="hover:text-primary cursor-pointer transition-colors">
            Security Audit
          </span>
          <span className="hover:text-primary cursor-pointer transition-colors">
            Support Portal
          </span>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
