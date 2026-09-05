import HealthStatus from "@/components/HealthStatus";
import ToastDemo from "@/components/ToastDemo";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Top Navbar */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[var(--text-main)] hover:text-[var(--primary)] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-xs py-1.5 px-3.5 cursor-pointer"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 space-y-12">
        {/* Hero Section */}
        <section className="space-y-4 text-center max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2">
            <span className="badge badge-accent">Unified Theme & Typography</span>
            <span className="text-xs text-[var(--text-muted)]">
              Next.js 16 + React 19
            </span>
          </div>

          <h1 className="type-h1">
            Build Fast With A Single Source of Truth
          </h1>

          <p className="type-lead">
            All colors, typography, surfaces, and geometry are controlled from a
            single file:{" "}
            <code className="bg-slate-200 px-2 py-0.5 rounded text-sm font-mono text-[var(--text-main)] font-semibold">
              frontend/app/theme.css
            </code>
            . Change any token once, and the entire app reflects it immediately.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a href="#components" className="btn-primary">
              Explore Component Kit
            </a>
            <a href="#typography" className="btn-secondary">
              View Typography Scale
            </a>
          </div>
        </section>

        {/* Live Backend Connection Status */}
        <section>
          <HealthStatus />
        </section>

        {/* Live Toast Tooling Section */}
        <section>
          <ToastDemo />
        </section>

        {/* The Magic: How To Change Theme */}
        <section className="card-surface bg-gradient-to-br from-white to-[var(--primary-subtle)]/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="badge badge-primary">How To Customize</span>
              <h2 className="type-h2">Want to change the app's brand color?</h2>
              <p className="type-body text-[var(--text-muted)] max-w-xl">
                Open <code className="font-mono font-semibold">app/theme.css</code> and update <code className="font-mono text-indigo-600 font-semibold">--primary: #6366f1;</code> to your hackathon project's hex code. Every button, border, badge, and accent on this page changes instantly!
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs shadow-md shrink-0 border border-slate-800">
              <div className="text-slate-400">// frontend/app/theme.css</div>
              <div>:root &#123;</div>
              <div className="pl-4 text-indigo-400">--primary: #6366f1;</div>
              <div className="pl-4 text-cyan-400">--accent: #06b6d4;</div>
              <div className="pl-4 text-slate-300">--radius-md: 0.75rem;</div>
              <div>&#125;</div>
            </div>
          </div>
        </section>

        {/* Typography Scale Showcase */}
        <section id="typography" className="space-y-6">
          <div className="border-b border-[var(--border)] pb-3">
            <h2 className="type-h2">Typography System</h2>
            <p className="type-muted">
              Using <strong>Plus Jakarta Sans</strong> for headings and <strong>Inter</strong> for clean body reading.
            </p>
          </div>

          <div className="card-surface space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)] w-28 shrink-0">
                .type-h1
              </span>
              <h1 className="type-h1 flex-1">
                The quick brown fox jumps over the lazy dog
              </h1>
            </div>

            <div className="border-b border-[var(--border-subtle)] pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)] w-28 shrink-0">
                .type-h2
              </span>
              <h2 className="type-h2 flex-1">
                High-performance interfaces with zero styling friction
              </h2>
            </div>

            <div className="border-b border-[var(--border-subtle)] pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)] w-28 shrink-0">
                .type-h3
              </span>
              <h3 className="type-h3 flex-1">
                Modular components designed for rapid hackathon building
              </h3>
            </div>

            <div className="border-b border-[var(--border-subtle)] pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)] w-28 shrink-0">
                .type-lead
              </span>
              <p className="type-lead flex-1">
                Subtitles and introductory paragraphs with relaxed line height and balanced visual contrast.
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)] w-28 shrink-0">
                .type-body
              </span>
              <p className="type-body flex-1">
                Standard body paragraph text optimized for maximum readability across mobile and desktop displays.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Signature Decision Simulator: Scenarios A, B, C with Sensitive Margins & COGS */}
        <DualSidedSimulator />

        {/* 6. Operations & Governance: Re-Routing, Multi-Warehouse Feasibility, Hybrid Billing */}
        <OperationsGovernance />

        {/* 7. Orbit Signature Visual Architecture: 9 Interactive Forces on Concentric Tracks */}
        <OrbitSignatureSection />

        {/* 8. Executive Pipeline Telemetry & RevOps Metrics */}
        <ExecutiveMetrics />
      </main>

      {/* 9. Final CTA & Enterprise Footer */}
      <FinalCtaAndFooter />
    </div>
  );
}
