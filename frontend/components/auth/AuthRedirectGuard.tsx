"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME_PATHS } from "@/context/RoleContext";
import type { Role } from "@/types";

interface AuthRedirectGuardProps {
  children: React.ReactNode;
}

/**
 * Guard for public authentication pages (/login, /signup, /auth, /forgot-password).
 * If a user with an active session hits any auth route, they are immediately redirected
 * to their default role workspace using router.replace(), preventing /login from remaining
 * in the browser history stack.
 */
export function AuthRedirectGuard({ children }: AuthRedirectGuardProps) {
  const router = useRouter();
  const [isAuthorizedGuest, setIsAuthorizedGuest] = useState(false);

  useEffect(() => {
    try {
      const token =
        localStorage.getItem("dealorbit_token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("dealorbit_token="))
          ?.split("=")[1];

      if (token) {
        let role: Role = "SALES_REP";
        const storedUser = localStorage.getItem("dealorbit_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.role) {
            role = parsed.role as Role;
          }
        } else {
          const cookieRole = document.cookie
            .split("; ")
            .find((row) => row.startsWith("dealorbit_role="))
            ?.split("=")[1];
          if (cookieRole) {
            role = cookieRole as Role;
          }
        }

        const destination = ROLE_HOME_PATHS[role] || "/quotations";
        window.location.replace(destination);
        return;
      }
    } catch {
      // Fallback: render auth card if parsing fails
    }

    setIsAuthorizedGuest(true);
  }, [router]);

  // While verifying if an active session exists, prevent login card flashing
  if (!isAuthorizedGuest) {
    return (
      <div className="w-full min-h-[380px] flex flex-col items-center justify-center space-y-3 animate-fadeIn">
        <div className="w-8 h-8 border-2 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
        <p className="text-xs font-medium text-[var(--text-muted)] animate-pulse">
          Verifying workspace session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
