"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import Logo from "@/components/Logo";

export default function FinalCtaAndFooter() {
  return (
    <>
      {/* FINAL CTA SECTION */}
      <section className="py-24 bg-white/70 relative overflow-hidden border-t border-blue-200/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-slate-900 tracking-tight leading-[1.15]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Explore the deal
            <span className="block text-blue-600 mt-1">before the customer does.</span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mt-4 leading-relaxed"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Build smarter strategies, navigate complexity, and turn commercial decisions into executable deals.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-3.5 mt-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href="#"
              className="btn-primary py-3.5 px-7 text-sm font-semibold shadow-md hover:shadow-blue-500/20 inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="btn-secondary py-3.5 px-7 text-sm font-semibold inline-flex items-center gap-2"
            >
              Sign In
            </a>
          </motion.div>
        </div>
      </section>

      {/* ENTERPRISE FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Col 1: Brand (2 cols on mobile) */}
            <div className="col-span-2 space-y-4">
              <Logo size="md" showText showSubtitle subtitle="Sales Operations" />
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                An Intelligent, Self-Governing Sales Operations Platform. DealOrbit evaluates the commercial, operational, and customer realities of every deal before commitment.
              </p>
              <div className="text-[11px] text-slate-500">
                Human knows the customer. System knows the complexity.
              </div>
            </div>

            {/* Col 2: Platform */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Platform
              </h4>
              <ul className="space-y-2">
                <li><a href="#platform" className="hover:text-white transition-colors">Deal Strategy Engine</a></li>
                <li><a href="#simulator" className="hover:text-white transition-colors">Scenario Explorer</a></li>
                <li><a href="#governance" className="hover:text-white transition-colors">Pricing & Ceilings</a></li>
                <li><a href="#governance" className="hover:text-white transition-colors">Approvals Flow</a></li>
                <li><a href="#platform" className="hover:text-white transition-colors">Fulfillment Intelligence</a></li>
                <li><a href="#platform" className="hover:text-white transition-colors">Hybrid Billing</a></li>
              </ul>
            </div>

            {/* Col 3: Solutions */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Solutions
              </h4>
              <ul className="space-y-2">
                <li><a href="#simulator" className="hover:text-white transition-colors">Sales Teams</a></li>
                <li><a href="#intelligence" className="hover:text-white transition-colors">Revenue Operations</a></li>
                <li><a href="#governance" className="hover:text-white transition-colors">Finance & Legal</a></li>
                <li><a href="#platform" className="hover:text-white transition-colors">Supply & Logistics</a></li>
              </ul>
            </div>

            {/* Col 4: Company & Legal */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Company
              </h4>
              <ul className="space-y-2 mb-4">
                <li><a href="#about" className="hover:text-white transition-colors">About DealOrbit</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Enterprise</a></li>
              </ul>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
                Legal
              </h4>
              <ul className="space-y-2">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>
              &copy; {new Date().getFullYear()} DealOrbit Inc. All rights reserved. Enterprise B2B Sales Operations.
            </span>
            <div className="flex items-center gap-4">
              <span>Next.js 16</span>
              <span>â€¢</span>
              <span>React 19</span>
              <span>â€¢</span>
              <span>Tailwind CSS v4</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

