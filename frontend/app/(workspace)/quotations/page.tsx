"use client";

import React, { useState } from "react";
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
  RefreshCw,
} from "lucide-react";

export default function QuotationsPage() {
  const router = useRouter();
  const { activeUser } = useRole();
  const { quotations, isLoading, refetchQuotations } = useQuotations();
  const [filterTab, setFilterTab] = useState<"ALL" | "DRAFT" | "IN_REVIEW">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const draftCount = quotations.filter((q) => q.status === "DRAFT").length;
  const inReviewCount = quotations.filter((q) => q.status === "IN_REVIEW").length;
  const totalPipelineValue = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const avgMargin =
    quotations.length > 0
      ? (quotations.reduce((sum, q) => sum + (q.blendedMargin || 0), 0) / quotations.length).toFixed(1)
      : "0.0";

  const filteredQuotes = quotations.filter((q) => {
    if (filterTab !== "ALL" && q.status !== filterTab) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      return (
        q.id.toLowerCase().includes(qLower) ||
        q.customerName.toLowerCase().includes(qLower)
      );
    }
    return true;
  });

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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] text-[var(--text-main)] transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Fetch live quotes from backend API"
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

      {/* 2. Key Sales Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Active Quotations</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading" suppressHydrationWarning>
              {quotations.length} Deals
            </div>
            <div className="text-[11px] text-emerald-600 font-medium" suppressHydrationWarning>
              {draftCount} Drafts, {inReviewCount} In Review
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Weighted Pipeline Value</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading" suppressHydrationWarning>
              ₹{totalPipelineValue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium" suppressHydrationWarning>
              {quotations.length} Active Deals Tracked
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Blended Margin Floor</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading" suppressHydrationWarning>
              {avgMargin}%
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              Protected across tiers
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Inventory Feasibility</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading">100% Ready</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Main Central & East Hub
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)]/60 p-2 rounded-xl border border-[var(--border)]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterTab === "ALL"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            All Proposals ({quotations.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("DRAFT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterTab === "DRAFT"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            Drafts ({draftCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("IN_REVIEW")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterTab === "IN_REVIEW"
                ? "bg-[var(--primary)] text-white shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
            }`}
          >
            Under Review ({inReviewCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by quote # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* 3. Quotations List Table */}
      <div className="card-glass rounded-2xl border border-[var(--border)] overflow-hidden">
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
              {filteredQuotes.length === 0 ? (
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
                filteredQuotes.map((q) => (
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
                    </td>

                    {/* Updated At */}
                    <td className="px-4 py-3.5 text-[var(--text-muted)] text-[11px]">
                      {q.updatedAt}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
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
      </div>
    </div>
  );
}
