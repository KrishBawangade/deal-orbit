import { ProductCategory, CustomerTier, BillingFrequency } from "@/types";

export interface ICatalogProduct {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  unitCost: number;
  unit: string;
  isRecurring: boolean;
  billingFrequency: BillingFrequency;
  description: string;
  inStock: number;
  taxRate: number; // e.g. 0.18 for 18%
}

export interface ICustomerAccount {
  id: string;
  name: string;
  code: string;
  tier: CustomerTier;
  paymentTerms: string;
  contactEmail: string;
  contactPerson: string;
  tierCeilings: {
    HARDWARE: number;
    SOFTWARE: number;
    SERVICES: number;
  };
}

export const CATALOG_PRODUCTS: ICatalogProduct[] = [
  // HARDWARE CATEGORY
  {
    id: "prod-hw-01",
    sku: "HW-LAPTOP-16",
    name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
    category: "HARDWARE",
    basePrice: 85000,
    unitCost: 65000,
    unit: "unit",
    isRecurring: false,
    billingFrequency: "ONE_TIME",
    description: "High-performance enterprise workstation with discrete GPU and enterprise security module.",
    inStock: 45,
    taxRate: 0.18,
  },
  {
    id: "prod-hw-02",
    sku: "HW-DOCK-4K",
    name: "UltraHD 4K Thunderbolt Docking Station 120W",
    category: "HARDWARE",
    basePrice: 18500,
    unitCost: 12000,
    unit: "unit",
    isRecurring: false,
    billingFrequency: "ONE_TIME",
    description: "Dual 4K display output, 120W power delivery, GbE and 8 peripheral ports.",
    inStock: 80,
    taxRate: 0.18,
  },
  {
    id: "prod-hw-03",
    sku: "HW-SRV-R750",
    name: "Performance Server Node R750 (2U Rackmount)",
    category: "HARDWARE",
    basePrice: 240000,
    unitCost: 180000,
    unit: "unit",
    isRecurring: false,
    billingFrequency: "ONE_TIME",
    description: "Dual Intel Xeon Gold, 128GB ECC RAM, redundant hot-swap power supplies.",
    inStock: 12,
    taxRate: 0.18,
  },
  {
    id: "prod-hw-04",
    sku: "HW-SW-48P",
    name: "High-Density Managed PoE Switch 48-Port L3",
    category: "HARDWARE",
    basePrice: 62000,
    unitCost: 44000,
    unit: "unit",
    isRecurring: false,
    billingFrequency: "ONE_TIME",
    description: "Enterprise multi-gigabit switch with layer-3 routing and cloud management.",
    inStock: 25,
    taxRate: 0.18,
  },

  // SERVICES CATEGORY
  {
    id: "prod-srv-01",
    sku: "SRV-DEPLOY-ONSITE",
    name: "On-Site Hardware Deployment & Provisioning",
    category: "SERVICES",
    basePrice: 120000,
    unitCost: 85000,
    unit: "engagement",
    isRecurring: false,
    billingFrequency: "ONE_TIME",
    description: "Turnkey rack installation, OS imaging, zero-touch staging, and perimeter testing.",
    inStock: 999, // Unconstrained service capacity
    taxRate: 0.18,
  },
  {
    id: "prod-srv-02",
    sku: "SRV-CARE-2YR",
    name: "2-Year Enterprise Care Pack & Next-Day Onsite SLA",
    category: "SERVICES",
    basePrice: 18000,
    unitCost: 10500,
    unit: "license",
    isRecurring: false,
    billingFrequency: "ONE_TIME",
    description: "Comprehensive accidental damage protection with 4-hour critical response guarantee.",
    inStock: 999,
    taxRate: 0.18,
  },
  {
    id: "prod-srv-03",
    sku: "SRV-CONSULT-ARCH",
    name: "Enterprise Architecture & Migration Consulting",
    category: "SERVICES",
    basePrice: 95000,
    unitCost: 60000,
    unit: "package",
    isRecurring: false,
    billingFrequency: "ONE_TIME",
    description: "Certified cloud architects for topology audit, capacity planning, and security hardening.",
    inStock: 999,
    taxRate: 0.18,
  },
  {
    id: "prod-srv-04",
    sku: "SRV-SUPP-247",
    name: "24/7 Dedicated Operational Support SLA (Annual)",
    category: "SERVICES",
    basePrice: 45000,
    unitCost: 25000,
    unit: "annual",
    isRecurring: false,
    billingFrequency: "ONE_TIME",
    description: "Direct priority line to Tier-3 support engineers with guaranteed 15-min response time.",
    inStock: 999,
    taxRate: 0.18,
  },

  // SUBSCRIPTIONS (Software / SaaS recurring)
  {
    id: "prod-sub-01",
    sku: "SUB-PLATFORM-ENT",
    name: "DealOrbit Cloud Platform Enterprise License",
    category: "SOFTWARE",
    basePrice: 25000,
    unitCost: 5000,
    unit: "month",
    isRecurring: true,
    billingFrequency: "MONTHLY",
    description: "Complete commercial governance platform with role controls, live margins & ERP sync.",
    inStock: 9999,
    taxRate: 0.18,
  },
  {
    id: "prod-sub-02",
    sku: "SUB-AI-SEAT",
    name: "Deal Strategy AI Predictive Seat",
    category: "SOFTWARE",
    basePrice: 6500,
    unitCost: 1200,
    unit: "seat/mo",
    isRecurring: true,
    billingFrequency: "MONTHLY",
    description: "Real-time deal corridor prediction, customer price elasticity, and discount recommendations.",
    inStock: 9999,
    taxRate: 0.18,
  },
  {
    id: "prod-sub-03",
    sku: "SUB-GOV-RADAR",
    name: "Threat & Governance Radar License",
    category: "SOFTWARE",
    basePrice: 38000,
    unitCost: 8000,
    unit: "month",
    isRecurring: true,
    billingFrequency: "MONTHLY",
    description: "Autonomous margin leakage detection, discount anomaly alerts, and multi-tier approval routing.",
    inStock: 9999,
    taxRate: 0.18,
  },
  {
    id: "prod-sub-04",
    sku: "SUB-RESILIENCE",
    name: "Multi-Region Enterprise Data Resiliency SaaS",
    category: "SOFTWARE",
    basePrice: 52000,
    unitCost: 14000,
    unit: "month",
    isRecurring: true,
    billingFrequency: "MONTHLY",
    description: "Active-active database replication, geo-redundant backups, and 99.999% uptime guarantee.",
    inStock: 9999,
    taxRate: 0.18,
  },
];

export const CUSTOMER_ACCOUNTS: ICustomerAccount[] = [
  {
    id: "cust-001",
    name: "Acme Corp",
    code: "ACME-IND",
    tier: "GOLD",
    paymentTerms: "Net 30",
    contactEmail: "procurement@acmecorp.com",
    contactPerson: "Jordan Vance",
    tierCeilings: {
      HARDWARE: 15.0,
      SOFTWARE: 15.0,
      SERVICES: 10.0,
    },
  },
  {
    id: "cust-002",
    name: "Stark Enterprises",
    code: "STRK-GLB",
    tier: "ENTERPRISE",
    paymentTerms: "Net 45",
    contactEmail: "purchasing@stark.io",
    contactPerson: "Elena Ramos",
    tierCeilings: {
      HARDWARE: 15.0,
      SOFTWARE: 20.0,
      SERVICES: 10.0,
    },
  },
  {
    id: "cust-003",
    name: "Wayne Logistics",
    code: "WYN-LOG",
    tier: "SILVER",
    paymentTerms: "Net 15",
    contactEmail: "ops@waynelogistics.com",
    contactPerson: "Marcus Chen",
    tierCeilings: {
      HARDWARE: 10.0,
      SOFTWARE: 10.0,
      SERVICES: 10.0,
    },
  },
  {
    id: "cust-004",
    name: "Cyberdyne Systems",
    code: "CYB-SYS",
    tier: "BRONZE",
    paymentTerms: "Immediate Advance",
    contactEmail: "procure@cyberdyne.org",
    contactPerson: "Sarah Connor",
    tierCeilings: {
      HARDWARE: 5.0,
      SOFTWARE: 5.0,
      SERVICES: 5.0,
    },
  },
];
