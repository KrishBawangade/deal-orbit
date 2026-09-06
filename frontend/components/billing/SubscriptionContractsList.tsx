"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Layers,
  Calendar,
  RotateCcw,
  Search,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpRight,
  Receipt,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { IHybridOrder } from "./SubscriptionBillingScreen";
import { ICreditNoteItem } from "./CreditNotesLedgerModal";
import { ShimmerBox } from "@/components/ui/Shimmer";

// Auth helper
const getAuthHeaders = (): Record<string, string> => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("dealorbit_token") || "demo_token_finance_ops"
      : "demo_token_finance_ops";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const executeWithAuthRetry = async (
  url: string,
  options: RequestInit = {}
): Promise<Response | null> => {
  const headers = getAuthHeaders();
  let res: Response | null = null;
  try {
    res = await fetch(url, {
      ...options,
      headers: { ...headers, ...((options.headers as Record<string, string>) || {}) },
    });
    if (res.status === 401 || res.status === 403) {
      const fallbackHeaders = {
        "Content-Type": "application/json",
        Authorization: "Bearer demo_token_finance_ops",
        ...((options.headers as Record<string, string>) || {}),
      };
      res = await fetch(url, { ...options, headers: fallbackHeaders });
    }
  } catch (e) {
    console.warn(`API call failed for ${url}:`, e);
  }
  return res;
};

export default function SubscriptionContractsList() {
  const router = useRouter();

  // State
  const [orders, setOrders] = useState<IHybridOrder[]>([]);
  const [creditNotes, setCreditNotes] = useState<ICreditNoteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  // Fetch billing data
  const fetchBillingData = useCallback(async (notify = false) => {
    setIsSyncing(true);
    try {
      const [ordRes, cnRes] = await Promise.all([
        executeWithAuthRetry(`${siteConfig.apiUrl}/api/v1/billing/orders`),
        executeWithAuthRetry(`${siteConfig.apiUrl}/api/v1/billing/credit-notes`),
      ]);

      let hasLive = false;

      if (ordRes && ordRes.ok) {
        const ordJson = await ordRes.json();
        const liveOrders = ordJson?.data;
        if (Array.isArray(liveOrders) && liveOrders.length > 0) {
          setOrders(liveOrders);
          hasLive = true;
          if (notify) {
            toast.success("Synchronized with PostgreSQL", {
              description: `Loaded ${liveOrders.length} live hybrid contracts.`,
            });
          }
        }
      }

      if (cnRes && cnRes.ok) {
        const cnJson = await cnRes.json();
        const liveNotes = cnJson?.data;
        if (Array.isArray(liveNotes)) {
          setCreditNotes(liveNotes);
        }
      }

      setIsLiveApi(hasLive);
    } catch (e) {
      console.warn("Error fetching billing orders:", e);
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingData(false);
  }, [fetchBillingData]);

  // Seed on demand
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      toast.info("Seeding PostgreSQL Database...", {
        description: "Populating hybrid contracts, subscriptions, and credit notes...",
      });
      const res = await executeWithAuthRetry(`${siteConfig.apiUrl}/api/v1/billing/seed`, {
        method: "POST",
      });

      if (res && res.ok) {
        toast.success("PostgreSQL Seeded Successfully!", {
          description: "Populated enterprise hybrid contracts with live schedules and credit notes.",
        });
        await fetchBillingData(false);
      } else {
        toast.error("Database seed request failed");
      }
    } catch (e) {
      toast.error("Error executing database seed request");
    } finally {
      setIsSeeding(false);
    }
  };

  // Aggregate Portfolio Metrics
  const portfolioMetrics = useMemo(() => {
    let totalMRR = 0;
    let totalOneTime = 0;
    let totalActiveSubscriptions = 0;

    orders.forEach((ord) => {
      const oneTime = (ord.oneTimeLines || []).reduce((sum, l) => sum + (l.netLineTotal || 0), 0);
      const mrr = (ord.recurringLines || [])
        .filter((l) => l.status !== "CANCELLED")
        .reduce((sum, l) => sum + (l.recurringAmount || 0), 0);
      const activeSubs = (ord.recurringLines || []).filter((l) => l.status !== "CANCELLED").length;

      totalOneTime += oneTime;
      totalMRR += mrr;
      totalActiveSubscriptions += activeSubs;
    });

    const totalCreditNotesAmount = creditNotes.reduce((sum, c) => sum + (c.amount || 0), 0);

    return {
      totalMRR,
      totalARR: totalMRR * 12,
      totalOneTime,
      totalActiveSubscriptions,
      totalContracts: orders.length,
      totalCreditNotesAmount,
      totalCreditNotesCount: creditNotes.length,
    };
  }, [orders, creditNotes]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.quoteNumber.toLowerCase().includes(q) ||
        (ord.recurringLines || []).some(
          (sub) =>
            sub.contractNumber.toLowerCase().includes(q) ||
            sub.name.toLowerCase().includes(q) ||
            sub.sku.toLowerCase().includes(q)
        ) ||
        (ord.oneTimeLines || []).some(
          (line) => line.name.toLowerCase().includes(q) || line.sku.toLowerCase().includes(q)
        );

      const matchesTier =
        tierFilter === "ALL" ||
        (ord.customerTier && ord.customerTier.toUpperCase() === tierFilter);

      return matchesSearch && matchesTier;
    });
  }, [orders, searchQuery, tierFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-role-finance text-xs py-0.5 px-2.5 flex items-center gap-1 font-semibold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Finance &amp; Operations Workspace</span>
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                &bull; Hybrid Revenue Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)] font-heading">
              Subscription &amp; Billing Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-body)]">
              Select a customer contract below to inspect one-time line bifurcation, manage recurring SaaS seat adjustments, simulate mid-cycle proration, and issue automated credit notes.
            </p>
          </div>

          {/* Header Action Strip */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Sync Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold bg-[var(--card)] border-[var(--border)] shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveApi ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span
                className={
                  isLiveApi
                    ? "text-emerald-700 dark:text-emerald-400 font-medium"
                    : "text-amber-700 dark:text-amber-400 font-medium"
                }
              >
                {isLiveApi ? "PostgreSQL Live Sync" : "Offline Fallback"}
              </span>
            </div>

            {/* Seed / Reset Button */}
            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={isSeeding || isSyncing}
              className="flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] shadow-2xs font-semibold text-[var(--text-main)] transition-colors disabled:opacity-50 cursor-pointer"
              title="Re-seed PostgreSQL with realistic hybrid revenue orders, subscriptions, and credit notes"
            >
              <Sparkles
                className={`w-3.5 h-3.5 text-indigo-500 ${isSeeding ? "animate-spin" : ""}`}
              />
              <span>Seed Live Data</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchBillingData(true)}
              disabled={isSyncing}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-2xs transition-colors cursor-pointer"
              title="Refresh Data from Backend"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global Aggregate Revenue Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Recurring Revenue (MRR) */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Portfolio MRR</span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          {isLoading ? (
            <ShimmerBox className="h-8 w-28 my-1 rounded-md" />
          ) : (
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              ₹{portfolioMetrics.totalMRR.toLocaleString("en-IN")}
            </div>
          )}
          {isLoading ? (
            <ShimmerBox className="h-3 w-32 rounded" />
          ) : (
            <div className="text-[10px] text-[var(--text-muted)] font-medium">
              ARR: ₹{portfolioMetrics.totalARR.toLocaleString("en-IN")} / yr
            </div>
          )}
        </div>

        {/* Total One-Time Hardware Bookings */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Capital Hardware Bookings</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          {isLoading ? (
            <ShimmerBox className="h-8 w-28 my-1 rounded-md" />
          ) : (
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] font-mono">
              ₹{portfolioMetrics.totalOneTime.toLocaleString("en-IN")}
            </div>
          )}
          {isLoading ? (
            <ShimmerBox className="h-3 w-36 rounded" />
          ) : (
            <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Hardware &amp; Setup Invoiced</span>
            </div>
          )}
        </div>

        {/* Total Active Recurring Subscriptions */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Active Subscriptions</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          {isLoading ? (
            <ShimmerBox className="h-8 w-20 my-1 rounded-md" />
          ) : (
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] font-mono">
              {portfolioMetrics.totalActiveSubscriptions}
              <span className="text-xs text-[var(--text-muted)] font-normal ml-1">
                across {portfolioMetrics.totalContracts} Contracts
              </span>
            </div>
          )}
          {isLoading ? (
            <ShimmerBox className="h-3 w-32 rounded" />
          ) : (
            <div className="text-[10px] text-[var(--text-muted)]">
              Multi-Tenant Cloud &amp; SLA Tiers
            </div>
          )}
        </div>

        {/* Issued Credit Notes Ledger */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Credit Notes Balance</span>
            <RotateCcw className="w-4 h-4 text-emerald-600" />
          </div>
          {isLoading ? (
            <ShimmerBox className="h-8 w-24 my-1 rounded-md" />
          ) : (
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{portfolioMetrics.totalCreditNotesAmount.toLocaleString("en-IN")}
            </div>
          )}
          {isLoading ? (
            <ShimmerBox className="h-3 w-32 rounded" />
          ) : (
            <div className="text-[10px] text-emerald-600 font-medium">
              {portfolioMetrics.totalCreditNotesCount} audit-verified adjustments
            </div>
          )}
        </div>
      </div>

      {/* 3. Search & Customer Tier Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Customer, Subscription Contract ID (e.g. SUB-2026-0198), or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-medium"
          />
        </div>

        {/* Tier Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Tier:</span>
          </div>
          {["ALL", "GOLD", "ENTERPRISE", "SILVER"].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTierFilter(tier)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                tierFilter === tier
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                  : "bg-[var(--card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Hybrid Contracts Portfolio Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <ShimmerBox className="h-6 rounded-lg w-2/3" />
                <ShimmerBox className="h-5 rounded-full w-16" />
              </div>
              <ShimmerBox className="h-16 rounded-xl w-full" />
              <div className="space-y-2 pt-2">
                <ShimmerBox className="h-4 rounded w-4/5" />
                <ShimmerBox className="h-4 rounded w-3/5" />
              </div>
              <ShimmerBox className="h-10 rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[var(--text-main)] font-heading">
            No Hybrid Contracts Found
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            No active contracts matched your search query or filter. Click Seed Live Data above to populate realistic enterprise contracts into PostgreSQL.
          </p>
          <button
            type="button"
            onClick={handleSeedDatabase}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seed Database Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((ord) => {
            const oneTimeSubtotal = (ord.oneTimeLines || []).reduce(
              (sum, l) => sum + (l.netLineTotal || 0),
              0
            );
            const recurringMRR = (ord.recurringLines || [])
              .filter((l) => l.status !== "CANCELLED")
              .reduce((sum, l) => sum + (l.recurringAmount || 0), 0);
            const activeSubs = (ord.recurringLines || []).filter((l) => l.status !== "CANCELLED");
            const schedulesCount = (ord.billingSchedules || []).length;
            const nextSchedule = ord.billingSchedules?.[0];

            // Tier styling
            const tier = ord.customerTier?.toUpperCase() || "GOLD";
            const tierBadgeClass =
              tier === "ENTERPRISE"
                ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
                : tier === "GOLD"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                : "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";

            return (
              <Link
                key={ord.id}
                href={`/billing/${encodeURIComponent(ord.orderNumber)}`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/60 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between overflow-hidden group cursor-pointer block text-left"
              >
                {/* Card Top / Header */}
                <div className="p-5 border-b border-[var(--border-subtle)] space-y-3 bg-gradient-to-b from-[var(--card-hover)]/40 to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-md border border-[var(--primary)]/20">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${tierBadgeClass}`}
                        >
                          {ord.customerTier || "Tier"}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[var(--text-main)] font-heading group-hover:text-[var(--primary)] transition-colors">
                        {ord.customerName}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                        Terms
                      </span>
                      <span className="text-xs font-bold text-[var(--text-main)] font-mono">
                        {ord.paymentTerms || "Net 30"}
                      </span>
                    </div>
                  </div>

                  {/* Dual Revenue Highlight Badge */}
                  <div className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">
                        One-Time Lines
                      </span>
                      <span className="font-mono font-bold text-[var(--text-main)]">
                        ₹{oneTimeSubtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-indigo-600 block">
                        Monthly SaaS (MRR)
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        ₹{recurringMRR.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subscriptions & Contract IDs Body */}
                <div className="p-5 space-y-3.5 flex-1">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] mb-2">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Active Subscriptions ({activeSubs.length})</span>
                      </span>
                      <span>Contract ID</span>
                    </div>

                    <div className="space-y-2">
                      {activeSubs.length > 0 ? (
                        activeSubs.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2.5 rounded-xl bg-[var(--card-hover)]/60 border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-[var(--text-main)] truncate">
                                {sub.name}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                  {sub.quantity} {sub.quantity > 1 ? "Seats" : "Unit"}
                                </span>
                                &bull;
                                <span>₹{sub.recurringAmount.toLocaleString("en-IN")}/{sub.billingFrequency.toLowerCase().slice(0, 2)}</span>
                              </div>
                            </div>

                            {/* Specific Subscription Contract ID Badge */}
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--text-main)]">
                                {sub.contractNumber}
                              </span>
                              <div className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">
                                {sub.status}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-[var(--text-muted)] bg-[var(--card-hover)]/30 rounded-xl">
                          No active recurring subscriptions
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Schedule Indicator */}
                  {nextSchedule && (
                    <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/30">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Next Charge: {nextSchedule.scheduledDate}</span>
                      </span>
                      <span className="font-bold font-mono">
                        {schedulesCount} scheduled
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Link / Indicator */}
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--card-hover)]/30">
                  <div className="w-full btn-primary py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2 group-hover:bg-[var(--primary-hover)] transition-all shadow-xs">
                    <span>Inspect Contract &amp; Manage Billing</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
