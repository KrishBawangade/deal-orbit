"use client";

import React, { useState, useEffect } from "react";
import {
  Percent,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import type { QuotationLineItem } from "@/context/QuotationsContext";

interface CounterDiscountProposalProps {
  lines: QuotationLineItem[];
  selectedLineId?: string;
  onSelectLineId?: (id: string) => void;
  onSubmitCounter: (
    lineItemId: string,
    proposedDiscount: number,
    proposedQuantity?: number,
    message?: string
  ) => void;
  isSubmitting?: boolean;
}

export default function CounterDiscountProposal({
  lines,
  selectedLineId,
  onSelectLineId,
  onSubmitCounter,
  isSubmitting = false,
}: CounterDiscountProposalProps) {
  // Currently selected line item for counter proposal
  const [activeLineId, setActiveLineId] = useState<string>(
    selectedLineId || lines[0]?.id || ""
  );

  useEffect(() => {
    if (selectedLineId) {
      setActiveLineId(selectedLineId);
    }
  }, [selectedLineId]);

  const activeLine = lines.find((l) => l.id === activeLineId) || lines[0];

  const [proposedDiscount, setProposedDiscount] = useState<number>(
    activeLine ? Math.min(100, activeLine.discountPercent + 2) : 10
  );
  const [proposedQuantity, setProposedQuantity] = useState<number>(
    activeLine ? activeLine.quantity : 1
  );
  const [justificationMessage, setJustificationMessage] = useState<string>("");

  // Whenever active line changes, reset proposed discount to line current + 2%
  useEffect(() => {
    if (activeLine) {
      setProposedDiscount(Math.min(100, activeLine.discountPercent + 2));
      setProposedQuantity(activeLine.quantity);
    }
  }, [activeLineId]);

  if (!activeLine) return null;

  // Threshold breach detection:
  // In DealOrbit, category/tier ceilings are governed (e.g. Hardware 15%, Software 20%, Services 10%).
  // If the proposed discount exceeds the effective ceiling, self-governing invalidation applies!
  const isBreach = proposedDiscount > activeLine.effectiveCeiling;
  const breachPoints = Math.max(0, proposedDiscount - activeLine.effectiveCeiling);

  // Proposed financial calculations
  const unitListPrice = activeLine.unitPrice;
  const currentNetLineTotal = activeLine.netLineTotal;

  const proposedNetPerUnit = unitListPrice * (1 - proposedDiscount / 100);
  const proposedNetLineTotal = proposedNetPerUnit * proposedQuantity;
  const netSavingsDelta = currentNetLineTotal - proposedNetLineTotal;

  const handlePresetDelta = (delta: number) => {
    setProposedDiscount((prev) => Math.max(0, Math.min(50, prev + delta)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitCounter(
      activeLine.id,
      proposedDiscount,
      proposedQuantity,
      justificationMessage
    );
  };

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
              Counter-Discount & Term Proposal
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Propose commercial adjustments on specific items. Terms re-evaluate against DealOrbit corporate governance.
            </p>
          </div>
        </div>

        {/* Target Line Selector Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-medium">Target Item:</span>
          <select
            value={activeLineId}
            onChange={(e) => {
              setActiveLineId(e.target.value);
              onSelectLineId?.(e.target.value);
            }}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-[var(--border)] bg-[var(--card-hover)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
          >
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.sku} — {l.name.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Item Current Context */}
      <div className="bg-[var(--background)]/60 rounded-xl p-4 border border-[var(--border)] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[11px] text-[var(--text-muted)] block">Selected Item:</span>
          <strong className="text-[var(--text-main)] font-semibold truncate block mt-0.5" title={activeLine.name}>
            {activeLine.name}
          </strong>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">{activeLine.sku}</span>
        </div>

        <div>
          <span className="text-[11px] text-[var(--text-muted)] block">List Price (Unit):</span>
          <strong className="text-[var(--text-main)] font-mono block mt-0.5">
            ₹{activeLine.unitPrice.toLocaleString("en-IN")}
          </strong>
          <span className="text-[10px] text-[var(--text-muted)]">Qty: {activeLine.quantity} units</span>
        </div>

        <div>
          <span className="text-[11px] text-[var(--text-muted)] block">Currently Quoted:</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {activeLine.discountPercent}% Discount
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            Net: ₹{activeLine.netLineTotal.toLocaleString("en-IN")}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-[var(--text-muted)] block">Pre-Approved Limit:</span>
          <div className="flex items-center gap-1 mt-0.5">
            <strong className="font-mono text-[var(--text-main)]">
              {activeLine.effectiveCeiling}%
            </strong>
            <span className="text-[10px] text-[var(--text-muted)]">({activeLine.category})</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Fast-Track Confirmation Cap</span>
        </div>
      </div>

      {/* Proposal Controls */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Proposed Discount & Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-main)]">
                Proposed Counter-Discount (%):
              </label>
              <span className="text-xs font-mono font-bold text-[var(--primary)]">
                {proposedDiscount.toFixed(1)}%
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={proposedDiscount}
                onChange={(e) => setProposedDiscount(parseFloat(e.target.value) || 0)}
                className="w-full accent-[var(--primary)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                <span>0%</span>
                <span>Quoted: {activeLine.discountPercent}%</span>
                <span>Pre-Approved: {activeLine.effectiveCeiling}%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Quick Adjustment Increment Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                Quick Adjust:
              </span>
              {[
                { label: "+1%", delta: 1 },
                { label: "+2%", delta: 2 },
                { label: "+4%", delta: 4 },
                { label: "Match 14%", val: 14 },
                { label: "Request 18%", val: 18 },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (btn.val !== undefined) setProposedDiscount(btn.val);
                    else handlePresetDelta(btn.delta);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:text-[var(--primary)] hover:border-[var(--primary-subtle-border)] transition-colors cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Proposed Quantity (Optional Change Request) */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                Proposed Quantity (Units):
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={proposedQuantity}
                onChange={(e) => setProposedQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          {/* Right Column: Customer Justification Note */}
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold text-[var(--text-main)]">
              Procurement Rationale & Message:
            </label>
            <textarea
              value={justificationMessage}
              onChange={(e) => setJustificationMessage(e.target.value)}
              placeholder="e.g. Procurement budget cap requires 14% on laptops to finalize approval this quarter. Competitor Dell matched terms..."
              rows={4}
              className="flex-1 text-xs p-3 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] resize-none leading-relaxed"
            />
            <p className="text-[10px] text-[var(--text-muted)]">
              This message is logged directly in the deal negotiation ledger for the sales representative.
            </p>
          </div>
        </div>

        {/* Live Impact & Self-Governing Threshold Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Financial Delta Card */}
          <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-cyan-800 dark:text-cyan-300 font-semibold block">
                Proposed Line Total:
              </span>
              <span className="text-base font-bold font-mono text-[var(--text-main)]">
                ₹{Math.round(proposedNetLineTotal).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                (₹{Math.round(proposedNetPerUnit).toLocaleString("en-IN")} / unit)
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
                Incremental Savings:
              </span>
              <span className={`text-sm font-bold font-mono ${netSavingsDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                {netSavingsDelta >= 0 ? `+₹${Math.round(netSavingsDelta).toLocaleString("en-IN")}` : `-₹${Math.round(Math.abs(netSavingsDelta)).toLocaleString("en-IN")}`}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                Δ {((proposedDiscount - activeLine.discountPercent)).toFixed(1)}% vs Original
              </span>
            </div>
          </div>

          {/* Self-Governing Ceiling Breach Alert */}
          {isBreach ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-semibold text-amber-800 dark:text-amber-300 block">
                  Self-Governing Threshold Notice (+{breachPoints.toFixed(1)}% over ceiling)
                </strong>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                  Proposed discount ({proposedDiscount}%) exceeds corporate pre-approved ceiling ({activeLine.effectiveCeiling}%).
                  Submitting will automatically revoke pre-approved status and route this deal into the <strong>B4 Manager Approval Flow</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-semibold text-emerald-800 dark:text-emerald-300 block">
                  Within Authorized Negotiation Ceiling (≤ {activeLine.effectiveCeiling}%)
                </strong>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                  Proposed terms remain within pre-authorized discount boundaries. Deal can progress seamlessly upon rep confirmation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Request Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Submit Request</span>
          </button>
        </div>
      </form>
    </div>
  );
}
