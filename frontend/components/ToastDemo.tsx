"use client";

import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Info, Sparkles, Loader2 } from "lucide-react";

export default function ToastDemo() {
  const showSuccessToast = () => {
    toast.success("Changes saved successfully!", {
      description: "Your team profile and preferences have been updated.",
    });
  };

  const showErrorToast = () => {
    toast.error("Failed to connect to database", {
      description: "Please check your network or verify PostgreSQL is running.",
    });
  };

  const showInfoToast = () => {
    toast.info("New Odoo webhook received", {
      description: "Sale order #SO-2026-09 was synchronized.",
    });
  };

  const showActionToast = () => {
    toast("Invoice #INV-4920 drafted", {
      description: "Ready for review and approval.",
      action: {
        label: "View Invoice",
        onClick: () => console.log("Navigating to invoice..."),
      },
    });
  };

  const showPromiseToast = () => {
    const simulateAsync = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.3 ? resolve({ id: "rec_992" }) : reject(new Error("Network timeout"));
      }, 1500);
    });

    toast.promise(simulateAsync, {
      loading: "Processing AI agent analysis...",
      success: "AI analysis completed successfully!",
      error: "Could not complete analysis. Try again.",
    });
  };

  return (
    <div className="card-surface space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="type-h3">Toast Notification System (Sonner)</h3>
            <span className="badge badge-success">Ready for Parallel Work</span>
          </div>
          <p className="type-muted text-xs mt-1">
            Teammates can trigger notifications anywhere with a single line of code.
          </p>
        </div>
        <span className="badge badge-primary font-mono text-[11px] self-start sm:self-center">
          import &#123; toast &#125; from &apos;sonner&apos;
        </span>
      </div>

      {/* Interactive Trigger Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={showSuccessToast}
          className="btn-outline flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 text-xs py-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Success Toast</span>
        </button>

        <button
          onClick={showErrorToast}
          className="btn-outline flex items-center justify-center gap-2 hover:border-rose-500 hover:text-rose-600 text-xs py-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Error Toast</span>
        </button>

        <button
          onClick={showInfoToast}
          className="btn-outline flex items-center justify-center gap-2 hover:border-cyan-500 hover:text-cyan-600 text-xs py-2.5"
        >
          <Info className="w-4 h-4 text-cyan-500" />
          <span>Info Toast</span>
        </button>

        <button
          onClick={showActionToast}
          className="btn-outline flex items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-600 text-xs py-2.5"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Action Toast</span>
        </button>

        <button
          onClick={showPromiseToast}
          className="btn-primary flex items-center justify-center gap-2 text-xs py-2.5"
        >
          <Loader2 className="w-4 h-4" />
          <span>Promise Toast</span>
        </button>
      </div>

      {/* Code Snippet for Teammates */}
      <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
        <div className="text-slate-400">// Example: Call from any button, form, or async action</div>
        <div>
          <span className="text-indigo-400">import</span> &#123; toast &#125; <span className="text-indigo-400">from</span> <span className="text-emerald-400">&apos;sonner&apos;</span>;
        </div>
        <div className="mt-1 text-slate-300">
          toast.<span className="text-amber-400">success</span>(<span className="text-emerald-400">&apos;Order submitted successfully!&apos;</span>);
        </div>
      </div>
    </div>
  );
}
