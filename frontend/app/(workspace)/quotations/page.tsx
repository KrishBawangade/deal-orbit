"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
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
} from "lucide-react";

interface QuoteSummary {
  id: string;
  customerName: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "ENTERPRISE";
  tierCeiling: number;
  lineItemsCount: number;
  subtotal: string;
  total: string;
  blendedMargin: number;
  marginStatus: "HIGH" | "MEDIUM" | "DANGER";
  riskScore: number;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "CUSTOMER_REVIEW";
  repName: string;
  updatedAt: string;
}

const SAMPLE_QUOTATIONS: QuoteSummary[] = [
  {
    id: "QT-2026-0043",
    customerName: "Acme Corp",
    tier: "GOLD",
    tierCeiling: 15,
    lineItemsCount: 2,
    subtotal: "₹18,20,000",
    total: "₹18,81,392",
    blendedMargin: 18.4,
    marginStatus: "MEDIUM",
    riskScore: 38.5,
    status: "IN_REVIEW",
    repName: "Sam Seller",
    updatedAt: "10 mins ago",
  },
  {
    id: "QT-2026-0044",
    customerName: "Stark Enterprises",
    tier: "ENTERPRISE",
    tierCeiling: 20,
    lineItemsCount: 4,
    subtotal: "₹8,90,000",
    total: "₹9,50,000",
    blendedMargin: 24.8,
    marginStatus: "HIGH",
    riskScore: 14.0,
    status: "DRAFT",
    repName: "Sam Seller",
    updatedAt: "1 hour ago",
  },
  {
    id: "QT-2026-0045",
    customerName: "Wayne Logistics",
    tier: "SILVER",
    tierCeiling: 10,
    lineItemsCount: 1,
    subtotal: "₹4,10,000",
    total: "₹4,48,600",
    blendedMargin: 22.1,
    marginStatus: "HIGH",
    riskScore: 12.0,
    status: "DRAFT",
    repName: "Sam Seller",
    updatedAt: "3 hours ago",
  },
];

export default function QuotationsPage() {
  const { activeUser } = useRole();
  const [filterTab, setFilterTab] = useState<"ALL" | "DRAFT" | "IN_REVIEW">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuotes = SAMPLE_QUOTATIONS.filter((q) => {
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
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
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
            All Proposals ({SAMPLE_QUOTATIONS.length})
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
            Drafts (2)
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
            Under Review (1)
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
              {filteredQuotes.map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-[var(--card-hover)]/60 transition-colors group"
                >
                  {/* Quote ID */}
                  <td className="px-4 py-3.5 font-mono font-bold text-[var(--primary)]">
                    {q.id}
                  </td>

                  {/* Customer Account & Tier */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-[var(--text-main)] text-sm">
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
                      <Link
                        href={`/quotations?id=${q.id}`}
                        className="btn-outline text-[11px] py-1 px-2.5 flex items-center gap-1 font-medium"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
