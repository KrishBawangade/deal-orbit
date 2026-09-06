"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Boxes,
  Package,
  PackageCheck,
  RefreshCw,
  Search,
  ChevronRight,
  Clock,
  CreditCard,
  Sparkles,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { IOrderItem } from "./FulfillmentSplitScreen";
import { ShimmerBox } from "@/components/ui/Shimmer";

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

export default function FulfillmentOrdersList() {
  const router = useRouter();
  // State initialized to empty array - purely populated from PostgreSQL backend
  const [orders, setOrders] = useState<IOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Client-Side Instant Filtering (runs in memory over backend records)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Fetch sales orders strictly from backend REST API
  const fetchOrders = useCallback(async (notify = false) => {
    setIsSyncing(true);
    try {
      let headers = getAuthHeaders();
      let res = await fetch(`${siteConfig.apiUrl}/api/v1/fulfillment/orders`, { headers });

      // Auto-retry with demo token if stored session token is expired
      if (res.status === 401) {
        headers = {
          "Content-Type": "application/json",
          Authorization: "Bearer demo_token_finance_ops",
        };
        res = await fetch(`${siteConfig.apiUrl}/api/v1/fulfillment/orders`, { headers });
      }

      if (res.ok) {
        const json = await res.json();
        const rawOrders = json?.data;
        if (Array.isArray(rawOrders)) {
          const mapped: IOrderItem[] = rawOrders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName || "Enterprise Customer",
            customerTier: o.customerTier,
            productName: o.productName || 'Enterprise Pro Laptop 16"',
            productId: o.productId,
            sku: o.sku || "HW-LAPTOP-16",
            requestedQty: o.requestedQty || 20,
            totalRequestedQty: o.totalRequestedQty,
            totalBackorderedQty: o.totalBackorderedQty,
            totalFulfilledQty: o.totalFulfilledQty,
            unitPrice: Number(o.unitPrice) || 85000,
            totalAmount: Number(o.totalAmount) || 0,
            status: o.status || "PENDING",
            fulfillmentSplits: o.fulfillmentSplits || [],
            backorders: o.backorders || [],
          }));
          setOrders(mapped);
          setIsLiveApi(true);
          if (notify) {
            toast.success("Backend Orders Synchronized", {
              description: `Fetched ${mapped.length} live sales orders directly from PostgreSQL database.`,
            });
          }
        }
      } else {
        toast.error("Failed to load orders from backend", {
          description: `Server responded with status ${res.status}.`,
        });
      }
    } catch (err: any) {
      console.error("Fulfillment orders fetch error:", err);
      toast.error("Unable to connect to backend server");
      setIsLiveApi(false);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, []);

  // Seed backend database if needed
  const handleSeedDatabase = async () => {
    setIsSyncing(true);
    try {
      let headers = getAuthHeaders();
      let res = await fetch(`${siteConfig.apiUrl}/api/v1/fulfillment/seed`, {
        method: "POST",
        headers,
      });

      if (res.status === 401) {
        headers = {
          "Content-Type": "application/json",
          Authorization: "Bearer demo_token_finance_ops",
        };
        res = await fetch(`${siteConfig.apiUrl}/api/v1/fulfillment/seed`, {
          method: "POST",
          headers,
        });
      }

      if (res.ok) {
        toast.success("PostgreSQL Seeded Successfully", {
          description: "Populated 3 warehouses, live stocks, and 5 sales orders in backend.",
        });
        await fetchOrders(false);
      } else {
        toast.error("Failed to seed backend database");
      }
    } catch {
      toast.error("Error executing database seed request");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Client-side computed metrics over live backend records
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const processingCount = orders.filter((o) => o.status === "PROCESSING" || o.status === "PARTIALLY_FULFILLED").length;
  const fulfilledCount = orders.filter((o) => o.status === "FULFILLED").length;
  const totalPipelineValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Client-Side filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        o.status === statusFilter ||
        (statusFilter === "PROCESSING" && o.status === "PARTIALLY_FULFILLED");
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.sku.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] font-heading">
                Fulfillment &amp; Orders Queue
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-body)]">
              Confirmed sales orders fetched live from PostgreSQL database. Select an order to evaluate greedy multi-warehouse split, dispatch manifests, and backorder consolidation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => fetchOrders(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-main)] shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Refresh sales orders live from backend database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[var(--primary)]" : ""}`} />
              <span>Sync Live Data</span>
            </button>

            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-main)] shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Seed backend database with demo sales orders"
            >
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Seed PostgreSQL</span>
            </button>

            <Link
              href="/billing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
              title="Open Hybrid Billing & Subscriptions Screen"
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-200" />
              <span>Hybrid Billing</span>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Orders */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Orders in Queue</div>
            {isLoading ? (
              <ShimmerBox className="h-7 w-24 my-1 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-[var(--text-main)] font-heading">
                {totalOrdersCount} Orders
              </div>
            )}
            {isLoading ? (
              <ShimmerBox className="h-3 w-32 mt-1 rounded" />
            ) : (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {pendingCount} Awaiting Allocation
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Pending Allocation */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Pending Split</div>
            {isLoading ? (
              <ShimmerBox className="h-7 w-24 my-1 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-heading">
                {pendingCount} Orders
              </div>
            )}
            {isLoading ? (
              <ShimmerBox className="h-3 w-32 mt-1 rounded" />
            ) : (
              <div className="text-[11px] text-[var(--text-muted)]">
                Requires warehouse allocation
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: In Picking / Dispatched */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Active Dispatch</div>
            {isLoading ? (
              <ShimmerBox className="h-7 w-24 my-1 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-heading">
                {processingCount + fulfilledCount} Active
              </div>
            )}
            {isLoading ? (
              <ShimmerBox className="h-3 w-32 mt-1 rounded" />
            ) : (
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                {processingCount} Processing, {fulfilledCount} Fulfilled
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Pipeline Value */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Fulfillment Pipeline Value</div>
            {isLoading ? (
              <ShimmerBox className="h-7 w-28 my-1 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-[var(--text-main)] font-heading">
                ₹{totalPipelineValue.toLocaleString("en-IN")}
              </div>
            )}
            {isLoading ? (
              <ShimmerBox className="h-3 w-32 mt-1 rounded" />
            ) : (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Live from PostgreSQL
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Instant Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)]/60 p-2.5 rounded-xl border border-[var(--border)]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { key: "ALL", label: `All Orders (${totalOrdersCount})` },
              { key: "PENDING", label: `Pending (${pendingCount})` },
              { key: "PROCESSING", label: `Processing (${processingCount})` },
              { key: "FULFILLED", label: `Fulfilled (${fulfilledCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by order #, customer, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* 4. Orders List Table */}
      <div className="card-glass rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--card)]/80 text-[var(--text-muted)] uppercase tracking-wider text-[10px] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-4 py-3.5">Order Number</th>
                <th className="px-4 py-3.5">Customer &amp; Tier</th>
                <th className="px-4 py-3.5">Target Product &amp; SKU</th>
                <th className="px-4 py-3.5">Allocation &amp; Progress</th>
                <th className="px-4 py-3.5">Total Value</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]/70 text-[var(--text-body)]">
              {isLoading ? (
                // Shimmer Wave Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)]/70">
                    <td className="px-4 py-4">
                      <ShimmerBox className="h-4 w-28 rounded" />
                    </td>
                    <td className="px-4 py-4 space-y-1.5">
                      <ShimmerBox className="h-4 w-32 rounded" />
                      <ShimmerBox className="h-3 w-16 rounded" />
                    </td>
                    <td className="px-4 py-4 space-y-1.5">
                      <ShimmerBox className="h-4 w-44 rounded" />
                      <ShimmerBox className="h-3 w-24 rounded" />
                    </td>
                    <td className="px-4 py-4 space-y-1.5">
                      <ShimmerBox className="h-4 w-32 rounded" />
                      <ShimmerBox className="h-2 w-28 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <ShimmerBox className="h-4 w-20 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <ShimmerBox className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ShimmerBox className="h-7 w-24 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-[var(--text-muted)]/40" />
                      <p className="text-sm font-semibold text-[var(--text-main)]">
                        {orders.length === 0 ? "No orders in PostgreSQL database" : "No matching orders found"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] max-w-sm">
                        {orders.length === 0
                          ? "Database has no sales orders. Click 'Seed PostgreSQL' to populate demonstration orders."
                          : `No orders matching "${searchQuery}" in this filter.`}
                      </p>
                      {orders.length === 0 && (
                        <button
                          type="button"
                          onClick={handleSeedDatabase}
                          disabled={isSyncing}
                          className="mt-3 btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Seed PostgreSQL Orders</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  // Calculate fulfilled units
                  const totalFulfilled = (order.fulfillmentSplits || []).reduce((acc, split) => {
                    const lineTotal = (split.fulfillmentLines || split.lines || []).reduce(
                      (lSum: number, l: any) => lSum + Number(l.quantityFulfilled || 0),
                      0
                    );
                    return acc + (lineTotal > 0 ? lineTotal : 0);
                  }, 0);

                  const progressPct =
                    order.requestedQty > 0
                      ? Math.min(100, Math.round((totalFulfilled / order.requestedQty) * 100))
                      : 0;

                  const splitsCount = (order.fulfillmentSplits || []).length;
                  const backordersCount = (order.backorders || []).filter(
                    (b) => b.status === "PENDING"
                  ).length;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/fulfillment/${encodeURIComponent(order.orderNumber)}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/fulfillment/${encodeURIComponent(order.orderNumber)}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      className="hover:bg-[var(--primary)]/5 transition-all group cursor-pointer focus:outline-none focus:bg-[var(--primary)]/10"
                      title={`Open fulfillment split for ${order.orderNumber} (${order.customerName})`}
                    >
                      {/* Order Number */}
                      <td className="px-4 py-3.5 font-mono font-bold text-[var(--primary)] group-hover:underline">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs">{order.orderNumber}</span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Account & Tier */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[var(--text-main)] text-xs group-hover:text-[var(--primary)] transition-colors">
                          {order.customerName}
                        </div>
                        {order.customerTier && (
                          <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono px-1 py-0.2 rounded bg-[var(--card-hover)] border border-[var(--border-subtle)] text-[9px] uppercase font-semibold">
                              {order.customerTier} Tier
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Product & SKU */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-[var(--text-main)] text-xs truncate max-w-[220px]" title={order.productName}>
                          {order.productName}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                          SKU: {order.sku} &bull; {order.requestedQty} Units
                        </div>
                      </td>

                      {/* Allocation & Progress */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1.5 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[var(--text-main)]">
                              {totalFulfilled} / {order.requestedQty} Units
                            </span>
                            <span className="font-mono text-[10px] text-[var(--text-muted)]">
                              {progressPct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--card-hover)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                            <div
                              className={`h-full transition-all duration-300 ${
                                progressPct === 100
                                  ? "bg-emerald-500"
                                  : progressPct > 0
                                  ? "bg-blue-500"
                                  : "bg-amber-500/40"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                            {splitsCount > 0 ? (
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                {splitsCount} {splitsCount === 1 ? "Shipment" : "Shipments"}
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">
                                Unallocated
                              </span>
                            )}
                            {backordersCount > 0 && (
                              <>
                                <span>&bull;</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  <span>{order.totalBackorderedQty || (order.backorders && order.backorders[0]?.quantityShort) || backordersCount}u Backorder</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total Value */}
                      <td className="px-4 py-3.5 font-semibold text-[var(--text-main)] font-heading text-xs">
                        ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`badge text-[10px] font-semibold ${
                            order.status === "FULFILLED"
                              ? "badge-success"
                              : order.status === "PROCESSING"
                              ? "badge-accent"
                              : order.status === "PARTIALLY_FULFILLED"
                              ? "badge-warning"
                              : "badge-outline text-amber-600 border-amber-500/40"
                          }`}
                        >
                          {order.status === "PARTIALLY_FULFILLED" ? (
                            <span>PARTIAL (BACKORDER)</span>
                          ) : (
                            order.status
                          )}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end">
                          <span
                            className="btn-outline text-[11px] py-1.5 px-3 flex items-center gap-1.5 font-semibold group-hover:bg-[var(--primary)] group-hover:text-white group-hover:border-[var(--primary)] transition-all shadow-xs"
                          >
                            <span>Manage Split</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
