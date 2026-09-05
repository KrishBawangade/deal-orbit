"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Building2,
  User,
  Download,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Percent,
  Truck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Printer,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQuotations, QuotationRecord, QuotationLineItem } from "@/context/QuotationsContext";
import LineItemDiscussionModal from "./LineItemDiscussionModal";
import CounterDiscountProposal from "./CounterDiscountProposal";
import DigitalConfirmationModal from "./DigitalConfirmationModal";

interface CustomerNegotiationPortalProps {
  token: string;
  initialQuoteId?: string;
}

export default function CustomerNegotiationPortal({
  token,
  initialQuoteId,
}: CustomerNegotiationPortalProps) {
  const {
    quotations,
    getQuotationByToken,
    submitCounterOffer,
    addLineComment,
    confirmQuotation,
  } = useQuotations();

  // Resolve quotation from token or ID
  const quote = useMemo(() => {
    if (initialQuoteId) {
      const found = quotations.find(
        (q) => q.id.toLowerCase() === initialQuoteId.toLowerCase()
      );
      if (found) return found;
    }
    return getQuotationByToken(token) || quotations[0];
  }, [token, initialQuoteId, quotations, getQuotationByToken]);

  // Modals state
  const [selectedLineForDiscussion, setSelectedLineForDiscussion] = useState<QuotationLineItem | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [activeCounterLineId, setActiveCounterLineId] = useState<string>(
    quote?.lines[0]?.id || ""
  );

  if (!quote) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-[var(--destructive)] mx-auto" />
        <h2 className="text-xl font-bold text-[var(--text-main)]">Proposal Not Found</h2>
        <p className="text-xs text-[var(--text-muted)]">
          The requested negotiation token ({token}) could not be resolved to an active quotation.
        </p>
        <Link href="/portal/demo-token" className="btn-primary text-xs py-2 px-4 inline-block">
          Open Demo Proposal Room
        </Link>
      </div>
    );
  }

  // Determine Customer Portal Status mapping
  // Required: Shows quotation details and current status (Sent, Under Negotiation, Confirmed)
  const getPortalStatusDisplay = (status: string) => {
    if (status === "ACCEPTED" || status === "CONVERTED_TO_ORDER") {
      return {
        label: "Confirmed",
        colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
        icon: CheckCircle2,
        desc: "Digitally signed and accepted commercial proposal",
      };
    }
    if (status === "NEGOTIATING") {
      return {
        label: "Under Negotiation",
        colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
        icon: Sparkles,
        desc: "Counter-proposals and line inquiries active",
      };
    }
    // Default / CUSTOMER_REVIEW / SENT / IN_REVIEW / DRAFT
    return {
      label: "Sent",
      colorClass: "bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30",
      icon: Clock,
      desc: "Delivered for procurement review & digital confirmation",
    };
  };

  const portalStatus = getPortalStatusDisplay(quote.status);
  const StatusIcon = portalStatus.icon;

  // Handle Counter Proposal submission
  const handleSubmitCounter = (
    lineItemId: string,
    proposedDiscount: number,
    proposedQuantity?: number,
    message?: string
  ) => {
    const result = submitCounterOffer(
      quote.id,
      lineItemId,
      proposedDiscount,
      proposedQuantity,
      message
    );

    if (result.reApprovalRequired) {
      toast.warning(
        `Counter-offer (${proposedDiscount}%) submitted. Because it breaches standard discount ceilings, it will require Manager re-approval (B4 flow).`,
        { duration: 5000 }
      );
    } else {
      toast.success(
        `Counter-offer (${proposedDiscount}%) transmitted to Sam Seller. Status updated to Under Negotiation.`,
        { duration: 4000 }
      );
    }
  };

  // Handle Line Comment submission
  const handleSendMessage = (lineItemId: string, message: string) => {
    addLineComment(
      quote.id,
      lineItemId,
      message,
      "CUSTOMER",
      "Jordan Procurement (Acme Corp)"
    );
    toast.success("Inquiry posted to quotation thread", { duration: 3000 });
  };

  // Handle Digital Confirmation
  const handleConfirmQuotation = (
    signerName: string,
    signerTitle: string,
    acceptanceNotes?: string
  ) => {
    const res = confirmQuotation(
      quote.id,
      signerName,
      signerTitle,
      acceptanceNotes
    );

    if (res.routeType === "RE_APPROVAL") {
      toast.warning(
        "Terms exceed discount ceilings. Quotation automatically re-entered B4 Approval Flow for manager review.",
        { duration: 6000 }
      );
    } else {
      toast.success(
        `Quotation confirmed! Sales Order ${res.salesOrderNumber} generated and dispatched to fulfillment.`,
        { duration: 5000 }
      );
    }

    return res;
  };

  // Printable Official Proposal
  const handlePrintProposal = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Proposal Header Card with Status Badge */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            {/* Status Pill & Token Ref */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--text-muted)] font-semibold">
                REF: {quote.id}
              </span>

              {/* Status Badge: Sent, Under Negotiation, Confirmed */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${portalStatus.colorClass}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>Status: {portalStatus.label}</span>
              </div>

              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                • {portalStatus.desc}
              </span>
            </div>

            {/* Proposal Heading */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] font-heading">
                Enterprise Commercial Proposal
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Prepared exclusively for <strong>{quote.customerName}</strong> ({quote.tier} Tier Corporate Account)
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Client: <strong>{quote.customerName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Account Rep: <strong>{quote.repName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Proposal Expiry: <strong>{quote.expiresAt || "2026-09-19"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Terms: <strong>{quote.paymentTerms || "Net 30"}</strong></span>
              </div>
            </div>
          </div>

          {/* Top Primary Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrintProposal}
              className="btn-outline text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsConfirmationOpen(true)}
              className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Quotation</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Security & Masking Guarantee Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3 text-xs">
        <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <strong className="text-cyan-900 dark:text-cyan-200 font-semibold block">
            Restricted Customer Proposal Room (Zero Data Leakage)
          </strong>
          <p className="text-[11px] text-cyan-900/80 dark:text-cyan-300/80 leading-relaxed">
            This secure environment strictly displays approved bill of materials, list pricing, and authorized commercial discounts. Internal COGS, line margins, and blended risk scores are physically omitted per DealOrbit privacy standards.
          </p>
        </div>
      </div>

      {/* 3. Proposed Bill of Materials Table */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
              Proposed Bill of Materials
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Review itemized hardware, software, and service allocations. Click on any line to comment or propose counter-discounts.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--text-muted)]">
            {quote.lines.length} Line Items
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]/70 text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3.5 px-5">Item Specification</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Qty</th>
                <th className="py-3.5 px-4 text-right">Unit List Price</th>
                <th className="py-3.5 px-4 text-right">Quoted Discount</th>
                <th className="py-3.5 px-4 text-right">Net Line Price</th>
                <th className="py-3.5 px-5 text-center">Line Collaboration</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {quote.lines.map((line) => {
                const lineMsgs = (quote.negotiationMessages || []).filter(
                  (m) => m.lineItemId === line.id
                );
                const hasComments = lineMsgs.length > 0;
                const isSelected = activeCounterLineId === line.id;

                return (
                  <tr
                    key={line.id}
                    className={`hover:bg-[var(--card-hover)] transition-colors ${
                      isSelected ? "bg-[var(--primary)]/5" : ""
                    }`}
                  >
                    {/* Item Spec */}
                    <td className="py-4 px-5">
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[var(--primary)] font-bold bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">
                            {line.sku}
                          </span>
                          {line.isRecurring && (
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-semibold">
                              Recurring ({line.billingFrequency})
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-[var(--text-main)] line-clamp-1">
                          {line.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Estimated dispatch SLA: 48h from confirmation
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="text-[11px] font-medium text-[var(--text-body)]">
                        {line.category}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono font-semibold text-[var(--text-main)]">
                        {line.quantity}
                      </span>
                    </td>

                    {/* List Price */}
                    <td className="py-4 px-4 text-right font-mono text-[var(--text-muted)]">
                      ₹{line.unitPrice.toLocaleString("en-IN")}
                    </td>

                    {/* Approved Discount % */}
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {line.discountPercent.toFixed(1)}%
                      </span>
                    </td>

                    {/* Net Line Total */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-[var(--text-main)] text-sm">
                      ₹{line.netLineTotal.toLocaleString("en-IN")}
                    </td>

                    {/* Collaboration Actions */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Discussion Trigger */}
                        <button
                          type="button"
                          onClick={() => setSelectedLineForDiscussion(line)}
                          className={`text-xs py-1 px-2.5 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                            hasComments
                              ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30 font-semibold"
                              : "bg-[var(--card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
                          }`}
                          title="Open line-item inquiry & comment thread"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{hasComments ? `${lineMsgs.length} Inquiries` : "Inquire"}</span>
                        </button>

                        {/* Counter Trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCounterLineId(line.id);
                            // Scroll smoothly to counter tool
                            const el = document.getElementById("counter-tool-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-xs py-1 px-2.5 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors cursor-pointer font-medium"
                        >
                          <span>Counter</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Commercial Summary Footer (Masked Totals) */}
        <div className="p-6 bg-[var(--background)]/60 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">
              Gross Bill Subtotal:
            </span>
            <strong className="text-base font-bold font-mono text-[var(--text-main)] mt-0.5 block">
              {quote.subtotal}
            </strong>
            <span className="text-[10px] text-[var(--text-muted)]">Standard List Price</span>
          </div>

          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">
              Total Discount Savings:
            </span>
            <strong className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              -₹{quote.discountAmount.toLocaleString("en-IN")}
            </strong>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
              Approved Corporate Savings
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">
              Estimated Taxes (18% GST):
            </span>
            <strong className="text-base font-bold font-mono text-[var(--text-main)] mt-0.5 block">
              ₹{quote.taxAmount.toLocaleString("en-IN")}
            </strong>
            <span className="text-[10px] text-[var(--text-muted)]">Statutory Applicable Taxes</span>
          </div>

          <div className="bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] shadow-2xs">
            <span className="text-[10px] text-[var(--primary)] uppercase tracking-wider font-bold block">
              Net Payable Proposal Total:
            </span>
            <strong className="text-lg font-bold font-mono text-[var(--primary)] block mt-0.5">
              {quote.total}
            </strong>
            <span className="text-[10px] text-[var(--text-muted)]">Payable under {quote.paymentTerms}</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Counter Discount Tool */}
      <div id="counter-tool-section">
        <CounterDiscountProposal
          lines={quote.lines}
          selectedLineId={activeCounterLineId}
          onSelectLineId={setActiveCounterLineId}
          onSubmitCounter={handleSubmitCounter}
        />
      </div>

      {/* 5. Active Negotiation Thread & Change Request Ledger */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
                Quotation Negotiation & Change Request Ledger
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Audit trail of inquiries, counter-offers, and rep responses on {quote.id}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedLineForDiscussion(quote.lines[0])}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>New Inquiry</span>
          </button>
        </div>

        {/* Message Thread List */}
        <div className="space-y-3">
          {(quote.negotiationMessages || []).length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--text-muted)]">
              No messages posted yet. Use the Inquiry button on any item to initiate a change request.
            </div>
          ) : (
            (quote.negotiationMessages || []).map((msg) => {
              const isCust = msg.authorRole === "CUSTOMER";
              const targetLine = quote.lines.find((l) => l.id === msg.lineItemId);

              return (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isCust
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400"
                            : "bg-[var(--primary)]/15 text-[var(--primary)]"
                        }`}
                      >
                        {isCust ? "Customer Procurement" : "DealOrbit Sales Rep"}
                      </span>
                      <span className="font-semibold text-[var(--text-main)]">
                        {msg.authorName}
                      </span>
                      {targetLine && (
                        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--card)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                          re: {targetLine.sku}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-[var(--text-muted)]">{msg.createdAt}</span>
                  </div>

                  <p className="text-[var(--text-body)] leading-relaxed pl-1">{msg.message}</p>

                  {msg.proposedDiscount && (
                    <div className="pt-1.5 border-t border-[var(--border)]/60 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1 text-[var(--primary)] font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        Counter Proposed: {msg.proposedDiscount}% discount
                      </span>
                      {msg.proposedQuantity && (
                        <span>Quantity: {msg.proposedQuantity} units</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Primary Action Footer Bar */}
      <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-[var(--text-main)]">Ready to Finalize?</h4>
          <p className="text-xs text-[var(--text-muted)]">
            Clicking Confirm Quotation signs the agreement digitally and moves order directly to fulfillment (or re-evaluates via B4 if ceilings are breached).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("counter-tool-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-outline text-xs py-2.5 px-5 flex items-center gap-2 cursor-pointer"
          >
            <Percent className="w-4 h-4 text-[var(--primary)]" />
            <span>Propose Counter</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConfirmationOpen(true)}
            className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Quotation</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <LineItemDiscussionModal
        isOpen={Boolean(selectedLineForDiscussion)}
        onClose={() => setSelectedLineForDiscussion(null)}
        lineItem={selectedLineForDiscussion}
        messages={quote.negotiationMessages || []}
        onSendMessage={handleSendMessage}
        customerName={quote.customerName}
        repName={quote.repName}
      />

      <DigitalConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        quotation={quote}
        onConfirm={handleConfirmQuotation}
        onDownloadPdf={handlePrintProposal}
      />
    </div>
  );
}
