"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { useQuotations, QuotationRecord } from "@/context/QuotationsContext";
import {
  FileText,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Layers,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import {
  ShimmerBox,
  QuotationsTableSkeleton,
  QuotationsPaginationSkeleton,
} from "@/components/quotations/QuotationsSkeleton";

type FilterTabType = "ALL" | "DRAFT" | "IN_REVIEW" | "CUSTOMER_REVIEW" | "APPROVED" | "ACCEPTED" | "REJECTED";

export default function QuotationsPage() {
  const router = useRouter();
  const { activeUser } = useRole();
  const { quotations, isLoading, refetchQuotations } = useQuotations();
  const [filterTab, setFilterTab] = useState<FilterTabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    refetchQuotations();
  }, [refetchQuotations]);

  const draftCount = quotations.filter((q) => q.status === "DRAFT").length;
  const inReviewCount = quotations.filter((q) => q.status === "IN_REVIEW").length;
  const customerReviewCount = quotations.filter((q) => q.status === "CUSTOMER_REVIEW" || q.status === "NEGOTIATING").length;
  const approvedCount = quotations.filter((q) => q.status === "APPROVED").length;
  const acceptedCount = quotations.filter((q) => q.status === "ACCEPTED" || q.status === "CONVERTED_TO_ORDER").length;
  const rejectedCount = quotations.filter((q) => q.status === "REJECTED" || q.status === "EXPIRED").length;

  const totalPipelineValue = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const avgMargin =
    quotations.length > 0
      ? (quotations.reduce((sum, q) => sum + (q.blendedMargin || 0), 0) / quotations.length).toFixed(1)
      : "0.0";

  const filteredQuotes = quotations.filter((q) => {
    if (filterTab === "DRAFT" && q.status !== "DRAFT") return false;
    if (filterTab === "IN_REVIEW" && q.status !== "IN_REVIEW") return false;
    if (filterTab === "CUSTOMER_REVIEW" && q.status !== "CUSTOMER_REVIEW" && q.status !== "NEGOTIATING") return false;
    if (filterTab === "APPROVED" && q.status !== "APPROVED") return false;
    if (filterTab === "ACCEPTED" && q.status !== "ACCEPTED" && q.status !== "CONVERTED_TO_ORDER") return false;
    if (filterTab === "REJECTED" && q.status !== "REJECTED" && q.status !== "EXPIRED") return false;

    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      return (
        q.id.toLowerCase().includes(qLower) ||
        q.customerName.toLowerCase().includes(qLower)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedQuotes = filteredQuotes.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumb & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] font-heading">
            Quotations Management
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Active and draft commercial proposals for {activeUser.name} with real-time gross margin and discount compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetchQuotations()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-main)] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh quotations data live from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[var(--primary)] ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Syncing..." : "Sync Data"}</span>
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

      {/* 2. Key Sales Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Active Quotations</div>
            {isLoading ? (
              <ShimmerBox className="h-7 w-24 my-1 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-[var(--text-main)] font-heading" suppressHydrationWarning>
                {quotations.length} Deals
              </div>
            )}
            {isLoading ? (
              <ShimmerBox className="h-3 w-32 mt-1 rounded" />
            ) : (
              <div className="text-[11px] text-emerald-600 font-medium" suppressHydrationWarning>
                {draftCount} Drafts, {inReviewCount} In Review
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Weighted Pipeline Value</div>
            {isLoading ? (
              <ShimmerBox className="h-7 w-32 my-1 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-[var(--text-main)] font-heading" suppressHydrationWarning>
                ₹{totalPipelineValue.toLocaleString("en-IN")}
              </div>
            )}
            {isLoading ? (
              <ShimmerBox className="h-3 w-28 mt-1 rounded" />
            ) : (
              <div className="text-[11px] text-emerald-600 font-medium" suppressHydrationWarning>
                {quotations.length} Active Deals Tracked
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Blended Margin Floor</div>
            {isLoading ? (
              <ShimmerBox className="h-7 w-20 my-1 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-[var(--text-main)] font-heading" suppressHydrationWarning>
                {avgMargin}%
              </div>
            )}
            {isLoading ? (
              <ShimmerBox className="h-3 w-28 mt-1 rounded" />
            ) : (
              <div className="text-[11px] text-emerald-600 font-medium">
                Protected across tiers
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Inventory Feasibility</div>
            {isLoading ? (
              <ShimmerBox className="h-7 w-28 my-1 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-[var(--text-main)] font-heading">100% Ready</div>
            )}
            {isLoading ? (
              <ShimmerBox className="h-3 w-36 mt-1 rounded" />
            ) : (
              <div className="text-[11px] text-[var(--text-muted)]">
                Main Central & East Hub
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[var(--card)]/60 p-2.5 rounded-xl border border-[var(--border)]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => { setFilterTab("ALL"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === "ALL"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            All Deals {isLoading ? <span className="inline-block w-4 h-3 rounded shimmer ml-1 align-middle opacity-70" /> : `(${quotations.length})`}
          </button>

          <button
            type="button"
            onClick={() => { setFilterTab("DRAFT"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === "DRAFT"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            Drafts {isLoading ? <span className="inline-block w-4 h-3 rounded shimmer ml-1 align-middle opacity-70" /> : `(${draftCount})`}
          </button>

          <button
            type="button"
            onClick={() => { setFilterTab("IN_REVIEW"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === "IN_REVIEW"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            Under Review {isLoading ? <span className="inline-block w-4 h-3 rounded shimmer ml-1 align-middle opacity-70" /> : `(${inReviewCount})`}
          </button>

          <button
            type="button"
            onClick={() => { setFilterTab("CUSTOMER_REVIEW"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === "CUSTOMER_REVIEW"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            Client Review {isLoading ? <span className="inline-block w-4 h-3 rounded shimmer ml-1 align-middle opacity-70" /> : `(${customerReviewCount})`}
          </button>

          <button
            type="button"
            onClick={() => { setFilterTab("APPROVED"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === "APPROVED"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            Approved {isLoading ? <span className="inline-block w-4 h-3 rounded shimmer ml-1 align-middle opacity-70" /> : `(${approvedCount})`}
          </button>

          <button
            type="button"
            onClick={() => { setFilterTab("ACCEPTED"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === "ACCEPTED"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            Converted {isLoading ? <span className="inline-block w-4 h-3 rounded shimmer ml-1 align-middle opacity-70" /> : `(${acceptedCount})`}
          </button>

          <button
            type="button"
            onClick={() => { setFilterTab("REJECTED"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === "REJECTED"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            Rejected {isLoading ? <span className="inline-block w-4 h-3 rounded shimmer ml-1 align-middle opacity-70" /> : `(${rejectedCount})`}
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by quote # or customer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* 3. Quotations List Table */}
      <div className="card-glass rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--card)]/70 text-[var(--text-muted)] uppercase tracking-wider text-[10px] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-4 py-3">Quote ID</th>
                <th className="px-4 py-3">Customer Account</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Gross Margin</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]/70 text-[var(--text-body)]">
              {isLoading ? (
                <QuotationsTableSkeleton rowCount={7} />
              ) : paginatedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-[var(--text-muted)]/40" />
                      <p className="text-sm font-semibold text-[var(--text-main)]">No quotations found</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {searchQuery ? `No deals matching "${searchQuery}"` : "No commercial proposals in this filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQuotes.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => router.push(`/quotations/${q.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/quotations/${q.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className="hover:bg-[var(--primary)]/5 transition-all group cursor-pointer focus:outline-none focus:bg-[var(--primary)]/10"
                    title={`Click to open proposal ${q.id} (${q.customerName})`}
                  >
                    {/* Quote ID */}
                    <td className="px-4 py-3.5 font-mono font-bold text-[var(--primary)] group-hover:underline">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[var(--primary)] opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span>{q.id}</span>
                      </div>
                    </td>

                    {/* Customer Account & Tier */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[var(--text-main)] text-sm group-hover:text-[var(--primary)] transition-colors">
                        {q.customerName}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-[var(--text-main)]">{q.tier} Tier</span>
                        <span>•</span>
                        <span>Ceiling: {q.tierCeiling}%</span>
                        <span>•</span>
                        <span>{q.lineItemsCount} Items</span>
                      </div>
                    </td>

                    {/* Grand Total */}
                    <td className="px-4 py-3.5 font-semibold text-[var(--text-main)] font-heading text-sm">
                      {q.total}
                    </td>

                    {/* Gross Margin */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`badge text-xs font-bold ${
                            q.marginStatus === "HIGH"
                              ? "badge-success"
                              : q.marginStatus === "MEDIUM"
                              ? "badge-warning"
                              : "badge-destructive"
                          }`}
                        >
                          {q.blendedMargin}%
                        </span>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        {q.riskScore > 30 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{q.riskScore} (Manager Review)</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{q.riskScore} (Low Risk)</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`badge text-[10px] font-semibold ${
                            q.status === "DRAFT"
                              ? "badge-role-rep"
                              : q.status === "IN_REVIEW"
                              ? "badge-accent"
                              : "badge-success"
                          }`}
                        >
                          {q.status}
                        </span>
                        {q.status === "DRAFT" && activeUser.role === "SALES_REP" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/quotations/${q.id}/simulate`);
                            }}
                            className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                            title="Simulate Deal Strategy for this draft proposal"
                          >
                            <Zap className="w-2.5 h-2.5 text-amber-500" />
                            <span>Simulate ⚡</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Updated At */}
                    <td className="px-4 py-3.5 text-[var(--text-muted)] text-[11px]">
                      {q.updatedAt}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {q.status === "DRAFT" && activeUser.role === "SALES_REP" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/quotations/${q.id}/simulate`);
                            }}
                            className="btn-outline text-[11px] py-1 px-2.5 flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500 hover:text-white transition-all shadow-2xs cursor-pointer"
                            title="Open Strategy Simulator"
                          >
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>Simulate</span>
                          </button>
                        )}
                        <span
                          className="btn-outline text-[11px] py-1 px-2.5 flex items-center gap-1 font-medium group-hover:bg-[var(--primary)] group-hover:text-white group-hover:border-[var(--primary)] transition-all shadow-2xs"
                        >
                          <span>Open</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer */}
        {isLoading ? (
          <QuotationsPaginationSkeleton />
        ) : filteredQuotes.length > 0 ? (
          <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--card)]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div>
              Showing <span className="font-semibold text-[var(--text-main)]">{(validCurrentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-[var(--text-main)]">{Math.min(validCurrentPage * pageSize, filteredQuotes.length)}</span> of{" "}
              <span className="font-semibold text-[var(--text-main)]">{filteredQuotes.length}</span> deals
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
                className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card)]/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="px-3 py-1 font-mono text-xs text-[var(--text-main)]">
                Page {validCurrentPage} of {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card)]/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
