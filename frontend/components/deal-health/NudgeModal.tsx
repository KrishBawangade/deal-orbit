"use client";

import React, { useState } from "react";
import {
  Bell,
  Send,
  X,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  Mail,
  AlertTriangle,
} from "lucide-react";
import type { IDealHealthAlertItem } from "@/context/DealHealthContext";

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: IDealHealthAlertItem | null;
  onSendNudge: (alertId: string, customMessage: string) => void;
}

const TEMPLATES = [
  "Quotation has been awaiting client review for > 7 days. Please follow up with procurement today.",
  "Proposed discount significantly exceeds your 90-day moving average. Please review pricing rationale.",
  "Logistics carrier lead times may exceed customer delivery SLA. Please sync with warehouse manager.",
];

export default function NudgeModal({
  isOpen,
  onClose,
  alert,
  onSendNudge,
}: NudgeModalProps) {
  const [message, setMessage] = useState(TEMPLATES[0]);
  const [channel, setChannel] = useState<"BOTH" | "EMAIL" | "IN_APP">("BOTH");

  if (!isOpen || !alert) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendNudge(alert.id, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
                Dispatch Automated Rep Nudge
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Target Rep: <strong>{alert.repName}</strong> ({alert.repEmail})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Context Alert Summary */}
          <div className="p-3 rounded-xl bg-[var(--background)]/70 border border-[var(--border)] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-muted)] font-mono font-semibold">
                {alert.quoteNumber} • {alert.customerName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                {alert.alertType.replace("_", " ")}
              </span>
            </div>
            <p className="text-[var(--text-body)] text-[11px] leading-relaxed">
              {alert.description}
            </p>
          </div>

          {/* Quick Template Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-main)] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--primary)]" />
              <span>Select Nudge Prompt Template:</span>
            </label>
            <div className="space-y-1.5">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(tmpl)}
                  className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors cursor-pointer leading-relaxed ${
                    message === tmpl
                      ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] font-semibold"
                      : "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Field */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
              Notification Message (editable):
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Channel Radio Options */}
          <div className="flex items-center gap-4 text-[11px]">
            <span className="font-semibold text-[var(--text-muted)]">Channel:</span>
            {[
              { id: "BOTH", label: "Email & In-App Alert" },
              { id: "EMAIL", label: "Email Only" },
              { id: "IN_APP", label: "In-App Toast" },
            ].map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="nudgeChannel"
                  checked={channel === c.id}
                  onChange={() => setChannel(c.id as any)}
                  className="text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline text-xs py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Nudge</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
