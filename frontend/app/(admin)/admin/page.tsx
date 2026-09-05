"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { RoleProvider, useRole } from "@/context/RoleContext";
import {
  Settings,
  Shield,
  Layers,
  Database,
  RefreshCw,
  ArrowLeft,
  Percent,
  Warehouse,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function AdminContent() {
  const { activeUser, reloadData, isReloading } = useRole();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Workspace Navbar */}
      <Navbar variant="workspace" logoHref="/dashboard" />

      {/* Admin Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumb & Navigation back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Link
                href="/dashboard"
                className="hover:text-[var(--text-main)] flex items-center gap-1 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sales Workspace</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-[var(--text-main)]">Back-end Configuration</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] font-heading flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span>Back-end Configuration & Admin Suite</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Configure master discount tier ceilings, category overrides, multi-warehouse shipping cost weights, and margin safety floors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => reloadData()}
              disabled={isReloading}
              className="btn-outline text-xs py-2 px-3 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin text-[var(--primary)]" : ""}`} />
              <span>Sync with ERP</span>
            </button>
          </div>
        </div>

        {/* Section 1: Customer Tier Ceilings & Category Overrides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Tiers */}
          <div className="card-glass p-5 rounded-2xl border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-main)] font-heading">
                  Customer Tier Discount Ceilings
                </h3>
              </div>
              <span className="badge badge-success text-[10px]">Active & Enforced</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div>
                  <div className="font-semibold text-[var(--text-main)]">Enterprise Tier</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Large strategic accounts</div>
                </div>
                <div className="font-mono font-bold text-sm text-[var(--primary)]">20.0% Max</div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div>
                  <div className="font-semibold text-[var(--text-main)]">Gold Tier (Acme Corp)</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Mid-market corporate</div>
                </div>
                <div className="font-mono font-bold text-sm text-[var(--primary)]">15.0% Max</div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div>
                  <div className="font-semibold text-[var(--text-main)]">Silver Tier</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Commercial standard</div>
                </div>
                <div className="font-mono font-bold text-sm text-[var(--primary)]">10.0% Max</div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div>
                  <div className="font-semibold text-[var(--text-main)]">Bronze Tier</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Entry accounts</div>
                </div>
                <div className="font-mono font-bold text-sm text-[var(--primary)]">5.0% Max</div>
              </div>
            </div>
          </div>

          {/* Category Overrides */}
          <div className="card-glass p-5 rounded-2xl border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-main)] font-heading">
                  Product Category Overrides
                </h3>
              </div>
              <span className="badge badge-accent text-[10px]">Policy Override</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div>
                  <div className="font-semibold text-[var(--text-main)]">Hardware Category</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Laptops, Servers, Storage</div>
                </div>
                <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">15.0% Ceiling</div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div>
                  <div className="font-semibold text-[var(--text-main)]">Software Category</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Licenses, SaaS seats</div>
                </div>
                <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">20.0% Ceiling</div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div>
                  <div className="font-semibold text-[var(--text-main)]">Services Category</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Deployment, Maintenance</div>
                </div>
                <div className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">10.0% Ceiling ⚠️</div>
              </div>

              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Line discounts exceeding category ceilings require Sales Manager approval.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Regional Warehouses & Shipping Multipliers */}
        <div className="card-glass p-5 rounded-2xl border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)] font-heading">
                Multi-Warehouse Logistics & Allocation Nodes
              </h3>
            </div>
            <span className="text-xs text-[var(--text-muted)]">2 Warehouses Linked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--text-main)]">Main Central Hub</span>
                <span className="badge badge-success text-[10px]">Primary Node</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">Weight Multiplier: 1.00x</div>
              <div className="text-[11px] text-[var(--text-muted)]">On-hand Stock: 1,450 Units</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--text-main)]">East Depot</span>
                <span className="badge badge-role-manager text-[10px]">Secondary Node</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">Weight Multiplier: 1.30x</div>
              <div className="text-[11px] text-[var(--text-muted)]">On-hand Stock: 820 Units</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleProvider>
      <AdminContent />
    </RoleProvider>
  );
}
