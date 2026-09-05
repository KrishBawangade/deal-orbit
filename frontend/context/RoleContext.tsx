"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Role } from "@/types";

export interface ActiveUser {
  name: string;
  roleLabel: string;
  email: string;
  badgeClass: string;
  avatarText: string;
  role: Role;
}

export const ROLE_PERSONAS: Record<Role, ActiveUser> = {
  SALES_REP: {
    name: "Sam Seller",
    roleLabel: "Sales Rep",
    email: "sam.seller@dealorbit.io",
    badgeClass: "badge-role-rep",
    avatarText: "SS",
    role: "SALES_REP",
  },
  SALES_MANAGER: {
    name: "Morgan Manager",
    roleLabel: "Sales Manager",
    email: "morgan.manager@dealorbit.io",
    badgeClass: "badge-role-manager",
    avatarText: "MM",
    role: "SALES_MANAGER",
  },
  FINANCE_OPS: {
    name: "Fiona Finance",
    roleLabel: "Finance / Ops",
    email: "fiona.finance@dealorbit.io",
    badgeClass: "badge-role-finance",
    avatarText: "FF",
    role: "FINANCE_OPS",
  },
  ADMIN: {
    name: "Alex Admin",
    roleLabel: "System Admin",
    email: "alex.admin@dealorbit.io",
    badgeClass: "badge-role-admin",
    avatarText: "AA",
    role: "ADMIN",
  },
};

export interface RoleContextType {
  currentRole: Role;
  setRole: (role: Role) => void;
  activeUser: ActiveUser;
  isReloading: boolean;
  reloadData: () => Promise<void>;
  closeWorkspace: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setRoleState] = useState<Role>("SALES_REP");
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const router = useRouter();

  const setRole = useCallback((role: Role) => {
    setRoleState(role);
    const persona = ROLE_PERSONAS[role] || ROLE_PERSONAS.SALES_REP;
    toast.info(`Switched persona to ${persona.name} (${persona.roleLabel})`, {
      description: "Permissions and available actions updated dynamically.",
    });
  }, []);

  const reloadData = useCallback(async () => {
    if (isReloading) return;
    setIsReloading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Workspace Data Refreshed", {
        description: "Pricing rules, warehouse stock counts, and approval statuses synchronized.",
      });
    } catch {
      toast.error("Failed to refresh workspace data");
    } finally {
      setIsReloading(false);
    }
  }, [isReloading]);

  const closeWorkspace = useCallback(() => {
    toast.info("Closing Workspace Session", {
      description: "Returning to public landing portal...",
    });
    router.push("/");
  }, [router]);

  const activeUser = ROLE_PERSONAS[currentRole] || ROLE_PERSONAS.SALES_REP;

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setRole,
        activeUser,
        isReloading,
        reloadData,
        closeWorkspace,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export function useOptionalRole(): RoleContextType | null {
  return useContext(RoleContext);
}
