"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  FileText,
  User,
  Building2,
  TrendingDown,
  TrendingUp,
  Percent,
  Layers,
  ChevronRight,
  Info,
  ArrowLeft,
} from "lucide-react";
import { useQuotations, type QuotationRecord, type QuotationAuditEntry } from "@/context/QuotationsContext";
import { useRole } from "@/context/RoleContext";
import ApprovalActionModal from "./ApprovalActionModal";
import ApprovalConfirmationCard from "./ApprovalConfirmationCard";
import Link from "next/link";
import { toast } from "sonner";

interface DiscountApprovalScreenProps {
  quotation: QuotationRecord;
  onBack?: () => void;
}

export default function DiscountApprovalScreen({
  quotation,
  onBack,
}: DiscountApprovalScreenProps) {
  const { activeUser, currentRole } = useRole();
  const { quotations, approveQuotation, rejectQuotation, returnQuotationForRevision } = useQuotations();
  const currentQuote = quotations.find((q) => q.id.toLowerCase() === quotation.id.toLowerCase()) || quotation;

  const isApproved =
    currentQuote.status === "APPROVED" ||
    currentQuote.approvalStage === "COMPLETED" ||
    Boolean(currentQuote.auditTrail?.some((a) => a.action?.startsWith("APPROVED")));
  const isRejected = currentQuote.status === "REJECTED";

  const [actionModalType, setActionModalType] = useState<"APPROVE" | "REJECT" | "RETURN" | null>(null);
  const [lastActionEntry, setLastActionEntry] = useState<QuotationAuditEntry | null>(null);

  // Determine High Risk / Multi-tier requirement (PRD §5.1: Risk > 50 or Margin < 18%)
  const isHighRisk = currentQuote.riskScore > 50;
  const isMarginEroded = currentQuote.blendedMargin < 18;
  const isFinanceRequired = isHighRisk || isMarginEroded || currentQuote.approvalRequirement === "DUAL_REQUIRED";

  // Mathematical formula weights (PRD §5.1)
  const repVolatilityIndex = 0.28;
  const categoryLeakageComponent = ((quotation.lines.reduce((acc, l) => acc + (l.violationPoints || 0), 0) / 100) * 4.0 * 10).toFixed(1);
  const marginPenaltyComponent = (25.0 * Math.max(0, (25 - quotation.blendedMargin) / 100) * 10).toFixed(1);
  const repVolatilityComponent = (10.0 * repVolatilityIndex * 10).toFixed(1);


  // Reviewer action execution
  const handleConfirmAction = async (notes: string) => {
    try {
      if (actionModalType === "APPROVE") {
        const result = await approveQuotation(quotation.id, activeUser.name, currentRole, notes);
        setLastActionEntry(result.auditEntry);
        setActionModalType(null);
        toast.success(`Quotation ${quotation.id} approved and moved to Approved ledger!`);
      } else if (actionModalType === "REJECT") {
        const result = await rejectQuotation(quotation.id, activeUser.name, currentRole, notes);
        setLastActionEntry(result.auditEntry);
        setActionModalType(null);
        toast.error(`Quotation ${quotation.id} rejected and closed out.`);
      } else if (actionModalType === "RETURN") {
        const result = await returnQuotationForRevision(quotation.id, activeUser.name, currentRole, notes);
        setLastActionEntry(result.auditEntry);
        setActionModalType(null);
        toast.warning(`Quotation ${quotation.id} returned to ${quotation.repName} for revision.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing approval action";
      toast.error(msg);
    }
  };

  // Determine risk badge attributes in clean light mode
  const getRiskAttributes = (score: number) => {
    if (score < 20) {
      return {
        level: "LOW RISK",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        progressColor: "bg-emerald-500",
        description: "Auto-approved or low policy friction. No financial escalation required.",
      };
    }
    if (score <= 50) {
      return {
        level: "MEDIUM RISK",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
        progressColor: "bg-amber-500",
        description: "Exceeds standard category ceilings. Requires Tier-1 Sales Manager sign-off.",
      };
    }
    return {
      level: "HIGH RISK",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      progressColor: "bg-rose-500",
      description: "Severe margin leakage or multi-point breach. Requires Two-Tier (Sales Manager + Finance) sequential governance.",
    };
  };

  const riskInfo = getRiskAttributes(quotation.riskScore);

  return (
    <div className="space-y-6 animate-fade-in text-[var(--text-body)]">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-[var(--border)] bg-white hover:bg-slate-50 text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/approvals"
              className="p-2 rounded-xl border border-[var(--border)] bg-white hover:bg-slate-50 text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)] font-mono">
                {quotation.id}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${riskInfo.badgeClass}`}
              >
                {riskInfo.level} ({quotation.riskScore.toFixed(1)})
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                  isApproved
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                    : isRejected
                    ? "bg-rose-50 border-rose-300 text-rose-800 font-bold"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                Status: <strong className={isApproved ? "text-emerald-900" : isRejected ? "text-rose-900" : "text-slate-900"}>
                  {isApproved ? "APPROVED" : currentQuote.status}
                </strong>
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-2">
              <span>Customer: <strong className="text-[var(--text-main)]">{quotation.customerName}</strong></span>
              <span>·</span>
              <span>Account Rep: <strong className="text-[var(--text-main)]">{quotation.repName}</strong></span>
              <span>·</span>
              <span>Customer Tier: <strong className="text-amber-600 font-semibold">{quotation.tier} (Ceiling: {quotation.tierCeiling}%)</strong></span>
            </p>
          </div>
        </div>

        {/* Commercial Highlights Pill */}
        <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-white border border-[var(--border)] shadow-xs text-xs">
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] font-medium uppercase tracking-wider">Net Order Value</span>
            <span className="font-bold text-sm text-[var(--text-main)] font-mono">{quotation.total}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] font-medium uppercase tracking-wider">Deal Margin</span>
            <span
              className={`font-bold text-sm font-mono flex items-center gap-1 ${
                quotation.blendedMargin < 18 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {quotation.blendedMargin < 18 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              {quotation.blendedMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Blended Risk Score Gauge & Mathematical Decomposition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Blended Risk Score Visual Gauge */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Blended Risk Score</h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">PRD §5.1 Formulation</span>
          </div>

          {/* Large Radial/Score Meter */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="relative inline-flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold font-mono text-[var(--text-main)]">
                {quotation.riskScore.toFixed(1)}
              </span>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                Out of 100
              </span>
            </div>

            {/* Gauge Progress Track */}
            <div className="space-y-1.5 text-left">
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${riskInfo.progressColor}`}
                  style={{ width: `${Math.min(100, Math.max(5, quotation.riskScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 font-medium">
                <span>0 (Low)</span>
                <span>20 (Manager)</span>
                <span>50 (Finance Tier-2)</span>
                <span>100</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed text-left pt-1">
              {riskInfo.description}
            </p>
          </div>

          {/* Mathematical Decomposition Breakdown */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider">
              Mathematical Score Breakdown
            </span>
            <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Category Leakage ($w_1 = 4.0$):</span>
                <span className="font-mono font-bold text-[var(--text-main)]">+{categoryLeakageComponent} pts</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Gross Margin Erosion ($w_2 = 25.0$):</span>
                <span className="font-mono font-bold text-rose-600">+{marginPenaltyComponent} pts</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Rep Volatility Factor ($w_3 = 10.0$):</span>
                <span className="font-mono font-bold text-amber-600">+{repVolatilityComponent} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Itemized Line Breaches & Policy Violations */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Quotation Line Breaches & Category Ceiling Audit
              </h3>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {quotation.lines.length} Line {quotation.lines.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-[var(--border)] text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Item & Category</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3">Discount</th>
                  <th className="py-2.5 px-3">Ceiling</th>
                  <th className="py-2.5 px-3">Violation</th>
                  <th className="py-2.5 px-3 text-right">Line Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono">
                {quotation.lines.map((line) => {
                  const hasViolation = line.isViolation || line.discountPercent > line.effectiveCeiling;
                  const overage = Math.max(0, line.discountPercent - line.effectiveCeiling);

                  return (
                    <tr
                      key={line.id}
                      className={hasViolation ? "bg-amber-50/40 hover:bg-amber-50/80 transition-colors" : "hover:bg-slate-50 transition-colors"}
                    >
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-semibold text-[var(--text-main)] truncate max-w-[240px]">
                          {line.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono">
                          {line.sku} · <span className="uppercase text-indigo-600 font-semibold">{line.category}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-main)] font-semibold">{line.quantity}</td>
                      <td className="py-2.5 px-3 font-bold text-[var(--text-main)]">
                        {line.discountPercent.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-muted)]">
                        {line.effectiveCeiling.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {hasViolation ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            <span>+{overage.toFixed(1)} pts breach</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Compliant</span>
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          line.lineMarginPercent < 15 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {line.lineMarginPercent.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rep 90-Day Benchmark Strip */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-indigo-600" />
              <span>
                Sales Rep Benchmark: <strong className="text-[var(--text-main)]">{quotation.repName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[var(--text-muted)] text-[11px]">90-Day Rep Avg Discount: </span>
                <span className="font-mono font-bold text-[var(--text-main)]">9.2%</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div>
                <span className="text-[var(--text-muted)] text-[11px]">Proposed Deal Discount: </span>
                <span className="font-mono font-bold text-amber-700">
                  {((quotation.discountAmount / (quotation.subtotalAmount || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                +4.8% vs Rep Baseline
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviewer Action Bar (Approve / Reject / Return for Revision) */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-main)]">
                Reviewer Governance Controls
              </h4>
              <p className="text-[11px] text-[var(--text-muted)]">
                Acting as <strong className="text-[var(--text-main)]">{activeUser.name}</strong> ({activeUser.roleLabel})
              </p>
            </div>
          </div>

          {isApproved ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Quotation Approved · Governance Complete</span>
            </div>
          ) : isRejected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold shadow-2xs">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Quotation Rejected</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Return for Revision */}
              <button
                type="button"
                onClick={() => setActionModalType("RETURN")}
                className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>Return for Revision</span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => setActionModalType("REJECT")}
                className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100 font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-700" />
                <span>Reject Quotation</span>
              </button>

              {/* Approve */}
              <button
                type="button"
                onClick={() => setActionModalType("APPROVE")}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Quotation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Screen & Full Audit Trail Ledger */}
      <ApprovalConfirmationCard
        quotation={currentQuote}
        lastActionEntry={lastActionEntry}
        onDismissConfirmation={() => setLastActionEntry(null)}
      />

      {/* Action Dialog Modal */}
      <ApprovalActionModal
        isOpen={actionModalType !== null}
        onClose={() => setActionModalType(null)}
        actionType={actionModalType}
        quotation={currentQuote}
        reviewerName={activeUser.name}
        reviewerRole={currentRole}
        isDualRequired={false}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
