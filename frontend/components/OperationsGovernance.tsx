"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Warehouse, 
  CreditCard, 
  AlertOctagon, 
  RotateCcw, 
  CheckCircle2, 
  Truck, 
  Calendar,
  Lock
} from "lucide-react";

export default function OperationsGovernance() {
  const [activeTab, setActiveTab] = useState<"governance" | "fulfillment" | "billing">("governance");

  return (
    <section id="governance" className="py-20 bg-white/70 border-y border-blue-200/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-10"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Commercial decisions understand operational reality.
          </h2>
          <p className="text-base text-slate-600 mt-2">
            DealOrbit unites margin governance, physical multi-depot inventory, and hybrid billing schedules into one self-governing platform.
          </p>
        </motion.div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("governance")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "governance"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Continuous Governance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fulfillment")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "fulfillment"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              Multi-Warehouse Feasibility
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "billing"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Hybrid Billing Streams
            </button>
          </div>
        </div>

        {/* Tab 1: Continuous Governance */}
        {activeTab === "governance" && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                  Autonomous Re-Routing Trigger
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  The deal keeps thinking after approval.
                </h3>
              </div>
              <span className="badge badge-danger text-xs font-bold">
                Discount Ceiling Breach
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  1. Approved Quote
                </span>
                <span className="font-bold text-slate-800">10% Approved</span>
                <p className="text-[11px] text-slate-500 mt-1">Manager signed off on standard pricing corridor.</p>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-700 uppercase font-bold block mb-1">
                  2. Counter-Offer
                </span>
                <span className="font-bold text-amber-900">16.5% Requested</span>
                <p className="text-[11px] text-amber-800 mt-1">Customer counter-offers via Customer Portal.</p>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
                <span className="text-[10px] text-rose-700 uppercase font-bold block mb-1">
                  3. Sign-off Revoked
                </span>
                <span className="font-bold text-rose-900">Prior Approval Invalid</span>
                <p className="text-[11px] text-rose-800 mt-1">Breaches 12% managerial floor. Deal lock revoked.</p>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <span className="text-[10px] text-blue-700 uppercase font-bold block mb-1">
                  4. Dynamic Escalation
                </span>
                <span className="font-bold text-blue-900">Re-routed to CFO</span>
                <p className="text-[11px] text-blue-800 mt-1">Automatically queued to executive with risk delta.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Security Boundary:</strong> Internal margin drops (21.5% â†’ 12.8%) are protected internally; customer portal only sees &ldquo;Counter under managerial review.&rdquo;</span>
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Warehouse Feasibility */}
        {activeTab === "fulfillment" && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block">
                  Cross-Depot Allocation
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Commercial promises verified against physical inventory.
                </h3>
              </div>
              <span className="badge badge-success text-xs font-bold">
                20 Units Feasible
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block text-sm">Main Regional Hub</span>
                <span className="text-slate-500 block text-xs mt-0.5">12 units available</span>
                <div className="mt-2 text-emerald-600 font-bold">â†’ 12 Units Allocated</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block text-sm">East Logistics Depot</span>
                <span className="text-slate-500 block text-xs mt-0.5">8 units available</span>
                <div className="mt-2 text-blue-600 font-bold">â†’ 8 Units Allocated</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
                <span className="font-bold text-slate-800 block text-sm">West Hub Center</span>
                <span className="text-rose-600 block text-xs mt-0.5">0 units (Exhausted)</span>
                <div className="mt-2 text-slate-400 font-semibold">0 Allocated</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Recommended 2-depot shipment plan automatically factors ₹14,200 freight into the deal margin calculation.</span>
              </span>
              <span className="font-bold font-mono">2 Shipments</span>
            </div>
          </div>
        )}

        {/* Tab 3: Hybrid Billing */}
        {activeTab === "billing" && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                  Commercial Structure
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  One deal. Multi-stream revenue unification.
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 font-mono">
                ACV: ₹9.70L
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Capital / One-Time Invoice
                </span>
                <div className="text-2xl font-black text-slate-900">₹5,50,000</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Hardware Server Nodes (₹5.0L) + Implementation (₹50K). Dispatched on contract execution.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-indigo-600 block mb-1">
                  Recurring Subscription Stream
                </span>
                <div className="text-2xl font-black text-indigo-700">₹35,000 <span className="text-xs font-medium text-slate-500">/ month</span></div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cloud Management (₹25K/mo) + 24/7 SLA Support (₹10K/mo). Automated recurring billing schedule.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Automated schedule reconciles one-time capital invoicing and mid-cycle recurring subscription proration without manual ledger adjustments.</span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

