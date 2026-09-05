import React from "react";
import { HelpCircle } from "lucide-react";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] relative overflow-x-hidden selection:bg-[var(--primary-subtle)] selection:text-[var(--primary)]">
      {/* Background Decorative Ambient Blobs & Subtle Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>



      {/* Centered Main Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-4">
        {children}
      </main>

      {/* Auth Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
        <p>© {new Date().getFullYear()} DealOrbit Inc. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[var(--text-main)] transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-[var(--text-main)] transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-[var(--text-main)] transition-colors">
            Security Overview
          </a>
          <a
            href="#"
            className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Help & Support
          </a>
        </div>
      </footer>
    </div>
  );
}
