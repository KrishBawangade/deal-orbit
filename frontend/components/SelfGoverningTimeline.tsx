"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  RefreshCw, 
  AlertOctagon, 
  ShieldAlert, 
  RotateCcw, 
  GitBranch, 
  Clock, 
  CheckCircle2, 
  UserCheck 
} from "lucide-react";

export default function SelfGoverningTimeline() {
  const [activeStep, setActiveStep] = useState<number>(3);

  const steps = [
    {
      id: 1,
      title: "APPROVED",
      status: "Initial State",
      badge: "badge-success",
      desc: "Sales manager signs off on initial 10% quotation bundle.",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: 2,
      title: "Customer Counter-Offer",
      status: "External Event",
      badge: "badge-accent",
      desc: "Procurement counter-proposes 16.5% discount via Portal.",
      icon: RefreshCw,
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      id: 3,
      title: "Discount Ceiling Breached",
      status: "Automated Audit",
      badge: "badge-danger",
      desc: "System detects counter exceeds 12% managerial authority ceiling.",
      icon: AlertOctagon,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      id: 4,
      title: "Prior Approval Revoked",
      status: "Self-Governing Action",
      badge: "badge-danger",
      desc: "Deal lock is immediately invalidated; deal is flagged in audit log.",
      icon: ShieldAlert,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      id: 5,
      title: "Risk Recalculated",
      status: "Continuous Analysis",
      badge: "badge-warning",
      desc: "Deal risk score jumps from 28 to 82/100; margin floor breached.",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: 6,
      title: "Deal Re-Routed",
      status: "Dynamic Escalation",
      badge: "badge-primary",
      desc: "Deal automatically routes to Finance VP with counter-analysis.",
      icon: GitBranch,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
  ];

  return (
    <section id="governance" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="type-eyebrow mb-2 block">Autonomous Governance</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            The deal keeps thinking after approval.
          </h2>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">
            Legacy sales tools treat approval as a one-time stamp. In DealOrbit, if a customer procurement negotiation breaches commercial limits, prior sign-offs are autonomously revoked and dynamically re-routed.
          </p>
        </div>

        {/* Dynamic Timeline Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 lg:p-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Live Governance Audit Trail
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Automated State Machine Response to Procurement Counter-Offer
              </h3>
            </div>

            {/* Interactive Step Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Highlight Stage:</span>
              <div className="flex gap-1">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveStep(s.id)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      activeStep === s.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Connected Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isSelected = activeStep === step.id;
              return (
                <motion.div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  whileHover={{ y: -2 }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${step.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        STEP 0{step.id}
                      </span>
                    </div>
                    <span className={`badge ${step.badge} text-[10px]`}>
                      {step.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-snug">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Callout */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Outcome:</strong> Deal status automatically updated to <span className="font-bold underline">Re-routed to Finance</span> with side-by-side impact comparison.
              </span>
            </div>
            <span className="font-mono text-blue-700 font-semibold hidden sm:inline">
              Latency: 120ms
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
