"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
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
  Lock,
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
  const { approveQuotation, rejectQuotation, returnQuotationForRevision } = useQuotations();

  const [actionModalType, setActionModalType] = useState<"APPROVE" | "REJECT" | "RETURN" | null>(null);
  const [lastActionEntry, setLastActionEntry] = useState<QuotationAuditEntry | null>(null);

  // Determine High Risk / Multi-tier requirement (PRD §5.1: Risk > 50 or Margin < 18%)
  const isHighRisk = quotation.riskScore > 50;
  const isMarginEroded = quotation.blendedMargin < 18;
  const isFinanceRequired = isHighRisk || isMarginEroded || quotation.approvalRequirement === "DUAL_REQUIRED";

  // Mathematical formula weights (PRD §5.1)
  const repVolatilityIndex = 0.28;
  const categoryLeakageComponent = ((quotation.lines.reduce((acc, l) => acc + (l.violationPoints || 0), 0) / 100) * 4.0 * 10).toFixed(1);
  const marginPenaltyComponent = (25.0 * Math.max(0, (25 - quotation.blendedMargin) / 100) * 10).toFixed(1);
  const repVolatilityComponent = (10.0 * repVolatilityIndex * 10).toFixed(1);

  // Stepper state calculations
  const isTier1Approved =
    quotation.approvalStage === "FINANCE" ||
    quotation.approvalStage === "COMPLETED" ||
    quotation.status === "APPROVED";

  const isTier2Approved = quotation.approvalStage === "COMPLETED" || quotation.status === "APPROVED";

  const isPendingReview = quotation.status === "IN_REVIEW";
  const isRejected = quotation.status === "REJECTED";
  const isReturned = quotation.status === "DRAFT" && quotation.approvalStage === "RETURNED";

  // Reviewer action execution
  const handleConfirmAction = (notes: string) => {
    try {
      if (actionModalType === "APPROVE") {
        const result = approveQuotation(quotation.id, activeUser.name, currentRole, notes);
        setLastActionEntry(result.auditEntry);
        setActionModalType(null);
        if (result.isFinal) {
          toast.success(`Quotation ${quotation.id} fully approved and unlocked for customer review!`);
        } else {
          toast.info(`Tier-1 approved. Escalated to Finance Director (Elena Rostova) for Tier-2 sign-off.`);
        }
      } else if (actionModalType === "REJECT") {
        const result = rejectQuotation(quotation.id, activeUser.name, currentRole, notes);
        setLastActionEntry(result.auditEntry);
        setActionModalType(null);
        toast.error(`Quotation ${quotation.id} rejected and closed out.`);
      } else if (actionModalType === "RETURN") {
        const result = returnQuotationForRevision(quotation.id, activeUser.name, currentRole, notes);
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
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                Status: <strong className="text-slate-900">{quotation.status}</strong>
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
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] font-medium uppercase tracking-wider">Payment Terms</span>
            <span className="font-semibold text-[var(--text-main)]">{quotation.paymentTerms}</span>
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

      {/* Approval Steps List (Sequential Stepper) */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Sequential Governance Approval Chain
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Dynamic approval steps list dictated by DealOrbit policy engine
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full font-mono font-semibold bg-slate-100 border border-slate-200 text-slate-700">
            {isFinanceRequired ? "Two-Tier Governance (Dual Sign-off)" : "Single-Tier Governance (Sales Manager)"}
          </span>
        </div>

        {/* The Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Step 1: Sales Manager */}
          <div
            className={`p-4 rounded-xl border transition-all space-y-3 ${
              isTier1Approved
                ? "border-emerald-300 bg-emerald-50/50"
                : quotation.approvalStage === "SALES_MANAGER"
                ? "border-amber-300 bg-amber-50/50 shadow-xs"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    isTier1Approved
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {isTier1Approved ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)]">
                    Tier-1: Sales Manager Sign-off
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Assigned: <strong>Morgan Manager</strong> (Sales Management)
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isTier1Approved
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : isRejected
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : isReturned
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {isTier1Approved
                  ? "APPROVED"
                  : isRejected
                  ? "REJECTED"
                  : isReturned
                  ? "CHANGES REQUESTED"
                  : "PENDING REVIEW"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Required for all quotations with Blended Risk Score &gt; 20 or line item category breaches. Validates commercial rationale and margin health.
            </p>
          </div>

          {/* Step 2: Finance Director (CONDITIONAL: ONLY SHOWN WHEN REQUIRED) */}
          {isFinanceRequired ? (
            <div
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                isTier2Approved
                  ? "border-emerald-300 bg-emerald-50/50"
                  : isTier1Approved && quotation.approvalStage === "FINANCE"
                  ? "border-amber-300 bg-amber-50/50 shadow-xs"
                  : "border-slate-200 bg-slate-50/70 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isTier2Approved
                        ? "bg-emerald-600 text-white"
                        : isTier1Approved
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-white text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isTier2Approved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : !isTier1Approved ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                      <span>Tier-2: Finance Director Sign-off</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-mono font-bold">
                        REQUIRED
                      </span>
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Assigned: <strong>Elena Rostova / Frankie Finance</strong> (Finance & Ops)
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isTier2Approved
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : isTier1Approved
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-slate-200 text-slate-600 border-slate-300"
                  }`}
                >
                  {isTier2Approved
                    ? "APPROVED"
                    : isTier1Approved
                    ? "AWAITING FINANCE"
                    : "LOCKED (AWAITING STEP 1)"}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Triggered because Blended Risk Score ({quotation.riskScore.toFixed(1)}) &gt; 50 or Blended Gross Margin ({quotation.blendedMargin.toFixed(1)}%) &lt; 18%. Vets enterprise cash-flow and corporate margin leakage.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col justify-center space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Finance Tier-2 Escalation Not Required</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Because this quotation carries a Risk Score ≤ 50 and Blended Margin ≥ 18%, corporate policy bypasses Tier-2 finance escalation. Single-tier Sales Manager sign-off is sufficient.
              </p>
            </div>
          )}
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

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Return for Revision */}
            <button
              type="button"
              onClick={() => setActionModalType("RETURN")}
              disabled={quotation.status === "APPROVED" || quotation.status === "REJECTED"}
              className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Return for Revision</span>
            </button>

            {/* Reject */}
            <button
              type="button"
              onClick={() => setActionModalType("REJECT")}
              disabled={quotation.status === "APPROVED" || quotation.status === "REJECTED"}
              className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100 font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4 text-rose-700" />
              <span>Reject Quotation</span>
            </button>

            {/* Approve */}
            <button
              type="button"
              onClick={() => setActionModalType("APPROVE")}
              disabled={quotation.status === "APPROVED" || quotation.status === "REJECTED"}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {quotation.approvalStage === "FINANCE"
                  ? "Approve Final (Finance Sign-off)"
                  : isFinanceRequired
                  ? "Approve Tier-1 (Pass to Finance)"
                  : "Approve Quotation"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Screen & Full Audit Trail Ledger */}
      <ApprovalConfirmationCard
        quotation={quotation}
        lastActionEntry={lastActionEntry}
        onDismissConfirmation={() => setLastActionEntry(null)}
      />

      {/* Action Dialog Modal */}
      <ApprovalActionModal
        isOpen={actionModalType !== null}
        onClose={() => setActionModalType(null)}
        actionType={actionModalType}
        quotation={quotation}
        reviewerName={activeUser.name}
        reviewerRole={currentRole}
        isDualRequired={isFinanceRequired}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
