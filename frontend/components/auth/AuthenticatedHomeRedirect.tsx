"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME_PATHS } from "@/context/RoleContext";
import type { Role } from "@/types";

/**
 * Ensures authenticated users landing on the public home page (e.g. via browser back button)
 * are immediately forwarded to their workspace default page without remaining in the history stack.
 */
export function AuthenticatedHomeRedirect() {
  const router = useRouter();

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
          if (parsed?.role) role = parsed.role as Role;
        } else {
          const cookieRole = document.cookie
            .split("; ")
            .find((row) => row.startsWith("dealorbit_role="))
            ?.split("=")[1];
          if (cookieRole) role = cookieRole as Role;
        }

        const destination = ROLE_HOME_PATHS[role] || "/quotations";
        window.location.replace(destination);
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
