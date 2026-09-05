"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, AlertTriangle, ShieldCheck, User } from "lucide-react";
import type { Role } from "@/types";
import type { QuotationRecord } from "@/context/QuotationsContext";

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: "APPROVE" | "REJECT" | "RETURN" | null;
  quotation: QuotationRecord;
  reviewerName: string;
  reviewerRole: Role;
  isDualRequired: boolean;
  onConfirm: (notes: string) => void;
}

export default function ApprovalActionModal({
  isOpen,
  onClose,
  actionType,
  quotation,
  reviewerName,
  reviewerRole,
  isDualRequired,
  onConfirm,
}: ApprovalActionModalProps) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !actionType) return null;

  const isFinanceStepNext =
    actionType === "APPROVE" &&
    isDualRequired &&
    quotation.approvalStage === "SALES_MANAGER" &&
    reviewerRole !== "FINANCE_OPS";

  const handleAction = () => {
    if ((actionType === "REJECT" || actionType === "RETURN") && !notes.trim()) {
      setError("Please provide a mandatory reason / feedback before proceeding.");
      return;
    }
    setError("");
    onConfirm(notes.trim());
    setNotes("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
              actionType === "APPROVE"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : actionType === "REJECT"
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-amber-50 text-amber-600 border border-amber-200"
            }`}
          >
            {actionType === "APPROVE" && <CheckCircle2 className="w-6 h-6" />}
            {actionType === "REJECT" && <XCircle className="w-6 h-6" />}
            {actionType === "RETURN" && <RotateCcw className="w-6 h-6" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900">
              {actionType === "APPROVE" && "Confirm Quotation Approval"}
              {actionType === "REJECT" && "Reject Quotation"}
              {actionType === "RETURN" && "Return Quotation for Revision"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quotation <span className="font-mono font-bold text-slate-800">{quotation.id}</span> · {quotation.customerName}
            </p>
          </div>
        </div>

        {/* Action-Specific Context Notice */}
        {actionType === "APPROVE" && (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Commercial & Discount Sign-off</span>
            </div>
            <p className="text-emerald-900/80 leading-relaxed">
              This approval finalizes discount governance. The quotation will be committed to the Approved ledger and unlocked for publishing to the customer portal.
            </p>
          </div>
        )}

        {actionType === "REJECT" && (
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Irreversible Deal Termination</span>
            </div>
            <p className="text-rose-900/80 leading-relaxed">
              Rejecting this quotation will terminate the commercial proposal. An immutable record with your justification will be permanently committed to the audit trail.
            </p>
          </div>
        )}

        {actionType === "RETURN" && (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Sent Back to Sales Rep ({quotation.repName})</span>
            </div>
            <p className="text-amber-900/80 leading-relaxed">
              The quotation will revert to <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-bold">DRAFT</code>. Please specify clear revision requirements (e.g., lower discount or attach care pack bundles).
            </p>
          </div>
        )}

        {/* Actor Info Bar */}
        <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium">Acting Reviewer:</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span>{reviewerName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-mono">
              {reviewerRole}
            </span>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>
              {actionType === "APPROVE" ? "Approval Notes & Rationale (Optional)" : "Mandatory Rationale / Instructions *"}
            </span>
            {actionType !== "APPROVE" && (
              <span className="text-[11px] text-rose-600 font-semibold">Required for audit ledger</span>
            )}
          </label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (error) setError("");
            }}
            placeholder={
              actionType === "APPROVE"
                ? "e.g., Approved strategic renewal; margin preserved via 3-year support commitment."
                : actionType === "REJECT"
                ? "e.g., Discount violates corporate gross margin threshold of 18% with insufficient ARR upside."
                : "e.g., Reduce on-site service discount from 18% to 10% or bundle 2-year warranty to preserve blended margin."
            }
            rows={3}
            className="w-full text-xs rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none shadow-2xs"
          />
          {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAction}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              actionType === "APPROVE"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : actionType === "REJECT"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {actionType === "APPROVE" && <CheckCircle2 className="w-4 h-4" />}
            {actionType === "REJECT" && <XCircle className="w-4 h-4" />}
            {actionType === "RETURN" && <RotateCcw className="w-4 h-4" />}
            <span>
              {actionType === "APPROVE" && (isFinanceStepNext ? "Approve & Advance to Finance" : "Approve Quotation")}
              {actionType === "REJECT" && "Confirm Rejection"}
              {actionType === "RETURN" && "Return to Rep"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
