"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CustomerTier, QuoteStatus, ICustomerNegotiationMessage, Role } from "@/types";
import { siteConfig } from "@/config/site";

export type ApprovalActionType =
  | "SUBMITTED"
  | "APPROVED_TIER_1"
  | "APPROVED_FINAL"
  | "REJECTED"
  | "RETURNED_FOR_REVISION"
  | "REVOKED_BY_MUTATION"
  | "DIGITALLY_CONFIRMED";

export interface QuotationAuditEntry {
  id: string;
  action: ApprovalActionType;
  actorName: string;
  actorRole: Role;
  timestamp: string;
  notes: string;
  metadata?: Record<string, unknown>;
}

export interface QuotationLineItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  category: "HARDWARE" | "SOFTWARE" | "SERVICES";
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPercent: number;
  effectiveCeiling: number;
  isViolation: boolean;
  violationPoints: number;
  netLineTotal: number;
  lineMarginPercent: number;
  isRecurring: boolean;
  billingFrequency: string;
}

export interface QuotationRecord {
  id: string;
  customerName: string;
  customerId: string;
  tier: CustomerTier;
  tierCeiling: number;
  lineItemsCount: number;
  subtotal: string;
  subtotalAmount: number;
  discountAmount: number;
  orderDiscountPercent: number;
  taxAmount: number;
  total: string;
  totalAmount: number;
  blendedMargin: number;
  marginStatus: "HIGH" | "MEDIUM" | "DANGER";
  riskScore: number;
  status: QuoteStatus;
  approvalRequirement: "NONE" | "MANAGER_REQUIRED" | "FINANCE_REQUIRED" | "DUAL_REQUIRED";
  approvalStage?: "SALES_MANAGER" | "FINANCE" | "COMPLETED" | "REJECTED" | "RETURNED";
  repName: string;
  updatedAt: string;
  lines: QuotationLineItem[];
  paymentTerms: string;
  portalToken?: string;
  expiresAt?: string;
  negotiationMessages?: ICustomerNegotiationMessage[];
  salesOrderNumber?: string;
  signerName?: string;
  signerTitle?: string;
  confirmedAt?: string;
  reApprovalRequired?: boolean;
  reApprovalReason?: string;
  auditTrail?: QuotationAuditEntry[];
}

const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: "QT-2026-0043",
    customerName: "Acme Corp",
    customerId: "cust-001",
    tier: "GOLD",
    tierCeiling: 15,
    lineItemsCount: 2,
    subtotal: "₹18,20,000",
    subtotalAmount: 1820000,
    discountAmount: 225600,
    orderDiscountPercent: 0,
    taxAmount: 286992,
    total: "₹18,81,392",
    totalAmount: 1881392,
    blendedMargin: 18.4,
    marginStatus: "MEDIUM",
    riskScore: 38.5,
    status: "IN_REVIEW",
    approvalRequirement: "MANAGER_REQUIRED",
    approvalStage: "SALES_MANAGER",
    repName: "Sam Seller",
    updatedAt: "10 mins ago",
    paymentTerms: "Net 30",
    portalToken: "demo-token",
    expiresAt: "2026-09-19",
    auditTrail: [
      {
        id: "audit-043-01",
        action: "SUBMITTED",
        actorName: "Sam Seller",
        actorRole: "SALES_REP",
        timestamp: "Today at 09:00",
        notes: "Quotation configured with 18% discount on on-site deployment to secure enterprise migration. Submitted for B4 managerial sign-off.",
      },
    ],
    negotiationMessages: [
      {
        id: "msg-01",
        quotationId: "QT-2026-0043",
        lineItemId: "line-01",
        authorRole: "CUSTOMER",
        authorName: "Jordan Procurement (Acme Corp)",
        message: "Can delivery timeline be accelerated to 48 hours for the first 10 laptop units?",
        createdAt: "Yesterday at 16:30",
      },
      {
        id: "msg-02",
        quotationId: "QT-2026-0043",
        lineItemId: "line-01",
        authorRole: "SALES_REP",
        authorName: "Sam Seller (DealOrbit Rep)",
        message: "Yes! Inventory is pre-staged across regional hubs. We can dispatch 10 units within 24 hours of confirmation.",
        createdAt: "Today at 09:15",
      },
    ],
    lines: [
      {
        id: "line-01",
        productId: "prod-hw-01",
        sku: "HW-LAPTOP-16",
        name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
        category: "HARDWARE",
        quantity: 20,
        unitPrice: 85000,
        unitCost: 65000,
        discountPercent: 12.0,
        effectiveCeiling: 15.0,
        isViolation: false,
        violationPoints: 0,
        netLineTotal: 1496000,
        lineMarginPercent: 23.5,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
      {
        id: "line-02",
        productId: "prod-srv-01",
        sku: "SRV-DEPLOY-ONSITE",
        name: "On-Site Hardware Deployment & Provisioning",
        category: "SERVICES",
        quantity: 1,
        unitPrice: 120000,
        unitCost: 85000,
        discountPercent: 18.0,
        effectiveCeiling: 10.0,
        isViolation: true,
        violationPoints: 8.0,
        netLineTotal: 98400,
        lineMarginPercent: -1.6,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
    ],
  },
  {
    id: "QT-2026-0046",
    customerName: "Cyberdyne Systems",
    customerId: "cust-004",
    tier: "ENTERPRISE",
    tierCeiling: 20,
    lineItemsCount: 2,
    subtotal: "₹46,50,000",
    subtotalAmount: 4650000,
    discountAmount: 1180000,
    orderDiscountPercent: 0,
    taxAmount: 624600,
    total: "₹40,94,600",
    totalAmount: 4094600,
    blendedMargin: 15.2,
    marginStatus: "DANGER",
    riskScore: 58.2,
    status: "IN_REVIEW",
    approvalRequirement: "DUAL_REQUIRED",
    approvalStage: "SALES_MANAGER",
    repName: "Sam Seller",
    updatedAt: "25 mins ago",
    paymentTerms: "Net 60",
    portalToken: "cyberdyne-token",
    expiresAt: "2026-09-25",
    auditTrail: [
      {
        id: "audit-046-01",
        action: "SUBMITTED",
        actorName: "Sam Seller",
        actorRole: "SALES_REP",
        timestamp: "Today at 11:20",
        notes: "High-value competitive bid against AWS & Dell. Aggressive discounting applied to secure multi-year infrastructure lock-in. Risk score exceeds 50 and margin is below 18%; triggers Two-Tier sequential approval (Sales Manager + Finance Director).",
      },
    ],
    lines: [
      {
        id: "line-46-01",
        productId: "prod-hw-04",
        sku: "HW-GPU-HGX",
        name: "Enterprise GPU Compute Node (8x H100 SXM5 / 640GB)",
        category: "HARDWARE",
        quantity: 4,
        unitPrice: 850000,
        unitCost: 710000,
        discountPercent: 22.0,
        effectiveCeiling: 20.0,
        isViolation: true,
        violationPoints: 2.0,
        netLineTotal: 2652000,
        lineMarginPercent: 16.4,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
      {
        id: "line-46-02",
        productId: "prod-srv-02",
        sku: "SRV-AI-DEPL",
        name: "Custom AI Cluster Architecture & On-Site Turnkey Commissioning",
        category: "SERVICES",
        quantity: 1,
        unitPrice: 1250000,
        unitCost: 880000,
        discountPercent: 28.0,
        effectiveCeiling: 10.0,
        isViolation: true,
        violationPoints: 18.0,
        netLineTotal: 900000,
        lineMarginPercent: 2.2,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
    ],
  },
  {
    id: "QT-2026-0042",
    customerName: "Nexus Healthcare",
    customerId: "cust-005",
    tier: "GOLD",
    tierCeiling: 15,
    lineItemsCount: 2,
    subtotal: "₹24,00,000",
    subtotalAmount: 2400000,
    discountAmount: 240000,
    orderDiscountPercent: 0,
    taxAmount: 388800,
    total: "₹25,48,800",
    totalAmount: 2548800,
    blendedMargin: 21.0,
    marginStatus: "MEDIUM",
    riskScore: 34.0,
    status: "APPROVED",
    approvalRequirement: "MANAGER_REQUIRED",
    approvalStage: "COMPLETED",
    repName: "Sam Seller",
    updatedAt: "Yesterday",
    paymentTerms: "Net 30",
    portalToken: "nexus-token",
    expiresAt: "2026-09-30",
    auditTrail: [
      {
        id: "audit-042-02",
        action: "APPROVED_FINAL",
        actorName: "Morgan Manager",
        actorRole: "SALES_MANAGER",
        timestamp: "Yesterday at 15:45",
        notes: "Strategic tier-1 hospital network expansion approved. Services margin compensated by 3-year recurring maintenance contract.",
      },
      {
        id: "audit-042-01",
        action: "SUBMITTED",
        actorName: "Sam Seller",
        actorRole: "SALES_REP",
        timestamp: "Yesterday at 11:30",
        notes: "Initial submission with 14% discount on health tech workstations.",
      },
    ],
    lines: [
      {
        id: "line-42-01",
        productId: "prod-hw-05",
        sku: "HW-MED-WKSTN",
        name: "Medical Diagnostic High-Res Workstation",
        category: "HARDWARE",
        quantity: 10,
        unitPrice: 190000,
        unitCost: 145000,
        discountPercent: 10.0,
        effectiveCeiling: 15.0,
        isViolation: false,
        violationPoints: 0,
        netLineTotal: 1710000,
        lineMarginPercent: 23.6,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
      {
        id: "line-42-02",
        productId: "prod-srv-03",
        sku: "SRV-MED-HIPAA",
        name: "HIPAA Compliance & Secure Network Integration Service",
        category: "SERVICES",
        quantity: 1,
        unitPrice: 500000,
        unitCost: 360000,
        discountPercent: 14.0,
        effectiveCeiling: 10.0,
        isViolation: true,
        violationPoints: 4.0,
        netLineTotal: 430000,
        lineMarginPercent: 16.3,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
    ],
  },
  {
    id: "QT-2026-0041",
    customerName: "OmniCorp Industries",
    customerId: "cust-006",
    tier: "SILVER",
    tierCeiling: 10,
    lineItemsCount: 1,
    subtotal: "₹12,50,000",
    subtotalAmount: 1250000,
    discountAmount: 250000,
    orderDiscountPercent: 0,
    taxAmount: 180000,
    total: "₹11,80,000",
    totalAmount: 1180000,
    blendedMargin: 14.5,
    marginStatus: "DANGER",
    riskScore: 62.0,
    status: "DRAFT",
    approvalRequirement: "DUAL_REQUIRED",
    approvalStage: "RETURNED",
    repName: "Sam Seller",
    updatedAt: "2 days ago",
    paymentTerms: "Net 30",
    reApprovalReason: "20% discount on Silver tier breaches margin threshold (<15%). Rep must bundle with 2-year Care Pack or reduce discount to 10% maximum.",
    auditTrail: [
      {
        id: "audit-041-02",
        action: "RETURNED_FOR_REVISION",
        actorName: "Morgan Manager",
        actorRole: "SALES_MANAGER",
        timestamp: "2 days ago at 17:10",
        notes: "20% discount on Silver tier breaches margin threshold (<15%). Rep must bundle with 2-year Care Pack or reduce discount to 10% maximum.",
      },
      {
        id: "audit-041-01",
        action: "SUBMITTED",
        actorName: "Sam Seller",
        actorRole: "SALES_REP",
        timestamp: "2 days ago at 14:00",
        notes: "Initial quotation submitted for review.",
      },
    ],
    lines: [
      {
        id: "line-41-01",
        productId: "prod-hw-06",
        sku: "HW-EDGE-ROUTER",
        name: "Enterprise Core Edge Gateway Router",
        category: "HARDWARE",
        quantity: 5,
        unitPrice: 250000,
        unitCost: 195000,
        discountPercent: 20.0,
        effectiveCeiling: 10.0,
        isViolation: true,
        violationPoints: 10.0,
        netLineTotal: 1000000,
        lineMarginPercent: 14.5,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
    ],
  },
  {
    id: "QT-2026-0044",
    customerName: "Stark Enterprises",
    customerId: "cust-002",
    tier: "ENTERPRISE",
    tierCeiling: 20,
    lineItemsCount: 3,
    subtotal: "₹7,90,000",
    subtotalAmount: 790000,
    discountAmount: 62500,
    orderDiscountPercent: 0,
    taxAmount: 130950,
    total: "₹8,58,450",
    totalAmount: 858450,
    blendedMargin: 43.6,
    marginStatus: "HIGH",
    riskScore: 12.0,
    status: "APPROVED",
    approvalRequirement: "MANAGER_REQUIRED",
    approvalStage: "COMPLETED",
    repName: "Sarah Jenkins",
    updatedAt: "12 hours ago",
    paymentTerms: "Net 60",
    portalToken: "stark-token",
    expiresAt: "2026-10-06",
    auditTrail: [
      {
        id: "audit-044-02",
        action: "APPROVED_FINAL",
        actorName: "Morgan Manager",
        actorRole: "SALES_MANAGER",
        timestamp: "Yesterday at 15:30",
        notes: "High margin multi-year software suite compliant with enterprise pricing guidelines. Blended margin 43.6% exceeds policy threshold.",
        metadata: {
          riskScore: 12.0,
          blendedMargin: 43.6,
          stage: "COMPLETED",
        },
      },
      {
        id: "audit-044-01",
        action: "SUBMITTED",
        actorName: "Sarah Jenkins",
        actorRole: "SALES_REP",
        timestamp: "Yesterday at 10:15",
        notes: "Initial quotation submitted for enterprise software security suite with 7.9% aggregate discount.",
        metadata: {
          riskScore: 12.0,
          blendedMargin: 43.6,
          stage: "SALES_MANAGER",
        },
      },
    ],
    lines: [
      {
        id: "line-03",
        productId: "prod-sw-01",
        sku: "SW-SEC-01",
        name: "Cloud Security Suite & Zero Trust Gateway",
        category: "SOFTWARE",
        quantity: 10,
        unitPrice: 45000,
        unitCost: 22000,
        discountPercent: 8.0,
        effectiveCeiling: 20.0,
        isViolation: false,
        violationPoints: 0,
        netLineTotal: 414000,
        lineMarginPercent: 46.8,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
      {
        id: "line-04",
        productId: "prod-sw-02",
        sku: "SW-DB-02",
        name: "Enterprise Database Managed Cluster (HA)",
        category: "SOFTWARE",
        quantity: 2,
        unitPrice: 95000,
        unitCost: 50000,
        discountPercent: 10.0,
        effectiveCeiling: 20.0,
        isViolation: false,
        violationPoints: 0,
        netLineTotal: 171000,
        lineMarginPercent: 41.5,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
      {
        id: "line-05",
        productId: "prod-srv-01",
        sku: "SRV-TAM-01",
        name: "24/7 Dedicated Technical Account Manager",
        category: "SERVICES",
        quantity: 1,
        unitPrice: 150000,
        unitCost: 90000,
        discountPercent: 5.0,
        effectiveCeiling: 10.0,
        isViolation: false,
        violationPoints: 0,
        netLineTotal: 142500,
        lineMarginPercent: 36.8,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
    ],
  },
  {
    id: "QT-2026-0045",
    customerName: "Wayne Logistics",
    customerId: "cust-003",
    tier: "SILVER",
    tierCeiling: 10,
    lineItemsCount: 1,
    subtotal: "₹4,10,000",
    subtotalAmount: 410000,
    discountAmount: 32800,
    orderDiscountPercent: 0,
    taxAmount: 71400,
    total: "₹4,48,600",
    totalAmount: 448600,
    blendedMargin: 22.1,
    marginStatus: "HIGH",
    riskScore: 12.0,
    status: "DRAFT",
    approvalRequirement: "NONE",
    repName: "Sam Seller",
    updatedAt: "3 hours ago",
    paymentTerms: "Net 15",
    lines: [
      {
        id: "line-05",
        productId: "prod-hw-03",
        sku: "HW-SRV-R750",
        name: "Performance Server Node R750 (2U Rackmount)",
        category: "HARDWARE",
        quantity: 1,
        unitPrice: 240000,
        unitCost: 180000,
        discountPercent: 8.0,
        effectiveCeiling: 10.0,
        isViolation: false,
        violationPoints: 0,
        netLineTotal: 220800,
        lineMarginPercent: 18.5,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
    ],
  },
];

interface QuotationsContextType {
  quotations: QuotationRecord[];
  isLoading: boolean;
  error: string | null;
  refetchQuotations: () => Promise<QuotationRecord[] | undefined>;
  addQuotation: (quote: QuotationRecord) => void;
  updateQuotation: (quote: QuotationRecord) => void;
  getQuotation: (id: string) => QuotationRecord | undefined;
  getQuotationByToken: (token: string) => QuotationRecord | undefined;
  getNextQuoteId: () => string;
  submitCounterOffer: (
    quoteId: string,
    lineItemId: string,
    proposedDiscount: number,
    proposedQuantity?: number,
    message?: string
  ) => { reApprovalRequired: boolean; quoteNumber: string };
  addLineComment: (
    quoteId: string,
    lineItemId: string | null,
    message: string,
    authorRole?: "CUSTOMER" | "SALES_REP",
    authorName?: string
  ) => void;
  confirmQuotation: (
    quoteId: string,
    signerName: string,
    signerTitle: string,
    acceptanceNotes?: string
  ) => {
    status: QuoteStatus;
    routeType: "FULFILLMENT" | "RE_APPROVAL";
    salesOrderNumber?: string;
    reApprovalReason?: string;
  };
  approveQuotation: (
    quoteId: string,
    reviewerName: string,
    reviewerRole: Role,
    notes?: string
  ) => Promise<{
    nextStatus: QuoteStatus;
    nextStage: "SALES_MANAGER" | "FINANCE" | "COMPLETED" | "REJECTED" | "RETURNED";
    isFinal: boolean;
    auditEntry: QuotationAuditEntry;
  }>;
  rejectQuotation: (
    quoteId: string,
    reviewerName: string,
    reviewerRole: Role,
    reason: string
  ) => Promise<{
    nextStatus: QuoteStatus;
    auditEntry: QuotationAuditEntry;
  }>;
  returnQuotationForRevision: (
    quoteId: string,
    reviewerName: string,
    reviewerRole: Role,
    feedback: string
  ) => Promise<{
    nextStatus: QuoteStatus;
    auditEntry: QuotationAuditEntry;
  }>;
}

const QuotationsContext = createContext<QuotationsContextType | null>(null);

const STORAGE_KEY = "dealorbit_quotations_data_v4";

export function QuotationsProvider({ children }: { children: React.ReactNode }) {
  const [quotations, setQuotations] = useState<QuotationRecord[]>(INITIAL_QUOTATIONS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetchQuotations = useCallback(async (): Promise<QuotationRecord[] | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("dealorbit_token") ||
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("dealorbit_token="))
              ?.split("=")[1]
          : undefined;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let res = await fetch(`${siteConfig.apiUrl}/api/v1/quotations`, {
        method: "GET",
        headers,
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${siteConfig.apiUrl}/api/quotations`, {
          method: "GET",
          headers,
        });
      }

      if (!res.ok) {
        throw new Error(`API responded with HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.data?.quotations)) {
        const serverQuotes: QuotationRecord[] = data.data.quotations.map((q: any) => ({
          ...q,
          approvalStage: q.approvalStage || (q.status === "IN_REVIEW" ? "SALES_MANAGER" : undefined),
          auditTrail: q.auditTrail || [],
        }));
        setQuotations(serverQuotes);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverQuotes));
        }
        setIsLoading(false);
        return serverQuotes;
      }
    } catch (err: any) {
      console.warn("Quotation API fetch notice (using cache/default):", err?.message);
      setError(err?.message || "Failed to fetch quotations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setQuotations(JSON.parse(saved));
      }
    } catch {
      // fallback to INITIAL_QUOTATIONS
    }
    setIsLoaded(true);
    refetchQuotations();
  }, [refetchQuotations]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
    }
  }, [quotations, isLoaded]);

  const addQuotation = useCallback((quote: QuotationRecord) => {
    setQuotations((prev) => [quote, ...prev]);
  }, []);

  const updateQuotation = useCallback((quote: QuotationRecord) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quote.id ? quote : q))
    );
  }, []);

  const getQuotation = useCallback(
    (id: string) => {
      return quotations.find((q) => q.id.toLowerCase() === id.toLowerCase());
    },
    [quotations]
  );

  const getQuotationByToken = useCallback(
    (token: string) => {
      const trimmed = token.trim().toLowerCase();
      // First check direct portalToken match
      const byPortalToken = quotations.find(
        (q) => q.portalToken?.toLowerCase() === trimmed
      );
      if (byPortalToken) return byPortalToken;

      // Second check quote ID
      const byId = quotations.find((q) => q.id.toLowerCase() === trimmed);
      if (byId) return byId;

      // Third fallback: If demo-token or demo, return QT-2026-0043 or first quote
      if (trimmed.includes("demo") || trimmed === "default") {
        return quotations.find((q) => q.id === "QT-2026-0043") || quotations[0];
      }

      return quotations[0];
    },
    [quotations]
  );

  const getNextQuoteId = useCallback(() => {
    const existingNums = quotations
      .map((q) => {
        const match = q.id.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 40;
      })
      .filter((n) => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 45;
    return `QT-2026-${String(maxNum + 1).padStart(4, "0")}`;
  }, [quotations]);

  const submitCounterOffer = useCallback(
    (
      quoteId: string,
      lineItemId: string,
      proposedDiscount: number,
      proposedQuantity?: number,
      message?: string
    ) => {
      let reApprovalRequired = false;
      let quoteNumber = quoteId;

      setQuotations((prev) =>
        prev.map((quote) => {
          if (quote.id.toLowerCase() !== quoteId.toLowerCase()) return quote;
          quoteNumber = quote.id;

          const updatedLines = quote.lines.map((line) => {
            if (line.id !== lineItemId) return line;

            const newQty = proposedQuantity && proposedQuantity > 0 ? proposedQuantity : line.quantity;
            const newDiscount = Math.max(0, Math.min(100, proposedDiscount));
            const isBreach = newDiscount > line.effectiveCeiling;
            if (isBreach) reApprovalRequired = true;

            const netPerUnit = line.unitPrice * (1 - newDiscount / 100);
            const netLineTotal = netPerUnit * newQty;
            const lineMargin = ((netPerUnit - line.unitCost) / netPerUnit) * 100;

            return {
              ...line,
              quantity: newQty,
              discountPercent: newDiscount,
              isViolation: isBreach,
              violationPoints: Math.max(0, newDiscount - line.effectiveCeiling),
              netLineTotal,
              lineMarginPercent: parseFloat(lineMargin.toFixed(1)),
            };
          });

          // Recalculate totals
          const subtotalAmount = updatedLines.reduce(
            (acc, l) => acc + l.unitPrice * l.quantity,
            0
          );
          const totalLineNet = updatedLines.reduce((acc, l) => acc + l.netLineTotal, 0);
          const totalCost = updatedLines.reduce(
            (acc, l) => acc + l.unitCost * l.quantity,
            0
          );
          const discountAmount = subtotalAmount - totalLineNet;
          const taxAmount = Math.round(totalLineNet * 0.18);
          const totalAmount = totalLineNet + taxAmount;
          const blendedMargin =
            totalLineNet > 0
              ? parseFloat((((totalLineNet - totalCost) / totalLineNet) * 100).toFixed(1))
              : 0;

          // Check any line violation
          const anyViolation = updatedLines.some((l) => l.isViolation);
          if (anyViolation) reApprovalRequired = true;

          // Append negotiation message
          const targetLine = quote.lines.find((l) => l.id === lineItemId);
          const newMessage: ICustomerNegotiationMessage = {
            id: `msg-${Date.now()}`,
            quotationId: quote.id,
            lineItemId,
            authorRole: "CUSTOMER",
            authorName: "Jordan Procurement (Acme Corp)",
            message:
              message ||
              `Proposed counter-offer: ${proposedDiscount}% discount on ${
                targetLine?.name || "line item"
              }.`,
            proposedDiscount,
            proposedQuantity: proposedQuantity || undefined,
            createdAt: "Just now",
          };

          return {
            ...quote,
            status: "NEGOTIATING" as QuoteStatus,
            lines: updatedLines,
            subtotalAmount,
            subtotal: `₹${subtotalAmount.toLocaleString("en-IN")}`,
            discountAmount,
            taxAmount,
            totalAmount,
            total: `₹${totalAmount.toLocaleString("en-IN")}`,
            blendedMargin,
            reApprovalRequired,
            reApprovalReason: reApprovalRequired
              ? `Counter discount (${proposedDiscount}%) exceeds category threshold (${
                  targetLine?.effectiveCeiling || 15
                }%). Requires managerial re-approval.`
              : undefined,
            negotiationMessages: [...(quote.negotiationMessages || []), newMessage],
            updatedAt: "Just now",
          };
        })
      );

      return { reApprovalRequired, quoteNumber };
    },
    []
  );

  const addLineComment = useCallback(
    (
      quoteId: string,
      lineItemId: string | null,
      message: string,
      authorRole: "CUSTOMER" | "SALES_REP" = "CUSTOMER",
      authorName: string = "Jordan Procurement (Acme Corp)"
    ) => {
      setQuotations((prev) =>
        prev.map((quote) => {
          if (quote.id.toLowerCase() !== quoteId.toLowerCase()) return quote;

          const newMessage: ICustomerNegotiationMessage = {
            id: `msg-${Date.now()}`,
            quotationId: quote.id,
            lineItemId: lineItemId || undefined,
            authorRole,
            authorName,
            message,
            createdAt: "Just now",
          };

          return {
            ...quote,
            status: quote.status === "CUSTOMER_REVIEW" ? "NEGOTIATING" : quote.status,
            negotiationMessages: [...(quote.negotiationMessages || []), newMessage],
            updatedAt: "Just now",
          };
        })
      );
    },
    []
  );

  const confirmQuotation = useCallback(
    (
      quoteId: string,
      signerName: string,
      signerTitle: string,
      acceptanceNotes?: string
    ) => {
      const currentQuote = quotations.find((q) => q.id.toLowerCase() === quoteId.toLowerCase());
      const hasBreach =
        Boolean(currentQuote?.reApprovalRequired) ||
        Boolean(currentQuote?.lines.some((l) => l.isViolation || l.discountPercent > l.effectiveCeiling));

      const routeType: "FULFILLMENT" | "RE_APPROVAL" = hasBreach ? "RE_APPROVAL" : "FULFILLMENT";
      const resultStatus: QuoteStatus = hasBreach ? "IN_REVIEW" : "ACCEPTED";
      const numPart = (currentQuote?.id || quoteId).replace(/[^0-9]/g, "").slice(-4) || "0043";
      const salesOrderNumber = routeType === "FULFILLMENT" ? `SO-2026-${numPart}` : undefined;
      const reApprovalReason =
        routeType === "RE_APPROVAL"
          ? currentQuote?.reApprovalReason ||
            "One or more line discounts exceed approved discount ceilings. Re-routed to Morgan Manager for B4 Governance Review."
          : undefined;

      setQuotations((prev) =>
        prev.map((quote) => {
          if (quote.id.toLowerCase() !== quoteId.toLowerCase()) return quote;

          if (routeType === "RE_APPROVAL") {
            const auditMsg: ICustomerNegotiationMessage = {
              id: `msg-${Date.now()}`,
              quotationId: quote.id,
              authorRole: "CUSTOMER",
              authorName: signerName || "Customer Signer",
              message: `Procurement attempted digital confirmation. Because terms exceed discount ceilings, quotation was automatically re-routed to Manager Morgan Manager for B4 re-approval.`,
              createdAt: "Just now",
            };

            return {
              ...quote,
              status: "IN_REVIEW" as QuoteStatus,
              approvalRequirement: "MANAGER_REQUIRED",
              reApprovalRequired: true,
              reApprovalReason,
              signerName,
              signerTitle,
              negotiationMessages: [...(quote.negotiationMessages || []), auditMsg],
              updatedAt: "Just now",
            };
          } else {
            const auditMsg: ICustomerNegotiationMessage = {
              id: `msg-${Date.now()}`,
              quotationId: quote.id,
              authorRole: "CUSTOMER",
              authorName: signerName || "Customer Signer",
              message: `Quotation digitally accepted & confirmed by ${signerName} (${signerTitle}). Sales Order ${salesOrderNumber} generated. Order moved directly to multi-warehouse fulfillment.`,
              createdAt: "Just now",
            };

            return {
              ...quote,
              status: "ACCEPTED" as QuoteStatus,
              salesOrderNumber,
              signerName,
              signerTitle,
              confirmedAt: new Date().toISOString(),
              negotiationMessages: [...(quote.negotiationMessages || []), auditMsg],
              updatedAt: "Just now",
            };
          }
        })
      );

      return {
        status: resultStatus,
        routeType,
        salesOrderNumber,
        reApprovalReason,
      };
    },
    [quotations]
  );

  const approveQuotation = useCallback(
    async (
      quoteId: string,
      reviewerName: string,
      reviewerRole: Role,
      notes: string = ""
    ) => {
      const currentQuote = quotations.find((q) => q.id.toLowerCase() === quoteId.toLowerCase());
      if (!currentQuote) throw new Error(`Quotation ${quoteId} not found`);

      const isDualRequired =
        currentQuote.approvalRequirement === "DUAL_REQUIRED" ||
        currentQuote.riskScore > 50 ||
        currentQuote.blendedMargin < 18;

      const currentStage = currentQuote.approvalStage || "SALES_MANAGER";

      const nextStatus: QuoteStatus = "APPROVED";
      const nextStage = "COMPLETED" as const;
      const actionType: ApprovalActionType = "APPROVED_FINAL";
      const isFinal = true;

      const defaultNotes = "Commercial and discount terms approved by governance.";

      const auditEntry: QuotationAuditEntry = {
        id: `audit-${Date.now()}`,
        action: actionType,
        actorName: reviewerName || "Morgan Manager",
        actorRole: reviewerRole || "SALES_MANAGER",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", Today",
        notes: notes.trim() || defaultNotes,
        metadata: {
          riskScore: currentQuote.riskScore,
          blendedMargin: currentQuote.blendedMargin,
          stage: nextStage,
        },
      };

      setQuotations((prev) =>
        prev.map((q) => {
          if (q.id.toLowerCase() !== quoteId.toLowerCase()) return q;
          return {
            ...q,
            status: nextStatus,
            approvalStage: nextStage,
            reApprovalRequired: false,
            reApprovalReason: undefined,
            updatedAt: "Just now",
            auditTrail: [auditEntry, ...(q.auditTrail || [])],
          };
        })
      );

      // Persist to backend API (API.md §8.2)
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("dealorbit_token") ||
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("dealorbit_token="))
                ?.split("=")[1]
            : undefined;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(
          `${siteConfig.apiUrl}/api/v1/approvals/${encodeURIComponent(quoteId)}/decision`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              decision: "APPROVED",
              reason: notes.trim() || defaultNotes,
              reviewerName,
              reviewerRole,
            }),
          }
        );

        if (!res.ok) {
          console.warn(`Backend approval API responded with HTTP ${res.status}`);
        }
      } catch (apiErr) {
        console.warn("Backend approval API sync notice:", apiErr);
      }

      return { nextStatus, nextStage, isFinal, auditEntry };
    },
    [quotations]
  );

  const rejectQuotation = useCallback(
    async (
      quoteId: string,
      reviewerName: string,
      reviewerRole: Role,
      reason: string
    ) => {
      const currentQuote = quotations.find((q) => q.id.toLowerCase() === quoteId.toLowerCase());
      const auditEntry: QuotationAuditEntry = {
        id: `audit-${Date.now()}`,
        action: "REJECTED",
        actorName: reviewerName || "Reviewer",
        actorRole: reviewerRole,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", Today",
        notes: reason.trim() || "Discount configuration rejected by governance board.",
        metadata: {
          previousStatus: currentQuote?.status,
        },
      };

      setQuotations((prev) =>
        prev.map((q) => {
          if (q.id.toLowerCase() !== quoteId.toLowerCase()) return q;
          return {
            ...q,
            status: "REJECTED" as QuoteStatus,
            approvalStage: "REJECTED",
            updatedAt: "Just now",
            auditTrail: [auditEntry, ...(q.auditTrail || [])],
          };
        })
      );

      // Persist to backend API (API.md §8.2)
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("dealorbit_token") ||
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("dealorbit_token="))
                ?.split("=")[1]
            : undefined;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        await fetch(
          `${siteConfig.apiUrl}/api/v1/approvals/${encodeURIComponent(quoteId)}/decision`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              decision: "REJECTED",
              reason: reason.trim() || "Discount configuration rejected by governance board.",
              reviewerName,
              reviewerRole,
            }),
          }
        );
      } catch (apiErr) {
        console.warn("Backend rejection API sync notice:", apiErr);
      }

      return { nextStatus: "REJECTED" as QuoteStatus, auditEntry };
    },
    [quotations]
  );

  const returnQuotationForRevision = useCallback(
    async (
      quoteId: string,
      reviewerName: string,
      reviewerRole: Role,
      feedback: string
    ) => {
      const currentQuote = quotations.find((q) => q.id.toLowerCase() === quoteId.toLowerCase());
      const auditEntry: QuotationAuditEntry = {
        id: `audit-${Date.now()}`,
        action: "RETURNED_FOR_REVISION",
        actorName: reviewerName || "Reviewer",
        actorRole: reviewerRole,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", Today",
        notes: feedback.trim(),
        metadata: {
          previousStatus: currentQuote?.status,
        },
      };

      setQuotations((prev) =>
        prev.map((q) => {
          if (q.id.toLowerCase() !== quoteId.toLowerCase()) return q;
          return {
            ...q,
            status: "DRAFT" as QuoteStatus,
            approvalStage: "RETURNED",
            reApprovalReason: feedback.trim(),
            updatedAt: "Just now",
            auditTrail: [auditEntry, ...(q.auditTrail || [])],
          };
        })
      );

      // Persist to backend API (API.md §8.2)
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("dealorbit_token") ||
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("dealorbit_token="))
                ?.split("=")[1]
            : undefined;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        await fetch(
          `${siteConfig.apiUrl}/api/v1/approvals/${encodeURIComponent(quoteId)}/decision`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              decision: "CHANGES_REQUESTED",
              reason: feedback.trim() || "Returned for revision.",
              reviewerName,
              reviewerRole,
            }),
          }
        );
      } catch (apiErr) {
        console.warn("Backend revision return API sync notice:", apiErr);
      }

      return { nextStatus: "DRAFT" as QuoteStatus, auditEntry };
    },
    [quotations]
  );

  return (
    <QuotationsContext.Provider
      value={{
        quotations,
        isLoading,
        error,
        refetchQuotations,
        addQuotation,
        updateQuotation,
        getQuotation,
        getQuotationByToken,
        getNextQuoteId,
        submitCounterOffer,
        addLineComment,
        confirmQuotation,
        approveQuotation,
        rejectQuotation,
        returnQuotationForRevision,
      }}
    >
      {children}
    </QuotationsContext.Provider>
  );
}

export function useQuotations() {
  const context = useContext(QuotationsContext);
  if (!context) {
    throw new Error("useQuotations must be used within a QuotationsProvider");
  }
  return context;
}
