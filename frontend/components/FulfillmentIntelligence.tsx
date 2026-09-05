"use client";

import { Warehouse, CheckCircle2, AlertTriangle, ArrowRight, Truck, Boxes } from "lucide-react";

export default function FulfillmentIntelligence() {
  const warehouses = [
    {
      name: "Main Regional Warehouse (North)",
      available: 12,
      allocated: 12,
      status: "Fully Allocated",
      badge: "badge-success",
      badgeText: "12 units available",
    },
    {
      name: "East Logistics Depot",
      available: 8,
      allocated: 8,
      status: "Depot Split",
      badge: "badge-primary",
      badgeText: "8 units available",
    },
    {
      name: "West Hub Center",
      available: 0,
      allocated: 0,
      status: "Stock Exhausted",
      badge: "badge-neutral",
      badgeText: "0 units available",
    },
  ];

  return (
    <section className="py-20 bg-slate-50/60 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="type-eyebrow mb-2 block">Physical Feasibility</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Commercial decisions should understand physical reality.
          </h2>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">
            A signed contract that cannot be delivered damages customer trust and burns margin in rush shipping fees. DealOrbit evaluates live cross-depot inventory before the salesperson sends the quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Warehouse Stock Matrix (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Live Regional Stock Availability (Requested: 20 Units)
              </span>
              <span className="text-slate-400 font-mono">SKU: SRV-INFRA-800</span>
            </div>

            {warehouses.map((wh) => (
              <div
                key={wh.name}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Warehouse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {wh.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Physical inventory on shelf
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`badge ${wh.badge} text-xs font-bold`}>
                    {wh.badgeText}
                  </span>
                  <div className="text-right w-20">
                    <span className="text-xs font-bold text-slate-900 block">
                      {wh.allocated} Allocated
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                West Hub has 0 units. DealOrbit automatically prevents promise dates based on fictitious single-depot supply.
              </span>
            </div>
          </div>

          {/* Recommended Split Engine (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border-2 border-blue-600/30 shadow-lg shadow-blue-900/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-700">
                <Truck className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  Recommended Fulfillment Split
                </h3>
              </div>
              <span className="badge badge-success text-[10px] font-bold">Feasible</span>
            </div>

            {/* Split Breakdown */}
            <div className="space-y-3 text-xs mb-5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Main Warehouse</span>
                <span className="font-bold text-slate-900 font-mono">12 units → Hub North</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">East Depot</span>
                <span className="font-bold text-slate-900 font-mono">8 units → Express Freight</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Shipment Count
                </span>
                <span className="text-xl font-black text-slate-900">2 Shipments</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Delivery SLA
                </span>
                <span className="text-xl font-black text-emerald-600">On Track (3d)</span>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-500 leading-snug">
              Estimated split freight cost of ₹14,200 is automatically incorporated into Deal Strategy Margin calculations.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
