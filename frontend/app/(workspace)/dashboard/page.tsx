"use client";

import React from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import {
  FileText,
  Kanban,
  Plus,
  RefreshCw,
  Settings,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function SalesWorkspaceDashboard() {
  const { activeUser, reloadData, isReloading } = useRole();

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold border border-[var(--primary)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sales Workspace Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] font-heading">
              Welcome back, {activeUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-body)]">
              Build living quotations, configure margins, simulate deal strategies, and monitor pipeline velocity in real-time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quotations/new"
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Quotation</span>
            </Link>

            <Link
              href="/pipeline"
              className="btn-outline text-xs py-2 px-4 flex items-center gap-2"
            >
              <Kanban className="w-4 h-4 text-[var(--primary)]" />
              <span>Pipeline Kanban</span>
            </Link>

            <button
              type="button"
              onClick={() => reloadData()}
              disabled={isReloading}
              className="btn-ghost text-xs py-2 px-3 border border-[var(--border)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh pricing, stock & approvals"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin text-[var(--primary)]" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Sales Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Active Quotations</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading">3 Deals</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              2 Drafts, 1 Under Review
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Weighted Pipeline Value</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading">₹32,80,000</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              +14% vs. target quota
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Blended Margin Floor</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading">21.5%</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Protected across tiers
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
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
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Direct Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quotations Card */}
        <div className="card-glass p-6 rounded-2xl border border-[var(--border)] space-y-4 hover:border-[var(--primary)]/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
              Quotations Management
            </h2>
            <p className="text-xs text-[var(--text-body)]">
              View active and draft proposals, launch the Quotation Builder, inspect real-time gross margins, and submit out-of-policy discounts for review.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]/70 text-xs">
            <span className="text-[var(--text-muted)]">3 Active Proposals Staged</span>
            <Link
              href="/quotations"
              className="font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
            >
              <span>Open Quotations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Pipeline Card */}
        <div className="card-glass p-6 rounded-2xl border border-[var(--border)] space-y-4 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Kanban className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
              Deal Pipeline Board
            </h2>
            <p className="text-xs text-[var(--text-body)]">
              Track deal velocity across Draft, Under Review, Negotiating, and Confirmed stages with blended risk badges and rep assignment.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]/70 text-xs">
            <span className="text-[var(--text-muted)]">5 Pipeline Stages Active</span>
            <Link
              href="/pipeline"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Open Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Active Quotations Table */}
      <div className="card-glass rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)] font-heading">
              Recent Quotations in Working Session
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Latest transactions associated with {activeUser.name}
            </p>
          </div>

          <Link
            href="/quotations"
            className="text-xs text-[var(--primary)] font-semibold hover:underline"
          >
            View all proposals →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--card)]/50 text-[var(--text-muted)] uppercase tracking-wider text-[10px] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-4 py-3">Quote ID</th>
                <th className="px-4 py-3">Customer Account</th>
                <th className="px-4 py-3">Total Value</th>
                <th className="px-4 py-3">Blended Margin</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]/70 text-[var(--text-body)]">
              <tr className="hover:bg-[var(--card-hover)]/60 transition-colors">
                <td className="px-4 py-3.5 font-mono font-medium text-[var(--text-main)]">
                  QT-2026-0043
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[var(--text-main)]">Acme Corp</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Gold Tier (15% Max)</div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-[var(--text-main)]">
                  ₹18,81,392
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge badge-warning text-[10px]">
                    18.4% (Req Mgr)
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge badge-accent text-[10px]">
                    IN_REVIEW
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link
                    href="/quotations"
                    className="btn-ghost text-[11px] py-1 px-2.5 border border-[var(--border)] rounded-md font-medium"
                  >
                    Inspect Deal
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-[var(--card-hover)]/60 transition-colors">
                <td className="px-4 py-3.5 font-mono font-medium text-[var(--text-main)]">
                  QT-2026-0044
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[var(--text-main)]">Stark Enterprises</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Enterprise Tier (20% Max)</div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-[var(--text-main)]">
                  ₹9,50,000
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge badge-success text-[10px]">
                    24.8% High
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge badge-role-rep text-[10px]">
                    DRAFT
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link
                    href="/quotations"
                    className="btn-ghost text-[11px] py-1 px-2.5 border border-[var(--border)] rounded-md font-medium"
                  >
                    Edit Draft
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-[var(--card-hover)]/60 transition-colors">
                <td className="px-4 py-3.5 font-mono font-medium text-[var(--text-main)]">
                  QT-2026-0045
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[var(--text-main)]">Wayne Logistics</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Silver Tier (10% Max)</div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-[var(--text-main)]">
                  ₹4,48,600
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge badge-success text-[10px]">
                    22.1% High
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="badge badge-role-rep text-[10px]">
                    DRAFT
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link
                    href="/quotations"
                    className="btn-ghost text-[11px] py-1 px-2.5 border border-[var(--border)] rounded-md font-medium"
                  >
                    Edit Draft
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
