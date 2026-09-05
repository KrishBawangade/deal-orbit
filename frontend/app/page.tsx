import HealthStatus from "@/components/HealthStatus";
import ToastDemo from "@/components/ToastDemo";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Top Navbar */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              O
            </div>
            <div>
              <span className="font-heading font-bold text-[var(--text-main)] text-base leading-tight block">
                {siteConfig.name}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block leading-none">
                Single-Source Theme System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="badge badge-primary hidden sm:inline-flex">
              Tailwind CSS v4
            </span>
            <a
              href="https://github.com/KrishBawangade/odoo_hack_starter"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs py-1.5 px-3"
            >
              GitHub
            </a>
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

        {/* Component Kit Showcase */}
        <section id="components" className="space-y-6">
          <div className="border-b border-[var(--border)] pb-3">
            <h2 className="type-h2">Reusable Component Kit</h2>
            <p className="type-muted">
              Pre-built classes matching your single-theme tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons Card */}
            <div className="card-surface space-y-4">
              <h3 className="type-h3">Button Variants</h3>
              <p className="type-muted text-xs">
                Built-in focus rings, hover elevations, and active micro-scaling.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className="btn-primary">Primary Action</button>
                <button className="btn-secondary">Secondary Action</button>
                <button className="btn-outline">Outline Button</button>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-200">
                &lt;button className="btn-primary"&gt;...&lt;/button&gt;
              </div>
            </div>

            {/* Badges & Status Pills */}
            <div className="card-surface space-y-4">
              <h3 className="type-h3">Badges & Status Pills</h3>
              <p className="type-muted text-xs">
                Semantic badges for status, tags, and category chips.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="badge badge-primary">Primary Tag</span>
                <span className="badge badge-accent">Cyan Accent</span>
                <span className="badge badge-success">System Active</span>
                <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
                  Pending Review
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-200">
                &lt;span className="badge badge-primary"&gt;...&lt;/span&gt;
              </div>
            </div>

            {/* Surface Card Demo */}
            <div className="card-surface space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge badge-accent">Card Component</span>
                <span className="text-xs text-[var(--text-muted)]">.card-surface</span>
              </div>
              <h4 className="font-heading font-semibold text-base text-[var(--text-main)]">
                Surface Elevation & Hover States
              </h4>
              <p className="type-body text-xs text-[var(--text-muted)]">
                Cards inherit border color, background, and soft ambient drop shadows automatically from <code className="font-mono">theme.css</code>.
              </p>
            </div>

            {/* Input & Form Control Demo */}
            <div className="card-surface space-y-3">
              <h4 className="font-heading font-semibold text-base text-[var(--text-main)]">
                Form Inputs
              </h4>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--text-main)]">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="Enter hackathon project name..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[var(--color-input-border)] rounded-[var(--radius-theme-md)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-main)] transition-all"
                  defaultValue="Nexus AI Agent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette Tokens Grid */}
        <section className="space-y-6">
          <div className="border-b border-[var(--border)] pb-3">
            <h2 className="type-h2">Design Token Palette</h2>
            <p className="type-muted">
              Direct mapping of CSS variables to Tailwind utility classes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[var(--primary)] text-white shadow-sm">
              <span className="font-bold block">--primary</span>
              <span className="opacity-80 text-[11px]">Brand Indigo</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary-subtle-border)]">
              <span className="font-bold block">--primary-subtle</span>
              <span className="opacity-80 text-[11px]">10% Tint</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--accent)] text-white shadow-sm">
              <span className="font-bold block">--accent</span>
              <span className="opacity-80 text-[11px]">Cyan Accent</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--card)] text-[var(--text-main)] border border-[var(--border)] shadow-sm">
              <span className="font-bold block">--card</span>
              <span className="text-[var(--text-muted)] text-[11px]">White Surface</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background)] text-[var(--text-body)] border border-[var(--border)]">
              <span className="font-bold block">--background</span>
              <span className="text-[var(--text-muted)] text-[11px]">Slate 50</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--text-main)] text-white shadow-sm">
              <span className="font-bold block">--text-main</span>
              <span className="opacity-80 text-[11px]">Slate 900</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)] py-6 mt-12 text-center text-xs text-[var(--text-muted)]">
        <p>
          {siteConfig.name} &bull; Built with Next.js 16, Tailwind CSS v4 & Express Clean Architecture
        </p>
      </footer>
    </div>
  );
}
