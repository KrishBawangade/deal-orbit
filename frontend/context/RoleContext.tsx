"use client";

import React, { createContext, useContext, useState } from "react";
import type { Role } from "@/types";

export interface ActiveUser {
  name: string;
  roleLabel: string;
  email: string;
  badgeClass: string;
  role?: Role;
}

export interface RoleContextType {
  currentRole: Role;
  setRole: (role: Role) => void;
  activeUser: ActiveUser;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setRole] = useState<Role>("SALES_REP");

  const activeUser: ActiveUser = {
    name: "Sam Seller",
    roleLabel: "Sales Rep",
    email: "sam.seller@dealorbit.io",
    badgeClass: "badge-role-rep",
    role: currentRole,
  };

  return (
    <RoleContext.Provider value={{ currentRole, setRole, activeUser }}>
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
