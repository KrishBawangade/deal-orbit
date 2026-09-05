"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  TrendingUp, 
  Warehouse, 
  Lock, 
  Check, 
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

type ScenarioType = "A" | "B" | "C";

interface ScenarioData {
  id: ScenarioType;
  name: string;
  badge: string;
  badgeClass: string;
  discount: string;
  discountNum: number;
  dealValue: string;
  // SENSITIVE INTERNAL TELEMETRY
  cogs: string;
  margin: number;
  marginFloor: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  approvalRequired: string;
  logisticsFreight: string;
  recurringArr: string;
  // CUSTOMER EMPIRICAL RESPONSE
  winRate: number;
  counterRate: number;
  rejectionRate: number;
  summary: string;
}

const scenarios: Record<ScenarioType, ScenarioData> = {
  A: {
    id: "A",
    name: "Aggressive Volume",
    badge: "Floor Violated",
    badgeClass: "badge-danger",
    discount: "15% Pure Discount",
    discountNum: 15,
    dealValue: "₹15,64,000",
    cogs: "₹13,45,000",
    margin: 14.0,
    marginFloor: 18.0,
    riskScore: 78,
    riskLevel: "High",
    approvalRequired: "Finance VP & CFO Escalation",
    logisticsFreight: "₹14,200 (2 Depots)",
    recurringArr: "₹3.8L ARR",
    winRate: 48,
    counterRate: 42,
    rejectionRate: 10,
    summary: "Breaches corporate 18% margin floor. Triggers mandatory CFO sign-off latency.",
  },
  B: {
    id: "B",
    name: "Value Expansion",
    badge: "Recommended",
    badgeClass: "badge-primary",
    discount: "10% + 2-Year Care Pack",
    discountNum: 10,
    dealValue: "₹17,80,000",
    cogs: "₹13,97,000",
    margin: 21.5,
    marginFloor: 18.0,
    riskScore: 28,
    riskLevel: "Low",
    approvalRequired: "Regional Sales Manager",
    logisticsFreight: "₹14,200 (2 Depots)",
    recurringArr: "₹4.2L ARR",
    winRate: 68,
    counterRate: 26,
    rejectionRate: 6,
    summary: "Protects margin above 18% floor via warranty bundle. Highest customer win rate.",
  },
  C: {
    id: "C",
    name: "Margin Maximization",
    badge: "Autonomous",
    badgeClass: "badge-success",
    discount: "7% + Premium SLA",
    discountNum: 7,
    dealValue: "₹18,10,000",
    cogs: "₹13,54,000",
    margin: 25.2,
    marginFloor: 18.0,
    riskScore: 14,
    riskLevel: "Low",
    approvalRequired: "None (Autonomous Self-Approval)",
    logisticsFreight: "₹8,500 (Single Depot)",
    recurringArr: "₹4.6L ARR",
    winRate: 58,
    counterRate: 35,
    rejectionRate: 7,
    summary: "Locks 25.2% gross profit. Zero approval latency for rapid end-of-quarter closure.",
  },
};

export default function DualSidedSimulator() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("B");
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const current = scenarios[activeScenario];

  const handleApply = (id: ScenarioType) => {
    setAppliedNotification(`Scenario ${id} (${scenarios[id].name}) applied to Deal QT-2026-0043.`);
    setTimeout(() => setAppliedNotification(null), 3500);
  };

  return (
    <section id="simulator" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Explore the deal before you commit.
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Simulate internal business impact against empirical customer negotiation psychology before sending the quote.
          </p>
        </motion.div>

        {/* Applied Notification */}
        <AnimatePresence>
          {appliedNotification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-md mx-auto mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{appliedNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Scenario Selector Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Select Strategy:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(["A", "B", "C"] as ScenarioType[]).map((key) => {
                const sc = scenarios[key];
                const isSelected = activeScenario === key;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setActiveScenario(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? sc.id === "B"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Scenario {sc.id}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      ({sc.discountNum}%)
                    </span>
                    {sc.id === "B" && (
                      <span className="text-amber-300 text-xs">★</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`badge ${current.badgeClass} text-[10px] font-bold`}>
              {current.name} • {current.badge}
            </span>
            <button
              type="button"
              onClick={() => handleApply(activeScenario)}
              className="btn-primary text-xs py-1.5 px-3.5 shadow-xs"
            >
              Apply Scenario →
            </button>
          </div>
        </div>

        {/* DUAL-SIDED ANALYSIS DISPLAY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. SENSITIVE INTERNAL BUSINESS IMPACT (Left 6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Internal Commercial Reality (Confidential)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Protected Data
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Gross Margin
                </span>
                <span className={`text-xl font-black ${
                  current.margin >= 18 ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {current.margin}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Floor: {current.marginFloor}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  True Base COGS
                </span>
                <span className="text-xl font-black text-slate-800">
                  {current.cogs}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Cost baseline
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Governance Risk
                </span>
                <span className={`text-xl font-black ${
                  current.riskLevel === "High" ? "text-rose-600" : "text-emerald-600"
                }`}>
                  {current.riskScore} <span className="text-xs font-medium text-slate-400">/100</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {current.riskLevel} Risk
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Required Approval:</span>
                <strong className={current.margin < 18 ? "text-rose-600" : "text-slate-800"}>
                  {current.approvalRequired}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Logistics Freight Surcharge:</span>
                <span className="font-semibold text-slate-800">{current.logisticsFreight}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Contract Recurring Stream:</span>
                <strong className="text-indigo-700">{current.recurringArr}</strong>
              </div>
            </div>
          </div>

          {/* 2. CUSTOMER EMPIRICAL RESPONSE (Right 6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Customer Empirical Probability
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Acme Corp Model
              </span>
            </div>

            {/* Probability Gauges */}
            <div className="space-y-3.5 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Direct Contract Acceptance</span>
                  <span className="text-emerald-600">{current.winRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${current.winRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Counter-Negotiation Expected</span>
                  <span className="text-amber-600">{current.counterRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${current.counterRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Rejection / Walkaway Risk</span>
                  <span className="text-rose-600">{current.rejectionRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${current.rejectionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <strong className="text-slate-800 block mb-0.5">Strategic Finding:</strong>
              {current.summary}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
