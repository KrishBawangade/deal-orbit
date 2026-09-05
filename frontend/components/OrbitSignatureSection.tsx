"use client";

import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Tag, Percent, ShieldCheck, Boxes,
  Truck, CreditCard, RefreshCw, Activity, Workflow,
} from "lucide-react";

interface OrbitForce {
  id: string;
  name: string;
  angle: number;
  radius: number;
  icon: React.ElementType;
  insight: string;
  badge: string;
}

const FORCES: OrbitForce[] = [
  { id: "customer",    name: "Customer",    angle: 0,   radius: 210, icon: Users,       insight: "Corridor: 8–12% historical discount tolerance", badge: "Behavioral" },
  { id: "pricing",     name: "Pricing",     angle: 40,  radius: 150, icon: Tag,         insight: "Ceiling: 12% max before CFO escalation",        badge: "Governance" },
  { id: "margin",      name: "Margin",      angle: 80,  radius: 210, icon: Percent,     insight: "Current gross margin: 21.5% (Protected)",        badge: "Commercial" },
  { id: "approval",    name: "Approval",    angle: 120, radius: 150, icon: ShieldCheck, insight: "Manager approval required & pre-routed",          badge: "Workflow"   },
  { id: "inventory",   name: "Inventory",   angle: 160, radius: 210, icon: Boxes,       insight: "20 requested / 20 available across 2 hubs",      badge: "Physical"   },
  { id: "fulfillment", name: "Fulfillment", angle: 200, radius: 150, icon: Truck,       insight: "Main Warehouse (12u) + East Depot (8u)",          badge: "Logistics"  },
  { id: "billing",     name: "Billing",     angle: 240, radius: 210, icon: CreditCard,  insight: "₹5.5L One-time + ₹35K Monthly Recurring ARR",    badge: "Revenue"    },
  { id: "negotiation", name: "Negotiation", angle: 280, radius: 150, icon: RefreshCw,   insight: "Auto re-simulation trigger on counter-offers",    badge: "Adaptive"   },
  { id: "dealhealth",  name: "Deal Health", angle: 320, radius: 210, icon: Activity,    insight: "92/100 composite operational health score",       badge: "Telemetry"  },
];

// Pre-compute positions once at module level
const POSITIONS = FORCES.map((f) => {
  const rad = (f.angle * Math.PI) / 180;
  return {
    x: Math.round(Math.cos(rad) * f.radius * 100) / 100,
    y: Math.round(Math.sin(rad) * f.radius * 100) / 100,
  };
});

// SVG icon paths for direct DOM injection (avoids React re-render for icon swap)
const ICON_SVG: Record<string, string> = {
  customer:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>',
  pricing:     '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>',
  margin:      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>',
  approval:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
  inventory:   '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>',
  fulfillment: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>',
  billing:     '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>',
  negotiation: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>',
  dealhealth:  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
};

export default function OrbitSignatureSection() {
  // Refs to banner DOM nodes — updated directly, bypassing React re-render
  const bannerIconRef = useRef<SVGSVGElement>(null);
  const bannerNameRef = useRef<HTMLHeadingElement>(null);
  const bannerBadgeRef = useRef<HTMLSpanElement>(null);
  const bannerInsightRef = useRef<HTMLParagraphElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIdRef = useRef("margin");

  // Set initial active state on mount
  useEffect(() => {
    updateBanner("margin");
    updateNodeStyles("margin");
  }, []);

  const updateBanner = useCallback((id: string) => {
    const force = FORCES.find((f) => f.id === id);
    if (!force) return;
    if (bannerNameRef.current) bannerNameRef.current.textContent = `${force.name} Force`;
    if (bannerBadgeRef.current) bannerBadgeRef.current.textContent = force.badge;
    if (bannerInsightRef.current) bannerInsightRef.current.textContent = force.insight;
    if (bannerIconRef.current) bannerIconRef.current.innerHTML = ICON_SVG[id] ?? ICON_SVG.margin;
  }, []);

  const updateNodeStyles = useCallback((id: string) => {
    nodeRefs.current.forEach((el, i) => {
      if (!el) return;
      const force = FORCES[i];
      const isActive = force.id === id;
      const { x, y } = POSITIONS[i];
      el.style.transform = `translate(${x}px, ${y}px) scale(${isActive ? 1.08 : 1})`;
      el.style.borderColor = isActive ? "#3b82f6" : "#e2e8f0";
      el.style.boxShadow = isActive ? "0 4px 16px rgba(59,130,246,0.15)" : "0 1px 3px rgba(0,0,0,0.05)";
      const iconBox = el.querySelector(".icon-box") as HTMLElement | null;
      if (iconBox) {
        iconBox.style.backgroundColor = isActive ? "#2563eb" : "#f1f5f9";
        iconBox.style.color = isActive ? "#ffffff" : "#475569";
      }
    });
  }, []);

  const handleEnter = useCallback((id: string) => {
    if (activeIdRef.current === id) return;
    activeIdRef.current = id;
    // Direct DOM — no setState, no re-render, truly instant
    updateBanner(id);
    updateNodeStyles(id);
  }, [updateBanner, updateNodeStyles]);

  return (
    <section id="how-it-works" className="py-24 bg-white/70 border-t border-blue-200/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-14"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
            Every force around the deal.
            <span className="block text-blue-600 mt-1">One intelligent orbit.</span>
          </h2>
          <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto">
            Hover over any operational force to inspect how the Deal Strategy Engine harmonizes constraints into one executable transaction.
          </p>
        </motion.div>

        {/* Orbit Stage */}
        <div className="relative max-w-2xl mx-auto h-[480px] sm:h-[540px] flex items-center justify-center">

          {/* SVG Orbit Tracks */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 540 540">
            <circle cx="270" cy="270" r="210" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="270" cy="270" r="150" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>

          {/* Central Hub */}
          <div className="relative z-20 w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/25 flex flex-col items-center justify-center p-3 text-center border-4 border-white">
            <Workflow className="w-5 h-5 text-blue-200 mb-1" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">CORE</span>
            <span className="text-lg font-black tracking-tight leading-tight">THE DEAL</span>
            <span className="text-[9px] text-blue-100 font-medium mt-0.5">Acme Corp ₹18.4L</span>
          </div>

          {/* Orbit Nodes */}
          {FORCES.map((force, i) => {
            const Icon = force.icon;
            const { x, y } = POSITIONS[i];
            const isInitialActive = force.id === "margin";
            return (
              <div
                key={force.id}
                ref={(el) => { nodeRefs.current[i] = el; }}
                onMouseEnter={() => handleEnter(force.id)}
                suppressHydrationWarning
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${isInitialActive ? 1.08 : 1})`,
                  transition: "transform 120ms ease, border-color 80ms ease, box-shadow 80ms ease",
                  willChange: "transform",
                  borderColor: isInitialActive ? "#3b82f6" : "#e2e8f0",
                  boxShadow: isInitialActive ? "0 4px 16px rgba(59,130,246,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
                }}
                className="absolute z-30 flex items-center gap-1.5 p-2 rounded-xl cursor-default select-none bg-white border"
              >
                <div
                  className="icon-box w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    transition: "background-color 80ms ease, color 80ms ease",
                    backgroundColor: isInitialActive ? "#2563eb" : "#f1f5f9",
                    color: isInitialActive ? "#ffffff" : "#475569",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 pr-1 hidden sm:inline">
                  {force.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Insight Banner — DOM-updated, never re-renders */}
        <div className="max-w-xl mx-auto -mt-6 relative z-30">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-blue-500/30 shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <svg
                  ref={bannerIconRef}
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  dangerouslySetInnerHTML={{ __html: ICON_SVG.margin }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 ref={bannerNameRef} className="text-sm font-bold text-slate-900">Margin Force</h4>
                  <span ref={bannerBadgeRef} className="badge badge-primary text-[10px]">Commercial</span>
                </div>
                <p ref={bannerInsightRef} className="text-xs text-slate-600 font-medium mt-0.5">
                  Current gross margin: 21.5% (Protected)
                </p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline shrink-0">Continuous Telemetry</span>
          </div>
        </div>

      </div>
    </section>
  );
}
