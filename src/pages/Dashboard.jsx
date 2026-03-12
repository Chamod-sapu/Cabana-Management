import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Umbrella, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  CreditCard,
  FileText,
  BarChart3
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, trend, trendLabel, accentColor }) {
  const isPositive = trend === "up";
  const isNeutral = trend === "neutral";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">{label}</p>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm dark:shadow-neon transition-all`}
          style={{ 
            backgroundColor: accentColor + "1a", 
            color: accentColor,
            boxShadow: `0 0 10px ${accentColor}33`
          }}
        >
          <Icon size={20} className="dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
        </div>
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white dark:text-neon-blue">
        {value ?? "—"}
      </p>
      {trendLabel && (
        <p
          className={`text-xs font-semibold flex items-center gap-1 ${
            isNeutral
              ? "text-slate-500"
              : isPositive
              ? "text-emerald-600 dark:text-neon-green"
              : "text-rose-500 dark:text-neon-rose"
          }`}
        >
          {isNeutral ? <Minus size={14} /> : isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trendLabel}
        </p>
      )}
    </div>
  );
}

// ─── Booking Schedule (Gantt) ──────────────────────────────────────────────────
const HOURS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

const SAMPLE_BOOKINGS = [
  {
    cabana: "Cabana 1 – VIP Pool",
    bookings: [
      { guest: "J. Thompson", type: "Full Day Package", start: 8, end: 12.5, color: "#dbeafe", textColor: "#1d4ed8" },
      { guest: "L. Martinez", type: "Afternoon Pass", start: 14, end: 17, color: "#ede9fe", textColor: "#6d28d9" },
    ],
  },
  {
    cabana: "Cabana 2 – North Deck",
    bookings: [
      { guest: "S. Wilson Family", type: "Group Event", start: 11, end: 17, color: "#dcfce7", textColor: "#15803d" },
    ],
  },
  {
    cabana: "Cabana 3 – Ocean View",
    bookings: [
      { guest: "D. Brown", type: "Couple Spa", start: 13, end: 16, color: "#fef9c3", textColor: "#a16207" },
    ],
  },
  {
    cabana: "Cabana 4 – Garden Retreat",
    bookings: [],
    maintenance: "Maintenance – Offline for repairs",
  },
];

const VIEW_TABS = ["Day", "Week", "Month"];

const TIMELINE_START = 8;  // 08:00
const TIMELINE_END = 20;   // 20:00
const TIMELINE_DURATION = TIMELINE_END - TIMELINE_START;

function pct(hour) {
  return ((hour - TIMELINE_START) / TIMELINE_DURATION) * 100;
}

function BookingSchedule() {
  const [view, setView] = useState("Day");
  const today = new Date(2023, 9, 24); // Oct 24 2023 (matches design)
  const label = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar size={18} className="text-primary dark:text-neon-blue" />
          Booking Schedule
        </h2>
        <div className="flex items-center gap-4">
          {/* View Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  view === tab
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[100px] text-center">
              {label}
            </span>
            <button className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Hour Headers */}
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800">
            <div className="w-44 flex-shrink-0 px-6 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              LOCATION
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="flex-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-2 pl-2"
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cabana Rows */}
          {SAMPLE_BOOKINGS.map((row, idx) => (
            <div
              key={row.cabana}
              className={`flex items-stretch h-[72px] ${
                idx < SAMPLE_BOOKINGS.length - 1
                  ? "border-b border-slate-100 dark:border-slate-800"
                  : ""
              }`}
            >
              {/* Cabana Name */}
              <div className="w-44 flex-shrink-0 px-6 flex items-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {row.cabana}
                </p>
              </div>

              {/* Timeline area */}
              <div className="flex-1 relative h-full pr-4">
                {/* Grid lines */}
                <div className="absolute inset-y-0 left-0 right-4 flex pointer-events-none">
                  {HOURS.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-l border-slate-100 dark:border-slate-800 first:border-l-0"
                    />
                  ))}
                </div>

                {/* Maintenance label */}
                {row.maintenance && (
                  <p className="absolute top-1/2 -translate-y-1/2 left-4 right-4 text-xs italic text-slate-400 dark:text-slate-500 text-center pointer-events-none">
                    {row.maintenance}
                  </p>
                )}

                {/* Booking blocks */}
                {row.bookings.map((b, i) => {
                  const left = pct(b.start);
                  const width = pct(b.end) - pct(b.start);
                  return (
                    <div
                      key={i}
                      className="absolute top-2 bottom-2 rounded-lg px-2 flex flex-col justify-center cursor-pointer hover:brightness-95 transition-all"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: b.color,
                      }}
                    >
                      <p
                        className="text-xs font-bold truncate"
                        style={{ color: b.textColor }}
                      >
                        {b.guest}
                      </p>
                      <p
                        className="text-[10px] truncate"
                        style={{ color: b.textColor + "cc" }}
                      >
                        {b.type}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6 flex-wrap">
        {[
          { color: "#2b86ff", label: "RESERVED" },
          { color: "#00f3ff", label: "CHECKED-IN" },
          { color: "#39ff14", label: "GROUP BOOKING" },
          { color: "#ff007f", label: "SERVICE PACKAGE" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0 shadow-[0_0_5px_rgba(255,255,255,0.2)]"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Activity ───────────────────────────────────────────────────────────
const RECENT_ACTIVITIES = [
  {
    id: 1,
    icon: CalendarCheck,
    iconBg: "#dbeafe",
    iconColor: "#1d4ed8",
    title: "New Booking",
    body: "for Cabana 2 by",
    link: "Sarah Miller",
    time: "2 minutes ago",
  },
  {
    id: 2,
    icon: CheckCircle,
    iconBg: "#dcfce7",
    iconColor: "#15803d",
    title: "Payment Processed",
    body: "for Booking #8829 ($450.00)",
    link: null,
    time: "15 minutes ago",
  },
  {
    id: 3,
    icon: AlertCircle,
    iconBg: "#fef9c3",
    iconColor: "#a16207",
    title: "Maintenance Alert:",
    body: "Cabana 4 offline (Electrical issue)",
    link: null,
    time: "1 hour ago",
  },
];

function RecentActivity() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-primary dark:text-neon-blue" />
          Recent Activity
        </h2>
        <button className="text-sm font-semibold text-primary dark:text-neon-blue hover:opacity-80 transition-opacity uppercase tracking-widest text-[10px]">
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RECENT_ACTIVITIES.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: a.iconBg, color: a.iconColor }}
            >
              <a.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                <span className="font-bold text-slate-900 dark:text-white">{a.title}</span>{" "}
                {a.body}{" "}
                {a.link && (
                  <span className="font-semibold text-primary cursor-pointer hover:underline">
                    {a.link}
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Billing Snapshot ──────────────────────────────────────────────────────────
const BILLING_ITEMS = [
  { label: "Today's Revenue", value: "$4,250", icon: DollarSign, iconBg: "#dcfce7", iconColor: "#15803d", sub: "3 transactions" },
  { label: "Pending Invoices", value: "$1,200", icon: FileText, iconBg: "#fef9c3", iconColor: "#a16207", sub: "2 outstanding" },
  { label: "Monthly Total", value: "$38,400", icon: BarChart3, iconBg: "#dbeafe", iconColor: "#1d4ed8", sub: "vs $34,100 last month" },
];

function BillingSnapshot() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 size={18} className="text-primary dark:text-neon-blue" />
          Billing Snapshot
        </h2>
        <button className="text-sm font-semibold text-primary dark:text-neon-blue hover:opacity-80 transition-opacity uppercase tracking-widest text-[10px]">
          View Details
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BILLING_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 hover:border-primary/30 transition-all cursor-default"
          >
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0`}
              style={{ 
                backgroundColor: item.iconBg, 
                color: item.iconColor,
                boxShadow: `0 0 10px ${item.iconColor}44`
              }}
            >
              <item.icon size={22} className="dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className={`text-xl font-black tracking-tight ${item.label.includes('Revenue') ? 'text-slate-900 dark:text-neon-green' : 'text-slate-900 dark:text-white'}`}>{item.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState({
    guests: null,
    bookingsToday: null,
    revenueToday: null,
    availableCabanas: null,
  });

  useEffect(() => {
    const loadStats = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ count: guestsCount }, { count: bookingsCount }] = await Promise.all([
        supabase.from("guests").select("*", { count: "exact", head: true }),
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .gte("start_time", today),
      ]);

      setStats({
        guests: guestsCount ?? 0,
        bookingsToday: bookingsCount ?? 0,
        revenueToday: null,     // Requires SQL aggregation — placeholder
        availableCabanas: null, // Requires availability view — placeholder
      });
    };

    loadStats();
  }, []);

  const statCards = [
    {
      label: "Total Guests",
      value: stats.guests !== null ? stats.guests.toLocaleString() : "—",
      icon: Users,
      accentColor: "#137fec",
      trend: "up",
      trendLabel: "+12% from last week",
    },
    {
      label: "Active Bookings",
      value: stats.bookingsToday !== null ? stats.bookingsToday.toLocaleString() : "—",
      icon: Calendar,
      accentColor: "#10b981",
      trend: "up",
      trendLabel: "+5% from yesterday",
    },
    {
      label: "Revenue Today",
      value: stats.revenueToday ? `$${Number(stats.revenueToday).toLocaleString()}` : "$4,250",
      icon: DollarSign,
      accentColor: "#f59e0b",
      trend: "down",
      trendLabel: "-2.4% from average",
    },
    {
      label: "Available Cabanas",
      value: stats.availableCabanas ?? "4",
      icon: Umbrella,
      accentColor: "#8b5cf6",
      trend: "neutral",
      trendLabel: "Stable occupancy",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of today's cabana operations and key metrics.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Booking Schedule */}
      <BookingSchedule />

      {/* Bottom Row: Recent Activity + (optionally Billing snapshot full width below) */}
      <RecentActivity />

      {/* Billing Snapshot */}
      <BillingSnapshot />
    </div>
  );
}

export default Dashboard;
