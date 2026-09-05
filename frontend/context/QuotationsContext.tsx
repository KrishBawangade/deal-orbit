"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CustomerTier, QuoteStatus, ICustomerNegotiationMessage } from "@/types";

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
    status: "CUSTOMER_REVIEW",
    approvalRequirement: "MANAGER_REQUIRED",
    repName: "Sam Seller",
    updatedAt: "10 mins ago",
    paymentTerms: "Net 30",
    portalToken: "demo-token",
    expiresAt: "2026-09-19",
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
    id: "QT-2026-0044",
    customerName: "Stark Enterprises",
    customerId: "cust-002",
    tier: "ENTERPRISE",
    tierCeiling: 20,
    lineItemsCount: 4,
    subtotal: "₹8,90,000",
    subtotalAmount: 890000,
    discountAmount: 71200,
    orderDiscountPercent: 0,
    taxAmount: 131000,
    total: "₹9,50,000",
    totalAmount: 950000,
    blendedMargin: 24.8,
    marginStatus: "HIGH",
    riskScore: 14.0,
    status: "DRAFT",
    approvalRequirement: "NONE",
    repName: "Sam Seller",
    updatedAt: "1 hour ago",
    paymentTerms: "Net 45",
    lines: [
      {
        id: "line-03",
        productId: "prod-hw-02",
        sku: "HW-DOCK-4K",
        name: "UltraHD 4K Thunderbolt Docking Station 120W",
        category: "HARDWARE",
        quantity: 20,
        unitPrice: 18500,
        unitCost: 12000,
        discountPercent: 10.0,
        effectiveCeiling: 15.0,
        isViolation: false,
        violationPoints: 0,
        netLineTotal: 333000,
        lineMarginPercent: 27.9,
        isRecurring: false,
        billingFrequency: "ONE_TIME",
      },
      {
        id: "line-04",
        productId: "prod-sub-01",
        sku: "SUB-PLATFORM-ENT",
        name: "DealOrbit Cloud Platform Enterprise License",
        category: "SOFTWARE",
        quantity: 12,
        unitPrice: 25000,
        unitCost: 5000,
        discountPercent: 15.0,
        effectiveCeiling: 20.0,
        isViolation: false,
        violationPoints: 0,
        netLineTotal: 255000,
        lineMarginPercent: 76.5,
        isRecurring: true,
        billingFrequency: "MONTHLY",
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
}

const QuotationsContext = createContext<QuotationsContextType | null>(null);

const STORAGE_KEY = "dealorbit_quotations_data";

export function QuotationsProvider({ children }: { children: React.ReactNode }) {
  const [quotations, setQuotations] = useState<QuotationRecord[]>(INITIAL_QUOTATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

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
  }, []);

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

  return (
    <QuotationsContext.Provider
      value={{
        quotations,
        addQuotation,
        updateQuotation,
        getQuotation,
        getQuotationByToken,
        getNextQuoteId,
        submitCounterOffer,
        addLineComment,
        confirmQuotation,
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
