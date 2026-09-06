export interface IDemoUser {
  id: string;
  role: "SALES_REP" | "SALES_MANAGER" | "FINANCE_OPS" | "CUSTOMER" | "ADMIN";
  roleLabel: string;
  name: string;
  email: string;
  password: string;
  title: string;
  department: string;
  avatar: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
  description: string;
  permissions: string[];
  defaultPath: string;
}

export const DEMO_USERS: IDemoUser[] = [
  {
    id: "demo-user-sales-rep",
    role: "SALES_REP",
    roleLabel: "Sales Representative",
    name: "Sarah Jenkins",
    email: "sales.rep@dealorbit.io",
    password: "DealOrbit@123",
    title: "Senior Enterprise Account Executive",
    department: "Sales Operations",
    avatar: "SJ",
    badgeColor: {
      bg: "bg-amber-500/10",
      text: "text-amber-800",
      border: "border-amber-500/25",
    },
    description: "Builds complex quotations, configures pricing, and submits discount requests.",
    permissions: [
      "Create & edit quotations",
      "Configure product line items",
      "Request manager discounts",
      "Monitor deal pipeline status",
    ],
    defaultPath: "/quotations",
  },
  {
    id: "demo-user-sales-manager",
    role: "SALES_MANAGER",
    roleLabel: "Sales Manager",
    name: "Marcus Vance",
    email: "sales.manager@dealorbit.io",
    password: "DealOrbit@123",
    title: "Regional Sales Director",
    department: "Sales Leadership",
    avatar: "MV",
    badgeColor: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-800",
      border: "border-indigo-500/25",
    },
    description: "Evaluates margin risk, approves steep discounts, and overrides thresholds.",
    permissions: [
      "Review & approve quotes (>15% discount)",
      "Reassign approval workflows",
      "Team quota and pipeline analytics",
      "Customer margin guardrail controls",
    ],
    defaultPath: "/approvals",
  },
  {
    id: "demo-user-finance-ops",
    role: "FINANCE_OPS",
    roleLabel: "Finance / Operations",
    name: "Elena Rostova",
    email: "finance.ops@dealorbit.io",
    password: "DealOrbit@123",
    title: "VP of Revenue Operations & Finance",
    department: "Finance & Order Ops",
    avatar: "ER",
    badgeColor: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-800",
      border: "border-emerald-500/25",
    },
    description: "Governs contract payment terms, oversees billing cycles, and validates orders.",
    permissions: [
      "Validate payment terms (Net 30/60/90)",
      "Convert accepted quotes to sales orders",
      "ERP invoice & billing synchronization",
      "Revenue recognition auditing",
    ],
    defaultPath: "/dashboard",
  },
  {
    id: "demo-user-customer",
    role: "CUSTOMER",
    roleLabel: "Customer / Buyer",
    name: "David Chen",
    email: "customer.acme@dealorbit.io",
    password: "DealOrbit@123",
    title: "VP of Procurement (Acme Corp)",
    department: "Global Procurement",
    avatar: "DC",
    badgeColor: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-800",
      border: "border-cyan-500/25",
    },
    description: "Reviews received quotations, proposes counter-offers, and e-signs contracts.",
    permissions: [
      "Access Customer Portal quotation view",
      "Submit line-item discount counter-offers",
      "Chat directly with sales representatives",
      "Electronically sign and accept quotations",
    ],
    defaultPath: "/portal/cust-001",
  },
  {
    id: "demo-user-admin",
    role: "ADMIN",
    roleLabel: "Administrator",
    name: "Alex Rivera",
    email: "admin@dealorbit.io",
    password: "DealOrbit@123",
    title: "Chief System Architect & Admin",
    department: "Platform Operations",
    avatar: "AR",
    badgeColor: {
      bg: "bg-purple-500/10",
      text: "text-purple-800",
      border: "border-purple-500/25",
    },
    description: "Comprehensive administration, audit log inspection, and system policies.",
    permissions: [
      "Full role & user permissions management",
      "Workflow approval matrix customization",
      "Audit trail & security telemetry review",
      "System integration & API configuration",
    ],
    defaultPath: "/",
  },
];

export function getDemoUserByRole(role: string): IDemoUser | undefined {
  return DEMO_USERS.find((u) => u.role === role);
}

export function getDemoUserByEmail(email: string): IDemoUser | undefined {
  return DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
}

export function isDemoCredential(email: string, password?: string): boolean {
  const user = getDemoUserByEmail(email);
  if (!user) return false;
  if (password !== undefined && user.password !== password) return false;
  return true;
}
