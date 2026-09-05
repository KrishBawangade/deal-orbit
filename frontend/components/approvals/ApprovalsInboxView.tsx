"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useQuotations, type QuotationRecord } from "@/context/QuotationsContext";
import { useRole } from "@/context/RoleContext";
import type { Role } from "@/types";
import DiscountApprovalScreen from "./DiscountApprovalScreen";

interface ApprovalsInboxViewProps {
  initialQuoteId?: string;
}

type TabType = "PENDING" | "HIGH_RISK" | "APPROVED" | "REVISIONS";

export function isAwaitingSalesManager(q: QuotationRecord): boolean {
  if (q.status !== "IN_REVIEW") return false;
  if (q.auditTrail?.some((a) => a.action?.startsWith("APPROVED"))) return false;
  return q.approvalStage !== "FINANCE" && q.approvalStage !== "COMPLETED";
}

export function isAwaitingFinance(q: QuotationRecord): boolean {
  if (q.status !== "IN_REVIEW") return false;
  // A quote in review requires Finance sign-off ONLY when it is officially at stage 'FINANCE'
  return q.approvalStage === "FINANCE";
}

function checkQuoteTabEligibility(
  q: QuotationRecord,
  tab: TabType,
  role: Role
): boolean {
  switch (tab) {
    case "PENDING":
      if (role === "FINANCE_OPS") {
        return isAwaitingFinance(q);
      }
      if (role === "SALES_MANAGER") {
        return isAwaitingSalesManager(q);
      }
      return q.status === "IN_REVIEW";

    case "HIGH_RISK": {
      const isHigh = q.riskScore > 50 || q.blendedMargin < 18;
      if (!isHigh) return false;
      if (role === "FINANCE_OPS") {
        return isAwaitingFinance(q) || Boolean(q.auditTrail?.some((a) => a.actorRole === "FINANCE_OPS"));
      }
      if (role === "SALES_MANAGER") {
        return isAwaitingSalesManager(q) || Boolean(q.auditTrail?.some((a) => a.actorRole === "SALES_MANAGER"));
      }
      return true;
    }

    case "APPROVED": {
      return (
        q.status === "APPROVED" ||
        q.approvalStage === "COMPLETED" ||
        Boolean(q.auditTrail?.some((a) => a.action?.startsWith("APPROVED")))
      );
    }

    case "REVISIONS": {
      const isRevision = q.approvalStage === "RETURNED" || q.status === "REJECTED";
      if (!isRevision) return false;
      if (role === "FINANCE_OPS") {
        return Boolean(
          q.auditTrail?.some(
            (a) => a.actorRole === "FINANCE_OPS" && (a.action === "RETURNED_FOR_REVISION" || a.action === "REJECTED")
          )
        );
      }
      if (role === "SALES_MANAGER") {
        return (
          Boolean(
            q.auditTrail?.some(
              (a) => a.actorRole === "SALES_MANAGER" && (a.action === "RETURNED_FOR_REVISION" || a.action === "REJECTED")
            )
          ) || q.approvalStage === "RETURNED"
        );
      }
      return true;
    }

    default:
      return true;
  }
}

export default function ApprovalsInboxView({ initialQuoteId }: ApprovalsInboxViewProps) {
  const { quotations } = useQuotations();
  const { activeUser, currentRole } = useRole();

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(initialQuoteId || null);
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter quotes based on activeTab, search, and activeRole
  const filteredQuotes = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.repName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      return checkQuoteTabEligibility(q, activeTab, currentRole);
    });
  }, [quotations, activeTab, searchQuery, currentRole]);

  // Tab counts dynamically calculated per role
  const tabCounts = useMemo(() => {
    return {
      pending: quotations.filter((q) => checkQuoteTabEligibility(q, "PENDING", currentRole)).length,
      highRisk: quotations.filter((q) => checkQuoteTabEligibility(q, "HIGH_RISK", currentRole)).length,
      approved: quotations.filter((q) => checkQuoteTabEligibility(q, "APPROVED", currentRole)).length,
      revisions: quotations.filter((q) => checkQuoteTabEligibility(q, "REVISIONS", currentRole)).length,
    };
  }, [quotations, currentRole]);

  // Aggregate governance metrics tailored by role
  const metrics = useMemo(() => {
    const pending = quotations.filter((q) => q.status === "IN_REVIEW");
    const managerPending = pending.filter(isAwaitingSalesManager);
    const financePending = pending.filter(isAwaitingFinance);

    const highRiskValue = quotations
      .filter((q) => q.riskScore > 50 || q.blendedMargin < 18)
      .reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    return {
      pendingCount: tabCounts.pending,
      managerPendingCount: managerPending.length,
      financePendingCount: financePending.length,
      highRiskExposureFormatted: `₹${(highRiskValue / 100000).toFixed(1)}L`,
    };
  }, [quotations, tabCounts.pending]);

  // Find currently selected quote
  const selectedQuote = useMemo(() => {
    if (!selectedQuoteId) return null;
    return quotations.find((q) => q.id.toLowerCase() === selectedQuoteId.toLowerCase()) || null;
  }, [quotations, selectedQuoteId]);

  // If a quotation is selected, show the Discount Approval Screen
  if (selectedQuote) {
    return (
      <DiscountApprovalScreen
        quotation={selectedQuote}
        onBack={() => setSelectedQuoteId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-[var(--text-body)]">
      {/* Top Title & Role Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
                Discount Approvals & Commercial Governance
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Centralized B4 Inbox · Tier-1 Sales Management & Tier-2 Finance Sequential Governance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[var(--border)] shadow-xs text-xs">
          <span className="text-[var(--text-muted)]">Active Role:</span>
          <span className="font-bold text-[var(--text-main)]">{activeUser.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {activeUser.roleLabel}
          </span>
        </div>
      </div>

      {/* KPI Governance Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-white shadow-xs space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Governance Review</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-[var(--text-main)]">
              {metrics.pendingCount}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">quotations</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-white shadow-xs space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tier-1 (Sales Manager) Queue</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-indigo-600">
              {metrics.managerPendingCount}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">awaiting Morgan</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-white shadow-xs space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tier-2 (Finance Director) Queue</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-600">
              {metrics.financePendingCount}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">awaiting Elena</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-white shadow-xs space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span>High Risk Deal Exposure</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-rose-600">
              {metrics.highRiskExposureFormatted}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">aggregate total</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "PENDING"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending Review ({tabCounts.pending})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("HIGH_RISK")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "HIGH_RISK"
                ? "bg-white text-rose-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            High Risk &gt;50 ({tabCounts.highRisk})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("APPROVED")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "APPROVED"
                ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approved Ledger ({tabCounts.approved})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("REVISIONS")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "REVISIONS"
                ? "bg-white text-amber-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Revisions / Rejected ({tabCounts.revisions})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quote, customer, rep..."
            className="w-full text-xs rounded-xl border border-[var(--border)] bg-white pl-8 pr-3 py-2 text-[var(--text-main)] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* Quotations List */}
      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center space-y-2 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              {activeTab === "PENDING"
                ? "Inbox All Clear"
                : activeTab === "HIGH_RISK"
                ? "No High Risk Deals"
                : activeTab === "APPROVED"
                ? "No Approved Deals"
                : "No Returned or Rejected Deals"}
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {activeTab === "PENDING" && currentRole === "FINANCE_OPS"
                ? "No quotations currently awaiting Finance sign-off. High-risk deals requiring Tier-2 approval will appear here once approved by the Sales Manager."
                : activeTab === "HIGH_RISK" && currentRole === "FINANCE_OPS"
                ? "No high-risk quotations currently active in the Finance queue."
                : `No quotations found under ${activeTab.toLowerCase().replace("_", " ")} criteria for ${activeUser.roleLabel}.`}
            </p>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const isHigh = quote.riskScore > 50;
            const isMedium = quote.riskScore >= 20 && quote.riskScore <= 50;
            const isDual = isHigh || quote.blendedMargin < 18 || quote.approvalRequirement === "DUAL_REQUIRED";

            return (
              <div
                key={quote.id}
                onClick={() => setSelectedQuoteId(quote.id)}
                className="group rounded-2xl border border-[var(--border)] bg-white hover:border-indigo-400 hover:bg-slate-50/70 p-5 shadow-xs transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[var(--text-main)] group-hover:text-indigo-600 transition-colors">
                      {quote.id}
                    </span>
                    <span className="font-bold text-sm text-[var(--text-main)]">
                      {quote.customerName}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                      {quote.tier} (Ceiling: {quote.tierCeiling}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        isHigh
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : isMedium
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      Risk: {quote.riskScore.toFixed(1)} {isHigh ? "(High Risk)" : isMedium ? "(Medium Risk)" : "(Low Risk)"}
                    </span>

                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-slate-100 border border-slate-200 text-slate-700">
                      {isDual ? "Two-Tier (Mgr + Fin)" : "Tier-1 (Mgr Only)"}
                    </span>

                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Sub-line info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-100 text-[var(--text-muted)]">
                  <div>
                    <span className="block text-[10px] font-medium uppercase tracking-wider">Net Value</span>
                    <span className="font-mono font-bold text-[var(--text-main)]">{quote.total}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-medium uppercase tracking-wider">Blended Margin</span>
                    <span
                      className={`font-mono font-bold flex items-center gap-1 ${
                        quote.blendedMargin < 18 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {quote.blendedMargin.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-medium uppercase tracking-wider">Account Rep</span>
                    <span className="font-semibold text-[var(--text-main)]">{quote.repName}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-medium uppercase tracking-wider">Current Stage</span>
                    <span
                      className={`font-semibold ${
                        quote.status === "APPROVED" || quote.approvalStage === "COMPLETED"
                          ? "text-emerald-600"
                          : "text-indigo-600"
                      }`}
                    >
                      {quote.status === "APPROVED" || quote.approvalStage === "COMPLETED"
                        ? "Approved"
                        : isAwaitingFinance(quote)
                        ? "Pending Finance Director"
                        : isAwaitingSalesManager(quote)
                        ? "Pending Sales Manager"
                        : quote.approvalStage || quote.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
