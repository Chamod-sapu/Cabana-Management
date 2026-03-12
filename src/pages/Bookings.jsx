import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Calendar,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  TrendingUp,
  Hotel,
  BarChart3,
  Filter,
} from "lucide-react";

// ─── Constants & Helpers ──────────────────────────────────────────────────────
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CABANA_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-neon-blue", border: "border-l-blue-500 dark:border-l-neon-blue", dot: "bg-blue-500 dark:bg-neon-blue" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-neon-green", border: "border-l-emerald-500 dark:border-l-neon-green", dot: "bg-emerald-500 dark:bg-neon-green" },
  { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-400", border: "border-l-amber-500 dark:border-l-amber-400", dot: "bg-amber-500 dark:bg-amber-400" },
  { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-neon-rose", border: "border-l-rose-500 dark:border-l-neon-rose", dot: "bg-rose-500 dark:bg-neon-rose" },
  { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-700 dark:text-violet-300", border: "border-l-violet-500 dark:border-l-violet-300", dot: "bg-violet-500 dark:bg-violet-300" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-700 dark:text-cyan-300", border: "border-l-cyan-500 dark:border-l-cyan-300", dot: "bg-cyan-500 dark:bg-cyan-300" },
];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, month: month - 1, year, outside: true });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, outside: false });
  }
  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: month + 1, year, outside: true });
  }
  return cells;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isBookingOnDay(booking, cellDate) {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  const cell = new Date(cellDate);
  cell.setHours(12, 0, 0, 0);
  return cell >= start && cell <= end;
}

function getCabanaColor(cabanaId) {
  return CABANA_COLORS[(cabanaId - 1) % CABANA_COLORS.length];
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
function StatCard({ icon: Icon, label, value, sub, subColor, color }) {
  const colorMap = {
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    rose: "text-rose-500",
  };
  const subColorMap = {
    emerald: "text-emerald-500",
    rose: "text-rose-500",
    amber: "text-amber-500",
    slate: "text-slate-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-5 py-4 transition-all">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white dark:text-neon-blue tracking-tight">
          {value}
        </p>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary dark:text-neon-blue dark:shadow-[0_0_10px_rgba(43,134,255,0.3)]">
          <Icon size={18} />
        </div>
      </div>
      {sub && (
        <p className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 uppercase tracking-wider ${subColorMap[subColor] || "text-slate-400"} ${subColor === 'emerald' ? 'dark:text-neon-green' : ''}`}>
          <TrendingUp size={10} />
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── New Booking Modal ────────────────────────────────────────────────────────
function NewBookingModal({ open, onClose, onSave, saving, guests, cabanas, selectedDate }) {
  const [form, setForm] = useState({
    cabana_id: "",
    guest_id: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    if (open) {
      const defaultStart = selectedDate
        ? `${selectedDate}T14:00`
        : "";
      const defaultEnd = selectedDate
        ? `${selectedDate}T11:00`
        : "";
      setForm({
        cabana_id: cabanas[0]?.id?.toString() || "1",
        guest_id: guests[0]?.id || "",
        start_time: defaultStart,
        end_time: defaultEnd,
      });
    }
  }, [open, selectedDate, cabanas, guests]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.guest_id || !form.start_time || !form.end_time) return;
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">New Booking</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Cabana *
            </label>
            <select
              value={form.cabana_id}
              onChange={(e) => setForm({ ...form, cabana_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
            >
              {cabanas.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Guest *
            </label>
            <select
              value={form.guest_id}
              onChange={(e) => setForm({ ...form, guest_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
            >
              <option value="">Select a guest...</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>{g.full_name}</option>
              ))}
            </select>
            {guests.length === 0 && (
              <p className="text-[10px] text-amber-600 font-medium mt-1">
                No guests found. Register guests first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Check-in *
              </label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Check-out *
              </label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.guest_id}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function Bookings() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [cabanas, setCabanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState("Month");

  // Modal
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Cabana filters
  const [enabledCabanas, setEnabledCabanas] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const showToastMsg = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: bookingsData }, { data: guestsData }, { data: cabanasData }] = await Promise.all([
        supabase.from("bookings").select("*, guests(full_name), cabanas(name)").order("start_time", { ascending: false }),
        supabase.from("guests").select("id, full_name"),
        supabase.from("cabanas").select("*").eq("is_active", true),
      ]);

      setBookings(bookingsData || []);
      setGuests(guestsData || []);
      setCabanas(cabanasData || []);

      // Initialize cabana filters — all enabled by default
      if (cabanasData && Object.keys(enabledCabanas).length === 0) {
        const init = {};
        cabanasData.forEach((c) => (init[c.id] = true));
        setEnabledCabanas(init);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      showToastMsg("Failed to load booking data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create booking
  const handleCreateBooking = async (form) => {
    setSubmitting(true);
    try {
      const { cabana_id, guest_id, start_time, end_time } = form;

      if (new Date(start_time) >= new Date(end_time)) {
        showToastMsg("End time must be after start time.", "error");
        setSubmitting(false);
        return;
      }

      // Overlap check
      const { data: overlaps } = await supabase
        .from("bookings")
        .select("id")
        .eq("cabana_id", parseInt(cabana_id))
        .lt("start_time", end_time)
        .gt("end_time", start_time);

      if (overlaps && overlaps.length > 0) {
        showToastMsg("This cabana is already booked for the selected time slot.", "error");
        setSubmitting(false);
        return;
      }

      const { data: newBooking, error: insertError } = await supabase
        .from("bookings")
        .insert([{ cabana_id: parseInt(cabana_id), guest_id, start_time, end_time, status: "CONFIRMED" }])
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from("activity_logs").insert([{
        actor_id: profile?.id,
        actor_name: profile?.full_name,
        actor_role: profile?.role,
        action: "CREATE_BOOKING",
        entity_type: "BOOKING",
        entity_id: newBooking.id,
        metadata: { cabana_id, guest_id, start_time, end_time },
      }]);

      showToastMsg("Booking created successfully!");
      setShowNewBooking(false);
      await loadData();
    } catch (err) {
      console.error("Error creating booking:", err);
      showToastMsg(err.message || "Failed to create booking.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;

      await supabase.from("activity_logs").insert([{
        actor_id: profile?.id,
        actor_name: profile?.full_name,
        actor_role: profile?.role,
        action: "DELETE_BOOKING",
        entity_type: "BOOKING",
        entity_id: id,
      }]);

      showToastMsg("Booking cancelled.");
      await loadData();
    } catch (err) {
      console.error("Error deleting booking:", err);
      showToastMsg("Failed to delete booking.", "error");
    }
  };

  // Calendar navigation
  const goToday = () => { setCalYear(now.getFullYear()); setCalMonth(now.getMonth()); };
  const goPrev = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
  const goNext = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };

  // Calendar cells
  const calendarCells = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);

  // Filter bookings by enabled cabanas
  const filteredBookings = useMemo(
    () => bookings.filter((b) => enabledCabanas[b.cabana_id] !== false),
    [bookings, enabledCabanas]
  );

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayBookings = bookings.filter((b) => {
      const s = new Date(b.start_time);
      return s >= today && s <= todayEnd;
    });

    const activeCabanas = cabanas.filter((c) => c.is_active).length;
    const bookedCabanas = new Set(
      bookings.filter((b) => b.status === "CONFIRMED" && isBookingOnDay(b, today)).map((b) => b.cabana_id)
    ).size;

    const occupancy = activeCabanas > 0 ? Math.round((bookedCabanas / activeCabanas) * 100) : 0;

    return {
      todayCount: todayBookings.length,
      availability: activeCabanas,
      occupancy,
    };
  }, [bookings, cabanas]);

  // Toggle cabana filter
  const toggleCabana = (id) => {
    setEnabledCabanas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle calendar day click
  const handleDayClick = (cell) => {
    if (cell.outside) return;
    const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setShowNewBooking(true);
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <NewBookingModal
        open={showNewBooking}
        onClose={() => setShowNewBooking(false)}
        onSave={handleCreateBooking}
        saving={submitting}
        guests={guests}
        cabanas={cabanas}
        selectedDate={selectedDate}
      />

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={28} className="text-primary" />
            Booking Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Create and manage cabana reservations with the interactive calendar.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Calendar}
          label="Today's Bookings"
          value={stats.todayCount.toString()}
          sub={bookings.length > 0 ? `${bookings.length} total active` : undefined}
          subColor="emerald"
        />
        <StatCard
          icon={Hotel}
          label="Availability"
          value={`${stats.availability}`}
          sub={`${stats.availability} Cabanas active`}
          subColor="slate"
        />
        <StatCard
          icon={BarChart3}
          label="Occupancy Rate"
          value={`${stats.occupancy}%`}
          sub={stats.occupancy > 50 ? "High demand" : "Low demand"}
          subColor={stats.occupancy > 50 ? "emerald" : "amber"}
        />
      </div>

      {/* Calendar card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Calendar header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {MONTHS[calMonth]} {calYear}
            </h2>
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button onClick={goPrev} className="px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft size={16} className="text-slate-500" />
              </button>
              <button onClick={goToday} className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-x border-slate-200 dark:border-slate-700 transition-colors">
                Today
              </button>
              <button onClick={goNext} className="px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cabana filter button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <Filter size={13} />
                Cabanas
              </button>
              {showFilters && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3 z-30 min-w-[200px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Cabana Filters</p>
                  {cabanas.map((c) => {
                    const color = getCabanaColor(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                        <button
                          type="button"
                          onClick={() => toggleCabana(c.id)}
                          className={`h-4 w-4 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                            enabledCabanas[c.id]
                              ? "bg-primary border-primary"
                              : "border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                          }`}
                        >
                          {enabledCabanas[c.id] && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 3l2 2 4-4" />
                            </svg>
                          )}
                        </button>
                        <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* View mode */}
            <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {["Month", "Week", "Day"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === mode
                      ? "bg-primary text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* New booking button */}
            <button
              onClick={() => {
                setSelectedDate(null);
                setShowNewBooking(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Plus size={14} />
              New Booking
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
              {DAYS.map((d) => (
                <div key={d} className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells: 6 rows × 7 cols */}
            <div className="grid grid-cols-7">
              {calendarCells.map((cell, idx) => {
                const cellDate = new Date(cell.year, cell.month, cell.day);
                const isToday = isSameDay(cellDate, now);
                const dayBookings = filteredBookings.filter((b) =>
                  isBookingOnDay(b, cellDate)
                );

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(cell)}
                    className={`min-h-[100px] border-b border-r border-slate-100 dark:border-slate-800 p-1.5 cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                      cell.outside ? "bg-slate-50/30 dark:bg-slate-800/10" : ""
                    } ${idx % 7 === 0 ? "border-l-0" : ""}`}
                  >
                    {/* Day number */}
                    <div className="flex justify-end mb-1">
                      <span
                        className={`inline-flex items-center justify-center text-xs font-semibold ${
                          isToday
                            ? "h-6 w-6 rounded-full bg-primary text-white"
                            : cell.outside
                            ? "text-slate-300 dark:text-slate-600"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {cell.day}
                      </span>
                    </div>

                    {/* Booking chips */}
                    <div className="space-y-0.5">
                      {dayBookings.slice(0, 2).map((b) => {
                        const color = getCabanaColor(b.cabana_id);
                        const label = `${b.cabanas?.name || "Cabana"} - ${b.guests?.full_name?.split(" ")[0] || "Guest"}`;
                        return (
                          <div
                            key={b.id}
                            onClick={(e) => e.stopPropagation()}
                            className={`group relative px-1.5 py-0.5 rounded text-[9px] font-semibold truncate border-l-2 ${color.bg} ${color.text} ${color.border} cursor-default`}
                            title={`${b.cabanas?.name} — ${b.guests?.full_name} (${new Date(b.start_time).toLocaleDateString()} - ${new Date(b.end_time).toLocaleDateString()})`}
                          >
                            {label.length > 18 ? label.slice(0, 18) + "…" : label}
                            {/* Delete on hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBooking(b.id);
                              }}
                              className="absolute right-0.5 top-0 bottom-0 my-auto h-3.5 w-3.5 rounded bg-rose-500/0 group-hover:bg-rose-500 text-transparent group-hover:text-white flex items-center justify-center transition-all"
                              title="Cancel booking"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        );
                      })}
                      {dayBookings.length > 2 && (
                        <div className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
