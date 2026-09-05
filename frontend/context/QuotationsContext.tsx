"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CustomerTier, QuoteStatus } from "@/types";

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
    repName: "Sam Seller",
    updatedAt: "10 mins ago",
    paymentTerms: "Net 30",
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
  getNextQuoteId: () => string;
}

const QuotationsContext = createContext<QuotationsContextType | null>(null);

const STORAGE_KEY = "dealorbit_quotations_data";

export function QuotationsProvider({ children }: { children: React.ReactNode }) {
  const [quotations, setQuotations] = useState<QuotationRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback to initial
        }
      }
    }
    return INITIAL_QUOTATIONS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
    }
  }, [quotations]);

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

  return (
    <QuotationsContext.Provider
      value={{
        quotations,
        addQuotation,
        updateQuotation,
        getQuotation,
        getNextQuoteId,
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
