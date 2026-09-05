"use client";

import { motion } from "framer-motion";
import { 
  Percent, 
  Tag, 
  Users2, 
  ShieldCheck, 
  Boxes, 
  CreditCard, 
  MessageSquareCode, 
  Workflow 
} from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.07 },
  }),
};

export default function PositioningStrip() {
  const forces = [
    { label: "Margin", icon: Percent, desc: "Profit Floor" },
    { label: "Pricing", icon: Tag, desc: "Category Ceilings" },
    { label: "Customer Behavior", icon: Users2, desc: "Empirical Corridor" },
    { label: "Approval", icon: ShieldCheck, desc: "Governance Flow" },
    { label: "Inventory", icon: Boxes, desc: "Multi-Warehouse" },
    { label: "Billing", icon: CreditCard, desc: "Hybrid & Proration" },
    { label: "Negotiation", icon: MessageSquareCode, desc: "Self-Governing" },
  ];

  return (
    <section id="platform" className="py-12 border-y border-blue-200/50 bg-white/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-9"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            One deal. Multiple realities. One intelligent decision layer.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every commercial deal is influenced by concurrent organizational realities that usually exist in silos.
          </p>
        </motion.div>

        {/* Visual Architecture: Converging forces toward Central Deal */}
        <div className="relative">
          {/* Subtle connection horizontal bar for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-blue-200 to-transparent -z-0" />

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative z-10 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {forces.slice(0, 4).map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  custom={i}
                  variants={cardVariants}
                  className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all text-center group"
                >
                  <div className="w-8 h-8 mx-auto rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="block text-xs font-bold text-slate-800 tracking-tight">
                    {f.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {f.desc}
                  </span>
                </motion.div>
              );
            })}

            {/* Central Deal Anchor */}
            <motion.div
              className="col-span-2 sm:col-span-4 lg:col-span-2 my-2 lg:my-0"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3.5 shadow-md shadow-blue-500/20 text-center border border-blue-400/30">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <Workflow className="w-4 h-4 text-blue-200" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-blue-100">
                    Decision Layer
                  </span>
                </div>
                <span className="block text-base font-extrabold tracking-tight">
                  THE DEAL
                </span>
                <span className="block text-[10px] text-blue-100/90 mt-0.5">
                  Self-Governing Core
                </span>
              </div>
            </motion.div>

            {forces.slice(4).map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  custom={i + 5}
                  variants={cardVariants}
                  className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all text-center group"
                >
                  <div className="w-8 h-8 mx-auto rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="block text-xs font-bold text-slate-800 tracking-tight">
                    {f.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {f.desc}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
