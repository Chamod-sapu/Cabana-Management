import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Clock,
  Calendar,
  FileText,
  Edit,
  ArrowLeft,
  UserCheck,
  LogOut,
  LogIn,
  Hotel,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

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

function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcDuration(start, end) {
  const ms = new Date(end) - new Date(start);
  const totalHours = ms / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  if (days > 0 && hours > 0) return `${days} Day${days > 1 ? "s" : ""}, ${hours}h`;
  if (days > 0) return `${days} Day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} Hour${hours > 1 ? "s" : ""}`;
  return "< 1 Hour";
}

function calcTotalFromBooking(booking) {
  const cabana = booking.cabanas;
  const dayRate = cabana?.base_rate_day ?? 250;
  const hourRate = cabana?.base_rate_hour ?? 30;
  const ms = new Date(booking.end_time) - new Date(booking.start_time);
  const totalHours = ms / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  let total = days * dayRate + hours * hourRate;
  if (days === 0 && hours === 0) total = hourRate;
  return total * 1.1; // Including 10% service tax
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
        toast.type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
      }`}
    >
      {toast.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
      {toast.msg}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
  const colorMap = {
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    violet: "text-violet-500",
    amber: "text-amber-500",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <Icon size={18} className={colorMap[color] || "text-slate-400"} />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="text-xs font-medium text-emerald-500 mt-1">{sub}</p>
      )}
    </div>
  );
}

// ─── Register Guest Modal ─────────────────────────────────────────────────────
function RegisterModal({ open, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    full_name: "",
    nic: "",
    country: "",
    mobile: "",
    address: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Register New Guest
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
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
                NIC / Passport
              </label>
              <input
                type="text"
                value={form.nic}
                onChange={(e) => setForm({ ...form, nic: e.target.value })}
                placeholder="e.g. 923456789V"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. United States"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Mobile
              </label>
              <input
                type="text"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="e.g. +1 234 567 890"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 123 Main St, City"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
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
              disabled={saving || !form.full_name.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {saving ? "Registering..." : "Register Guest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Guest Profile View ───────────────────────────────────────────────────────
function GuestProfile({ guest, bookings, onBack }) {
  const [profileTab, setProfileTab] = useState("history");
  const [bookingPage, setBookingPage] = useState(1);
  const bkPerPage = 4;

  const guestBookings = useMemo(
    () => bookings.filter((b) => b.guest_id === guest.id),
    [bookings, guest.id]
  );

  const sortedBookings = useMemo(
    () => [...guestBookings].sort((a, b) => new Date(b.start_time) - new Date(a.start_time)),
    [guestBookings]
  );

  const paginatedBookings = sortedBookings.slice(
    (bookingPage - 1) * bkPerPage,
    bookingPage * bkPerPage
  );
  const totalBookingPages = Math.ceil(sortedBookings.length / bkPerPage);

  const activeBooking = guestBookings.find((b) => b.status === "CONFIRMED");

  const loyaltyStats = useMemo(() => {
    const totalVisits = guestBookings.length;
    const totalSpent = guestBookings.reduce((sum, b) => sum + calcTotalFromBooking(b), 0);
    return { totalVisits, totalSpent };
  }, [guestBookings]);

  const memberTier = loyaltyStats.totalVisits >= 10 ? "GOLD" : loyaltyStats.totalVisits >= 5 ? "SILVER" : "BRONZE";
  const tierColors = {
    GOLD: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    SILVER: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    BRONZE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft size={12} />
          Guests
        </button>
        <span>›</span>
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          Guest Profile: {guest.full_name}
        </span>
      </div>

      {/* Profile header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center text-2xl font-extrabold text-primary flex-shrink-0">
            {getInitials(guest.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {guest.full_name}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tierColors[memberTier]}`}>
                {memberTier} Member
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Guest ID: #{guest.id.slice(0, 8).toUpperCase()} • Joined {fmtDate(guest.created_at)}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              {guest.mobile && (
                <span className="flex items-center gap-1.5">
                  <Phone size={12} className="text-slate-400" />
                  {guest.mobile}
                </span>
              )}
              {guest.nic && (
                <span className="flex items-center gap-1.5">
                  <CreditCard size={12} className="text-slate-400" />
                  {guest.nic}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Edit size={14} />
              Edit Profile
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all">
              <Download size={14} />
              Download History
            </button>
          </div>
        </div>
      </div>

      {/* Current Stay banner */}
      {activeBooking && (
        <div className="bg-primary/[0.03] border-2 border-primary/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Hotel size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Current Stay</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeBooking.cabanas?.name || `Cabana #${activeBooking.cabana_id}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div>
              <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 mb-0.5">Check In</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{fmtDateTime(activeBooking.start_time)}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 mb-0.5">Check Out</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{fmtDateTime(activeBooking.end_time)}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 mb-0.5">Balance Due</p>
              <p className="font-bold text-primary">${calcTotalFromBooking(activeBooking).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all">
              Add Service
            </button>
            <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow hover:brightness-110 transition-all">
              Quick Checkout
            </button>
          </div>
        </div>
      )}

      {/* Lower section: info sidebar + tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: Guest Information */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
              <UserCheck size={16} className="text-primary" />
              Guest Information
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                  National ID / Passport
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {guest.nic || "—"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                  Country of Origin
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400" />
                  {guest.country || "—"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                  Mobile
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {guest.mobile || "—"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                  Residential Address
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {guest.address || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Loyalty Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Loyalty Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-primary">{loyaltyStats.totalVisits}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Total Visits
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-primary">
                  ${loyaltyStats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Total Spent
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Historical Bookings tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-1 pt-1">
            {[
              { id: "info", label: "General Info" },
              { id: "history", label: "Historical Bookings" },
              { id: "preferences", label: "Preferences" },
              { id: "billing", label: "Billing Reports" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setProfileTab(tab.id)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all rounded-t-lg ${
                  profileTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-0">
            {profileTab === "history" && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Cabana
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Dates
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Duration
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </th>
                        <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Total Paid
                        </th>
                        <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedBookings.map((b) => {
                        const statusColors = {
                          CONFIRMED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
                          CHECKED_OUT: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
                          CANCELLED: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
                          PENDING_PAYMENT: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
                        };
                        const statusLabels = {
                          CONFIRMED: "Active",
                          CHECKED_OUT: "Completed",
                          CANCELLED: "Cancelled",
                          PENDING_PAYMENT: "Pending",
                        };
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                  #{b.cabana_id}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {b.cabanas?.name?.includes("Luxury")
                                    ? "Luxury"
                                    : b.cabanas?.name?.includes("Beach")
                                    ? "Deluxe"
                                    : "Standard"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                              {fmtDate(b.start_time)} – {fmtDate(b.end_time)}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                              {calcDuration(b.start_time, b.end_time)}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[b.status] || "bg-slate-100 text-slate-500"}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {statusLabels[b.status] || b.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                              ${calcTotalFromBooking(b).toFixed(2)}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                                <FileText size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {sortedBookings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                            No booking history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalBookingPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400">
                      Showing {(bookingPage - 1) * bkPerPage + 1}-
                      {Math.min(bookingPage * bkPerPage, sortedBookings.length)} of{" "}
                      {sortedBookings.length} bookings
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBookingPage((p) => Math.max(1, p - 1))}
                        disabled={bookingPage <= 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setBookingPage((p) => Math.min(totalBookingPages, p + 1))}
                        disabled={bookingPage >= totalBookingPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {profileTab === "info" && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">Full Name</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{guest.full_name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">NIC / Passport</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{guest.nic || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">Country</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{guest.country || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">Mobile</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{guest.mobile || "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">Address</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{guest.address || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary mb-1">Registered On</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtDate(guest.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
            {profileTab === "preferences" && (
              <div className="p-6 text-center text-slate-400 text-sm py-16">
                Guest preferences will be available in a future update.
              </div>
            )}
            {profileTab === "billing" && (
              <div className="p-6 text-center text-slate-400 text-sm py-16">
                Billing reports will be available in a future update.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Guest Directory ─────────────────────────────────────────────────────
function Guests() {
  const { profile } = useAuth();
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showRegister, setShowRegister] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | checked-out
  const [showFilters, setShowFilters] = useState(false);

  const showToastMsg = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: guestsData }, { data: bookingsData }] = await Promise.all([
        supabase.from("guests").select("*").order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select("*, cabanas(id, name, base_rate_hour, base_rate_day)")
          .order("start_time", { ascending: false }),
      ]);
      setGuests(guestsData || []);
      setBookings(bookingsData || []);
    } catch (err) {
      console.error("Error loading guests:", err);
      showToastMsg("Failed to load guest data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Guest statuses derived from bookings
  const guestStatusMap = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (b.status === "CONFIRMED") {
        map[b.guest_id] = "Active";
      } else if (!map[b.guest_id]) {
        map[b.guest_id] = "Checked-out";
      }
    });
    return map;
  }, [bookings]);

  // Filtered + searched guests
  const filteredGuests = useMemo(() => {
    let result = guests;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.full_name?.toLowerCase().includes(q) ||
          g.nic?.toLowerCase().includes(q) ||
          g.mobile?.toLowerCase().includes(q) ||
          g.country?.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filterStatus === "active") {
      result = result.filter((g) => guestStatusMap[g.id] === "Active");
    } else if (filterStatus === "checked-out") {
      result = result.filter(
        (g) => guestStatusMap[g.id] === "Checked-out" || !guestStatusMap[g.id]
      );
    }

    return result;
  }, [guests, search, filterStatus, guestStatusMap]);

  const totalPages = Math.ceil(filteredGuests.length / PAGE_SIZE);
  const paginatedGuests = filteredGuests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => {
    const total = guests.length;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = guests.filter((g) => new Date(g.created_at) >= monthStart).length;
    const inHouse = Object.values(guestStatusMap).filter((s) => s === "Active").length;
    const activeCabanas = new Set(
      bookings.filter((b) => b.status === "CONFIRMED").map((b) => b.cabana_id)
    ).size;
    const occupancy = activeCabanas > 0 ? Math.round((activeCabanas / 4) * 100) : 0;

    // Average stay duration
    const checkedOut = bookings.filter((b) => b.status === "CHECKED_OUT");
    const avgStay =
      checkedOut.length > 0
        ? checkedOut.reduce((sum, b) => {
            const ms = new Date(b.end_time) - new Date(b.start_time);
            return sum + ms / (1000 * 60 * 60 * 24);
          }, 0) / checkedOut.length
        : 0;

    return { total, newThisMonth, inHouse, occupancy, avgStay };
  }, [guests, bookings, guestStatusMap]);

  // Register guest
  const handleRegister = async (form) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("guests").insert([form]);
      if (error) throw error;

      await supabase.from("activity_logs").insert([
        {
          actor_id: profile?.id,
          actor_name: profile?.full_name,
          actor_role: profile?.role,
          action: "REGISTER_GUEST",
          entity_type: "GUEST",
          metadata: { guest_name: form.full_name },
        },
      ]);

      showToastMsg(`${form.full_name} registered successfully!`);
      setShowRegister(false);
      await loadData();
    } catch (err) {
      console.error("Register error:", err);
      showToastMsg(err.message || "Failed to register guest.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Full Name", "NIC", "Country", "Mobile", "Address", "Registered"];
    const rows = filteredGuests.map((g) => [
      g.full_name,
      g.nic || "",
      g.country || "",
      g.mobile || "",
      g.address || "",
      fmtDate(g.created_at),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guest-directory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToastMsg("CSV exported successfully!");
  };

  // Pagination helpers
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

  // If a guest is selected, show profile view
  if (selectedGuest) {
    return (
      <>
        <Toast toast={toast} />
        <GuestProfile
          guest={selectedGuest}
          bookings={bookings}
          onBack={() => setSelectedGuest(null)}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <RegisterModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onSave={handleRegister}
        saving={saving}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Guest Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage registrations, check-ins, and guest profiles.
          </p>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <UserPlus size={16} />
          Register New Guest
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Registered Guests"
          value={stats.total.toLocaleString()}
          sub={stats.total > 0 ? `↗ ${((stats.newThisMonth / Math.max(stats.total, 1)) * 100).toFixed(0)}%` : undefined}
          color="blue"
        />
        <StatCard
          icon={UserPlus}
          label="New Guests This Month"
          value={stats.newThisMonth.toString()}
          sub={stats.newThisMonth > 0 ? `↗ ${stats.newThisMonth} new` : undefined}
          color="emerald"
        />
        <StatCard
          icon={Hotel}
          label="Currently In-House"
          value={stats.inHouse.toString()}
          sub={`Occupancy: ${stats.occupancy}%`}
          color="violet"
        />
        <StatCard
          icon={CalendarDays}
          label="Average Stay Duration"
          value={stats.avgStay > 0 ? stats.avgStay.toFixed(1) : "0"}
          sub="Days"
          color="amber"
        />
      </div>

      {/* Guest Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  filterStatus !== "all"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Filter size={13} />
                Filter
                {filterStatus !== "all" && (
                  <span className="ml-1 h-4 w-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
              {showFilters && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 z-30 min-w-[160px]">
                  {[
                    { id: "all", label: "All Guests" },
                    { id: "active", label: "Active (In-House)" },
                    { id: "checked-out", label: "Checked Out" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setFilterStatus(opt.id); setShowFilters(false); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        filterStatus === opt.id
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search guests..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-3 py-2 w-56 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <span className="text-[11px] italic text-slate-400 hidden md:inline whitespace-nowrap">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredGuests.length)} of{" "}
              {filteredGuests.length.toLocaleString()} results
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Guest Details
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  NIC / Passport
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Country
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mobile
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Actions
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
              {!loading && paginatedGuests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Search size={32} strokeWidth={1.5} />
                      <p className="text-sm font-medium">No guests found</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                paginatedGuests.map((guest) => {
                  const status = guestStatusMap[guest.id] || "Checked-out";
                  const isActive = status === "Active";
                  return (
                    <tr
                      key={guest.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedGuest(guest)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                            {getInitials(guest.full_name)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {guest.full_name}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                              {guest.id.slice(0, 8)}@guest
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {guest.nic || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {guest.country || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {guest.mobile || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGuest(guest);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isActive
                              ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              : "border border-primary text-primary hover:bg-primary/5"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <LogOut size={12} />
                              CHECK-OUT
                            </>
                          ) : (
                            <>
                              <LogIn size={12} />
                              CHECK-IN
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages}
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
                  <span key={`dots-${i}`} className="px-1 text-xs text-slate-400">
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
    </div>
  );
}

export default Guests;
