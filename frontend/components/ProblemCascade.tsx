"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  AlertTriangle, 
  Layers, 
  Check, 
  Percent, 
  ShieldAlert, 
  UserCheck, 
  Warehouse, 
  TrendingDown, 
  Receipt 
} from "lucide-react";

export default function ProblemCascade() {
  const [selectedDiscount, setSelectedDiscount] = useState<number>(15);

  const cascadeSteps = [
    {
      step: "Discount Changes",
      val: `${selectedDiscount}% Requested`,
      desc: "Rep adjusts discount to win customer deal",
      icon: Percent,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      step: "Margin Changes",
      val: selectedDiscount > 10 ? "14.2% (Depressed)" : "22.5% (Protected)",
      desc: "Violates target product profitability floor",
      icon: TrendingDown,
      color: selectedDiscount > 10 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      step: "Risk Changes",
      val: selectedDiscount > 10 ? "Risk 72/100 (Elevated)" : "Risk 22/100 (Safe)",
      desc: "Blended pricing & credit risk score spikes",
      icon: ShieldAlert,
      color: selectedDiscount > 10 ? "text-rose-600 bg-rose-50 border-rose-200" : "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      step: "Approval Changes",
      val: selectedDiscount > 12 ? "Escalates to CFO / VP" : "Direct Manager Sign-off",
      desc: "Trigger latency delays sales cycle by 5 days",
      icon: UserCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      step: "Inventory Shifts",
      val: "Splits 2 Regional Warehouses",
      desc: "Depot A (12u) + Depot B (8u) adds ₹14K freight",
      icon: Warehouse,
      color: "text-slate-700 bg-slate-100 border-slate-200",
    },
    {
      step: "Billing Schedules",
      val: "Hybrid Proration Recalculated",
      desc: "Hardware one-time + cloud recurring readjusted",
      icon: Receipt,
      color: "text-teal-700 bg-teal-50 border-teal-200",
    },
  ];

  return (
    <section id="problem" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="type-eyebrow mb-2">The Multi-Dimensional Reality</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight">
            A deal is never just a quotation.
          </h2>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            In enterprise sales, changing a single commercial variable is not an isolated decision. It sends shockwaves through operational constraints, executive approvals, logistics, and customer behavior.
          </p>
        </div>

        {/* Traditional Linear vs Interconnected Reality */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Traditional Workflow (Left 4 cols) */}
          <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Traditional Sales Model
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Assumes commerce is a frictionless, one-way conveyor belt with no internal dependencies:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-slate-700">
                <span className="font-semibold">1. Quotation</span>
                <span className="text-slate-400">Static doc</span>
              </div>
              <div className="text-center text-slate-400 text-xs">↓</div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-slate-700">
                <span className="font-semibold">2. Order</span>
                <span className="text-slate-400">Hand-off</span>
              </div>
              <div className="text-center text-slate-400 text-xs">↓</div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-slate-700">
                <span className="font-semibold">3. Invoice</span>
                <span className="text-slate-400">Fixed ledger</span>
              </div>
            </div>

            <div className="mt-6 p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Too simple for real enterprise deals.</span>
                Ignores inventory bottlenecks, margin floors, approval chains, and live procurement counter-offers.
              </div>
            </div>
          </div>

          {/* Connected Cascade Visualization (Right 8 cols) */}
          <div className="lg:col-span-8 bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                  DealOrbit Dependency Chain
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Select discount to observe downstream system reaction:
                </h4>
              </div>

              {/* Quick toggle to test reaction */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
                {[8, 10, 15, 20].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDiscount(d)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      selectedDiscount === d
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {d}% Discount
                  </button>
                ))}
              </div>
            </div>

            {/* Cascade Flow Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {cascadeSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    layout
                    className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          0{idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800">
                          {step.step}
                        </h5>
                      </div>
                      <div className={`p-1.5 rounded-md border ${step.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mb-1">
                      {step.val}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {step.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                Connected Impact Summary:
              </span>
              <span className="font-mono text-blue-600 font-semibold">
                6 operational dimensions governed concurrently
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
