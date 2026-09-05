"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { QuotationsProvider } from "@/context/QuotationsContext";
import { DealHealthProvider } from "@/context/DealHealthContext";
import { PageAuthGuard } from "@/components/auth/PageAuthGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Kanban,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react";

function WorkspaceContent({ children }: { children: React.ReactNode }) {
  const { activeUser, currentRole } = useRole();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith("/quotations")) return "Quotations Management";
    if (pathname.startsWith("/pipeline")) return "Deal Pipeline Kanban";
    if (pathname.startsWith("/fulfillment")) return "Fulfillment & Warehouse Split";
    if (pathname.startsWith("/billing")) return "Subscription & Billing Management";
    if (pathname.startsWith("/dashboard"))
      return currentRole === "FINANCE_OPS"
        ? "Operations & Fulfillment Workspace"
        : "Sales Workspace Dashboard";
    return "Operations Workspace";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white">
      {/* 1. Global Reusable Glassmorphism Navbar for Workspace */}
      <Navbar variant="workspace" />

      {/* 2. Main Workspace Canvas with Dynamic Auth & Role Inspection */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <PageAuthGuard
          allowedRoles={["SALES_REP", "SALES_MANAGER", "FINANCE_OPS", "ADMIN"]}
          pageName={getPageTitle()}
        >
          {children}
        </PageAuthGuard>
      </main>
    </div>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <QuotationsProvider>
        <DealHealthProvider>
          <WorkspaceContent>{children}</WorkspaceContent>
        </DealHealthProvider>
      </QuotationsProvider>
    </RoleProvider>
  );
}
