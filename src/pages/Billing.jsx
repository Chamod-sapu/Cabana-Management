import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import jsPDF from "jspdf";
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  Clock,
  History,
  ZoomIn,
  AlertTriangle,
  Loader2,
  Receipt,
  Search,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICE_TAX_RATE = 0.1; // 10%
const AMENITIES_COST = 45; // flat per booking
const HOURLY_LATE_RATE = 40;
const RESORT_NAME = "Azure Bay Resort";
const RESORT_ADDRESS = "122 Beach Avenue, Southern Coast";
const RESORT_PHONE = "+1 234 567 8900";
const RESORT_EMAIL = "billing@azurebayresort.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcDuration(start, end) {
  const ms = new Date(end) - new Date(start);
  const totalHours = ms / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  return { totalHours, days, hours };
}

function buildLineItems(booking) {
  const cabana = booking.cabanas;
  const dayRate = cabana?.base_rate_day ?? 250;
  const hourRate = cabana?.base_rate_hour ?? 30;

  const { days, hours } = calcDuration(booking.start_time, booking.end_time);

  const items = [];

  if (days > 0) {
    items.push({
      description: "Cabana Rental (Day Rate)",
      unit: "Day",
      qty: days,
      price: dayRate,
      total: days * dayRate,
    });
  }

  if (hours > 0) {
    items.push({
      description: days > 0 ? "Late Checkout (Hourly)" : "Cabana Rental (Hourly)",
      unit: "Hour",
      qty: hours,
      price: days > 0 ? HOURLY_LATE_RATE : hourRate,
      total: hours * (days > 0 ? HOURLY_LATE_RATE : hourRate),
    });
  }

  if (days === 0 && hours === 0) {
    items.push({
      description: "Cabana Rental (Minimum Charge)",
      unit: "Hour",
      qty: 1,
      price: hourRate,
      total: hourRate,
    });
  }

  items.push({
    description: "Room Service / Amenities",
    unit: "—",
    qty: 1,
    price: AMENITIES_COST,
    total: AMENITIES_COST,
  });

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = subtotal * SERVICE_TAX_RATE;
  const grandTotal = subtotal + tax;

  return { items, subtotal, tax, grandTotal };
}

function formatStayDuration(start, end) {
  const { totalHours, days, hours } = calcDuration(start, end);
  if (totalHours < 1) return "< 1 Hour";
  const parts = [];
  if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? "s" : ""}`);
  return parts.join(", ");
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShortDate(iso) {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function genInvoiceNumber(bookingId) {
  const num = parseInt(bookingId.replace(/-/g, "").slice(0, 8), 16) % 9000 + 1000;
  return `#INV-${new Date().getFullYear()}-${num}`;
}

// ─── PDF Generator ────────────────────────────────────────────────────────────
function downloadInvoicePDF(booking) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { items, subtotal, tax, grandTotal } = buildLineItems(booking);
  const guest = booking.guests;
  const cabana = booking.cabanas;
  const invoiceNo = genInvoiceNumber(booking.id);

  const primary = [19, 127, 236];
  const dark = [30, 41, 59];
  const mid = [100, 116, 139];
  const light = [248, 250, 252];

  // Header bar
  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 32, "F");

  // Resort name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(RESORT_NAME, 14, 14);

  // INVOICE label
  doc.setFontSize(22);
  doc.text("INVOICE", 196, 14, { align: "right" });

  // Resort sub-info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`${RESORT_ADDRESS}  |  ${RESORT_PHONE}  |  ${RESORT_EMAIL}`, 14, 22);

  // Invoice meta
  doc.setFontSize(9);
  doc.text(`${invoiceNo}`, 196, 22, { align: "right" });
  doc.text(`Issued: ${fmtShortDate(new Date())}`, 196, 27, { align: "right" });

  // Divider
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  doc.line(14, 36, 196, 36);

  // Guest info box
  doc.setFillColor(...light);
  doc.roundedRect(14, 40, 85, 40, 3, 3, "F");
  doc.setTextColor(...mid);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("GUEST INFORMATION", 20, 48);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.text(guest?.full_name || "—", 20, 55);
  doc.setFontSize(8);
  doc.setTextColor(...mid);
  if (guest?.nic) doc.text(`NIC: ${guest.nic}`, 20, 61);
  if (guest?.country) doc.text(guest.country, 20, 67);
  if (guest?.mobile) doc.text(guest.mobile, 20, 73);

  // Booking details box
  doc.setFillColor(...light);
  doc.roundedRect(111, 40, 85, 40, 3, 3, "F");
  doc.setTextColor(...mid);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING DETAILS", 117, 48);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.text(cabana?.name || `Cabana #${booking.cabana_id}`, 117, 55);
  doc.setFontSize(8);
  doc.setTextColor(...mid);
  doc.text(`Check-in:  ${fmtDate(booking.start_time)}`, 117, 61);
  doc.text(`Check-out: ${fmtDate(booking.end_time)}`, 117, 68);

  // Line items table header
  let y = 92;
  doc.setFillColor(...primary);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Description", 18, y + 5.5);
  doc.text("Unit", 115, y + 5.5);
  doc.text("Qty", 135, y + 5.5, { align: "center" });
  doc.text("Price", 162, y + 5.5, { align: "right" });
  doc.text("Total", 196, y + 5.5, { align: "right" });

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 3, 182, 9, "F");
    }
    doc.setTextColor(...dark);
    doc.text(item.description, 18, y + 3);
    doc.setTextColor(...mid);
    doc.text(item.unit, 115, y + 3);
    doc.text(String(item.qty), 135, y + 3, { align: "center" });
    doc.text(`$${item.price.toFixed(2)}`, 162, y + 3, { align: "right" });
    doc.setTextColor(...dark);
    doc.text(`$${item.total.toFixed(2)}`, 196, y + 3, { align: "right" });
    y += 10;
  });

  // Totals
  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(120, y, 196, y);
  y += 6;

  const totals = [
    ["Subtotal", subtotal],
    [`Service Tax (${(SERVICE_TAX_RATE * 100).toFixed(0)}%)`, tax],
  ];
  totals.forEach(([label, val]) => {
    doc.setTextColor(...mid);
    doc.setFontSize(9);
    doc.text(label, 155, y, { align: "right" });
    doc.setTextColor(...dark);
    doc.text(`$${val.toFixed(2)}`, 196, y, { align: "right" });
    y += 7;
  });

  // Grand total
  doc.setFillColor(...primary);
  doc.roundedRect(120, y - 2, 76, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Grand Total", 155, y + 5, { align: "right" });
  doc.text(`$${grandTotal.toFixed(2)}`, 194, y + 5, { align: "right" });

  // Footer
  doc.setTextColor(...mid);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(
    "Thank you for staying at Azure Bay Resort. We hope to see you again soon.",
    105,
    270,
    { align: "center" }
  );

  doc.save(`invoice-${invoiceNo.replace("#", "").replace(/-/g, "_")}.pdf`);
}

// ─── Invoice Preview Component ─────────────────────────────────────────────
function InvoicePreview({ booking, onCheckout, checkingOut }) {
  if (!booking) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col items-center justify-center gap-4 p-10 min-h-[500px]">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <FileText size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-400 text-sm font-medium text-center">
          Select a booking to preview the invoice
        </p>
      </div>
    );
  }

  const guest = booking.guests;
  const cabana = booking.cabanas;
  const { items, subtotal, tax, grandTotal } = buildLineItems(booking);
  const invoiceNo = genInvoiceNumber(booking.id);
  const isCheckedOut = booking.status === "CHECKED_OUT";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Preview header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">Invoice Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Print"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={() => downloadInvoicePDF(booking)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Full screen preview"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Invoice body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5">
        {/* Resort header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt size={16} className="text-primary" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-primary uppercase">
                {RESORT_NAME}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-5">
              {RESORT_ADDRESS}
              <br />
              {RESORT_PHONE}
              <br />
              {RESORT_EMAIL}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">INVOICE</p>
            <p className="text-xs font-semibold text-primary mt-1">{invoiceNo}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Issued: {fmtShortDate(new Date())}
            </p>
          </div>
        </div>

        {/* Guest + Booking grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Guest Information
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {guest?.full_name || "Unknown Guest"}
            </p>
            {guest?.nic && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                NIC: {guest.nic}
              </p>
            )}
            {guest?.country && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{guest.country}</p>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Booking Details
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {cabana?.name || `Cabana #${booking.cabana_id}`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Check-in: {fmtDate(booking.start_time)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Check-out: {fmtDate(booking.end_time)}
            </p>
          </div>
        </div>

        {/* Line items table */}
        <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                <th className="px-3 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300">
                  Description
                </th>
                <th className="px-2 py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">
                  Unit
                </th>
                <th className="px-2 py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">
                  Qty
                </th>
                <th className="px-2 py-2.5 text-right font-bold text-slate-700 dark:text-slate-300">
                  Price
                </th>
                <th className="px-3 py-2.5 text-right font-bold text-slate-700 dark:text-slate-300">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 font-medium">
                    {item.description}
                  </td>
                  <td className="px-2 py-2.5 text-center text-slate-500 dark:text-slate-400">
                    {item.unit}
                  </td>
                  <td className="px-2 py-2.5 text-center text-slate-600 dark:text-slate-300 font-semibold">
                    {item.qty}
                  </td>
                  <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-300">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Service Tax ({(SERVICE_TAX_RATE * 100).toFixed(0)}%)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Grand Total</span>
            <span className="text-2xl font-black text-primary dark:text-neon-blue drop-shadow-[0_0_8px_rgba(43,134,255,0.4)]">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] italic text-slate-400 dark:text-slate-500">
          Thank you for staying at Azure Bay Resort. We hope to see you again soon.
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={() => downloadInvoicePDF(booking)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase tracking-wider"
        >
          <Download size={15} />
          PDF
        </button>
        {!isCheckedOut && (
          <button
            onClick={() => onCheckout(booking)}
            disabled={checkingOut}
            className="flex-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary dark:bg-electric-blue text-white text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-electric-blue/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 uppercase tracking-wider"
          >
            {checkingOut ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCircle size={15} />
            )}
            {checkingOut ? "..." : "Checkout"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Booking Row ──────────────────────────────────────────────────────────────
function BookingRow({ booking, isSelected, onSelect }) {
  const guest = booking.guests;
  const cabana = booking.cabanas;
  const duration = formatStayDuration(booking.start_time, booking.end_time);

  return (
    <tr
      onClick={() => onSelect(booking)}
      className={`cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors ${
        isSelected
          ? "bg-primary/5 dark:bg-primary/10"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
      }`}
    >
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
          {guest?.full_name || "Unknown Guest"}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          NIC: {guest?.nic || "N/A"}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {cabana?.name || `Cabana #${booking.cabana_id}`}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {cabana?.name?.includes("Luxury")
            ? "Luxury Suite"
            : cabana?.name?.includes("Beach") || cabana?.name?.includes("02")
            ? "Beachfront"
            : "Standard"}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{duration}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          Check-in: {fmtShortDate(booking.start_time)}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        {isSelected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold">
            <FileText size={12} />
            Viewing
          </span>
        ) : (
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-bold hover:bg-primary/5 transition-colors">
            Generate Invoice
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "ready", label: "Ready for Checkout", icon: Clock, statusFilter: "CONFIRMED" },
  { id: "pending", label: "Pending Payments", icon: AlertTriangle, statusFilter: "PENDING_PAYMENT" },
  { id: "history", label: "History", icon: History, statusFilter: "CHECKED_OUT" },
];

function Billing() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ready");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          guests(id, full_name, nic, country, mobile),
          cabanas(id, name, base_rate_hour, base_rate_day)
        `
        )
        .in("status", ["CONFIRMED", "PENDING_PAYMENT", "CHECKED_OUT"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // For "Ready for Checkout" we show CONFIRMED bookings whose end_time is in the past
      // For demo purposes, we show ALL confirmed bookings in that tab
      setBookings(data || []);

      // If selected booking is updated, refresh it
      if (selectedBooking) {
        const refreshed = (data || []).find((b) => b.id === selectedBooking.id);
        setSelectedBooking(refreshed || null);
      }
    } catch (err) {
      console.error("Error loading billing data:", err);
      showToast("Failed to load billing data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = bookings.filter(
    (b) => b.status === TABS.find((t) => t.id === activeTab)?.statusFilter
  );

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.id] = bookings.filter((b) => b.status === tab.statusFilter).length;
    return acc;
  }, {});

  const handleCheckout = async (booking) => {
    setCheckingOut(true);
    try {
      const { items, subtotal, tax, grandTotal } = buildLineItems(booking);

      // 1. Update booking status to CHECKED_OUT
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "CHECKED_OUT" })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // 2. Create invoice record
      const { error: invoiceError } = await supabase.from("invoices").insert([
        {
          booking_id: booking.id,
          total_amount: grandTotal,
          currency: "USD",
        },
      ]);

      if (invoiceError) console.error("Invoice insert error:", invoiceError);

      // 3. Log activity
      await supabase.from("activity_logs").insert([
        {
          actor_id: profile?.id,
          actor_name: profile?.full_name,
          actor_role: profile?.role,
          action: "CHECKOUT_BOOKING",
          entity_type: "BOOKING",
          entity_id: booking.id,
          metadata: {
            guest: booking.guests?.full_name,
            cabana: booking.cabanas?.name,
            total: grandTotal,
          },
        },
      ]);

      showToast(`Checkout complete! Invoice: $${grandTotal.toFixed(2)}`);
      downloadInvoicePDF(booking);
      await loadBookings();
      setActiveTab("history");
      setSelectedBooking(null);
    } catch (err) {
      console.error("Checkout error:", err);
      showToast(err.message || "Checkout failed.", "error");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all animate-in slide-in-from-top-2 ${
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

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="text-primary" size={28} />
          Billing &amp; Invoicing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Review completed stays and generate formal billing documents for checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
        {/* Left panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-1 pt-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedBooking(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all rounded-t-lg ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tabCounts[tab.id] > 0 && (
                    <span
                      className={`ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {tabCounts[tab.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Guest &amp; NIC
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cabana #
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Stay Duration
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex justify-center">
                        <Loader2 size={24} className="animate-spin text-primary" />
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Search size={32} strokeWidth={1.5} />
                        <p className="text-sm font-medium">No bookings in this category</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  filteredBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      isSelected={selectedBooking?.id === booking.id}
                      onSelect={setSelectedBooking}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel — Invoice Preview */}
        <div className="sticky top-24">
          <InvoicePreview
            booking={selectedBooking}
            onCheckout={handleCheckout}
            checkingOut={checkingOut}
          />
        </div>
      </div>
    </div>
  );
}

export default Billing;
