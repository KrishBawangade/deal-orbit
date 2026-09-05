"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { QuotationsProvider } from "@/context/QuotationsContext";
import { DealHealthProvider } from "@/context/DealHealthContext";
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
    if (pathname.startsWith("/quotations")) return "Active & Draft Quotations";
    if (pathname.startsWith("/pipeline")) return "Deal Pipeline Kanban";
    if (pathname.startsWith("/dashboard")) return "Sales Workspace Dashboard";
    if (pathname.startsWith("/deal-health")) return "Deal Health Radar";
    return "Sales Operations Workspace";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white">
      {/* 1. Global Reusable Glassmorphism Navbar for Workspace */}
      <Navbar variant="workspace" />

      {/* 2. Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {children}
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
