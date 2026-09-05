"use client";

import React, { useState } from "react";
import { Sparkles, Shield, UserCheck, KeyRound, Check, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";

interface DemoPersona {
  role: string;
  name: string;
  email: string;
  badge: string;
  color: string;
  description: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: "Sales Rep",
    name: "Alex Rivera",
    email: "alex.rep@dealorbit.com",
    badge: "Quoting & Negotiation",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    description: "Live quote simulator, pricing intelligence, and customer interaction.",
  },
  {
    role: "Sales Manager",
    name: "Sarah Chen",
    email: "sarah.manager@dealorbit.com",
    badge: "Approvals & Guardrails",
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    description: "Multi-level margin threshold overrides and deal sign-offs.",
  },
  {
    role: "Finance / Ops",
    name: "Marcus Vance",
    email: "marcus.ops@dealorbit.com",
    badge: "Fulfillment & Billing",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    description: "Multi-warehouse split allocations and hybrid billing engine.",
  },
  {
    role: "Admin",
    name: "Elena Rostova",
    email: "admin@dealorbit.com",
    badge: "Global Governance",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    description: "Discount matrix ceilings, audit logs, and ERP synchronizations.",
  },
];

interface SmartSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (email: string, role: string) => void;
}

export function SmartSignInModal({
  isOpen,
  onClose,
  onSelectPersona,
}: SmartSignInModalProps) {
  const [activeTab, setActiveTab] = useState<"personas" | "passkey">("personas");
  const [passkeyProgress, setPasskeyProgress] = useState(false);

  if (!isOpen) return null;

  const handlePasskeySimulation = () => {
    setPasskeyProgress(true);
    toast.info("Triggering Passkey / WebAuthn prompt...");
    setTimeout(() => {
      setPasskeyProgress(false);
      toast.success("Biometric authentication verified!");
      onSelectPersona("admin@dealorbit.com", "Admin");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 via-transparent to-[var(--accent)]/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--primary)] text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-[var(--text-main)]">
                Smart Sign-in Hub
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                1-Click hackathon demo access or biometric passkey
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[var(--border)] bg-[var(--background)] px-6 pt-3">
          <button
            onClick={() => setActiveTab("personas")}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all mr-6 ${
              activeTab === "personas"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Demo Personas
          </button>
          <button
            onClick={() => setActiveTab("passkey")}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === "passkey"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Biometric / Passkey
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
          {activeTab === "personas" ? (
            <>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Select any DealOrbit demo persona to sign in instantly without typing passwords:
              </p>
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.role}
                  onClick={() => {
                    toast.success(`Signed in as ${p.name} (${p.role})`);
                    onSelectPersona(p.email, p.role);
                    onClose();
                  }}
                  className="w-full text-left p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)]/40 transition-all duration-150 flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-sm text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                        {p.name}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${p.color}`}>
                        {p.role}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {p.description}
                    </p>
                    <span className="text-[11px] font-mono text-[var(--text-subtle)] block">
                      {p.email}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-[var(--primary)]">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-semibold text-base text-[var(--text-main)]">
                  FIDO2 / WebAuthn Ready
                </h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Sign in instantly with Windows Hello, Touch ID, Apple FaceID, or hardware security keys.
                </p>
              </div>
              <button
                type="button"
                disabled={passkeyProgress}
                onClick={handlePasskeySimulation}
                className="btn-primary w-full py-3 text-sm justify-center"
              >
                {passkeyProgress ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Scanning Biometrics...
                  </span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Authenticate with Device Key
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--background)] border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[var(--success)]" /> Session persists across workspace
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-main)] hover:underline font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
