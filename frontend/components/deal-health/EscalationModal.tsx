"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Send,
  X,
  UserCheck,
  AlertTriangle,
  Building,
  CheckCircle2,
} from "lucide-react";
import type { IDealHealthAlertItem } from "@/context/DealHealthContext";

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: IDealHealthAlertItem | null;
  onEscalate: (alertId: string, targetRole: string, rationale: string) => void;
}

const ESCALATION_TARGETS = [
  { id: "SALES_DIRECTOR", label: "Morgan Manager — Director of Commercial Operations", role: "Sales Director" },
  { id: "FINANCE_DIRECTOR", label: "Frankie Finance — Chief Financial Officer / Deal Desk", role: "Finance Director" },
  { id: "LOGISTICS_HEAD", label: "Operations & Multi-Warehouse Fulfillment Lead", role: "Logistics Lead" },
];

export default function EscalationModal({
  isOpen,
  onClose,
  alert,
  onEscalate,
}: EscalationModalProps) {
  const [targetRole, setTargetRole] = useState(ESCALATION_TARGETS[0].role);
  const [rationale, setRationale] = useState(
    "Deal requires managerial override and executive review due to threshold breach."
  );
  const [urgency, setUrgency] = useState<"HIGH" | "CRITICAL">("HIGH");

  if (!isOpen || !alert) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEscalate(alert.id, targetRole, rationale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
                Escalate Deal to Leadership
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Quotation: <strong className="font-mono text-[var(--primary)]">{alert.quoteNumber}</strong> ({alert.customerName})
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
          {/* Alert Context */}
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <strong className="text-red-800 dark:text-red-300 font-semibold">
                {alert.alertType.replace("_", " ")}
              </strong>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                Severity: {alert.severity}
              </span>
            </div>
            <p className="text-[11px] text-red-900/80 dark:text-red-300/80 leading-relaxed">
              {alert.description}
            </p>
          </div>

          {/* Escalation Target Recipient */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-main)] block">
              Escalate To Authority:
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
            >
              {ESCALATION_TARGETS.map((t) => (
                <option key={t.id} value={t.role}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-main)] block">
              Escalation Urgency Level:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "HIGH", label: "High Priority (SLA 24h)" },
                { id: "CRITICAL", label: "Critical Priority (SLA 4h)" },
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUrgency(u.id as any)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                    urgency === u.id
                      ? "bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-400 font-bold"
                      : "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Managerial Rationale */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-main)] block">
              Escalation Rationale & Required Decision:
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Provide context on why standard sales operations thresholds could not accommodate this deal..."
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
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
              className="btn-danger text-xs py-2 px-5 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Escalate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
