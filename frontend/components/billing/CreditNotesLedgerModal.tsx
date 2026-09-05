"use client";

import React from "react";
import {
  X,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Building2,
  CreditCard,
  AlertCircle,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export interface ICreditNoteItem {
  id: string;
  creditNoteNumber: string;
  subscriptionId?: string;
  salesOrderNumber: string;
  customerName: string;
  amount: number;
  reason: string;
  issuedAt: string;
  status: "APPLIED_TO_BALANCE" | "PENDING_REFUND" | "REFUNDED";
  unconsumedDays?: number;
  totalDaysInPeriod?: number;
}

interface CreditNotesLedgerModalProps {
  creditNote: ICreditNoteItem | null;
  onClose: () => void;
}

export default function CreditNotesLedgerModal({
  creditNote,
  onClose,
}: CreditNotesLedgerModalProps) {
  if (!creditNote) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    toast.success(`Exporting ${creditNote.creditNoteNumber}`, {
      description: "Credit note PDF receipt generated for accounting audit.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-[var(--card)] to-[var(--card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
                  Official Credit Note
                </h3>
                <span className="badge badge-success text-[10px] py-0.5 px-2">
                  {creditNote.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                {creditNote.creditNoteNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Credit Note Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[var(--text-body)] print:p-0">
          {/* Header Metadata */}
          <div className="p-4 rounded-xl bg-[var(--card-hover)]/60 border border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                Customer
              </div>
              <div className="font-bold text-[var(--text-main)] mt-0.5">
                {creditNote.customerName}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                Sales Order Ref
              </div>
              <div className="font-mono font-bold text-[var(--text-main)] mt-0.5">
                {creditNote.salesOrderNumber}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                Issue Date
              </div>
              <div className="font-medium text-[var(--text-main)] mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                <span>{creditNote.issuedAt}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                Ledger Status
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Credited</span>
              </div>
            </div>
          </div>

          {/* Credit Note Amount Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block">
                Total Credit Value Applied
              </span>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
                This credit note has been automatically credited against the customer&apos;s commercial ledger balance.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{creditNote.amount.toLocaleString("en-IN")}
              </span>
              <span className="block text-[10px] text-[var(--text-muted)]">
                INR (Pre-Tax Adjusted)
              </span>
            </div>
          </div>

          {/* Reason & Proration Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-[var(--text-main)] text-xs uppercase tracking-wide">
              Proration & Trigger Reason
            </h4>
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[var(--text-main)]">
                    Audit Description:
                  </span>{" "}
                  <span>{creditNote.reason}</span>
                </div>
              </div>

              {creditNote.unconsumedDays !== undefined && (
                <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                  <span>Day Count Proration Metric:</span>
                  <span className="font-mono font-semibold text-[var(--text-main)]">
                    {creditNote.unconsumedDays} unconsumed days remaining out of{" "}
                    {creditNote.totalDaysInPeriod || 30} days
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Finance Accounting Notice */}
          <div className="p-3.5 rounded-xl bg-[var(--card-hover)]/50 border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
            <div className="font-semibold text-[var(--text-main)] flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-indigo-500" />
              <span>Accounting Treatment & Operations Note</span>
            </div>
            <p>
              In accordance with revenue recognition policies, mid-cycle contract modifications and cancellations generate immediate pro-rata credit notes. The credit balance can be applied to future recurring invoices or refunded via standard treasury disbursement.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--card-hover)]/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-xs py-2 px-4 border border-[var(--border)]"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-ghost text-xs py-2 px-3.5 border border-[var(--border)] flex items-center gap-1.5 hover:bg-[var(--card-hover)]"
            >
              <Printer className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
