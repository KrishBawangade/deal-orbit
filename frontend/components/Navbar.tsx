"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { useOptionalRole, ROLE_PERSONAS, ROLE_HOME_PATHS } from "@/context/RoleContext";
import type { Role } from "@/types";
import {
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ArrowRight,
  RefreshCw,
  Power,
  Sparkles,
  Check,
  FileText,
  Kanban,
  Boxes,
  CreditCard,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

export interface NavbarProps {
  /**
   * Preset layout variant:
   * - "landing": public marketing navbar with feature links & auth CTA
   * - "workspace": authenticated enterprise navbar with operational routes, search & avatar
   * - "custom": custom links and actions only
   */
  variant?: "landing" | "workspace" | "custom";
  /** Optional custom navigation links to override defaults */
  links?: NavItem[];
  /** Optional custom action elements for the right-hand slot */
  actions?: React.ReactNode;
  /** Optional custom href for the Logo */
  logoHref?: string;
  /** Optional custom subtitle under the Logo */
  logoSubtitle?: string;
  /** Additional container classes */
  className?: string;
}

const DEFAULT_LANDING_LINKS: NavItem[] = [
  { label: "Platform", href: "#platform" },
  { label: "Simulator", href: "#simulator" },
  { label: "Governance", href: "#governance" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Telemetry", href: "#telemetry" },
];

const DEFAULT_WORKSPACE_LINKS: NavItem[] = [];

/**
 * Reusable Glassmorphism Navbar Component for both Landing Page and Workspace.
 */
export default function Navbar({
  variant = "landing",
  links,
  actions,
  logoHref,
  logoSubtitle,
  className = "",
}: NavbarProps) {
  const pathname = usePathname();
  const roleContext = useOptionalRole();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Determine active links based on variant, role and props
  const dynamicWorkspaceLinks: NavItem[] =
    roleContext?.currentRole === "FINANCE_OPS"
      ? [
        { label: "Overview", href: "/dashboard" },
        { label: "Billing & Subscriptions", href: "/billing" },
        { label: "Fulfillment & Split", href: "/fulfillment" },
        { label: "Quotations", href: "/quotations" },
        { label: "Pipeline", href: "/pipeline" },
      ]
      : [
        { label: "Quotations", href: "/quotations" },
        { label: "Pipeline", href: "/pipeline" },
        { label: "Billing & Subscriptions", href: "/billing" },
        { label: "Fulfillment & Split", href: "/fulfillment" },
        { label: "Customer Portal", href: "/portal/demo-token" },
      ];

  const activeLinks =
    links ||
    (variant === "workspace"
      ? dynamicWorkspaceLinks
      : variant === "landing"
      ? DEFAULT_LANDING_LINKS
      : []);

  // Determine role-adaptive logo destination
  const activeRole = roleContext?.activeUser?.role;
  const roleHomePath = activeRole ? ROLE_HOME_PATHS[activeRole] : undefined;
  const resolvedLogoHref =
    logoHref ||
    (activeRole === "CUSTOMER"
      ? "/portal/demo-token"
      : variant === "workspace"
        ? roleHomePath || "/quotations"
        : "/");

  // Fallback user info if not inside RoleProvider
  const user = roleContext?.activeUser || {
    name: "Sam Seller",
    roleLabel: "Sales Rep",
    email: "sam.seller@dealorbit.io",
    badgeClass: "badge-role-rep",
    avatarText: "SS",
    role: "SALES_REP" as Role,
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[var(--border)]/60 bg-[var(--card)]/65 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--card)]/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-200 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--primary)]/30 before:to-transparent ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* 1. Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Logo
            href={resolvedLogoHref}
            size="sm"
            showText
            showSubtitle={!!logoSubtitle}
            subtitle={logoSubtitle}
          />

          {/* Desktop Navigation Links with subtle glass hover */}
          {activeLinks.length > 0 && (
            <nav className="hidden lg:flex items-center gap-1">
              {activeLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border border-[var(--primary)]/25 shadow-2xs backdrop-blur-xs"
                        : "text-[var(--text-body)] hover:text-[var(--text-main)] hover:bg-[var(--card)]/60 hover:backdrop-blur-xs"
                      }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="h-4 min-w-4 px-1 rounded-full bg-[var(--warning)] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-2xs">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* 2. Right: Action Slot (Adaptive by variant) */}
        <div className="flex items-center gap-2.5">
          {actions ? (
            actions
          ) : variant === "workspace" ? (
            /* Workspace Right Slot: Reload Data & Single Role Profile */
            <>
              {/* Action: Reload Data */}
              <button
                type="button"
                onClick={() => roleContext?.reloadData()}
                disabled={roleContext?.isReloading}
                className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)]/70 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/10 text-[var(--text-main)] transition-all cursor-pointer disabled:opacity-50"
                title="Reload pricing rules, inventory counts, and approval data from backend"
                aria-label="Reload Data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${roleContext?.isReloading
                      ? "animate-spin text-[var(--primary)]"
                      : "text-[var(--text-muted)]"
                    }`}
                />
                <span className="hidden sm:inline">
                  {roleContext?.isReloading ? "Reloading..." : "Reload Data"}
                </span>
              </button>

              {/* Single Role User Profile Trigger */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-[var(--border)]/70 hover:border-[var(--primary-subtle-border)] bg-[var(--card)]/50 backdrop-blur-md hover:bg-[var(--card)]/80 shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  aria-label="User profile menu"
                >
                  <div className="flex items-center justify-center shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-[var(--card)]">
                      {user.avatarText || getInitials(user.name)}
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col text-left leading-tight pr-0.5">
                    <span className="text-xs font-semibold text-[var(--text-main)] truncate max-w-[110px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[110px]">
                      {user.roleLabel}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:inline" />
                </button>

                {/* Profile Popover */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--card)]/95 backdrop-blur-2xl border border-[var(--border)]/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Active User Header */}
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)]/70 space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {user.avatarText || getInitials(user.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs text-[var(--text-main)] truncate">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-1.5">
                        <span className={`badge text-[10px] py-0.5 px-2 ${user.badgeClass}`}>
                          <Shield className="w-3 h-3 inline mr-1" />
                          {user.roleLabel}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ● Online
                        </span>
                      </div>
                    </div>

                    {/* Quick Menu Actions */}
                    <div className="py-1 px-1.5 space-y-0.5 text-xs text-[var(--text-body)]">
                      {user.role === "CUSTOMER" ? (
                        <Link
                          href="/portal/demo-token"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)]/70 hover:text-[var(--text-main)] transition-colors"
                        >
                          <FileText className="w-4 h-4 text-[var(--primary)]" />
                          <span>Customer Proposal Portal</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/billing"
                            onClick={() => setProfileOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)]/70 hover:text-[var(--text-main)] transition-colors"
                          >
                            <CreditCard className="w-4 h-4 text-indigo-500" />
                            <span>Billing & Subscriptions</span>
                          </Link>

                          <Link
                            href="/fulfillment"
                            onClick={() => setProfileOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)]/70 hover:text-[var(--text-main)] transition-colors"
                          >
                            <Boxes className="w-4 h-4 text-emerald-500" />
                            <span>Fulfillment & Warehouse Split</span>
                          </Link>

                          <Link
                            href="/quotations"
                            onClick={() => setProfileOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)]/70 hover:text-[var(--text-main)] transition-colors"
                          >
                            <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                            <span>My Active Quotations</span>
                          </Link>

                          <Link
                            href="/pipeline"
                            onClick={() => setProfileOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)]/70 hover:text-[var(--text-main)] transition-colors"
                          >
                            <Kanban className="w-4 h-4 text-[var(--text-muted)]" />
                            <span>Kanban Deal Pipeline</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Persona Switcher */}
                    <div className="pt-2 mt-1 border-t border-[var(--border-subtle)]/70 px-3 pb-1">
                      <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[var(--primary)]" />
                        <span>Switch Persona</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            roleContext?.setRole("SALES_REP");
                            setProfileOpen(false);
                          }}
                          className={`px-2 py-1.5 rounded-md text-left flex items-center gap-1.5 cursor-pointer transition-colors ${roleContext?.currentRole === "SALES_REP"
                              ? "bg-[var(--primary)]/15 font-bold text-[var(--primary)]"
                              : "hover:bg-[var(--card-hover)] text-[var(--text-body)]"
                            }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate">Sales Rep</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            roleContext?.setRole("FINANCE_OPS");
                            setProfileOpen(false);
                          }}
                          className={`px-2 py-1.5 rounded-md text-left flex items-center gap-1.5 cursor-pointer transition-colors ${roleContext?.currentRole === "FINANCE_OPS"
                              ? "bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400"
                              : "hover:bg-[var(--card-hover)] text-[var(--text-body)]"
                            }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">Finance/Ops</span>
                        </button>
                      </div>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-1 mt-1 border-t border-[var(--border-subtle)]/70 px-1.5">
                      <Link
                        href="/login"
                        onClick={() => {
                          setProfileOpen(false);
                          localStorage.removeItem("dealorbit_token");
                          localStorage.removeItem("dealorbit_user");
                          document.cookie = "dealorbit_token=; path=/; max-age=0";
                          document.cookie = "dealorbit_role=; path=/; max-age=0";
                          toast.info("Signed out of DealOrbit");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Landing Page Right Slot: Sign In & Get Started CTA */
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="btn-ghost text-xs py-1.5 px-3 hidden sm:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-xs py-1.5 px-3.5 shadow-sm flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          {activeLinks.length > 0 && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card)]/60"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Frosted Glass Mobile Drawer Menu */}
      {mobileMenuOpen && activeLinks.length > 0 && (
        <div className="lg:hidden border-t border-[var(--border)]/60 bg-[var(--card)]/90 backdrop-blur-2xl px-4 py-3 space-y-2 shadow-lg">
          {activeLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border border-[var(--primary)]/20"
                    : "text-[var(--text-body)] hover:bg-[var(--card)]/60"
                  }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-[var(--warning)] text-white text-xs font-bold flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {variant === "workspace" && (
            <div className="pt-2 border-t border-[var(--border-subtle)]/70 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  roleContext?.reloadData();
                }}
                className="btn-ghost text-xs py-2 w-full justify-center flex items-center gap-2 border border-[var(--border)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Data</span>
              </button>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-ghost text-xs py-2 w-full justify-center flex items-center gap-2 border border-rose-500/20 text-rose-600"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </Link>
            </div>
          )}

          {variant === "landing" && (
            <div className="pt-2 border-t border-[var(--border-subtle)]/70 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-center text-xs py-2 w-full justify-center"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
