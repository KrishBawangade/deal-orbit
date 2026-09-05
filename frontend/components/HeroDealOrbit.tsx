"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, ShieldCheck, Lock, Building2, TrendingUp, AlertTriangle } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};
const fadeRight = { hidden: { opacity: 0, x: 40, scale: 0.97 }, visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.75, ease: EASE, delay: 0.2 } } };

export default function HeroDealOrbit() {
  return (
    <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Focused Executive Copy */}
          <motion.div
            className="lg:col-span-6 space-y-6"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div className="space-y-3" custom={0} variants={fadeUp}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-slate-900 tracking-tight leading-[1.1]">
                Don&apos;t just validate a deal.
                <span className="block text-blue-600 mt-2">
                  Explore it before the customer does.
                </span>
              </h1>
            </motion.div>

            <motion.p custom={1} variants={fadeUp} className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              DealOrbit evaluates commercial margins, operational inventory, and customer negotiation corridors before commitment — helping sales teams navigate approvals, protect profitability, and execute with confidence.
            </motion.p>

            {/* CTAs */}
            <motion.div custom={2} variants={fadeUp} className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#simulator"
                className="btn-primary py-3.5 px-6 text-sm font-semibold shadow-xs hover:shadow-md transition-all"
              >
                Explore the Deal Engine
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
              <a
                href="#how-it-works"
                className="btn-secondary py-3.5 px-5 text-sm font-semibold inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                See How It Works
              </a>
            </motion.div>

            {/* Core Architectural Tenet */}
            <motion.div custom={3} variants={fadeUp} className="pt-4 border-t border-slate-200/80 max-w-md">
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 font-bold">Human knows the customer. System knows the complexity.</strong>
                <span className="block text-slate-400 mt-0.5">Together they construct the optimal executable deal.</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column: The Live Deal with Sensitive Operational Telemetry */}
          <motion.div className="lg:col-span-6 relative" variants={fadeRight} initial="hidden" animate="visible">
            <div className="relative w-full max-w-lg mx-auto">
              
              {/* Central Deal Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] relative z-10 transition-all hover:border-blue-300">
                
                {/* Header with Sensitive Flag */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        ACME CORPORATION
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enterprise Infrastructure Deal • <span className="font-mono text-slate-700">QT-2026-0043</span>
                      </p>
                    </div>
                  </div>

                  <span className="badge badge-primary text-[11px] font-bold">
                    Strategy Ready
                  </span>
                </div>

                {/* Deal Value + Health */}
                <div className="grid grid-cols-2 gap-4 my-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">
                      Quotation Value
                    </span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight font-heading">
                      ₹18,40,000
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">
                      Composite Deal Health
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-emerald-600 font-heading">92</span>
                      <span className="text-xs text-slate-400">/ 100</span>
                      <span className="badge badge-success text-[10px] py-0 px-1.5 ml-1">Optimal</span>
                    </div>
                  </div>
                </div>

                {/* SENSITIVE INTERNAL TELEMETRY (Protected Internal Reality) */}
                <div className="rounded-xl border border-blue-200/90 bg-blue-50/40 p-4 mb-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Confidential Commercial Telemetry</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      Masked in Customer Portal
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">Gross Margin</span>
                      <span className="font-extrabold text-emerald-600 text-sm">21.5%</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Floor: 18.0%</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">Base COGS</span>
                      <span className="font-extrabold text-slate-800 text-sm">₹14.44L</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Hardware + SLA</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">Risk Score</span>
                      <span className="font-extrabold text-slate-800 text-sm">28 / 100</span>
                      <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">Low Governance</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-blue-100/80 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Approval Tier: <strong className="text-slate-800">Manager Sign-off</strong></span>
                    <span>Logistics: <strong className="text-slate-800">2 Depots (₹14.2K)</strong></span>
                    <span>ARR: <strong className="text-indigo-700 font-bold">₹4.2L</strong></span>
                  </div>
                </div>

                {/* Deal Operations Pipeline Stepper */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Operational Orbit Stage
                    </span>
                    <span className="text-blue-600 font-mono text-[10px]">Stage 3 of 6</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 text-[11px] font-semibold overflow-x-auto">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                      Opportunity ✓
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                      Quote ✓
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-300 whitespace-nowrap">
                      Strategy Engine
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className="text-slate-400 px-1 whitespace-nowrap">Approval</span>
                    <span className="text-slate-300">→</span>
                    <span className="text-slate-400 px-1 whitespace-nowrap">Fulfillment</span>
                    <span className="text-slate-300">→</span>
                    <span className="text-slate-400 px-1 whitespace-nowrap">Revenue</span>
                  </div>
                </div>

              </div>

              {/* Orbiting Satellite Node 1: Customer Reality */}
              <div className="absolute -top-5 -right-4 z-20 hidden sm:block bg-white rounded-xl p-3 border border-slate-200 shadow-md max-w-[200px] text-xs">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-teal-700">Customer Reality</span>
                  <span className="status-dot status-dot-success" />
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Discount Corridor:</span>
                    <span className="font-bold text-slate-800">8–12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Likelihood:</span>
                    <span className="font-bold text-emerald-600">68%</span>
                  </div>
                </div>
              </div>

              {/* Orbiting Satellite Node 2: Strategy Scenarios */}
              <div className="absolute -bottom-5 -left-4 z-20 hidden sm:block bg-white rounded-xl p-3 border border-slate-200 shadow-md max-w-[210px] text-xs">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-blue-700">3 Strategy Options</span>
                  <span className="text-[10px] text-amber-500 font-bold">Scenario B ★</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  10% + 2-Yr Care Pack preserves 21.5% margin vs 15% price cut.
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
