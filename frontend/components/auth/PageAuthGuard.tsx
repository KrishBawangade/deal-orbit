"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useOptionalRole } from "@/context/RoleContext";
import type { Role } from "@/types";

interface PageAuthGuardProps {
  allowedRoles: Role[];
  pageName?: string;
  children: React.ReactNode;
}

/**
 * Enterprise Page Authorization Guard (GitHub / AWS Pattern)
 * If the user is unauthenticated or their role is not authorized,
 * it invokes notFound() to display a standard 404 Page Not Found.
 * This completely conceals the existence of restricted/internal routes.
 */
export function PageAuthGuard({
  allowedRoles,
  children,
}: PageAuthGuardProps) {
  const roleContext = useOptionalRole();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<Role>("SALES_REP");

  useEffect(() => {
    setMounted(true);
    try {
      const token =
        localStorage.getItem("dealorbit_token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("dealorbit_token="))
          ?.split("=")[1];

      setHasToken(!!token);

      const storedUser = localStorage.getItem("dealorbit_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.role) {
          setUserRole(parsed.role as Role);
          return;
        }
      }

      const cookieRole = document.cookie
        .split("; ")
        .find((row) => row.startsWith("dealorbit_role="))
        ?.split("=")[1];

      if (cookieRole) {
        setUserRole(cookieRole as Role);
      } else if (roleContext?.currentRole) {
        setUserRole(roleContext.currentRole);
      }
    } catch {
      // Fallback
    }
  }, [roleContext?.currentRole]);

  // Sync role if RoleContext changes dynamically
  const effectiveRole: Role = roleContext?.currentRole || userRole;
  const isAuthorized = hasToken && allowedRoles.includes(effectiveRole);

  // Initial SSR / Hydration placeholder
  if (!mounted) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
      </div>
    );
  }

  // If unauthorized (not logged in OR role not in allowedRoles), trigger 404 Not Found!
  if (!isAuthorized) {
    notFound();
  }

  return <>{children}</>;
}
