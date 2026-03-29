import React from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export default function ConfirmModal({ 
  open, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel, 
  variant = "danger", // "danger" | "success" | "info" 
  loading = false
}) {
  if (!open) return null;

  const styles = {
    danger: {
      icon: <AlertTriangle size={28} className="text-rose-600 dark:text-rose-500 drop-shadow-sm" />,
      bg: "bg-rose-100 dark:bg-rose-900/40 ring-4 ring-rose-50 dark:ring-rose-900/20",
      btn: "bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/50"
    },
    success: {
      icon: <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-500 drop-shadow-sm" />,
      bg: "bg-emerald-100 dark:bg-emerald-900/40 ring-4 ring-emerald-50 dark:ring-emerald-900/20",
      btn: "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/50"
    },
    info: {
      icon: <Info size={28} className="text-blue-600 dark:text-blue-500 drop-shadow-sm" />,
      bg: "bg-blue-100 dark:bg-blue-900/40 ring-4 ring-blue-50 dark:ring-blue-900/20",
      btn: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50"
    }
  };

  const activeStyle = styles[variant] || styles.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-[400px] overflow-hidden transform transition-all">
        <div className="p-8 text-center relative">
          <button 
            onClick={onCancel}
            disabled={loading}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform hover:scale-105 ${activeStyle.bg}`}>
            {activeStyle.icon}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">{title}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed ${activeStyle.btn}`}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
