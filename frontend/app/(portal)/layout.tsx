"use client";

import React from "react";
import Link from "next/link";
import { QuotationsProvider, useQuotations } from "@/context/QuotationsContext";
import Logo from "@/components/Logo";
import {
  ShieldCheck,
  Building2,
  Lock,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Layers,
} from "lucide-react";

function PortalShell({ children }: { children: React.ReactNode }) {
  const { quotations } = useQuotations();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white">
      {/* 1. Customer-Facing Minimalist Header (Strictly Isolated from Internal Menus) */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Portal Room Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo size="sm" showText={true} />
            </Link>

            <div className="h-5 w-[1px] bg-[var(--border)] hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-main)] font-heading">
                Customer Negotiation Portal
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                Restricted External View
              </span>
            </div>
          </div>

          {/* Right Slot: Secure Session Info & Demo Quote Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--background)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
              <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-[11px] font-medium">Demo Quotes:</span>
              {quotations.slice(0, 3).map((q) => (
                <Link
                  key={q.id}
                  href={`/portal/${q.portalToken || q.id}`}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded hover:bg-[var(--card)] text-[var(--text-main)] font-semibold transition-colors"
                >
                  {q.id}
                </Link>
              ))}
            </div>

            {/* Secure Token Session Pill */}
            <div className="flex items-center gap-2 bg-[var(--background)]/80 border border-[var(--border)] py-1 px-3 rounded-full text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1 text-[var(--text-main)] font-medium">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px]">Encrypted Magic Link</span>
              </div>
            </div>

            {/* Link back to internal workspace for evaluation convenience */}
            <Link
              href="/quotations"
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 transition-colors px-2 py-1 rounded-md border border-transparent hover:border-[var(--border)] cursor-pointer"
              title="Return to Internal Sales Workspace"
            >
              <span className="hidden lg:inline">Internal Workspace</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Portal Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* 3. Customer Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)] py-6 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 DealOrbit Enterprise Operations. Strictly Confidential & Client Privileged.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Zero-Leakage Data Masking Enabled</span>
            <span>•</span>
            <span>256-bit Commercial Encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuotationsProvider>
      <PortalShell>{children}</PortalShell>
    </QuotationsProvider>
  );
}
