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
    <div className="w-full rounded-[var(--radius-md)] border border-slate-200 bg-slate-50/80 overflow-hidden transition-all duration-200 shadow-2xs">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/90 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-indigo-50 text-[var(--primary)] border border-indigo-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-[var(--primary)]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 group-hover:text-[var(--primary)] transition-colors">
              Demo Role Accounts
            </span>
            <span className="ml-2 text-[10px] text-slate-500 font-normal hidden sm:inline">
              (5 personas available)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-[var(--primary)]">
            {isOpen ? "Hide" : "Explore"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded Persona List */}
      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-slate-200/80 animate-fadeIn">
          <p className="text-[11px] text-slate-500 mb-2">
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
                  className={`w-full p-2.5 rounded-[var(--radius-sm)] border text-left flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer group ${
                    isSelected
                      ? "border-[var(--primary)] bg-indigo-50/90 shadow-2xs ring-1 ring-[var(--primary)]/30"
                      : "border-slate-200/90 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-2xs"
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
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[var(--primary)] transition-colors truncate">
                          {user.roleLabel}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${user.badgeColor.bg} ${user.badgeColor.text} ${user.badgeColor.border}`}
                        >
                          {ROLE_ICONS[user.role]}
                          {user.role}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        <span className="font-semibold text-slate-800">{user.name}</span> &bull;{" "}
                        <span className="font-mono text-[10px] text-slate-500 group-hover:text-slate-700">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Selected Check or Subtle Indicator */}
                  <div className="shrink-0 flex items-center pr-1">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] bg-indigo-100/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                        <Check className="w-3 h-3" />
                        <span>Filled</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                        Click to fill &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Universal demo password:</span>
              <code className="font-mono text-slate-800 font-semibold bg-slate-200/70 px-1.5 py-0.5 rounded text-[10px]">DealOrbit@123</code>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
