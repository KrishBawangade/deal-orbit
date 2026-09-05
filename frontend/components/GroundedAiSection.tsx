"use client";

import { 
  Database, 
  History, 
  Tag, 
  Layers, 
  SlidersHorizontal, 
  PackageCheck, 
  UserCheck2, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";

export default function GroundedAiSection() {
  const empiricalFactors = [
    { label: "Historical Purchases", desc: "Past 24-mo ticket volumes", icon: History },
    { label: "Accepted Discounts", desc: "Proven transaction ceilings", icon: Tag },
    { label: "Category Sensitivity", desc: "Hardware vs SaaS elasticity", icon: SlidersHorizontal },
    { label: "Negotiation History", desc: "Past counter-offer rounds", icon: Database },
    { label: "Bundle Behavior", desc: "Warranty & support affinity", icon: PackageCheck },
  ];

  return (
    <section id="intelligence" className="py-20 bg-slate-50/70 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Grounded in historical customer behavior
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Intelligence grounded in behavior, not guesswork.
          </h2>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">
            Enterprise procurement teams don&apos;t make random decisions. DealOrbit replaces ungrounded AI hallucinations with mathematical behavioral modeling derived from actual enterprise transaction history.
          </p>
        </div>

        {/* Empirical Formula Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: 5 Multipliers */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Observable Empirical Inputs
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {empiricalFactors.map((factor, idx) => {
                const Icon = factor.icon;
                return (
                  <div
                    key={factor.label}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {factor.label}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {factor.desc}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="p-3.5 rounded-xl bg-teal-600 text-white shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 font-bold text-base">
                  ∑
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Synthesized Model
                  </span>
                  <span className="text-[11px] text-teal-100">
                    Continuous Calibration
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Zero black-box LLM hallucinations. All probabilities are verifiable against historical audit trails.
              </span>
            </div>
          </div>

          {/* Right: Example Customer Profile (Acme Corp) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border-2 border-teal-600/30 shadow-lg shadow-teal-900/5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-xs">
                  AC
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Acme Corporation
                  </h3>
                  <span className="text-[11px] text-slate-400">Customer Negotiation Profile</span>
                </div>
              </div>
              <span className="badge badge-accent text-[10px]">Verified Profile</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600 font-medium">Historical Discount Corridor:</span>
                <span className="font-bold text-slate-900 font-mono">8% – 12%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600 font-medium">Hardware Price Sensitivity:</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  High
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600 font-medium">Service Bundle Acceptance:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  High (74%)
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600 font-medium">Payment Term Flexibility:</span>
                <span className="font-bold text-slate-700">Low (Net-30 strict)</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-teal-50/60 border border-teal-200/80">
              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block mb-1">
                Strategic Intelligence Recommendation
              </span>
              <p className="text-xs text-teal-900 leading-snug">
                &ldquo;Acme pushes aggressively on hardware list price, but consistently accepts 2-year warranty bundles without objection. Bundle services to preserve margin.&rdquo;
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
