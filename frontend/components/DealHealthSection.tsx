"use client";

import { Activity, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, HeartPulse } from "lucide-react";

export default function DealHealthSection() {
  const metrics = [
    { label: "Customer Engagement", status: "Healthy", score: "94/100", badge: "badge-success" },
    { label: "Gross Margin Integrity", status: "Healthy", score: "21.5% (>18% floor)", badge: "badge-success" },
    { label: "Governance & Approval", status: "Healthy", score: "Manager Signed", badge: "badge-success" },
    { label: "Inventory Allocation", status: "Attention", score: "Split Required", badge: "badge-warning" },
    { label: "Delivery Promise SLA", status: "Healthy", score: "3-Day Buffer", badge: "badge-success" },
  ];

  return (
    <section className="py-20 bg-slate-50/60 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="type-eyebrow mb-2 block">Proactive Surveillance</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Keep every deal on course.
          </h2>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">
            Deals don&apos;t fail all at once; they drift off course unnoticed. DealOrbit continuously monitors multi-dimensional deal health indicators and alerts teams before promises are broken.
          </p>
        </div>

        {/* Executive Health Panel */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Health Score Gauge (4 cols) */}
            <div className="lg:col-span-4 text-center lg:text-left lg:border-r lg:border-slate-100 lg:pr-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Composite Deal Health Score
              </span>
              <div className="flex items-baseline justify-center lg:justify-start gap-2 my-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight">92</span>
                <span className="text-xl text-slate-400 font-semibold">/ 100</span>
                <span className="badge badge-success text-xs font-bold ml-2">Optimal</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculated across 5 continuous telemetry vectors: margin floor, inventory availability, counter-offer velocity, approval SLA, and customer historical stability.
              </p>
            </div>

            {/* Metrics Breakdown (8 cols) */}
            <div className="lg:col-span-8 space-y-2.5">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-semibold text-slate-800">{m.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">{m.score}</span>
                    <span className={`badge ${m.badge} text-[10px] font-bold`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Intelligence Early Warning Banner */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block">Early Warning: Single-Depot Shortage Detected</span>
                <span>Inventory shortage in West Hub may affect promised delivery date.</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-800 font-medium">Recommended Action:</span>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-xs inline-flex items-center gap-1"
              >
                Re-route Fulfillment
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
