"use client";

import React, { useState, useMemo } from "react";
import {
  Warehouse,
  Truck,
  Boxes,
  CheckCircle2,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  PackageCheck,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface IWarehouseStock {
  id: string;
  name: string;
  code: string;
  location: string;
  availableStock: number;
  costWeight: number; // multiplier for freight cost
  baseCostPerShipment: number;
}

interface IOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  sku: string;
  requestedQty: number;
  unitPrice: number;
  status: "PROCESSING" | "PARTIALLY_FULFILLED" | "FULFILLED";
}

const SAMPLE_ORDERS: IOrderItem[] = [
  {
    id: "ord-1",
    orderNumber: "SO-2026-0891",
    customerName: "Acme Corp (Enterprise)",
    productName: "Enterprise Rack Server SRV-800",
    sku: "SRV-INFRA-800",
    requestedQty: 20,
    unitPrice: 125000,
    status: "PROCESSING",
  },
  {
    id: "ord-2",
    orderNumber: "SO-2026-0892",
    customerName: "Stark Industries (Defense)",
    productName: "High-Performance Edge Gateway EG-40",
    sku: "NET-EDGE-400",
    requestedQty: 24,
    unitPrice: 85000,
    status: "PARTIALLY_FULFILLED",
  },
];

const INITIAL_WAREHOUSES: IWarehouseStock[] = [
  {
    id: "wh-north",
    name: "Main Regional Warehouse (North)",
    code: "WH-MAIN-01",
    location: "Chicago Central Hub",
    availableStock: 12,
    costWeight: 1.0,
    baseCostPerShipment: 6500,
  },
  {
    id: "wh-east",
    name: "East Logistics Depot",
    code: "WH-EAST-02",
    location: "New Jersey Corridor",
    availableStock: 10,
    costWeight: 1.2,
    baseCostPerShipment: 7700,
  },
  {
    id: "wh-west",
    name: "West Hub Center",
    code: "WH-WEST-03",
    location: "Reno Logistics Park",
    availableStock: 0,
    costWeight: 1.5,
    baseCostPerShipment: 9200,
  },
];

export default function FulfillmentSplitScreen() {
  // Selected order state
  const [selectedOrderId, setSelectedOrderId] = useState<string>("ord-1");
  const currentOrder = useMemo(
    () => SAMPLE_ORDERS.find((o) => o.id === selectedOrderId) || SAMPLE_ORDERS[0],
    [selectedOrderId]
  );

  // Live warehouse state
  const [warehouses, setWarehouses] = useState<IWarehouseStock[]>(INITIAL_WAREHOUSES);

  // Allocation status: "RECOMMENDED" | "ACCEPTED" | "OVERRIDDEN"
  const [allocationStatus, setAllocationStatus] = useState<
    "RECOMMENDED" | "ACCEPTED" | "OVERRIDDEN"
  >("RECOMMENDED");

  // Manual Override mode
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [manualAllocations, setManualAllocations] = useState<Record<string, number>>({
    "wh-north": 12,
    "wh-east": 8,
    "wh-west": 0,
  });

  // Mid-fulfillment stock arrival & backorder state
  const [midFulfillmentStockArrived, setMidFulfillmentStockArrived] = useState(false);
  const [backorderConsolidated, setBackorderConsolidated] = useState(false);

  // Calculate recommended split greedily based on live stock
  const recommendedSplit = useMemo(() => {
    let remaining = currentOrder.requestedQty;
    const split: Record<string, number> = {};

    // Sort active warehouses by costWeight ascending
    const sorted = [...warehouses].sort((a, b) => a.costWeight - b.costWeight);

    for (const wh of sorted) {
      if (remaining <= 0) {
        split[wh.id] = 0;
        continue;
      }
      const canFulfill = Math.min(wh.availableStock, remaining);
      split[wh.id] = canFulfill;
      remaining -= canFulfill;
    }

    const backorderQty = Math.max(0, remaining);
    return { split, backorderQty };
  }, [currentOrder.requestedQty, warehouses]);

  // Active split currently applied (recommended or manual)
  const activeSplit = useMemo(() => {
    if (isManualOverride || allocationStatus === "OVERRIDDEN") {
      return manualAllocations;
    }
    return recommendedSplit.split;
  }, [isManualOverride, allocationStatus, manualAllocations, recommendedSplit.split]);

  // Calculations for displayed warehouses
  const splitDetails = useMemo(() => {
    return warehouses.map((wh) => {
      const qtyFulfilled = activeSplit[wh.id] || 0;
      const shipmentCount = qtyFulfilled > 0 ? 1 : 0;
      const shipmentCost = shipmentCount > 0 ? wh.baseCostPerShipment : 0;

      return {
        ...wh,
        qtyFulfilled,
        shipmentCount,
        shipmentCost,
      };
    });
  }, [warehouses, activeSplit]);

  // Aggregate metrics
  const totalFulfilled = useMemo(
    () => Object.values(activeSplit).reduce((a, b) => a + b, 0),
    [activeSplit]
  );

  const totalEstimatedShipments = useMemo(
    () => splitDetails.reduce((acc, curr) => acc + curr.shipmentCount, 0),
    [splitDetails]
  );

  const totalEstimatedCost = useMemo(
    () => splitDetails.reduce((acc, curr) => acc + curr.shipmentCost, 0),
    [splitDetails]
  );

  // Remaining backorder quantity (if total fulfilled < requested and not yet consolidated)
  const remainingBackorderQty = useMemo(() => {
    if (backorderConsolidated) return 0;
    return Math.max(0, currentOrder.requestedQty - totalFulfilled);
  }, [backorderConsolidated, currentOrder.requestedQty, totalFulfilled]);

  // Automatic Prompt trigger: shows when stock arrives mid fulfillment or when backorder exists and replenishment arrives
  const showConsolidatePrompt =
    (remainingBackorderQty > 0 || midFulfillmentStockArrived) && !backorderConsolidated;

  // Handle Accept Suggested Split
  const handleAcceptSuggestedSplit = () => {
    setIsManualOverride(false);
    setAllocationStatus("ACCEPTED");
    toast.success("Suggested Split Accepted", {
      description: `Committed allocation for ${currentOrder.orderNumber}: ${totalFulfilled} units across ${totalEstimatedShipments} shipments. Manifests dispatched to picking.`,
    });
  };

  // Handle Enter Manual Override
  const handleToggleManualOverride = () => {
    if (!isManualOverride) {
      // Initialize with current active split
      setManualAllocations({
        "wh-north": activeSplit["wh-north"] || 0,
        "wh-east": activeSplit["wh-east"] || 0,
        "wh-west": activeSplit["wh-west"] || 0,
      });
      setIsManualOverride(true);
      toast.info("Manual Override Mode Active", {
        description: "Adjust quantities per warehouse manually. Live costs and shipment counts will update in real time.",
      });
    } else {
      setIsManualOverride(false);
    }
  };

  // Save manual override
  const handleSaveManualOverride = () => {
    const total = Object.values(manualAllocations).reduce((a, b) => a + b, 0);
    if (total > currentOrder.requestedQty) {
      toast.error("Allocation Exceeds Order Demand", {
        description: `Total allocated (${total}) exceeds requested quantity (${currentOrder.requestedQty}).`,
      });
      return;
    }

    setAllocationStatus("OVERRIDDEN");
    setIsManualOverride(false);
    toast.success("Manual Override Applied", {
      description: `Custom warehouse allocation saved for ${currentOrder.orderNumber}. Estimated cost: ₹${totalEstimatedCost.toLocaleString("en-IN")}.`,
    });
  };

  // Reset to recommended
  const handleResetToRecommended = () => {
    setIsManualOverride(false);
    setAllocationStatus("RECOMMENDED");
    setManualAllocations({ ...recommendedSplit.split });
    toast.info("Reset to Recommended Split", {
      description: "Optimal greedy warehouse split restored based on live stock.",
    });
  };

  // Simulate mid-fulfillment stock arrival
  const handleSimulateMidFulfillmentArrival = () => {
    setMidFulfillmentStockArrived(true);
    setWarehouses((prev) =>
      prev.map((wh) =>
        wh.id === "wh-east"
          ? { ...wh, availableStock: wh.availableStock + 4 }
          : wh
      )
    );
    toast.info("Live Inventory Update: Stock Arrived Mid-Fulfillment!", {
      description: "4 replenishment units checked into East Logistics Depot.",
    });
  };

  // Consolidate Remaining Backorder action
  const handleConsolidateBackorder = () => {
    setBackorderConsolidated(true);
    setMidFulfillmentStockArrived(false);

    // Fulfill the remaining backorder from East Depot
    const remainingToFulfill = Math.max(0, currentOrder.requestedQty - totalFulfilled);
    const addedUnits = remainingToFulfill > 0 ? remainingToFulfill : 4;

    setManualAllocations((prev) => ({
      ...prev,
      "wh-east": (prev["wh-east"] || 0) + addedUnits,
    }));
    setAllocationStatus("ACCEPTED");

    toast.success("Backorder Consolidated Successfully!", {
      description: `${addedUnits} remaining backorder units merged into East Logistics Depot dispatch manifest. Order is now 100% fulfilled.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] font-heading">
              Fulfillment & Warehouse Split
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-body)]">
              Recommended warehouse split for confirmed orders based on live regional inventory, minimizing shipment count and logistics cost.
            </p>
          </div>

          {/* Actions / Simulation Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSimulateMidFulfillmentArrival}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 cursor-pointer"
              title="Simulate replenishment arrival while order is in fulfillment"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Simulate Stock Arrival</span>
            </button>
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. AUTOMATIC PROMPT: Consolidate Remaining Backorder (Appears Mid-Fulfillment) */}
      {showConsolidatePrompt && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-950/20 p-5 sm:p-6 shadow-md animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-success text-[10px] font-bold uppercase tracking-wider">
                    Automatic Alert
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    Mid-Fulfillment Replenishment Arrived
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] font-heading">
                  Consolidate Remaining Backorder
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-body)] max-w-2xl">
                  {midFulfillmentStockArrived
                    ? "Replenishment inventory (4 units) has just arrived mid-fulfillment at East Logistics Depot. You can automatically consolidate the remaining backorder into the active dispatch manifest now."
                    : `An active backorder of ${remainingBackorderQty} units is pending for ${currentOrder.orderNumber}. Stock is available to consolidate into an immediate dispatch shipment.`}
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleConsolidateBackorder}
                className="w-full sm:w-auto btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] transition-all"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Consolidate Remaining Backorder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Order Selection Strip */}
      <div className="card-glass p-4 rounded-xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
              Selected Sales Order for Fulfillment
            </div>
            <div className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <span>{currentOrder.orderNumber}</span>
              <span className="text-[var(--text-muted)] font-normal">&bull;</span>
              <span className="font-semibold text-[var(--text-body)]">{currentOrder.customerName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-medium text-[var(--text-muted)]">Switch Order:</label>
          <select
            value={selectedOrderId}
            onChange={(e) => {
              setSelectedOrderId(e.target.value);
              setAllocationStatus("RECOMMENDED");
              setIsManualOverride(false);
              setBackorderConsolidated(false);
              setMidFulfillmentStockArrived(false);
            }}
            className="text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-[var(--text-main)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
          >
            {SAMPLE_ORDERS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} ({o.requestedQty} units - {o.customerName.split(" ")[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Top Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Order Requirement */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Requested Quantity</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading">
              {currentOrder.requestedQty} Units
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">
              SKU: {currentOrder.sku}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Quantity Fulfilled */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Quantity Fulfilled</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading">
              {totalFulfilled} / {currentOrder.requestedQty}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {totalFulfilled >= currentOrder.requestedQty
                ? "100% Demand Satisfied"
                : `${remainingBackorderQty} Units Backordered`}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Estimated Shipment Count */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Estimated Shipment Count</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading">
              {totalEstimatedShipments} {totalEstimatedShipments === 1 ? "Shipment" : "Shipments"}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Multi-depot freight dispatch
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Estimated Logistics Cost */}
        <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">Estimated Shipment Cost</div>
            <div className="text-2xl font-bold text-[var(--text-main)] font-heading">
              ₹{totalEstimatedCost.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Weighted by regional distance
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 5. Recommended Warehouse Split & Displays */}
      <div className="card-glass rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
                Recommended Warehouse Split
              </h2>
              {allocationStatus === "ACCEPTED" && (
                <span className="badge badge-success text-[10px] font-semibold">
                  Split Accepted
                </span>
              )}
              {allocationStatus === "OVERRIDDEN" && (
                <span className="badge badge-warning text-[10px] font-semibold">
                  Manual Override Active
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Regional warehouse inventory levels, quantities fulfilled from each node, and calculated logistics cost.
            </p>
          </div>

          {/* Action Buttons: Accept Suggested Split & Manual Override */}
          <div className="flex items-center gap-2.5">
            {isManualOverride ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveManualOverride}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Override</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToRecommended}
                  className="btn-ghost text-xs py-2 px-3 border border-[var(--border)] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Suggested</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAcceptSuggestedSplit}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Suggested Split</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleManualOverride}
                  className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>Manual Override</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Displays: Warehouse name, Quantity fulfilled, Estimated shipment count and cost */}
        <div className="divide-y divide-[var(--border-subtle)]/70">
          {splitDetails.map((wh) => {
            const isAllocated = wh.qtyFulfilled > 0;

            return (
              <div
                key={wh.id}
                className={`p-4 sm:p-5 transition-colors ${
                  isAllocated
                    ? "bg-[var(--card)] hover:bg-[var(--card-hover)]/60"
                    : "bg-[var(--card)]/40 opacity-70"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Warehouse Name & Details (5 cols) */}
                  <div className="md:col-span-5 flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAllocated
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-[var(--text-muted)] border border-[var(--border)]"
                      }`}
                    >
                      <Warehouse className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[var(--text-main)] font-heading">
                          {wh.name}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--card-hover)] border border-[var(--border-subtle)]">
                          {wh.code}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                        <span>{wh.location}</span>
                        <span>&bull;</span>
                        <span className="font-medium text-[var(--text-body)]">
                          Live Stock: <strong className="text-[var(--text-main)]">{wh.availableStock} Units</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Fulfilled from that warehouse (4 cols) */}
                  <div className="md:col-span-4 flex flex-col justify-center">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)] font-medium">Quantity Fulfilled</span>
                      <span className="font-bold font-mono text-[var(--text-main)]">
                        {wh.qtyFulfilled} Units
                      </span>
                    </div>

                    {isManualOverride ? (
                      /* Manual Override Input / Stepper */
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="range"
                          min={0}
                          max={wh.availableStock}
                          value={manualAllocations[wh.id] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setManualAllocations((prev) => ({
                              ...prev,
                              [wh.id]: val,
                            }));
                          }}
                          className="w-full accent-[var(--primary)] cursor-pointer"
                        />
                        <input
                          type="number"
                          min={0}
                          max={wh.availableStock}
                          value={manualAllocations[wh.id] || 0}
                          onChange={(e) => {
                            const val = Math.min(wh.availableStock, Math.max(0, parseInt(e.target.value, 10) || 0));
                            setManualAllocations((prev) => ({
                              ...prev,
                              [wh.id]: val,
                            }));
                          }}
                          className="w-16 px-2 py-1 text-center font-mono text-xs font-bold border border-[var(--border)] rounded bg-[var(--background)] text-[var(--text-main)]"
                        />
                      </div>
                    ) : (
                      /* Progress bar */
                      <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isAllocated ? "bg-emerald-500" : "bg-transparent"
                          }`}
                          style={{
                            width: `${
                              currentOrder.requestedQty > 0
                                ? (wh.qtyFulfilled / currentOrder.requestedQty) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Estimated Shipment Count and Cost (3 cols) */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-6 text-right">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                        Shipment Count
                      </div>
                      <div className="text-xs font-bold text-[var(--text-main)]">
                        {wh.shipmentCount > 0 ? `${wh.shipmentCount} Shipment` : "0 (No split)"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                        Estimated Cost
                      </div>
                      <div className="text-xs font-bold font-mono text-[var(--text-main)]">
                        {wh.shipmentCost > 0 ? `₹${wh.shipmentCost.toLocaleString("en-IN")}` : "₹0"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Split Summary Footer */}
        <div className="p-4 sm:p-5 bg-[var(--card-hover)]/40 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-xs text-[var(--text-muted)]">
            Total Fulfilled: <strong className="text-[var(--text-main)]">{totalFulfilled} / {currentOrder.requestedQty} Units</strong>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <span className="text-[var(--text-muted)]">
              Estimated Shipment Count: <strong className="text-[var(--text-main)]">{totalEstimatedShipments}</strong>
            </span>
            <span className="text-[var(--text-muted)]">
              Estimated Total Cost:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{totalEstimatedCost.toLocaleString("en-IN")}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
