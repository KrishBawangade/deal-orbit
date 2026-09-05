"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, ShieldCheck, Percent, DollarSign } from "lucide-react";

export default function ExecutiveMetrics() {
  const metrics = [
    {
      label: "Active Pipeline Governed",
      value: "₹48.2M",
      sub: "142 Active Enterprise Quotes",
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Deals Flagged at Risk",
      value: "12",
      sub: "Margin or stock bottleneck",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Healthy Executable Deals",
      value: "87%",
      sub: "+14% vs unassisted baseline",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Average Governed Discount",
      value: "14.2%",
      sub: "Down from 18.5% leak ceiling",
      icon: Percent,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      label: "Executable Revenue Forecast",
      value: "₹32.6M",
      sub: "95% statistical confidence",
      icon: TrendingUp,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
  ];

  return (
    <section id="telemetry" className="py-16 bg-white/70 border-t border-blue-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Predictable execution across the enterprise pipeline.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
        >
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                variants={{
                  hidden: { opacity: 0, y: 28, scale: 0.94 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all text-center group"
              >
                <div className={`w-8 h-8 mx-auto rounded-lg border flex items-center justify-center mb-2.5 ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                  {m.value}
                </div>
                <span className="text-xs font-bold text-slate-700 block mt-1">
                  {m.label}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {m.sub}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}

