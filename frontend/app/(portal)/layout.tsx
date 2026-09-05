"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QuotationsProvider } from "@/context/QuotationsContext";
import Logo from "@/components/Logo";
import {
  ChevronDown,
  LogOut,
  User,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const portalHome = pathname && pathname.startsWith("/portal") ? pathname : "/portal/demo-token";

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setProfileOpen(false);
    toast.info("Signed out of Customer Portal", {
      description: "Returning to DealOrbit login...",
    });
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white">
      {/* 1. Customer-Facing Clean Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo & Portal Title */}
          <div className="flex items-center gap-4">
            <Link href={portalHome} className="flex items-center gap-2 group" title="Customer Proposal Room">
              <Logo size="sm" showText={true} />
            </Link>

            <div className="h-5 w-[1px] bg-[var(--border)] hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-main)] font-heading">
                Customer Negotiation Portal
              </span>
            </div>
          </div>

          {/* Right: Customer Profile Avatar & Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-[var(--border)]/80 hover:border-cyan-500/40 bg-[var(--card)]/80 backdrop-blur-md hover:bg-[var(--card)] shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Customer profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-[var(--card)]">
                  DC
                </div>

                <div className="hidden sm:flex flex-col text-left leading-tight pr-0.5">
                  <span className="text-xs font-semibold text-[var(--text-main)] truncate max-w-[130px]">
                    David Chen
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[130px]">
                    Acme Corp
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--card)]/95 backdrop-blur-2xl border border-[var(--border)]/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Customer Info Header */}
                  <div className="px-4 py-3 border-b border-[var(--border-subtle)]/70 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        DC
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-[var(--text-main)] truncate">
                          David Chen
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          customer.acme@dealorbit.io
                        </div>
                      </div>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between text-[10px]">
                      <span className="inline-flex items-center gap-1 font-semibold text-cyan-800 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        <Building2 className="w-3 h-3 text-cyan-600" />
                        <span>Acme Corp</span>
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">VP of Procurement</span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1 px-1.5">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
