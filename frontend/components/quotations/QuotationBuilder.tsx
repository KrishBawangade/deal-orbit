"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Search,
  Package,
  Wrench,
  Repeat,
  Percent,
  TrendingUp,
  Building2,
  DollarSign,
  Send,
  Truck,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/context/RoleContext";
import { useQuotations, QuotationRecord, QuotationLineItem } from "@/context/QuotationsContext";
import { CATALOG_PRODUCTS, CUSTOMER_ACCOUNTS, ICatalogProduct, ICustomerAccount } from "@/config/catalogData";
import { ProductCategory, CustomerTier } from "@/types";

interface QuotationBuilderProps {
  initialQuote?: QuotationRecord;
}

export default function QuotationBuilder({ initialQuote }: QuotationBuilderProps) {
  const router = useRouter();
  const { activeUser } = useRole();
  const { addQuotation, updateQuotation, getNextQuoteId } = useQuotations();

  // 1. Customer Selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialQuote?.customerId || CUSTOMER_ACCOUNTS[0].id
  );

  const selectedCustomer: ICustomerAccount = useMemo(() => {
    return (
      CUSTOMER_ACCOUNTS.find((c) => c.id === selectedCustomerId) ||
      CUSTOMER_ACCOUNTS[0]
    );
  }, [selectedCustomerId]);

  // 2. Active Quote Identification
  const quoteId = useMemo(() => {
    return initialQuote?.id || getNextQuoteId();
  }, [initialQuote, getNextQuoteId]);

  // 3. Catalog Filtering
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "HARDWARE" | "SERVICES" | "SUBSCRIPTIONS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCatalog = useMemo(() => {
    return CATALOG_PRODUCTS.filter((prod) => {
      if (categoryFilter === "HARDWARE" && prod.category !== "HARDWARE") return false;
      if (categoryFilter === "SERVICES" && prod.category !== "SERVICES") return false;
      if (categoryFilter === "SUBSCRIPTIONS" && prod.category !== "SOFTWARE") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          prod.name.toLowerCase().includes(q) ||
          prod.sku.toLowerCase().includes(q) ||
          prod.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  // 4. Order Lines Cart State
  const [cartLines, setCartLines] = useState<QuotationLineItem[]>(() => {
    if (initialQuote?.lines && initialQuote.lines.length > 0) {
      return initialQuote.lines;
    }
    // Default starter template for interactive feel
    const starterProduct = CATALOG_PRODUCTS[0]; // Enterprise Laptop
    const ceiling = selectedCustomer.tierCeilings.HARDWARE;
    const discount = 10;
    const net = starterProduct.basePrice * (1 - discount / 100);
    const margin = ((net - starterProduct.unitCost) / net) * 100;

    return [
      {
        id: `line-${Date.now()}-1`,
        productId: starterProduct.id,
        sku: starterProduct.sku,
        name: starterProduct.name,
        category: starterProduct.category,
        quantity: 5,
        unitPrice: starterProduct.basePrice,
        unitCost: starterProduct.unitCost,
        discountPercent: discount,
        effectiveCeiling: ceiling,
        isViolation: discount > ceiling,
        violationPoints: Math.max(0, discount - ceiling),
        netLineTotal: net * 5,
        lineMarginPercent: parseFloat(margin.toFixed(1)),
        isRecurring: starterProduct.isRecurring,
        billingFrequency: starterProduct.billingFrequency,
      },
    ];
  });

  // 5. Order-Level Discount (%)
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(
    initialQuote?.orderDiscountPercent || 0
  );

  // 6. Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    quoteId: string;
    routeType: "FULFILLMENT" | "APPROVAL";
    totalFormatted: string;
    blendedMargin: number;
    riskScore: number;
  } | null>(null);

  // Helper: Get ceiling for product category given the active customer
  const getCeilingForProduct = (category: ProductCategory) => {
    if (category === "HARDWARE") return selectedCustomer.tierCeilings.HARDWARE;
    if (category === "SERVICES") return selectedCustomer.tierCeilings.SERVICES;
    return selectedCustomer.tierCeilings.SOFTWARE;
  };

  // Add Product to Cart
  const handleAddToCart = (product: ICatalogProduct) => {
    setCartLines((prevLines) => {
      const existingIndex = prevLines.findIndex((l) => l.productId === product.id);
      const ceiling = getCeilingForProduct(product.category);

      if (existingIndex > -1) {
        // Increment quantity
        const updated = [...prevLines];
        const line = updated[existingIndex];
        const newQty = line.quantity + 1;
        const netPerUnit = line.unitPrice * (1 - line.discountPercent / 100);
        const margin = ((netPerUnit - line.unitCost) / netPerUnit) * 100;

        updated[existingIndex] = {
          ...line,
          quantity: newQty,
          netLineTotal: Math.round(netPerUnit * newQty),
          lineMarginPercent: parseFloat(margin.toFixed(1)),
        };
        toast.success(`Incremented quantity for ${product.name}`);
        return updated;
      } else {
        // Add new line
        const defaultDiscount = 0;
        const netPerUnit = product.basePrice * (1 - defaultDiscount / 100);
        const margin = ((netPerUnit - product.unitCost) / netPerUnit) * 100;

        const newLine: QuotationLineItem = {
          id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          quantity: 1,
          unitPrice: product.basePrice,
          unitCost: product.unitCost,
          discountPercent: defaultDiscount,
          effectiveCeiling: ceiling,
          isViolation: defaultDiscount > ceiling,
          violationPoints: Math.max(0, defaultDiscount - ceiling),
          netLineTotal: Math.round(netPerUnit * 1),
          lineMarginPercent: parseFloat(margin.toFixed(1)),
          isRecurring: product.isRecurring,
          billingFrequency: product.billingFrequency,
        };
        toast.success(`Added ${product.name} to quotation cart`);
        return [...prevLines, newLine];
      }
    });
  };

  // Adjust Quantity
  const handleQuantityChange = (lineId: string, delta: number) => {
    setCartLines((prevLines) =>
      prevLines.map((line) => {
        if (line.id !== lineId) return line;
        const newQty = Math.max(1, line.quantity + delta);
        const netPerUnit = line.unitPrice * (1 - line.discountPercent / 100);
        const margin = ((netPerUnit - line.unitCost) / netPerUnit) * 100;
        return {
          ...line,
          quantity: newQty,
          netLineTotal: Math.round(netPerUnit * newQty),
          lineMarginPercent: parseFloat(margin.toFixed(1)),
        };
      })
    );
  };

  // Direct Quantity Input
  const handleDirectQuantity = (lineId: string, val: number) => {
    const qty = isNaN(val) || val < 1 ? 1 : Math.floor(val);
    setCartLines((prevLines) =>
      prevLines.map((line) => {
        if (line.id !== lineId) return line;
        const netPerUnit = line.unitPrice * (1 - line.discountPercent / 100);
        const margin = ((netPerUnit - line.unitCost) / netPerUnit) * 100;
        return {
          ...line,
          quantity: qty,
          netLineTotal: Math.round(netPerUnit * qty),
          lineMarginPercent: parseFloat(margin.toFixed(1)),
        };
      })
    );
  };

  // Adjust Line Discount
  const handleDiscountChange = (lineId: string, discount: number) => {
    const safeDiscount = Math.min(100, Math.max(0, isNaN(discount) ? 0 : discount));
    setCartLines((prevLines) =>
      prevLines.map((line) => {
        if (line.id !== lineId) return line;
        const ceiling = getCeilingForProduct(line.category);
        const isViolation = safeDiscount > ceiling;
        const violationPoints = Math.max(0, parseFloat((safeDiscount - ceiling).toFixed(1)));
        const netPerUnit = line.unitPrice * (1 - safeDiscount / 100);
        const margin = netPerUnit > 0 ? ((netPerUnit - line.unitCost) / netPerUnit) * 100 : -100;

        return {
          ...line,
          discountPercent: safeDiscount,
          effectiveCeiling: ceiling,
          isViolation,
          violationPoints,
          netLineTotal: Math.round(netPerUnit * line.quantity),
          lineMarginPercent: parseFloat(margin.toFixed(1)),
        };
      })
    );
  };

  // Remove Line
  const handleRemoveLine = (lineId: string) => {
    setCartLines((prevLines) => {
      const remaining = prevLines.filter((l) => l.id !== lineId);
      toast.info("Item removed from cart");
      return remaining;
    });
  };

  // Recalculate ceiling compliance if customer changes
  const handleCustomerChange = (newCustomerId: string) => {
    setSelectedCustomerId(newCustomerId);
    const newCust = CUSTOMER_ACCOUNTS.find((c) => c.id === newCustomerId) || CUSTOMER_ACCOUNTS[0];

    setCartLines((prevLines) =>
      prevLines.map((line) => {
        const ceiling =
          line.category === "HARDWARE"
            ? newCust.tierCeilings.HARDWARE
            : line.category === "SERVICES"
            ? newCust.tierCeilings.SERVICES
            : newCust.tierCeilings.SOFTWARE;

        const isViolation = line.discountPercent > ceiling;
        const violationPoints = Math.max(0, parseFloat((line.discountPercent - ceiling).toFixed(1)));

        return {
          ...line,
          effectiveCeiling: ceiling,
          isViolation,
          violationPoints,
        };
      })
    );
    toast.info(`Updated customer tier ceilings for ${newCust.name} (${newCust.tier} Tier)`);
  };

  // =========================================================================
  // FINANCIAL CALCULATIONS & REAL-TIME MARGINS
  // =========================================================================
  const financialTotals = useMemo(() => {
    // 1. Gross List Price Subtotal
    const grossSubtotal = cartLines.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0
    );

    // 2. Line Discounts Total
    const lineDiscountsTotal = cartLines.reduce((sum, line) => {
      const undiscounted = line.unitPrice * line.quantity;
      return sum + (undiscounted - line.netLineTotal);
    }, 0);

    const netAfterLineDiscounts = grossSubtotal - lineDiscountsTotal;

    // 3. Order-level discount
    const safeOrderDiscount = Math.min(100, Math.max(0, orderDiscountPercent || 0));
    const orderDiscountAmount = Math.round((netAfterLineDiscounts * safeOrderDiscount) / 100);

    const netTaxableAmount = Math.max(0, netAfterLineDiscounts - orderDiscountAmount);

    // 4. Tax (GST 18%)
    const taxAmount = Math.round(netTaxableAmount * 0.18);

    // 5. Grand Total
    const grandTotal = netTaxableAmount + taxAmount;

    // 6. Total Cost & Blended Margin
    const totalCost = cartLines.reduce(
      (sum, line) => sum + line.unitCost * line.quantity,
      0
    );

    let blendedMargin = 0;
    if (netTaxableAmount > 0) {
      blendedMargin = parseFloat((((netTaxableAmount - totalCost) / netTaxableAmount) * 100).toFixed(1));
    }

    // 7. Ceiling Breaches & Governance Evaluation
    const violations = cartLines.filter((l) => l.isViolation);
    const hasCeilingViolations = violations.length > 0;

    // Risk score calculation based on governance rules:
    // Base risk from margin erosion below 25%:
    let risk = 10;
    if (blendedMargin < 20) risk += 15;
    if (blendedMargin < 15) risk += 25;
    if (blendedMargin < 10) risk += 30;

    // Additional risk from ceiling violations
    violations.forEach((v) => {
      risk += v.violationPoints * 2.5;
    });

    if (safeOrderDiscount > 5) {
      risk += safeOrderDiscount * 2;
    }

    const calculatedRiskScore = Math.min(100, Math.max(5, parseFloat(risk.toFixed(1))));

    // Direct fulfillment requires: 0 ceiling breaches AND margin >= 18% AND risk <= 20
    const isApprovalRequired =
      hasCeilingViolations ||
      blendedMargin < 18.0 ||
      calculatedRiskScore > 20.0 ||
      safeOrderDiscount > 0;

    return {
      grossSubtotal,
      lineDiscountsTotal,
      orderDiscountAmount,
      totalDiscounts: lineDiscountsTotal + orderDiscountAmount,
      netTaxableAmount,
      taxAmount,
      grandTotal,
      totalCost,
      blendedMargin,
      marginStatus: (blendedMargin >= 20 ? "HIGH" : blendedMargin >= 12 ? "MEDIUM" : "DANGER") as
        | "HIGH"
        | "MEDIUM"
        | "DANGER",
      violations,
      hasCeilingViolations,
      calculatedRiskScore,
      isApprovalRequired,
    };
  }, [cartLines, orderDiscountPercent]);

  // Format currency
  const formatCurrency = (val: number) => {
    return "₹" + val.toLocaleString("en-IN");
  };

  // =========================================================================
  // CONFIRMATION & MOVE TO APPROVAL OR FULFILLMENT
  // =========================================================================
  const handleConfirmQuotation = () => {
    if (cartLines.length === 0) {
      toast.error("Quotation cannot be empty", {
        description: "Please add at least one product line before confirming.",
      });
      return;
    }

    const routeType = financialTotals.isApprovalRequired ? "APPROVAL" : "FULFILLMENT";
    const status = financialTotals.isApprovalRequired ? "IN_REVIEW" : "APPROVED";
    const approvalRequirement = financialTotals.isApprovalRequired
      ? financialTotals.calculatedRiskScore > 50
        ? "DUAL_REQUIRED"
        : "MANAGER_REQUIRED"
      : "NONE";

    const newRecord: QuotationRecord = {
      id: quoteId,
      customerName: selectedCustomer.name,
      customerId: selectedCustomer.id,
      tier: selectedCustomer.tier,
      tierCeiling: selectedCustomer.tierCeilings.HARDWARE,
      lineItemsCount: cartLines.length,
      subtotal: formatCurrency(financialTotals.grossSubtotal),
      subtotalAmount: financialTotals.grossSubtotal,
      discountAmount: financialTotals.totalDiscounts,
      orderDiscountPercent: orderDiscountPercent,
      taxAmount: financialTotals.taxAmount,
      total: formatCurrency(financialTotals.grandTotal),
      totalAmount: financialTotals.grandTotal,
      blendedMargin: financialTotals.blendedMargin,
      marginStatus: financialTotals.marginStatus,
      riskScore: financialTotals.calculatedRiskScore,
      status: status,
      approvalRequirement: approvalRequirement,
      repName: activeUser.name,
      updatedAt: "Just now",
      lines: cartLines,
      paymentTerms: selectedCustomer.paymentTerms,
    };

    if (initialQuote) {
      updateQuotation(newRecord);
      toast.success(`Quotation ${quoteId} updated`);
    } else {
      addQuotation(newRecord);
      toast.success(`Quotation ${quoteId} created successfully`);
    }

    // Open confirmation feedback modal
    setConfirmationModal({
      isOpen: true,
      quoteId: quoteId,
      routeType,
      totalFormatted: formatCurrency(financialTotals.grandTotal),
      blendedMargin: financialTotals.blendedMargin,
      riskScore: financialTotals.calculatedRiskScore,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Header & Metadata Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              {quoteId}
            </span>
            <span className="badge badge-role-rep text-[10px] font-semibold">
              {initialQuote ? "Editing Proposal" : "Draft Proposal"}
            </span>
            <span className="text-xs text-[var(--text-muted)]">• Rep: {activeUser.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] font-heading">
            Quotation Builder
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure line quantities, customer discounts, and live gross margins.
          </p>
        </div>

        {/* Customer Account Selector */}
        <div className="flex items-center gap-3">
          <div className="bg-[var(--card-hover)] p-2.5 rounded-xl border border-[var(--border)] text-xs space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Customer Account:</span>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="bg-[var(--card)] text-[var(--text-main)] border border-[var(--border)] rounded-md px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
            >
              {CUSTOMER_ACCOUNTS.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.tier} Tier — {cust.paymentTerms})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customer Governance & Discount Ceiling Banner */}
      <div className="card-glass p-4 rounded-xl border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Customer:</span>
            <span className="font-semibold text-[var(--text-main)]">{selectedCustomer.name}</span>
            <span className="badge badge-accent text-[10px] uppercase font-bold">
              {selectedCustomer.tier} TIER
            </span>
          </div>
          <div className="h-4 w-px bg-[var(--border)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Max Discount Ceilings:</span>
            <span className="px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-medium">
              Hardware: <strong className="text-[var(--primary)]">{selectedCustomer.tierCeilings.HARDWARE}%</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-medium">
              Services: <strong className="text-[var(--primary)]">{selectedCustomer.tierCeilings.SERVICES}%</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-medium">
              Subscriptions: <strong className="text-[var(--primary)]">{selectedCustomer.tierCeilings.SOFTWARE}%</strong>
            </span>
          </div>

          <div className="h-4 w-px bg-[var(--border)] hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Live Risk:</span>
            <span
              className={`badge text-[10px] font-bold ${
                financialTotals.calculatedRiskScore <= 20
                  ? "badge-success"
                  : financialTotals.calculatedRiskScore <= 50
                  ? "badge-warning"
                  : "badge-destructive"
              }`}
            >
              {financialTotals.calculatedRiskScore} / 100 (
              {financialTotals.calculatedRiskScore <= 20
                ? "Low Risk"
                : financialTotals.calculatedRiskScore <= 50
                ? "Medium Risk"
                : "High Risk"}
              )
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[var(--text-muted)]">
          Payment Terms: <span className="font-semibold text-[var(--text-main)]">{selectedCustomer.paymentTerms}</span>
        </div>
      </div>

      {/* 2. Main Builder Body: Products Catalog + Order Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Products Picker & Active Cart */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: Product Catalog Selector */}
          <div className="card-glass p-5 rounded-2xl border border-[var(--border)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)] font-heading flex items-center gap-2">
                  <Package className="w-4 h-4 text-[var(--primary)]" />
                  <span>Product Catalog</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Pick commercial items across Hardware, Services, and Subscriptions.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border-subtle)] pb-3">
              <button
                type="button"
                onClick={() => setCategoryFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  categoryFilter === "ALL"
                    ? "bg-[var(--primary)] text-white shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
                }`}
              >
                All Categories ({CATALOG_PRODUCTS.length})
              </button>

              <button
                type="button"
                onClick={() => setCategoryFilter("HARDWARE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  categoryFilter === "HARDWARE"
                    ? "bg-[var(--primary)] text-white shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Hardware</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryFilter("SERVICES")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  categoryFilter === "SERVICES"
                    ? "bg-[var(--primary)] text-white shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Services</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryFilter("SUBSCRIPTIONS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  categoryFilter === "SUBSCRIPTIONS"
                    ? "bg-[var(--primary)] text-white shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Subscriptions</span>
              </button>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredCatalog.map((product) => {
                const inCart = cartLines.find((l) => l.productId === product.id);
                return (
                  <div
                    key={product.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      inCart
                        ? "bg-[var(--primary)]/5 border-[var(--primary)]/40"
                        : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/30 hover:bg-[var(--card-hover)]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            product.category === "HARDWARE"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : product.category === "SERVICES"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {product.category === "SOFTWARE" ? "SUBSCRIPTION" : product.category}
                        </span>

                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                          {product.sku}
                        </span>
                      </div>

                      <div className="font-semibold text-xs text-[var(--text-main)] line-clamp-1">
                        {product.name}
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                      <div>
                        <div className="text-sm font-bold text-[var(--text-main)] font-heading">
                          {formatCurrency(product.basePrice)}
                          {product.isRecurring && (
                            <span className="text-[10px] font-normal text-[var(--text-muted)] ml-1">
                              /{product.unit}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {product.category === "HARDWARE"
                            ? `Stock: ${product.inStock} units`
                            : product.category === "SERVICES"
                            ? "Enterprise SLA Staged"
                            : "Instant Cloud Provision"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={`text-xs py-1 px-3 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          inCart
                            ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                            : "btn-primary"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCart ? `Add (${inCart.quantity})` : "Add to Cart"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: Living Order Lines Cart Table */}
          <div className="card-glass rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/40">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--primary)]" />
                <h2 className="text-base font-bold text-[var(--text-main)] font-heading">
                  Order Lines & Cart ({cartLines.length})
                </h2>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Adjust quantities & line discounts in real time
              </div>
            </div>

            {cartLines.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-[var(--text-main)]">Cart is Empty</div>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Select products from the catalog above to populate this quotation.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--card)]/70 text-[var(--text-muted)] uppercase tracking-wider text-[10px] border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="px-4 py-3">Product Description</th>
                      <th className="px-3 py-3">List Price</th>
                      <th className="px-3 py-3 text-center">Quantity</th>
                      <th className="px-3 py-3">Line Discount (%)</th>
                      <th className="px-3 py-3">Net Total</th>
                      <th className="px-3 py-3 text-center">Margin</th>
                      <th className="px-3 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]/70 text-[var(--text-body)]">
                    {cartLines.map((line) => (
                      <tr
                        key={line.id}
                        className={`hover:bg-[var(--card-hover)]/60 transition-colors ${
                          line.isViolation ? "bg-amber-500/5" : ""
                        }`}
                      >
                        {/* Product Info */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="font-semibold text-[var(--text-main)] text-xs line-clamp-1">
                            {line.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[var(--text-muted)]">
                            <span className="font-mono">{line.sku}</span>
                            <span>•</span>
                            <span className="uppercase font-medium text-[var(--primary)]">
                              {line.category === "SOFTWARE" ? "SUBSCRIPTION" : line.category}
                            </span>
                            {line.isRecurring && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  Recurring ({line.billingFrequency})
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className="px-3 py-3.5 font-mono text-[var(--text-main)]">
                          {formatCurrency(line.unitPrice)}
                        </td>

                        {/* Quantity Stepper */}
                        <td className="px-3 py-3.5 text-center">
                          <div className="inline-flex items-center border border-[var(--border)] rounded-lg bg-[var(--card)] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(line.id, -1)}
                              disabled={line.quantity <= 1}
                              className="p-1 hover:bg-[var(--card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30 cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => handleDirectQuantity(line.id, parseInt(e.target.value, 10))}
                              className="w-10 text-center text-xs font-semibold text-[var(--text-main)] bg-transparent focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => handleQuantityChange(line.id, 1)}
                              className="p-1 hover:bg-[var(--card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Line Discount Input + Ceiling Check */}
                        <td className="px-3 py-3.5">
                          <div className="space-y-1">
                            <div className="relative w-24">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={line.discountPercent}
                                onChange={(e) => handleDiscountChange(line.id, parseFloat(e.target.value))}
                                className={`w-full bg-[var(--card)] border rounded-md px-2 py-1 text-xs font-mono text-[var(--text-main)] focus:outline-none ${
                                  line.isViolation
                                    ? "border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    : "border-[var(--border)] focus:ring-1 focus:ring-[var(--primary)]"
                                }`}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)]">
                                %
                              </span>
                            </div>

                            {/* Ceiling Breach Pill */}
                            {line.isViolation ? (
                              <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>
                                  Ceiling {line.effectiveCeiling}% (+{line.violationPoints}%)
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-[var(--text-muted)]">
                                Max Ceiling: {line.effectiveCeiling}%
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Net Line Total */}
                        <td className="px-3 py-3.5 font-mono font-semibold text-[var(--text-main)]">
                          {formatCurrency(line.netLineTotal)}
                          {line.discountPercent > 0 && (
                            <div className="text-[10px] text-[var(--text-muted)] line-through">
                              {formatCurrency(line.unitPrice * line.quantity)}
                            </div>
                          )}
                        </td>

                        {/* Margin Indicator */}
                        <td className="px-3 py-3.5 text-center">
                          <span
                            className={`badge text-[10px] font-bold ${
                              line.lineMarginPercent >= 20
                                ? "badge-success"
                                : line.lineMarginPercent >= 12
                                ? "badge-warning"
                                : "badge-destructive"
                            }`}
                          >
                            {line.lineMarginPercent}%
                          </span>
                        </td>

                        {/* Delete Action */}
                        <td className="px-3 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                            title="Remove Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Commercial Summary & Governance Routing */}
        <div className="lg:col-span-4 space-y-6">
          {/* COMMERCIAL TOTALS & MARGIN CARD */}
          <div className="card-glass p-5 rounded-2xl border border-[var(--border)] space-y-5 sticky top-20">
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)] font-heading flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[var(--primary)]" />
                <span>Price & Margin Summary</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Dynamic calculations across line items and order terms.
              </p>
            </div>

            {/* Order-level Discount Control */}
            <div className="p-3 rounded-xl bg-[var(--card)]/80 border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--text-main)] flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>Order-Level Discount:</span>
                </span>
                <span className="font-mono font-bold text-[var(--primary)]">
                  {orderDiscountPercent}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={orderDiscountPercent}
                  onChange={(e) => setOrderDiscountPercent(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={orderDiscountPercent}
                  onChange={(e) => setOrderDiscountPercent(parseInt(e.target.value, 10) || 0)}
                  className="w-14 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-0.5 text-xs font-mono text-right"
                />
              </div>

              {orderDiscountPercent > 0 && (
                <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  <span>Order discount applies on top of line discounts.</span>
                </div>
              )}
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2 text-xs border-t border-[var(--border-subtle)] pt-4">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>Gross List Subtotal</span>
                <span className="font-mono text-[var(--text-main)] font-medium">
                  {formatCurrency(financialTotals.grossSubtotal)}
                </span>
              </div>

              {financialTotals.lineDiscountsTotal > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Line Item Discounts</span>
                  <span className="font-mono font-medium">
                    -{formatCurrency(financialTotals.lineDiscountsTotal)}
                  </span>
                </div>
              )}

              {financialTotals.orderDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Order-Level Discount ({orderDiscountPercent}%)</span>
                  <span className="font-mono font-medium">
                    -{formatCurrency(financialTotals.orderDiscountAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>Estimated Taxes (18% GST)</span>
                <span className="font-mono text-[var(--text-main)] font-medium">
                  +{formatCurrency(financialTotals.taxAmount)}
                </span>
              </div>

              <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--text-main)] font-heading">
                  Grand Total
                </span>
                <span className="text-xl font-bold text-[var(--text-main)] font-heading font-mono">
                  {formatCurrency(financialTotals.grandTotal)}
                </span>
              </div>
            </div>

            {/* LIVE COMMERCIAL GAUGES: MARGIN & RISK SCORE */}
            <div className="space-y-3">
              {/* Live Blended Margin */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                    <span>Live Blended Margin</span>
                  </span>
                  <span
                    className={`badge text-xs font-bold ${
                      financialTotals.marginStatus === "HIGH"
                        ? "badge-success"
                        : financialTotals.marginStatus === "MEDIUM"
                        ? "badge-warning"
                        : "badge-destructive"
                    }`}
                  >
                    {financialTotals.blendedMargin}%
                  </span>
                </div>

                {/* Visual Health Gauge Bar */}
                <div className="w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      financialTotals.blendedMargin >= 20
                        ? "bg-emerald-500"
                        : financialTotals.blendedMargin >= 12
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, financialTotals.blendedMargin * 2))}%` }}
                  />
                </div>
              </div>

              {/* Live Risk Score */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                    <span>Live Risk Score</span>
                  </span>
                  <span
                    className={`badge text-xs font-bold ${
                      financialTotals.calculatedRiskScore <= 20
                        ? "badge-success"
                        : financialTotals.calculatedRiskScore <= 50
                        ? "badge-warning"
                        : "badge-destructive"
                    }`}
                  >
                    {financialTotals.calculatedRiskScore} / 100
                  </span>
                </div>

                {/* Visual Risk Gauge Bar */}
                <div className="w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      financialTotals.calculatedRiskScore <= 20
                        ? "bg-emerald-500"
                        : financialTotals.calculatedRiskScore <= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, financialTotals.calculatedRiskScore))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* DYNAMIC CONFIRMATION ACTION BUTTON */}
            <button
              type="button"
              onClick={handleConfirmQuotation}
              disabled={cartLines.length === 0}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                financialTotals.isApprovalRequired
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
              }`}
            >
              {financialTotals.isApprovalRequired ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Confirm & Submit for Approval</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Confirm & Move Straight to Fulfillment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  confirmationModal.routeType === "FULFILLMENT"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {confirmationModal.routeType === "FULFILLMENT" ? (
                  <Truck className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)] font-heading">
                  {confirmationModal.routeType === "FULFILLMENT"
                    ? "Quotation Dispatched to Fulfillment"
                    : "Quotation Submitted for Approval"}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Reference: <strong className="font-mono text-[var(--primary)]">{confirmationModal.quoteId}</strong>
                </p>
              </div>
            </div>

            <div className="bg-[var(--card-hover)] p-4 rounded-xl border border-[var(--border)] space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Customer:</span>
                <span className="font-semibold text-[var(--text-main)]">{selectedCustomer.name}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Grand Total:</span>
                <span className="font-bold text-[var(--text-main)] font-mono">{confirmationModal.totalFormatted}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Blended Margin:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {confirmationModal.blendedMargin}%
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Governance Decision:</span>
                <span className="font-semibold text-[var(--text-main)]">
                  {confirmationModal.routeType === "FULFILLMENT"
                    ? "Auto-Approved (Direct Logistics)"
                    : "Tier-1 Manager Review Queue"}
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-body)]">
              {confirmationModal.routeType === "FULFILLMENT"
                ? "This deal has been confirmed and routed directly to multi-warehouse inventory allocation."
                : "This proposal has been routed to Morgan Manager's governance inbox for review."}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/quotations")}
                className="btn-primary flex-1 text-xs py-2.5 text-center cursor-pointer"
              >
                Go to Quotations List
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmationModal(null);
                  router.push("/pipeline");
                }}
                className="btn-outline flex-1 text-xs py-2.5 text-center cursor-pointer"
              >
                View Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
