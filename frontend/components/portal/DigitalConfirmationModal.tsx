"use client";

import React, { useState } from "react";
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Truck,
  CheckCircle2,
  X,
  Download,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Building2,
  Clock,
} from "lucide-react";
import type { QuotationRecord } from "@/context/QuotationsContext";

interface DigitalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: QuotationRecord;
  onConfirm: (
    signerName: string,
    signerTitle: string,
    acceptanceNotes?: string
  ) => {
    status: string;
    routeType: "FULFILLMENT" | "RE_APPROVAL";
    salesOrderNumber?: string;
    reApprovalReason?: string;
  };
  onDownloadPdf?: () => void;
}

export default function DigitalConfirmationModal({
  isOpen,
  onClose,
  quotation,
  onConfirm,
  onDownloadPdf,
}: DigitalConfirmationModalProps) {
  const [signerName, setSignerName] = useState("Jordan Procurement");
  const [signerTitle, setSignerTitle] = useState("Director of IT Procurement");
  const [acceptanceNotes, setAcceptanceNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Result state after confirmation: null | "FULFILLMENT" | "RE_APPROVAL"
  const [resultState, setResultState] = useState<{
    routeType: "FULFILLMENT" | "RE_APPROVAL";
    salesOrderNumber?: string;
    reApprovalReason?: string;
  } | null>(null);

  if (!isOpen) return null;

  // Check if terms currently exceed threshold before submission
  const termsExceedThreshold =
    quotation.reApprovalRequired ||
    quotation.lines.some((l) => l.isViolation || l.discountPercent > l.effectiveCeiling);

  const violatingLines = quotation.lines.filter(
    (l) => l.isViolation || l.discountPercent > l.effectiveCeiling
  );

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || !signerName.trim() || !signerTitle.trim()) return;

    const res = onConfirm(signerName, signerTitle, acceptanceNotes);
    setResultState({
      routeType: res.routeType,
      salesOrderNumber: res.salesOrderNumber,
      reApprovalReason: res.reApprovalReason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ========================================================= */}
        {/* STATE 1: INITIAL SIGNING FORM                             */}
        {/* ========================================================= */}
        {!resultState ? (
          <form onSubmit={handleConfirmSubmit} className="flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
                    Digital Acceptance & Quotation Confirmation
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Proposal Reference: <strong className="font-mono text-[var(--primary)]">{quotation.id}</strong> ({quotation.customerName})
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

            {/* Content Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Financial Snapshot Card */}
              <div className="bg-[var(--background)]/70 p-4 rounded-xl border border-[var(--border)] space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Customer Organization:</span>
                  <strong className="text-[var(--text-main)]">{quotation.customerName}</strong>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Bill of Materials Items:</span>
                  <span className="font-mono font-semibold text-[var(--text-main)]">
                    {quotation.lines.length} Line Items
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono">{quotation.subtotal}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Authorized Discount Savings:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    -₹{quotation.discountAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Estimated Taxes (18% GST):</span>
                  <span className="font-mono">₹{quotation.taxAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between items-baseline">
                  <span className="font-bold text-xs text-[var(--text-main)]">
                    Net Payable Commercial Total:
                  </span>
                  <span className="text-lg font-bold font-mono text-[var(--primary)]">
                    {quotation.total}
                  </span>
                </div>
              </div>

              {/* Threshold Indicator Banner */}
              {termsExceedThreshold ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-800 dark:text-amber-300 font-semibold block">
                      Self-Governing Threshold Exceeded (Re-Approval Trigger)
                    </strong>
                    <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                      One or more lines ({violatingLines.map((l) => l.sku).join(", ")}) exceed corporate discount thresholds.
                      Confirming will immediately route this quote back into the <strong>B4 Approval Flow</strong> for Morgan Manager review before fulfillment.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-800 dark:text-emerald-300 font-semibold block">
                      Fully Authorized Commercial Proposal
                    </strong>
                    <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                      All terms are compliant with corporate discount thresholds. Confirming will <strong>move this order directly into Multi-Warehouse Fulfillment</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Signer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                    Authorized Signer Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="e.g. Jordan Procurement"
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                    Signer Corporate Title:
                  </label>
                  <input
                    type="text"
                    required
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    placeholder="e.g. Director of IT Procurement"
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Acceptance Notes */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                  Purchase Order / Acceptance Notes (Optional):
                </label>
                <input
                  type="text"
                  value={acceptanceNotes}
                  onChange={(e) => setAcceptanceNotes(e.target.value)}
                  placeholder="e.g. PO-ACM-2026-8842 / Payment terms Net 30 confirmed"
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--card)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Legal Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-[11px] text-[var(--text-body)] leading-relaxed">
                  I confirm digital acceptance and e-sign this commercial agreement on behalf of{" "}
                  <strong>{quotation.customerName}</strong> under DealOrbit standard commercial terms ({quotation.paymentTerms}).
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline text-xs py-2.5 px-4 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!agreedToTerms || !signerName.trim() || !signerTitle.trim()}
                className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Quotation</span>
              </button>
            </div>
          </form>
        ) : resultState.routeType === "RE_APPROVAL" ? (
          /* ========================================================= */
          /* STATE 2: RE-APPROVAL REQUIRED (BRANCH 1: B4 FLOW)         */
          /* ========================================================= */
          <div className="p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  <span>Self-Governing Invalidation</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)] font-heading">
                  Quotation Re-Entered Approval Flow (B4)
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Quote Reference: <strong className="font-mono text-[var(--primary)]">{quotation.id}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">New Deal Status:</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  Under Negotiation & Pending Re-Approval
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Governance Assignee:</span>
                <span className="font-semibold text-[var(--text-main)]">Morgan Manager (Sales Manager)</span>
              </div>
              <div className="pt-2 border-t border-amber-500/20 text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                <strong>Governance Rule Triggered:</strong> {resultState.reApprovalReason}
              </div>
            </div>

            <p className="text-xs text-[var(--text-body)] leading-relaxed">
              Because the requested terms exceed pre-authorized ceiling limits, DealOrbit has automatically revoked prior approvals and placed this deal in the <strong>B4 Discount Approval queue</strong>. You will be notified once managerial sign-off is completed.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary flex-1 text-xs py-2.5 cursor-pointer text-center"
              >
                Return to Proposal Room
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* STATE 3: ORDER MOVES TO FULFILLMENT (BRANCH 2: B6 FLOW)  */
          /* ========================================================= */
          <div className="p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Confirmed & Converted to Sales Order</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)] font-heading">
                  Order Dispatched Directly to Fulfillment
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Sales Order: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{resultState.salesOrderNumber}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Signer Sign-off:</span>
                <span className="font-semibold text-[var(--text-main)]">
                  {signerName} ({signerTitle})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Total Commercial Value:</span>
                <span className="font-mono font-bold text-[var(--text-main)]">{quotation.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Fulfillment Routing:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Multi-Warehouse Auto-Split (Main Hub & East Depot)
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-body)] leading-relaxed">
              All commercial parameters satisfy corporate discount governance. The order has moved directly into warehouse allocation and fulfillment staging.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDownloadPdf?.();
                }}
                className="btn-outline flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official Agreement</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-primary flex-1 text-xs py-2.5 cursor-pointer text-center"
              >
                Return to Proposal Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
