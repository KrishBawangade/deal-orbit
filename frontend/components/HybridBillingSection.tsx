"use client";

import { Calendar, CreditCard, Layers, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

export default function HybridBillingSection() {
  const lineItems = [
    {
      category: "One-Time Capital Hardware",
      name: "Enterprise Server Node (20 Units)",
      amount: "₹5,00,000",
      type: "One-time",
      badge: "badge-neutral",
    },
    {
      category: "One-Time Services",
      name: "On-Premise Rack Implementation & Provisioning",
      amount: "₹50,000",
      type: "One-time",
      badge: "badge-neutral",
    },
    {
      category: "Recurring Cloud Platform",
      name: "DealOrbit Cloud Management License",
      amount: "₹25,000 / mo",
      type: "Recurring (Annual)",
      badge: "badge-primary",
    },
    {
      category: "Recurring Managed SLA",
      name: "24/7 Dedicated Infrastructure Support Tier",
      amount: "₹10,000 / mo",
      type: "Recurring (Annual)",
      badge: "badge-accent",
    },
  ];

  const schedulePreview = [
    { event: "Day 0 (Signing)", desc: "₹5.5L Capital Invoice & Hardware Dispatch", status: "Immediate" },
    { event: "Month 1 (Go-Live)", desc: "₹35,000 Cloud Platform & Support Billing Begins", status: "Automated" },
    { event: "Month 2–12", desc: "Recurring ₹35,000 Monthly Auto-Invoicing with Proration Support", status: "Automated" },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="type-eyebrow mb-2 block">Revenue Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            One deal. Multiple revenue streams.
          </h2>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">
            Modern enterprise sales bundle hardware, professional services, and multi-year subscriptions into single contracts. DealOrbit unifies one-time invoicing and recurring billing schedules without manual spreadsheet reconciliations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Line Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Multi-Stream Deal Composition
            </span>

            {lineItems.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.name}
                  </h4>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1">
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {item.amount}
                  </span>
                  <span className={`badge ${item.badge} text-[10px]`}>
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Synthesis & Calendar Preview (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/40 via-white to-slate-50 rounded-2xl p-6 border-2 border-blue-200 shadow-md">
            <div className="pb-4 mb-5 border-b border-blue-100">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
                Deal Commercial Structure
              </span>
              <div className="flex flex-wrap items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-slate-900">₹5.5L</span>
                <span className="text-xs text-slate-500 font-semibold uppercase">One-Time</span>
                <span className="text-slate-300 font-light text-xl">+</span>
                <span className="text-2xl font-black text-indigo-700">₹35K</span>
                <span className="text-xs text-slate-500 font-semibold uppercase">Monthly Recurring</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Annual Contract Value (ACV): ₹9,70,000
              </span>
            </div>

            {/* Calendar Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Automated Billing Event Schedule</span>
              </div>

              {schedulePreview.map((ev, i) => (
                <div
                  key={ev.event}
                  className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-xs"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-blue-900">{ev.event}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                      {ev.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {ev.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
