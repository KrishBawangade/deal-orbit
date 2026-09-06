"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Clock,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Receipt,
  Download,
  Info,
} from "lucide-react";
import { useQuotations, QuotationRecord } from "@/context/QuotationsContext";
import { ShimmerBox, ShimmerPill } from "@/components/ui/Shimmer";

interface CustomerQuotationsHubProps {
  customerToken: string;
  onSelectQuote: (quoteId: string) => void;
}

type StatusFilter = "ALL" | "IN_REVIEW" | "APPROVED" | "CONFIRMED";

export default function CustomerQuotationsHub({
  customerToken,
  onSelectQuote,
}: CustomerQuotationsHubProps) {
  const { quotations, isLoading, getQuotationsByCustomer } = useQuotations();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Get all quotations for this customer
  const customerQuotes = useMemo(() => {
    const quotes = getQuotationsByCustomer
      ? getQuotationsByCustomer(customerToken)
      : quotations.filter(
          (q) =>
            q.customerId?.toLowerCase() === customerToken.toLowerCase() ||
            q.customerName.toLowerCase().includes("acme")
        );
    return quotes.length > 0 ? quotes : quotations.slice(0, 3);
  }, [customerToken, getQuotationsByCustomer, quotations]);

  // Primary customer info
  const customerInfo = useMemo(() => {
    const primary = customerQuotes[0];
    return {
      name: primary?.customerName || "Acme Corp",
      tier: primary?.tier || "GOLD",
      customerId: primary?.customerId || customerToken || "cust-001",
      repName: primary?.repName || "Sam Seller",
      repEmail: "sam.seller@dealorbit.io",
    };
  }, [customerQuotes, customerToken]);

  // KPI calculations
  const stats = useMemo(() => {
    const total = customerQuotes.length;
    const inReview = customerQuotes.filter(
      (q) => q.status === "IN_REVIEW" || q.status === "CUSTOMER_REVIEW" || q.status === "DRAFT"
    ).length;
    const approved = customerQuotes.filter((q) => q.status === "APPROVED").length;
    const confirmed = customerQuotes.filter(
      (q) => q.status === "ACCEPTED" || q.status === "CONVERTED_TO_ORDER"
    ).length;
    const totalValue = customerQuotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);

    return { total, inReview, approved, confirmed, totalValue };
  }, [customerQuotes]);

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    return customerQuotes.filter((q) => {
      // Status filter
      if (statusFilter === "IN_REVIEW") {
        if (
          q.status !== "IN_REVIEW" &&
          q.status !== "CUSTOMER_REVIEW" &&
          q.status !== "NEGOTIATING" &&
          q.status !== "DRAFT"
        ) {
          return false;
        }
      } else if (statusFilter === "APPROVED") {
        if (q.status !== "APPROVED") return false;
      } else if (statusFilter === "CONFIRMED") {
        if (q.status !== "ACCEPTED" && q.status !== "CONVERTED_TO_ORDER") return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const qLower = searchQuery.toLowerCase();
      const matchId = q.id.toLowerCase().includes(qLower);
      const matchLines = q.lines?.some(
        (l) =>
          l.name.toLowerCase().includes(qLower) ||
          l.sku.toLowerCase().includes(qLower) ||
          l.category.toLowerCase().includes(qLower)
      );
      const matchRep = q.repName.toLowerCase().includes(qLower);

      return matchId || matchLines || matchRep;
    });
  }, [customerQuotes, statusFilter, searchQuery]);

  // Status visual badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_REVIEW":
      case "CUSTOMER_REVIEW":
      case "DRAFT":
        return {
          label: "Delivered for Review & Negotiation",
          shortLabel: "Review Required",
          colorClass: "bg-amber-500/10 text-amber-800 border-amber-500/25",
          dotClass: "bg-amber-500",
          icon: Clock,
          actionText: "Enter Negotiation Room",
          actionClass: "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white",
        };
      case "APPROVED":
        return {
          label: "Commercial Terms Approved",
          shortLabel: "Approved by Management",
          colorClass: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25",
          dotClass: "bg-emerald-500",
          icon: CheckCircle2,
          actionText: "Review & Electronically Sign",
          actionClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      case "ACCEPTED":
      case "CONVERTED_TO_ORDER":
        return {
          label: "Digitally Confirmed & Executed",
          shortLabel: "Confirmed Order",
          colorClass: "bg-blue-500/10 text-blue-800 border-blue-500/25",
          dotClass: "bg-blue-500",
          icon: ShieldCheck,
          actionText: "View Executed Agreement",
          actionClass: "bg-[var(--card)] hover:bg-[var(--background-subtle)] border border-[var(--border)] text-[var(--text-main)]",
        };
      default:
        return {
          label: status,
          shortLabel: status,
          colorClass: "bg-[var(--background-subtle)] text-[var(--text-muted)] border-[var(--border)]",
          dotClass: "bg-[var(--text-muted)]",
          icon: Clock,
          actionText: "View Proposal",
          actionClass: "bg-[var(--primary)] text-white",
        };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Corporate Buyer Welcome Banner */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono px-3 py-1 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] font-bold">
                ACCOUNT: {customerInfo.customerId}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-800">
                {customerInfo.tier} Tier Corporate Account
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                • Standard Discount Ceiling: 15%
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] font-heading">
                {customerInfo.name} — Commercial Proposals
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-2xl">
                Welcome to your secure customer negotiation hub. Select an active quotation below to review proposed bill of materials, negotiate line-item discounts, chat directly with sales, or digitally execute agreements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Client: <strong>{customerInfo.name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Dedicated Rep: <strong>{customerInfo.repName}</strong> ({customerInfo.repEmail})</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex sm:flex-col justify-between sm:justify-center items-end bg-[var(--background-subtle)] p-4 rounded-xl border border-[var(--border)] sm:min-w-[200px]">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Total Proposals Value
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)] mt-0.5">
              ₹{stats.totalValue.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium mt-1">
              {stats.total} Commercial Proposals
            </span>
          </div>
        </div>
      </div>

      {/* 2. Zero Leakage Trust Notice */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-main)] space-y-1">
          <p className="font-semibold text-cyan-900">
            Restricted Customer Proposal Room (Zero Confidential Data Leakage)
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            This customer view displays authorized bill of materials, agreed price points, and client discount allowances. Internal vendor cost bases (COGS), distributor margins, and internal risk scores are strictly excluded.
          </p>
        </div>
      </div>

      {/* 3. KPI Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quotes */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "ALL"
              ? "bg-[var(--card)] border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-xs"
        {/* Total Quotes */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "ALL"
              ? "bg-[var(--card)] border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-xs"
              : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/40"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold">All Proposals</span>
            <FileText className="w-4 h-4 text-[var(--primary)]" />
          </div>
          {isLoading ? (
            <ShimmerBox className="h-8 w-16 rounded-md mt-2" />
          ) : (
            <div className="mt-2 text-2xl font-bold font-mono text-[var(--text-main)]">
              {stats.total}
            </div>
          )}
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Active proposals on record</p>
        </div>

        {/* Action Required */}
        <div
          onClick={() => setStatusFilter("IN_REVIEW")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "IN_REVIEW"
              ? "bg-[var(--card)] border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
              : "bg-[var(--card)] border-[var(--border)] hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold">Action Required</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          {isLoading ? (
            <ShimmerBox className="h-8 w-16 rounded-md mt-2" />
          ) : (
            <div className="mt-2 text-2xl font-bold font-mono text-amber-700">
              {stats.inReview}
            </div>
          )}
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Ready for review & counter-offer</p>
        </div>

        {/* Approved */}
        <div
          onClick={() => setStatusFilter("APPROVED")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "APPROVED"
              ? "bg-[var(--card)] border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
              : "bg-[var(--card)] border-[var(--border)] hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold">Approved Terms</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          {isLoading ? (
            <ShimmerBox className="h-8 w-16 rounded-md mt-2" />
          ) : (
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
              {stats.approved}
            </div>
          )}
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Cleared for electronic signature</p>
        </div>

        {/* Confirmed Orders */}
        <div
          onClick={() => setStatusFilter("CONFIRMED")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "CONFIRMED"
              ? "bg-[var(--card)] border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
              : "bg-[var(--card)] border-[var(--border)] hover:border-blue-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold">Executed Agreements</span>
            <ShieldCheck className="w-4 h-4 text-blue-700" />
          </div>
          {isLoading ? (
            <ShimmerBox className="h-8 w-16 rounded-md mt-2" />
          ) : (
            <div className="mt-2 text-2xl font-bold font-mono text-blue-700">
              {stats.confirmed}
            </div>
          )}
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Confirmed & in fulfillment</p>
        </div>
      </div>

      {/* 4. Filter, Search & Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotations by reference, product, or rep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "ALL", label: "All", count: stats.total },
              { key: "IN_REVIEW", label: "In Review", count: stats.inReview },
              { key: "APPROVED", label: "Approved", count: stats.approved },
              { key: "CONFIRMED", label: "Confirmed", count: stats.confirmed },
            ] as const
          ).map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === filter.key
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text-main)]"
              }`}
            >
              <span>{filter.label}</span>{" "}
              {isLoading ? <ShimmerPill className="w-3.5 h-3 ml-1" /> : `(${filter.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Quotations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShimmerBox className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <ShimmerBox className="h-5 w-36 rounded" />
                    <ShimmerBox className="h-3 w-48 rounded" />
                  </div>
                </div>
                <ShimmerBox className="h-7 w-24 rounded-md" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[var(--border-subtle)]">
                <div>
                  <ShimmerBox className="h-3 w-16 rounded mb-1" />
                  <ShimmerBox className="h-5 w-24 rounded" />
                </div>
                <div>
                  <ShimmerBox className="h-3 w-16 rounded mb-1" />
                  <ShimmerBox className="h-5 w-20 rounded" />
                </div>
                <div>
                  <ShimmerBox className="h-3 w-16 rounded mb-1" />
                  <ShimmerBox className="h-5 w-20 rounded" />
                </div>
                <div className="flex items-center justify-end">
                  <ShimmerBox className="h-9 w-28 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-main)]">No matching quotations found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Try adjusting your search criteria or status filters to view other proposals available for {customerInfo.name}.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="text-xs text-[var(--primary)] font-semibold hover:underline mt-2 inline-block cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] px-1">
            <span>Showing {filteredQuotes.length} commercial quotation{filteredQuotes.length > 1 ? "s" : ""}</span>
            <span>Click any proposal to enter its dedicated negotiation room</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredQuotes.map((quote) => {
              const statusCfg = getStatusBadge(quote.status);
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={quote.id}
                  onClick={() => onSelectQuote(quote.id)}
                  className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-xs hover:border-[var(--primary)]/60 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Proposal Scope & Details */}
                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Status row */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-md border border-[var(--primary)]/20">
                          {quote.id}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${statusCfg.colorClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} animate-pulse`} />
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusCfg.shortLabel}</span>
                        </span>

                        <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                          Updated {quote.updatedAt || "Recently"}
                        </span>
                      </div>

                      {/* Proposal Title */}
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                          <span>
                            {quote.id === "QT-2026-0043"
                              ? "Enterprise Commercial Proposal (Hardware & Deployment)"
                              : quote.id === "QT-2026-0045"
                              ? "Cloud Infrastructure & Hybrid Security Modernization Suite"
                              : quote.id === "QT-2026-0039"
                              ? "Annual Mission-Critical 24/7 SLA Engineering Support Contract"
                              : `Commercial Proposal for ${quote.customerName}`}
                          </span>
                          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                        </h2>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Prepared by account executive <strong>{quote.repName}</strong> • Payment terms: <strong>{quote.paymentTerms || "Net 30"}</strong>
                        </p>
                      </div>

                      {/* Line Items Preview Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1">
                          Included items ({quote.lines?.length || 0}):
                        </span>
                        {quote.lines?.map((line) => (
                          <span
                            key={line.id}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-[var(--background-subtle)] border border-[var(--border)] text-[var(--text-muted)] font-medium"
                          >
                            <Layers className="w-3 h-3 text-[var(--primary)]" />
                            <span>{line.name}</span>
                            <span className="font-semibold text-[var(--text-main)]">×{line.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Commercial Pricing & Enter CTA */}
                    <div className="flex sm:items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--border)] shrink-0">
                      {/* Price Summary */}
                      <div className="text-left lg:text-right space-y-1">
                        <div className="text-[11px] text-[var(--text-muted)] font-medium">
                          Net Payable Proposal Total
                        </div>
                        <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)]">
                          ₹{quote.totalAmount ? quote.totalAmount.toLocaleString("en-IN") : quote.total}
                        </div>
                        {quote.discountAmount > 0 && (
                          <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                            Includes ₹{quote.discountAmount.toLocaleString("en-IN")} Approved Corporate Savings
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectQuote(quote.id);
                          }}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs group-hover:scale-102 cursor-pointer ${statusCfg.actionClass}`}
                        >
                          <span>{statusCfg.actionText}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
