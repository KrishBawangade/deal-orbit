"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

export default function LiveOperationalTimeline() {
  const events = [
    { time: "09:12", event: "Opportunity Created", desc: "CRM syncs Acme Corp infrastructure expansion signal", badge: "CRM Sync" },
    { time: "09:18", event: "Quotation Generated", desc: "Sales rep configures 20 enterprise nodes + care pack", badge: "Bill of Materials" },
    { time: "09:20", event: "Strategy Simulation Completed", desc: "Deal Engine recommends Scenario B (21.5% margin, 68% win rate)", badge: "Deal Strategy" },
    { time: "09:21", event: "Approval Routed", desc: "Automated sign-off routed to Regional Sales Manager", badge: "Governance" },
    { time: "09:24", event: "Inventory Allocated", desc: "Smart 2-depot split confirmed across Main (12u) & East (8u)", badge: "Logistics" },
    { time: "09:26", event: "Invoice Generated", desc: "₹5.5L capital invoice + recurring cloud schedule created", badge: "Hybrid Billing" },
    { time: "09:28", event: "Payment Received", desc: "Procurement confirms digital escrow & sign-off in Portal", badge: "Settlement" },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="type-eyebrow mb-2 block">Continuous Execution Velocity</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            16 minutes from quotation to cash.
          </h2>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">
            By eliminating friction between quotation design, multi-tier approvals, inventory feasibility, and billing generation, DealOrbit collapses multi-week sales operations cycles into minutes.
          </p>
        </div>

        {/* Timeline Flow */}
        <div className="relative border-l-2 border-blue-200 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-6">
          {events.map((ev, index) => (
            <motion.div
              key={ev.time}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="relative group"
            >
              {/* Bullet Node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 transition-transform flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              </div>

              <div className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-xl hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all max-w-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {ev.time}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {ev.event}
                    </h4>
                  </div>
                  <span className="badge badge-neutral text-[10px]">
                    {ev.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {ev.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
