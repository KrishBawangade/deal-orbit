"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { useQuotations, QuotationRecord } from "@/context/QuotationsContext";
import {
  Kanban,
  Plus,
  Search,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  RefreshCw,
} from "lucide-react";

export type PipelineStage = "DRAFT" | "UNDER_REVIEW" | "NEGOTIATING" | "CONFIRMED" | "FULFILLMENT";

export interface PipelineDeal {
  id: string;
  customerName: string;
  tier: string;
  value: string;
  amount: number;
  margin: number;
  stage: PipelineStage;
  riskScore: number;
  assignedRep: string;
  daysActive: number;
}

const COLUMNS: { id: PipelineStage; title: string; color: string }[] = [
  { id: "DRAFT", title: "Draft Proposals", color: "border-slate-500/40 text-slate-700 dark:text-slate-300" },
  { id: "UNDER_REVIEW", title: "Under Manager Review", color: "border-amber-500/40 text-amber-600 dark:text-amber-400" },
  { id: "NEGOTIATING", title: "Customer Negotiating", color: "border-blue-500/40 text-blue-600 dark:text-blue-400" },
  { id: "CONFIRMED", title: "Digitally Confirmed", color: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" },
  { id: "FULFILLMENT", title: "Warehouse Fulfillment", color: "border-purple-500/40 text-purple-600 dark:text-purple-400" },
];

function mapQuoteToStage(quote: QuotationRecord): PipelineStage {
  const status = (quote.status || "").toUpperCase();
  if (status === "DRAFT") return "DRAFT";
  if (
    status === "IN_REVIEW" ||
    quote.approvalStage === "SALES_MANAGER" ||
    quote.approvalStage === "FINANCE"
  ) {
    return "UNDER_REVIEW";
  }
  if (
    status === "CONFIRMED" ||
    status === "ACCEPTED" ||
    status === "CUSTOMER_ACCEPTED"
  ) {
    return "CONFIRMED";
  }
  if (
    status === "FULFILLED" ||
    status === "CLOSED_WON" ||
    Boolean(quote.salesOrderNumber)
  ) {
    return "FULFILLMENT";
  }
  // APPROVED, CUSTOMER_REVIEW, NEGOTIATING, or default
  return "NEGOTIATING";
}

function mapQuoteToDeal(quote: QuotationRecord, fallbackRepName: string): PipelineDeal {
  const stage = mapQuoteToStage(quote);

  let daysActive = 1;
  if (quote.updatedAt) {
    const updatedTime = new Date(quote.updatedAt).getTime();
    if (!isNaN(updatedTime)) {
      daysActive = Math.max(1, Math.floor((Date.now() - updatedTime) / (1000 * 60 * 60 * 24)));
    }
  }

  const tierFormatted = quote.tier
    ? `${quote.tier.charAt(0).toUpperCase() + quote.tier.slice(1).toLowerCase()} Tier`
    : "Enterprise Tier";

  const totalAmount = quote.totalAmount || 0;
  const formattedValue =
    quote.total ||
    (totalAmount > 0
      ? `₹${totalAmount.toLocaleString("en-IN")}`
      : "₹0");

  return {
    id: quote.id,
    customerName: quote.customerName || "Enterprise Client",
    tier: tierFormatted,
    value: formattedValue,
    amount: totalAmount,
    margin: typeof quote.blendedMargin === "number" ? quote.blendedMargin : 20.0,
    stage,
    riskScore: typeof quote.riskScore === "number" ? quote.riskScore : 10.0,
    assignedRep: quote.repName || fallbackRepName || "Sam Seller",
    daysActive,
  };
}

export default function PipelinePage() {
  const router = useRouter();
  const { activeUser } = useRole();
  const { quotations, isLoading, refetchQuotations } = useQuotations();
  const [search, setSearch] = useState("");

  const deals: PipelineDeal[] = quotations.map((q) => mapQuoteToDeal(q, activeUser.name));

  const filteredDeals = deals.filter((d) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return d.customerName.toLowerCase().includes(term) || d.id.toLowerCase().includes(term);
  });

  const totalPipelineValue = deals.reduce((acc, d) => acc + d.amount, 0);
  const formattedPipelineValue =
    totalPipelineValue >= 10000000
      ? `₹${(totalPipelineValue / 10000000).toFixed(2)} Cr`
      : totalPipelineValue >= 100000
      ? `₹${(totalPipelineValue / 100000).toFixed(2)} Lakh`
      : `₹${totalPipelineValue.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] font-heading">
            Deal Pipeline Kanban
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Visual pipeline board for {activeUser.name} tracking live quote progression, risk levels, and deal health across stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetchQuotations()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] text-[var(--text-main)] transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Fetch live quotes and pipeline deals from backend API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[var(--primary)]" : "text-[var(--text-muted)]"}`} />
            <span>{isLoading ? "Syncing..." : "Sync Live API"}</span>
          </button>

          {activeUser.role !== "FINANCE_OPS" && (
            <Link
              href="/quotations/new"
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Quotation</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Pipeline Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)]/60 p-3 rounded-xl border border-[var(--border)] text-xs">
        <div className="flex items-center gap-4 text-[var(--text-muted)]">
          <div>
            Total Active Pipeline:{" "}
            <strong className="text-[var(--text-main)] font-heading">
              {formattedPipelineValue}
            </strong>
          </div>
          <span>•</span>
          <div>
            Total Deals:{" "}
            <strong className="text-[var(--text-main)]">
              {filteredDeals.length} {filteredDeals.length === 1 ? "Deal" : "Deals"}
            </strong>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* 3. Kanban Columns Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colDeals = filteredDeals.filter((d) => d.stage === col.id);
          const colTotalValue = colDeals.reduce((acc, d) => acc + d.amount, 0);

          return (
            <div
              key={col.id}
              className="bg-[var(--card)]/50 rounded-xl border border-[var(--border)] p-3 space-y-3 min-h-[480px] flex flex-col shadow-2xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-main)] font-heading">
                    {col.title}
                  </h3>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {colTotalValue >= 100000
                      ? `₹${(colTotalValue / 100000).toFixed(1)}L Total`
                      : `₹${colTotalValue.toLocaleString("en-IN")} Total`}
                  </div>
                </div>
                <span className="w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[10px] font-bold flex items-center justify-center text-[var(--text-main)]">
                  {colDeals.length}
                </span>
              </div>

              {/* Deal Cards */}
              <div className="space-y-2.5 flex-1">
                {colDeals.length === 0 ? (
                  <div className="h-32 border border-dashed border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-[11px] text-[var(--text-muted)]">
                    No deals in stage
                  </div>
                ) : (
                  colDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => router.push(`/quotations/${deal.id}`)}
                      className="card-glass p-3.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-sm transition-all space-y-2.5 group shadow-2xs cursor-pointer"
                      title={`Open quotation ${deal.id} (${deal.customerName})`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] font-medium">
                            {deal.id}
                          </span>
                          <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                            {deal.customerName}
                          </h4>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {deal.tier}
                          </span>
                        </div>

                        <span
                          className={`badge text-[10px] font-bold ${
                            deal.margin >= 22
                              ? "badge-success"
                              : deal.margin >= 18
                              ? "badge-warning"
                              : "badge-destructive"
                          }`}
                        >
                          {deal.margin}%
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-[var(--border-subtle)]/70">
                        <div className="text-sm font-bold text-[var(--text-main)] font-heading">
                          {deal.value}
                        </div>

                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{deal.daysActive}d in stage</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <div className="flex items-center gap-1">
                          {deal.riskScore > 30 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5 text-[10px]">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Risk: {deal.riskScore}</span>
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 text-[10px]">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Risk: {deal.riskScore}</span>
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/quotations/${deal.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
