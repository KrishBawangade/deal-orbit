import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ArrowLeft, Home, FileText, Search, ShieldOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-4 sm:p-6 relative selection:bg-[var(--primary)] selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)] p-8 sm:p-10 text-center relative z-10 transition-all duration-200">
        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        {/* 404 Display */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 mb-4 shadow-2xs">
          <Search className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-main)] font-heading mb-2">
          404
        </h1>

        <h2 className="text-lg font-bold text-[var(--text-main)] mb-3">
          Page Not Found
        </h2>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto mb-8">
          The page you are trying to access does not exist, has been moved, or is restricted from your account.
        </p>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto btn-primary py-2.5 px-5 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto btn-ghost py-2.5 px-5 rounded-xl border border-[var(--border)] hover:bg-[var(--card-hover)] text-xs font-medium text-[var(--text-main)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sign In / Switch Account</span>
          </Link>
        </div>

        {/* Bottom Helpful Links */}
        <div className="mt-8 pt-5 border-t border-[var(--border-subtle)] flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
          <Link
            href="/portal/cust-001"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Customer Portal Room (cust-001)
          </Link>
          <span>•</span>
          <Link
            href="/quotations"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Sales Quotations
          </Link>
        </div>
      </div>
    </div>
  );
}
