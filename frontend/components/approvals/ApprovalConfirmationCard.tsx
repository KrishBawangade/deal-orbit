"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ShieldCheck,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { QuotationAuditEntry, QuotationRecord } from "@/context/QuotationsContext";
import Link from "next/link";

interface ApprovalConfirmationCardProps {
  quotation: QuotationRecord;
  lastActionEntry?: QuotationAuditEntry | null;
  onDismissConfirmation?: () => void;
}

export default function ApprovalConfirmationCard({
  quotation,
  lastActionEntry,
  onDismissConfirmation,
}: ApprovalConfirmationCardProps) {
  const auditEntries = quotation.auditTrail || [];

  const getActionBadge = (action: QuotationAuditEntry["action"]) => {
    switch (action) {
      case "APPROVED_FINAL":
        return {
          label: "Final Sign-off Committed",
          className: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
        };
      case "APPROVED_TIER_1":
        return {
          label: "Tier-1 Manager Approved",
          className: "bg-blue-100 text-blue-800 border-blue-300",
          icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />,
        };
      case "RETURNED_FOR_REVISION":
        return {
          label: "Returned for Revision",
          className: "bg-amber-100 text-amber-800 border-amber-300",
          icon: <RotateCcw className="w-3.5 h-3.5 text-amber-700" />,
        };
      case "REJECTED":
        return {
          label: "Quotation Rejected",
          className: "bg-rose-100 text-rose-800 border-rose-300",
          icon: <XCircle className="w-3.5 h-3.5 text-rose-700" />,
        };
      case "SUBMITTED":
        return {
          label: "Submitted for Review",
          className: "bg-purple-100 text-purple-800 border-purple-300",
          icon: <FileText className="w-3.5 h-3.5 text-purple-700" />,
        };
      default:
        return {
          label: action,
          className: "bg-slate-100 text-slate-800 border-slate-300",
          icon: <Clock className="w-3.5 h-3.5 text-slate-600" />,
        };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SALES_MANAGER":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "FINANCE_OPS":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "ADMIN":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "SALES_REP":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "CUSTOMER":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Action Confirmation Alert (if recently acted) */}
      {lastActionEntry && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 shadow-xs space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Governance Decision Successfully Committed</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-200 text-emerald-900">
                    AUDIT COMMITTED
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Quotation <span className="font-mono font-bold text-slate-900">{quotation.id}</span> is now{" "}
                  <strong className="text-slate-900">{quotation.status}</strong>
                  {quotation.approvalStage === "FINANCE" && " (Awaiting Tier-2 Finance Sign-off)"}
                  {quotation.status === "APPROVED" && " (Unlocked for Customer Negotiation Portal)"}
                </p>
              </div>
            </div>

            {onDismissConfirmation && (
              <button
                type="button"
                onClick={onDismissConfirmation}
                className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer font-medium"
              >
                Dismiss Notice
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-bold text-slate-900">{lastActionEntry.actorName}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getRoleBadge(lastActionEntry.actorRole)}`}>
                {lastActionEntry.actorRole}
              </span>
              <span>· {lastActionEntry.timestamp}</span>
            </div>

            <div className="flex items-center gap-2">
              {quotation.status === "APPROVED" && (
                <Link
                  href={`/portal/${quotation.customerId || quotation.portalToken || "cust-001"}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <span>Open Customer Portal View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              {quotation.status === "DRAFT" && (
                <Link
                  href={`/quotations/${quotation.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <span>Edit Revision in Quotation Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Append-Only Audit Trail Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-indigo-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-main)]">
                Append-Only Governance Audit Trail
              </h4>
              <p className="text-[11px] text-[var(--text-muted)]">
                Cryptographically tracked, immutable ledger of all discount reviews & signatures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-500">
              {auditEntries.length} {auditEntries.length === 1 ? "entry" : "entries"} committed
            </span>
          </div>
        </div>

        {/* Audit Log Entries List */}
        {auditEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-1">
            <Clock className="w-6 h-6 mx-auto text-slate-300" />
            <p>No audit trail records committed yet.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {auditEntries.map((entry, index) => {
              const badge = getActionBadge(entry.action);
              const isLatest = index === 0;

              return (
                <div key={entry.id || `audit-${index}`} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div
                    className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isLatest
                        ? "border-emerald-600 bg-emerald-100 text-emerald-800 shadow-xs"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? "bg-emerald-600" : "bg-slate-400"}`} />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-xs font-bold text-slate-900">
                          {entry.actorName}
                        </span>

                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(entry.actorRole)}`}>
                          {entry.actorRole}
                        </span>
                      </div>

                      <span className="text-xs font-mono text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{entry.timestamp}</span>
                      </span>
                    </div>

                    {/* Notes / Rationale */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-sans leading-relaxed shadow-2xs">
                      {entry.notes || "No additional comments provided."}
                    </div>

                    {/* Metadata indicators */}
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                        {entry.metadata.riskScore !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">
                            Risk Score: <strong className="text-slate-800">{Number(entry.metadata.riskScore).toFixed(1)}</strong>
                          </span>
                        )}
                        {entry.metadata.blendedMargin !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">
                            Blended Margin: <strong className="text-slate-800">{Number(entry.metadata.blendedMargin).toFixed(1)}%</strong>
                          </span>
                        )}
                        {entry.metadata.stage !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">
                            Next Stage: <strong className="text-slate-800">{String(entry.metadata.stage)}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
