"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Cpu, 
  Building, 
  Users, 
  Compass, 
  ArrowDown, 
  Percent, 
  ShieldCheck, 
  Boxes, 
  TrendingUp, 
  History, 
  DollarSign, 
  Sparkles 
} from "lucide-react";

export default function DealStrategyEngineOverview() {
  const businessPoints = [
    { label: "Margin", desc: "Category margin floors & contribution" },
    { label: "Risk Score", desc: "Blended pricing, payment & SLA risk" },
    { label: "Approval Tier", desc: "Dynamic rule routing (Manager/Finance/CFO)" },
    { label: "Inventory Reality", desc: "Live multi-depot stock check" },
    { label: "Shipment Count", desc: "Regional routing & split logistics" },
    { label: "One-Time vs Recurring", desc: "Hardware COGS vs Cloud Subscription ARR" },
  ];

  const customerPoints = [
    { label: "Purchase History", desc: "Past 24 months order scale & renewals" },
    { label: "Discount Corridor", desc: "Historical benchmark range (8–12%)" },
    { label: "Price Sensitivity", desc: "Category-specific elasticity" },
    { label: "Negotiation Propensity", desc: "Likelihood to counter-offer" },
    { label: "Bundle Acceptance", desc: "Receptivity to Care Packs & SLAs" },
    { label: "Acceptance Probability", desc: "Empirical P(Accept), P(Negotiate), P(Reject)" },
  ];

  return (
    <section id="platform" className="py-20 bg-slate-50/50 border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="type-eyebrow mb-2 inline-block">Architecture of Intelligence</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            The decision layer around every deal.
          </h2>
          <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto">
            Instead of submitting a blind quote and waiting for finance to reject it, DealOrbit simultaneously models internal commercial governance alongside external customer psychology.
          </p>
        </div>

        {/* Central Architecture Flow */}
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Top: Current Quote */}
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-3.5 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Draft Quotation
              </span>
              <span className="text-sm font-bold text-slate-900">
                Acme Corp Bill of Materials (₹18,40,000)
              </span>
            </div>
          </div>

          <div className="my-3 flex flex-col items-center text-blue-500">
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </div>

          {/* Central Hub: DEAL STRATEGY ENGINE */}
          <div className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl shadow-blue-500/10 border border-blue-400/30 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Core Co-Pilot Engine
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              DEAL STRATEGY ENGINE
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto mt-1">
              Evaluates dual-sided realities in real time before salesperson commits.
            </p>
          </div>

          <div className="my-4 flex flex-col items-center text-slate-400">
            <div className="w-0.5 h-6 bg-slate-300"></div>
          </div>

          {/* Split into Two Sides: Business Reality vs Customer Reality */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* 1. BUSINESS REALITY (Left) */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Business Reality
                      </h4>
                      <span className="text-[11px] text-slate-400">Internal Constraints</span>
                    </div>
                  </div>
                  <span className="badge badge-primary text-[10px]">Company Viability</span>
                </div>

                <div className="space-y-3">
                  {businessPoints.map((item) => (
                    <div key={item.label} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 leading-tight">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-700">
                Governs: Margin floors, inventory splits, and approval chains.
              </div>
            </div>

            {/* 2. CUSTOMER REALITY (Right) */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Customer Reality
                      </h4>
                      <span className="text-[11px] text-slate-400">Empirical Psychology</span>
                    </div>
                  </div>
                  <span className="badge badge-accent text-[10px]">Behavioral Profile</span>
                </div>

                <div className="space-y-3">
                  {customerPoints.map((item) => (
                    <div key={item.label} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0"></span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 leading-tight">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-700">
                Predicts: Acceptance probability, counter-offer likelihood, and bundle receptivity.
              </div>
            </div>

          </div>

          <div className="my-4 flex flex-col items-center text-slate-400">
            <div className="w-0.5 h-6 bg-slate-300"></div>
          </div>

          {/* Bottom: SCENARIO EXPLORER */}
          <div className="bg-slate-900 text-white rounded-xl px-6 py-4 shadow-lg border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Output Exploration
              </span>
              <span className="text-sm font-extrabold text-white">
                SCENARIO EXPLORER (Scenarios A, B, C)
              </span>
              <p className="text-xs text-slate-400">
                Allows reps to compare aggressive vs recommended vs margin-preservation deal structures.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
