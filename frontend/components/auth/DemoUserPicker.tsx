"use client";

import React, { useState } from "react";
import { DEMO_USERS, IDemoUser } from "@/config/demoUsers";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Shield,
  Briefcase,
  TrendingUp,
  CreditCard,
  User,
  Check,
} from "lucide-react";

interface DemoUserPickerProps {
  onSelectUser: (user: IDemoUser) => void;
  activeEmail?: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  SALES_REP: <TrendingUp className="w-3.5 h-3.5" />,
  SALES_MANAGER: <Briefcase className="w-3.5 h-3.5" />,
  FINANCE_OPS: <CreditCard className="w-3.5 h-3.5" />,
  CUSTOMER: <User className="w-3.5 h-3.5" />,
  ADMIN: <Shield className="w-3.5 h-3.5" />,
};

export function DemoUserPicker({ onSelectUser, activeEmail }: DemoUserPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelect = (user: IDemoUser) => {
    setSelectedRole(user.role);
    onSelectUser(user);
  };

  return (
    <div className="w-full rounded-[var(--radius-md)] border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden transition-all duration-200">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-[var(--primary)] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
              Demo Role Accounts
            </span>
            <span className="ml-2 text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
              (5 personas available)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <span className="text-[11px] font-medium text-[var(--primary)]">
            {isOpen ? "Hide" : "Explore"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          )}
        </div>
      </button>

      {/* Expanded Persona List */}
      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-slate-200/60 dark:border-slate-800/60 animate-fadeIn">
          <p className="text-[11px] text-[var(--text-muted)] mb-2">
            Click any demo persona to automatically fill their credentials:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_USERS.map((user) => {
              const isSelected =
                selectedRole === user.role ||
                (activeEmail && activeEmail.toLowerCase() === user.email.toLowerCase());

              return (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className={`w-full p-2.5 rounded-[var(--radius-sm)] border text-left flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                    isSelected
                      ? "border-[var(--primary)] bg-indigo-500/10 dark:bg-indigo-500/15 shadow-2xs ring-1 ring-[var(--primary)]/30"
                      : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                  }`}
                  title={`Click to fill credentials for ${user.roleLabel}`}
                >
                  {/* Left: Avatar & User Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${user.badgeColor.bg} ${user.badgeColor.text} border ${user.badgeColor.border}`}
                    >
                      {user.avatar}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors truncate">
                          {user.roleLabel}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${user.badgeColor.bg} ${user.badgeColor.text}`}
                        >
                          {ROLE_ICONS[user.role]}
                          {user.role}
                        </span>
                      </div>

                      <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        <span className="font-medium text-[var(--text-main)]">{user.name}</span> &bull;{" "}
                        <span className="font-mono text-[10px]">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Selected Check or Subtle Indicator */}
                  <div className="shrink-0 flex items-center pr-1">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Filled</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to fill &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-500" />
              Universal demo password: <code className="font-mono text-[var(--text-main)]">DealOrbit@123</code>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
