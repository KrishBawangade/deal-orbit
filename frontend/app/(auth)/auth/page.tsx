"use client";

import React, { useState } from "react";
import { ZohoSignInCard } from "@/components/auth/ZohoSignInCard";
import { HubspotSignUpCard } from "@/components/auth/HubspotSignUpCard";
import { Sparkles, Layers } from "lucide-react";

export default function AuthPlaygroundPage() {
  const [activeLayout, setActiveLayout] = useState<"zoho" | "hubspot">("zoho");

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6 animate-fadeIn">
      {/* Interactive Pattern Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--card)] p-1.5 rounded-full border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-1.5 px-3 text-xs font-semibold text-[var(--text-muted)]">
          <Layers className="w-3.5 h-3.5" />
          <span>Active Layout Pattern:</span>
        </div>

        <div className="flex items-center gap-1 bg-[var(--background)] p-1 rounded-full border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveLayout("zoho")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeLayout === "zoho"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            Zoho Pattern (Sign In)
          </button>
          <button
            type="button"
            onClick={() => setActiveLayout("hubspot")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeLayout === "hubspot"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            HubSpot Pattern (Sign Up)
          </button>
        </div>
      </div>

      {/* Render Active Card */}
      <div className="w-full flex justify-center transition-all duration-300">
        {activeLayout === "zoho" ? (
          <ZohoSignInCard onToggleToSignUp={() => setActiveLayout("hubspot")} />
        ) : (
          <HubspotSignUpCard onToggleToSignIn={() => setActiveLayout("zoho")} />
        )}
      </div>

      {/* Reusability Information Card */}
      <div className="max-w-md w-full p-4 rounded-[var(--radius-md)] bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
          <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Theme & Font Reusability Status</span>
        </div>
        <p>
          Both cards are fully integrated with{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[var(--primary)]">
            app/theme.css
          </code>{" "}
          and{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[var(--primary)]">
            config/fonts.ts
          </code>
          . Swapping colors or fonts in those two files immediately cascades into all buttons, borders, inputs, and typography across both layouts!
        </p>
      </div>
    </div>
  );
}
