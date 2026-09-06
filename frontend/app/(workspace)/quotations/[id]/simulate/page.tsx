"use client";

import React, { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  User,
  HeartHandshake,
  Check,
  ArrowRight,
  Sparkles,
  Info,
  Scale,
  RefreshCw,
  Building2,
  Cpu,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/context/RoleContext";
import { useQuotations, QuotationRecord, QuotationLineItem } from "@/context/QuotationsContext";
import { CUSTOMER_ACCOUNTS } from "@/config/catalogData";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

interface NegotiationRound {
  roundNumber: number;
  repOffer: {
    hardwareDiscount: number;
    servicesDiscount: number;
    paymentTerms: string;
    expeditedDelivery: boolean;
    blendedMargin?: number;
    grandTotal?: number;
  };
  customerMessage: string;
  customerDemands: {
    hardwareDiscount: number;
    servicesDiscount: number;
    paymentTerms: string;
  };
  behavioralSignals: {
    priceSensitivity: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
    competitorRisk?: string;
    cashFlowUrgency: boolean;
    churnHazard: number;
  };
  decision: "ACCEPTED" | "COUNTERED" | "REJECTED";
  isAiGenerated?: boolean;
}

export default function QuotationSimulatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const quoteId = unwrappedParams.id;
  const router = useRouter();
  const { activeUser } = useRole();
  const { getQuotation, updateQuotation } = useQuotations();

  // Retrieve base quote
  const quote: QuotationRecord = useMemo(() => {
    const found = getQuotation(quoteId);
    if (found) return found;

    return {
      id: quoteId,
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
      status: "DRAFT",
      approvalRequirement: "MANAGER_REQUIRED",
      repName: activeUser.name,
      updatedAt: "Just now",
      paymentTerms: "Net 30",
      lines: [
        {
          id: "line-sim-1",
          productId: "prod-hw-01",
          sku: "HW-SRV-POWEREDGE-R750",
          name: "Dell PowerEdge R750 Rack Server",
          category: "HARDWARE",
          quantity: 4,
          unitPrice: 425000,
          unitCost: 320000,
          discountPercent: 8.0,
          effectiveCeiling: 15.0,
          isViolation: false,
          violationPoints: 0,
          netLineTotal: 1496000,
          lineMarginPercent: 23.5,
          isRecurring: false,
          billingFrequency: "ONE_TIME",
        },
        {
          id: "line-sim-2",
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
    };
  }, [quoteId, getQuotation, activeUser.name]);

  const customer = useMemo(() => {
    return (
      CUSTOMER_ACCOUNTS.find((c) => c.id === quote.customerId) ||
      CUSTOMER_ACCOUNTS.find((c) => c.name.toLowerCase() === quote.customerName.toLowerCase()) ||
      CUSTOMER_ACCOUNTS[0]
    );
  }, [quote]);

  // Customer Baseline Thresholds
  const tierCeilings = customer.tierCeilings || { HARDWARE: 15, SERVICES: 10, SOFTWARE: 20 };
  const corridorMin = customer.tier === "ENTERPRISE" ? 10 : customer.tier === "GOLD" ? 8 : 5;
  const corridorMax = customer.tier === "ENTERPRISE" ? 15 : customer.tier === "GOLD" ? 12 : 10;
  const corridorCenter = (corridorMin + corridorMax) / 2;

  // Selected round for viewing history (rounds are clickable)
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0);
  const [isSimulatingResponse, setIsSimulatingResponse] = useState<boolean>(false);
  const [dealAcquired, setDealAcquired] = useState<boolean>(false);

  // Active Rep Counter Inputs (Every single factor is simulated in real-time)
  const [repCounterHwDiscount, setRepCounterHwDiscount] = useState<number>(11);
  const [repCounterSrvDiscount, setRepCounterSrvDiscount] = useState<number>(10);
  const [repCounterTerms, setRepCounterTerms] = useState<string>("Net 45");
  const [repExpeditedDelivery, setRepExpeditedDelivery] = useState<boolean>(true);

  // Negotiation rounds state with full percentage offer history
  const [rounds, setRounds] = useState<NegotiationRound[]>([
    {
      roundNumber: 1,
      repOffer: {
        hardwareDiscount: 8,
        servicesDiscount: 18,
        paymentTerms: "Net 30",
        expeditedDelivery: false,
        blendedMargin: 18.4,
        grandTotal: 1881392,
      },
      customerMessage:
        `"We have reviewed your quotation ${quote.id}. The hardware unit price is high compared to Dell's alternate enterprise bid. We need an 18% discount on hardware, 20% on deployment services, and Net 60 payment terms to proceed this quarter."`,
      customerDemands: {
        hardwareDiscount: 18,
        servicesDiscount: 20,
        paymentTerms: "Net 60",
      },
      behavioralSignals: {
        priceSensitivity: "EXTREME",
        competitorRisk: "Dell Alternate Bid",
        cashFlowUrgency: true,
        churnHazard: 34,
      },
      decision: "COUNTERED",
      isAiGenerated: false,
    },
  ]);

  const activeViewingRound = rounds[selectedRoundIndex] || rounds[rounds.length - 1];
  const isViewingPastRound = selectedRoundIndex < rounds.length - 1;

  // Dynamic Factor Probability Calculation (Reacts live to EVERY single factor change)
  const dynamicFactors = useMemo(() => {
    // 1. Hardware Discount Factor
    const hwDelta = repCounterHwDiscount - corridorCenter;
    const hwImpactPoints = Math.round(hwDelta * 4.2 * 10) / 10;

    // 2. Services Discount Factor
    const srvDelta = repCounterSrvDiscount - 8;
    const srvImpactPoints = Math.round(srvDelta * 2.8 * 10) / 10;

    // 3. Payment Terms Factor
    const termsImpactPoints = repCounterTerms === "Net 60" ? 12 : repCounterTerms === "Net 45" ? 6 : 0;

    // 4. Expedited Delivery SLA Factor
    const deliveryImpactPoints = repExpeditedDelivery ? 8 : 0;

    // Total Concession Score
    const rawAcceptance = 45 + hwImpactPoints + srvImpactPoints + termsImpactPoints + deliveryImpactPoints;
    const acceptanceChance = Math.max(8, Math.min(96, Math.round(rawAcceptance)));
    const counterChance = Math.max(
      4,
      Math.min(55, Math.round(35 - (hwImpactPoints + srvImpactPoints) * 0.4 - termsImpactPoints * 0.3))
    );
    const walkAwayRisk = Math.max(2, 100 - acceptanceChance - counterChance);

    return {
      hwImpactPoints,
      srvImpactPoints,
      termsImpactPoints,
      deliveryImpactPoints,
      acceptanceChance,
      counterChance,
      walkAwayRisk,
    };
  }, [
    repCounterHwDiscount,
    repCounterSrvDiscount,
    repCounterTerms,
    repExpeditedDelivery,
    corridorCenter,
  ]);

  // Calculate live company financial totals for the simulated counter-quote
  const repCounterMetrics = useMemo(() => {
    let grossTotal = 0;
    let discountTotal = 0;
    let costTotal = 0;

    const simulatedLines: QuotationLineItem[] = quote.lines.map((l) => {
      const disc = l.category === "SERVICES" ? repCounterSrvDiscount : repCounterHwDiscount;
      const ceiling = l.category === "SERVICES" ? tierCeilings.SERVICES : tierCeilings.HARDWARE;
      const isViolation = disc > ceiling;
      const violationPoints = Math.max(0, disc - ceiling);
      const gross = l.unitPrice * l.quantity;
      const discVal = (gross * disc) / 100;
      const netLine = gross - discVal;
      const cost = l.unitCost * l.quantity;
      const margin = netLine > 0 ? ((netLine - cost) / netLine) * 100 : 0;

      grossTotal += gross;
      discountTotal += discVal;
      costTotal += cost;

      return {
        ...l,
        discountPercent: disc,
        effectiveCeiling: ceiling,
        isViolation,
        violationPoints,
        netLineTotal: Math.round(netLine),
        lineMarginPercent: parseFloat(margin.toFixed(1)),
      };
    });

    const netTaxable = grossTotal - discountTotal;
    const tax = Math.round(netTaxable * 0.18);
    const grandTotal = netTaxable + tax;
    const blendedMargin =
      netTaxable > 0 ? parseFloat((((netTaxable - costTotal) / netTaxable) * 100).toFixed(1)) : 0;

    const hwViolation =
      repCounterHwDiscount > tierCeilings.HARDWARE ? (repCounterHwDiscount - tierCeilings.HARDWARE) * 7 : 0;
    const srvViolation =
      repCounterSrvDiscount > tierCeilings.SERVICES ? (repCounterSrvDiscount - tierCeilings.SERVICES) * 8 : 0;
    const marginPenalty = blendedMargin < 15 ? 20 : blendedMargin < 18 ? 8 : 0;
    const riskScore = Math.max(10, Math.min(90, Math.round(18 + hwViolation + srvViolation + marginPenalty)));

    const approvalRequired =
      riskScore > 50 || blendedMargin < 15
        ? "Two-Tier Sequential (Sales Manager + Finance Director)"
        : riskScore > 25
        ? "Tier-1 Single Approval (Sales Manager Review)"
        : "Auto-Approved (Direct Logistics Dispatch)";

    return {
      simulatedLines,
      grossTotal,
      discountTotal,
      grandTotal,
      blendedMargin,
      riskScore,
      approvalRequired,
    };
  }, [
    quote.lines,
    repCounterHwDiscount,
    repCounterSrvDiscount,
    tierCeilings,
  ]);

  // Execute Gemini AI Customer Simulation
  const handleSimulateCustomerResponse = async (overrideOffer?: {
    hardwareDiscount?: number;
    servicesDiscount?: number;
    paymentTerms?: string;
    expeditedDelivery?: boolean;
  }) => {
    setIsSimulatingResponse(true);

    const hwDisc = overrideOffer?.hardwareDiscount ?? repCounterHwDiscount;
    const srvDisc = overrideOffer?.servicesDiscount ?? repCounterSrvDiscount;
    const termsVal = overrideOffer?.paymentTerms ?? repCounterTerms;
    const delivVal = overrideOffer?.expeditedDelivery ?? repExpeditedDelivery;

    const currentRepOffer = {
      hardwareDiscount: hwDisc,
      servicesDiscount: srvDisc,
      paymentTerms: termsVal,
      expeditedDelivery: delivVal,
      blendedMargin: repCounterMetrics.blendedMargin,
      grandTotal: repCounterMetrics.grandTotal,
    };

    const latestRoundIdx = rounds.length - 1;

    try {
      const response = await fetch("/api/simulate-customer-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customer.name,
          tier: customer.tier,
          corridorMin,
          corridorMax,
          roundNumber: rounds.length,
          repOffer: currentRepOffer,
          previousCustomerMessage: activeViewingRound.customerMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.decision === "ACCEPTED" || dynamicFactors.acceptanceChance >= 75) {
          // DEAL ACQUIRED!
          setDealAcquired(true);
          const acceptedRound: NegotiationRound = {
            roundNumber: rounds.length,
            repOffer: currentRepOffer,
            customerMessage: data.customerMessage,
            customerDemands: {
              hardwareDiscount: repCounterHwDiscount,
              servicesDiscount: repCounterSrvDiscount,
              paymentTerms: repCounterTerms,
            },
            behavioralSignals: {
              priceSensitivity: "MEDIUM",
              cashFlowUrgency: false,
              churnHazard: 2,
            },
            decision: "ACCEPTED",
            isAiGenerated: data.isAiGenerated,
          };
          setRounds((prev) => {
            const updated = [...prev];
            updated[latestRoundIdx] = acceptedRound;
            return updated;
          });
          setSelectedRoundIndex(latestRoundIdx);
          toast.success("Deal Acquired! Customer accepted your counter-quote terms.");
        } else {
          // Customer Counter-Proposal (Next Round)
          setDealAcquired(false);
          const nextRoundDemandsHw = data.demandedHardwareDiscount || Math.min(18, repCounterHwDiscount + 2);
          const nextRoundDemandsSrv = data.demandedServicesDiscount || Math.min(18, repCounterSrvDiscount + 2);
          const nextRoundDemandsTerms = data.demandedPaymentTerms || (repCounterTerms === "Net 30" ? "Net 45" : "Net 60");

          const updatedCurrentRound: NegotiationRound = {
            ...rounds[latestRoundIdx],
            repOffer: currentRepOffer,
            decision: "COUNTERED",
          };

          const newRoundNumber = rounds.length + 1;
          const nextRound: NegotiationRound = {
            roundNumber: newRoundNumber,
            repOffer: currentRepOffer,
            customerMessage: data.customerMessage,
            customerDemands: {
              hardwareDiscount: nextRoundDemandsHw,
              servicesDiscount: nextRoundDemandsSrv,
              paymentTerms: nextRoundDemandsTerms,
            },
            behavioralSignals: {
              priceSensitivity: data.priceSensitivity || "HIGH",
              cashFlowUrgency: nextRoundDemandsTerms === "Net 60",
              churnHazard: data.walkAwayRisk || 20,
            },
            decision: "COUNTERED",
            isAiGenerated: data.isAiGenerated,
          };

          setRounds((prev) => {
            const updated = [...prev];
            updated[latestRoundIdx] = updatedCurrentRound;
            return [...updated, nextRound];
          });
          setSelectedRoundIndex(rounds.length);

          toast.info(
            `Round ${newRoundNumber}: Customer countered demanding ${nextRoundDemandsHw}% HW discount.`
          );
        }
      } else {
        throw new Error(data.error || "Simulation error");
      }
    } catch (err: any) {
      console.warn("API simulation fallback triggered:", err);

      // Fallback local logic
      if (dynamicFactors.acceptanceChance >= 75) {
        setDealAcquired(true);
        const acceptedRound: NegotiationRound = {
          roundNumber: rounds.length,
          repOffer: currentRepOffer,
          customerMessage: `"We agree to your proposal of ${repCounterHwDiscount}% hardware discount with ${repCounterTerms} terms. Let's move forward."`,
          customerDemands: {
            hardwareDiscount: repCounterHwDiscount,
            servicesDiscount: repCounterSrvDiscount,
            paymentTerms: repCounterTerms,
          },
          behavioralSignals: {
            priceSensitivity: "LOW",
            cashFlowUrgency: false,
            churnHazard: 2,
          },
          decision: "ACCEPTED",
          isAiGenerated: false,
        };
        setRounds((prev) => {
          const updated = [...prev];
          updated[latestRoundIdx] = acceptedRound;
          return updated;
        });
        setSelectedRoundIndex(latestRoundIdx);
        toast.success("Deal Acquired! Customer accepted your simulated counter-quote.");
      } else {
        setDealAcquired(false);
        const newRoundNumber = rounds.length + 1;
        const nextHwDemand = Math.min(18, repCounterHwDiscount + 2);
        const nextTerms = repCounterTerms === "Net 30" ? "Net 45" : "Net 60";

        const updatedCurrentRound: NegotiationRound = {
          ...rounds[latestRoundIdx],
          repOffer: currentRepOffer,
          decision: "COUNTERED",
        };

        const nextRound: NegotiationRound = {
          roundNumber: newRoundNumber,
          repOffer: currentRepOffer,
          customerMessage: `"We evaluated your ${repCounterHwDiscount}% hardware concession. While improved, our procurement ceiling requires ${nextHwDemand}% on core hardware units under ${nextTerms} to execute without further delay."`,
          customerDemands: {
            hardwareDiscount: nextHwDemand,
            servicesDiscount: Math.min(18, repCounterSrvDiscount + 2),
            paymentTerms: nextTerms,
          },
          behavioralSignals: {
            priceSensitivity: "HIGH",
            cashFlowUrgency: false,
            churnHazard: 18,
          },
          decision: "COUNTERED",
          isAiGenerated: false,
        };
        setRounds((prev) => {
          const updated = [...prev];
          updated[latestRoundIdx] = updatedCurrentRound;
          return [...updated, nextRound];
        });
        setSelectedRoundIndex(rounds.length);
        toast.info(`Customer countered back! Round ${newRoundNumber} counter-quote generated.`);
      }
    } finally {
      setIsSimulatingResponse(false);
    }
  };

  // Auto-Simulate Customer Negotiation (Let Gemini AI manage and simulate discounts)
  const handleAutoSimulateWithGemini = async () => {
    const targetHw = activeViewingRound.customerDemands.hardwareDiscount;
    const targetSrv = activeViewingRound.customerDemands.servicesDiscount;
    
    // Strategic concession towards customer target while honoring tier ceilings & corridor
    const optimalHw = Math.min(
      corridorMax + 1,
      Math.max(corridorMin, Math.round(((repCounterHwDiscount + targetHw) / 2) * 2) / 2)
    );
    const optimalSrv = Math.min(
      tierCeilings.SERVICES,
      Math.max(8, Math.round(((repCounterSrvDiscount + targetSrv) / 2) * 2) / 2)
    );
    const optimalTerms = targetHw >= 14 ? "Net 60" : "Net 45";

    setRepCounterHwDiscount(optimalHw);
    setRepCounterSrvDiscount(optimalSrv);
    setRepCounterTerms(optimalTerms);
    setRepExpeditedDelivery(true);

    toast.info(`Gemini auto-calibrated discounts to ${optimalHw}% HW & ${optimalSrv}% Services. Simulating customer response...`);

    // Directly simulate with the calculated discounts
    await handleSimulateCustomerResponse({
      hardwareDiscount: optimalHw,
      servicesDiscount: optimalSrv,
      paymentTerms: optimalTerms,
      expeditedDelivery: true,
    });
  };

  // Reset Simulation to Round 1
  const handleResetSimulation = () => {
    setSelectedRoundIndex(0);
    setDealAcquired(false);
    setRounds([
      {
        roundNumber: 1,
        repOffer: {
          hardwareDiscount: 8,
          servicesDiscount: 18,
          paymentTerms: "Net 30",
          expeditedDelivery: false,
          blendedMargin: 18.4,
          grandTotal: 1881392,
        },
        customerMessage:
          `"We have reviewed your quotation ${quote.id}. The hardware unit price is high compared to Dell's alternate enterprise bid. We need an 18% discount on hardware, 20% on deployment services, and Net 60 payment terms to proceed this quarter."`,
        customerDemands: {
          hardwareDiscount: 18,
          servicesDiscount: 20,
          paymentTerms: "Net 60",
        },
        behavioralSignals: {
          priceSensitivity: "EXTREME",
          competitorRisk: "Dell Alternate Bid",
          cashFlowUrgency: true,
          churnHazard: 34,
        },
        decision: "COUNTERED",
        isAiGenerated: false,
      },
    ]);
    setRepCounterHwDiscount(11);
    setRepCounterSrvDiscount(10);
    setRepCounterTerms("Net 45");
    setRepExpeditedDelivery(true);
    toast.info("Simulation reset to Round 1.");
  };

  // Apply Negotiated Deal to Quotation in Context
  const handleApplyNegotiatedDeal = async () => {
    const grossSubtotal = repCounterMetrics.grossTotal;
    const discountAmount = Math.round(repCounterMetrics.discountTotal);
    const netTaxable = grossSubtotal - discountAmount;
    const taxAmount = Math.round(netTaxable * 0.18);
    const grandTotal = netTaxable + taxAmount;

    const updatedQuotationRecord: QuotationRecord = {
      ...quote,
      lines: repCounterMetrics.simulatedLines,
      lineItemsCount: repCounterMetrics.simulatedLines.length,
      subtotal: formatCurrency(grossSubtotal),
      subtotalAmount: grossSubtotal,
      discountAmount: discountAmount,
      orderDiscountPercent: 0,
      taxAmount: taxAmount,
      total: formatCurrency(grandTotal),
      totalAmount: grandTotal,
      blendedMargin: repCounterMetrics.blendedMargin,
      marginStatus:
        repCounterMetrics.blendedMargin >= 20
          ? "HIGH"
          : repCounterMetrics.blendedMargin >= 12
          ? "MEDIUM"
          : "DANGER",
      riskScore: repCounterMetrics.riskScore,
      paymentTerms: repCounterTerms,
      approvalRequirement:
        repCounterMetrics.riskScore > 50 || repCounterMetrics.blendedMargin < 15
          ? "DUAL_REQUIRED"
          : repCounterMetrics.riskScore > 25
          ? "MANAGER_REQUIRED"
          : "NONE",
      updatedAt: new Date().toISOString(),
    };

    await updateQuotation(updatedQuotationRecord);
    toast.success(`Negotiated deal applied to Quotation ${quote.id}!`);
    router.push(`/quotations/${quote.id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. TOP NAVIGATION */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/quotations/${quote.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors py-1.5 px-3 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quotation Builder</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
            {quote.id}
          </span>
          <span className="badge badge-accent text-[10px] font-bold uppercase">
            {customer.tier} TIER
          </span>
          <span className="badge badge-role-rep text-[10px] font-bold uppercase">
            {quote.status}
          </span>
        </div>
      </div>

      {/* 2. HEADER: DEAL NEGOTIATION & COUNTER SIMULATOR */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-lg text-[var(--text-main)] font-heading">
            <Scale className="w-5 h-5 text-[var(--primary)]" />
            <span>Customer Behavioral & Counter-Quote Simulator</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Bot className="w-3 h-3" />
              <span>Gemini AI Driven</span>
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Simulate customer negotiation psychology round-by-round. Any factor adjustment dynamically updates customer decision probabilities and company margins in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetSimulation}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Rounds</span>
          </button>
        </div>
      </div>

      {/* 3. INTERACTIVE ROUND PROGRESS & HISTORY TABS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
              Negotiation Rounds:
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              (Click any round to inspect historical offers and customer responses)
            </span>
          </div>
          {isViewingPastRound && (
            <button
              type="button"
              onClick={() => setSelectedRoundIndex(rounds.length - 1)}
              className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Return to Active Round {rounds.length}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {rounds.map((r, idx) => {
            const isSelected = idx === selectedRoundIndex;
            const isLatest = idx === rounds.length - 1;
            const isAccepted = r.decision === "ACCEPTED";

            return (
              <button
                key={r.roundNumber}
                type="button"
                onClick={() => setSelectedRoundIndex(idx)}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm scale-102 ring-2 ring-[var(--primary)]/30"
                    : "bg-[var(--card)] hover:bg-[var(--card-hover)] border-[var(--border)] text-[var(--text-main)] hover:border-[var(--text-muted)]"
                }`}
              >
                <span className="font-bold">Round {r.roundNumber}</span>
                {r.repOffer && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition-colors ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[var(--card-hover)] text-[var(--text-muted)] group-hover:text-[var(--text-main)] border border-[var(--border)]"
                    }`}
                  >
                    Offered: {r.repOffer.hardwareDiscount}% HW
                  </span>
                )}
                {isAccepted ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-200" : "text-emerald-500"}`} />
                ) : isLatest && !dealAcquired ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                ) : (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-white/80" : "text-emerald-500"}`} />
                )}
              </button>
            );
          })}

          {dealAcquired && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold shadow-sm animate-pulse">
              <Check className="w-4 h-4" />
              <span>Deal Acquired!</span>
            </div>
          )}
        </div>

        {/* Historical Round Inspection Banner */}
        {isViewingPastRound && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Viewing Historical Snapshot of Round {activeViewingRound.roundNumber}:</strong> In this round, you offered{" "}
                <span className="font-mono font-bold underline">{activeViewingRound.repOffer.hardwareDiscount}% HW</span> and{" "}
                <span className="font-mono font-bold underline">{activeViewingRound.repOffer.servicesDiscount}% Services</span> under{" "}
                <span className="font-bold">{activeViewingRound.repOffer.paymentTerms}</span>
                {activeViewingRound.repOffer.expeditedDelivery ? " (48h Dispatch)" : ""}.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setRepCounterHwDiscount(activeViewingRound.repOffer.hardwareDiscount);
                  setRepCounterSrvDiscount(activeViewingRound.repOffer.servicesDiscount);
                  setRepCounterTerms(activeViewingRound.repOffer.paymentTerms);
                  setRepExpeditedDelivery(activeViewingRound.repOffer.expeditedDelivery);
                  toast.info(`Loaded Round ${activeViewingRound.roundNumber} percentages into sliders.`);
                }}
                className="btn-outline text-[11px] py-1 px-2.5 bg-white dark:bg-black/20 cursor-pointer"
              >
                Copy to Sliders
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoundIndex(rounds.length - 1)}
                className="btn-primary text-[11px] py-1 px-2.5 cursor-pointer"
              >
                Go to Active Round
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. MAIN SIMULATION STAGE: CUSTOMER COUNTER vs OUR COUNTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INCOMING CUSTOMER COUNTER-QUOTE (CUSTOMER BEHAVIOR) */}
        <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-sm text-[var(--text-main)] font-heading">
                Customer Counter-Quote (Round {activeViewingRound.roundNumber})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {activeViewingRound.isAiGenerated && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Gemini Generated</span>
                </span>
              )}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {customer.name}
              </span>
            </div>
          </div>

          {/* Customer Incoming Message Card */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Customer Procurement Response:</span>
              </span>
              {isViewingPastRound && (
                <span className="text-[10px] font-mono font-semibold opacity-75">
                  Round {activeViewingRound.roundNumber} Historical Record
                </span>
              )}
            </div>
            <p className="text-[var(--text-main)] italic leading-relaxed">
              {activeViewingRound.customerMessage}
            </p>
          </div>

          {/* Customer Extracted Behavioral Psychology */}
          <div className="space-y-2.5 text-xs">
            <span className="font-semibold text-[var(--text-muted)] text-[11px] block uppercase">
              Customer Behavioral Profile:
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[var(--card-hover)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Price Sensitivity</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                  {activeViewingRound.behavioralSignals.priceSensitivity}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--card-hover)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Competitor Threat</span>
                <span className="font-bold text-red-600 dark:text-red-400 text-xs">
                  {activeViewingRound.behavioralSignals.competitorRisk || "None Active"}
                </span>
              </div>
            </div>

            {/* Demanded Counter Terms */}
            <div className="p-3 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                  Customer Target Demands:
                </span>
                {!isViewingPastRound && !dealAcquired && (
                  <button
                    type="button"
                    onClick={() => {
                      setRepCounterHwDiscount(activeViewingRound.customerDemands.hardwareDiscount);
                      setRepCounterSrvDiscount(activeViewingRound.customerDemands.servicesDiscount);
                      setRepCounterTerms(activeViewingRound.customerDemands.paymentTerms);
                      toast.success(`Matched customer demands: ${activeViewingRound.customerDemands.hardwareDiscount}% HW & ${activeViewingRound.customerDemands.servicesDiscount}% Services`);
                    }}
                    className="text-[10px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20"
                  >
                    <span>Match Demands</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex justify-between text-xs">
                <span>Hardware Discount Target:</span>
                <strong className="font-mono text-red-500 font-bold">{activeViewingRound.customerDemands.hardwareDiscount}%</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span>Services Discount Target:</span>
                <strong className="font-mono text-red-500 font-bold">{activeViewingRound.customerDemands.servicesDiscount}%</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span>Payment Terms Target:</span>
                <strong className="font-mono text-[var(--text-main)]">{activeViewingRound.customerDemands.paymentTerms}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OUR COUNTER-SIMULATION (REP'S STRATEGY RESPONSE) */}
        <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-[var(--text-main)] font-heading">
                {isViewingPastRound
                  ? `Our Offer in Round ${activeViewingRound.roundNumber}`
                  : "Our Simulated Counter-Quote (Live)"}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
              {isViewingPastRound ? "Historical Snapshot" : "Interactive Factors"}
            </span>
          </div>

          {/* Interactive Counter Controls with Real-time Dynamic Feedback */}
          <div className="space-y-3.5 text-xs">
            {/* Factor 1: Hardware Discount Slider */}
            <div className="p-3 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between items-center font-semibold">
                <span className="flex items-center gap-1.5">
                  <span>Simulated Hardware Discount:</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {dynamicFactors.hwImpactPoints >= 0 ? `+${dynamicFactors.hwImpactPoints}% Win` : `${dynamicFactors.hwImpactPoints}% Win`}
                  </span>
                </span>
                <span className="font-mono font-bold text-sm text-[var(--primary)]">{repCounterHwDiscount}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="0.5"
                value={repCounterHwDiscount}
                disabled={dealAcquired || isViewingPastRound}
                onChange={(e) => setRepCounterHwDiscount(Number(e.target.value))}
                className="w-full accent-[var(--primary)] cursor-pointer disabled:opacity-60"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>Corridor: {corridorMin}% - {corridorMax}%</span>
                <span>Customer Target: {activeViewingRound.customerDemands.hardwareDiscount}%</span>
              </div>
            </div>

            {/* Factor 2: Services Discount Slider */}
            <div className="p-3 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between items-center font-semibold">
                <span className="flex items-center gap-1.5">
                  <span>Simulated Services Discount:</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {dynamicFactors.srvImpactPoints >= 0 ? `+${dynamicFactors.srvImpactPoints}% Win` : `${dynamicFactors.srvImpactPoints}% Win`}
                  </span>
                </span>
                <span className="font-mono font-bold text-sm text-[var(--primary)]">{repCounterSrvDiscount}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={repCounterSrvDiscount}
                disabled={dealAcquired || isViewingPastRound}
                onChange={(e) => setRepCounterSrvDiscount(Number(e.target.value))}
                className="w-full accent-[var(--primary)] cursor-pointer disabled:opacity-60"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>Ceiling: {tierCeilings.SERVICES}%</span>
                <span>Customer Target: {activeViewingRound.customerDemands.servicesDiscount}%</span>
              </div>
            </div>

            {/* Factor 3 & 4: Terms and Delivery SLA */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--card-hover)] border border-[var(--border)]">
                <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-medium">
                  <span>Payment Terms:</span>
                  <span className="font-bold text-emerald-600">
                    +{dynamicFactors.termsImpactPoints}% Win
                  </span>
                </div>
                <select
                  value={repCounterTerms}
                  disabled={dealAcquired || isViewingPastRound}
                  onChange={(e) => setRepCounterTerms(e.target.value)}
                  className="w-full bg-[var(--card)] text-[var(--text-main)] border border-[var(--border)] rounded px-2 py-1 text-xs font-semibold mt-1 cursor-pointer disabled:opacity-60"
                >
                  <option value="Net 30">Net 30 (Baseline)</option>
                  <option value="Net 45">Net 45 (+6% Win)</option>
                  <option value="Net 60">Net 60 (+12% Win)</option>
                </select>
              </div>

              <label className={`p-2.5 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] flex items-center justify-between select-none ${isViewingPastRound ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-main)] block">48h Delivery</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">+{dynamicFactors.deliveryImpactPoints}% Win</span>
                </div>
                <input
                  type="checkbox"
                  checked={repExpeditedDelivery}
                  disabled={dealAcquired || isViewingPastRound}
                  onChange={(e) => setRepExpeditedDelivery(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--primary)] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* DYNAMIC PROBABILITY & MARGIN REACTION PANEL */}
          <div className="p-4 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--text-main)]">Predicted Customer Reaction:</span>
              <span
                className={`font-mono font-extrabold text-sm ${
                  dynamicFactors.acceptanceChance >= 75
                    ? "text-emerald-600 dark:text-emerald-400"
                    : dynamicFactors.acceptanceChance >= 50
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {dynamicFactors.acceptanceChance}% Accept Probability
              </span>
            </div>

            {/* Multi-segmented animated probability bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--border)]">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${dynamicFactors.acceptanceChance}%` }}
                title={`Acceptance: ${dynamicFactors.acceptanceChance}%`}
              />
              <div
                className="bg-amber-400 transition-all duration-300"
                style={{ width: `${dynamicFactors.counterChance}%` }}
                title={`Counter: ${dynamicFactors.counterChance}%`}
              />
              <div
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${dynamicFactors.walkAwayRisk}%` }}
                title={`Walk Away: ${dynamicFactors.walkAwayRisk}%`}
              />
            </div>

            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
              <span className="text-emerald-600 font-bold">Accept: {dynamicFactors.acceptanceChance}%</span>
              <span className="text-amber-600 font-bold">Counter: {dynamicFactors.counterChance}%</span>
              <span className="text-red-500 font-bold">Walk-away: {dynamicFactors.walkAwayRisk}%</span>
            </div>

            {/* Company Margin & Governance Impact */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
              <div>
                <span className="text-[var(--text-muted)] block">Company Margin:</span>
                <strong
                  className={`font-mono ${
                    repCounterMetrics.blendedMargin >= 18
                      ? "text-emerald-600 dark:text-emerald-400"
                      : repCounterMetrics.blendedMargin >= 15
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-500"
                  }`}
                >
                  {repCounterMetrics.blendedMargin}% (Target &gt;18%)
                </strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Approval Requirement:</span>
                <strong className="text-[var(--text-main)] line-clamp-1">
                  {repCounterMetrics.approvalRequired.split("(")[0]}
                </strong>
              </div>
            </div>
          </div>

          {/* SIMULATION ACTION BUTTON */}
          {isViewingPastRound ? (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between gap-2">
              <span>You are viewing Round {activeViewingRound.roundNumber} history.</span>
              <button
                type="button"
                onClick={() => setSelectedRoundIndex(rounds.length - 1)}
                className="btn-primary py-1.5 px-3 text-xs font-bold cursor-pointer"
              >
                Go to Active Round {rounds.length}
              </button>
            </div>
          ) : !dealAcquired ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulateCustomerResponse()}
                disabled={isSimulatingResponse}
                className="w-full btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-600 hover:opacity-95 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSimulatingResponse ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Simulating with Gemini API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Simulate Customer Response (Gemini API)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAutoSimulateWithGemini}
                disabled={isSimulatingResponse}
                className="w-full btn-outline py-2 px-4 text-xs font-bold flex items-center justify-center gap-2 rounded-xl border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Let Gemini AI Auto-Negotiate & Simulate Round</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Deal Acquired! Customer accepted the counter-quote. You can now lock this deal into the quotation.</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. DEDICATED PERCENTAGE OFFER HISTORY & CONCESSION TRAJECTORY TABLE */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
            <h4 className="font-bold text-sm text-[var(--text-main)] font-heading">
              Percentage Offer History & Concession Trajectory
            </h4>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            {rounds.length} {rounds.length === 1 ? "Round" : "Rounds"} in History
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[11px]">
                <th className="py-2.5 px-3">Round</th>
                <th className="py-2.5 px-3">Our Offered HW %</th>
                <th className="py-2.5 px-3">Our Offered Services %</th>
                <th className="py-2.5 px-3">Our Payment Terms</th>
                <th className="py-2.5 px-3">Customer Target HW %</th>
                <th className="py-2.5 px-3">Customer Target Srv %</th>
                <th className="py-2.5 px-3 text-center">HW Gap</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {rounds.map((r, idx) => {
                const isSelected = idx === selectedRoundIndex;
                const hwGap = r.repOffer
                  ? Math.max(0, r.customerDemands.hardwareDiscount - r.repOffer.hardwareDiscount)
                  : 0;
                return (
                  <tr
                    key={r.roundNumber}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[var(--primary)]/10 font-semibold"
                        : "hover:bg-[var(--card-hover)]/40"
                    }`}
                    onClick={() => setSelectedRoundIndex(idx)}
                  >
                    <td className="py-2.5 px-3 font-bold font-mono">
                      Round {r.roundNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--primary)]">
                      {r.repOffer ? `${r.repOffer.hardwareDiscount}%` : "-"}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {r.repOffer ? `${r.repOffer.servicesDiscount}%` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-muted)]">
                      {r.repOffer?.paymentTerms || "Net 30"}
                      {r.repOffer?.expeditedDelivery ? " • 48h Hub" : ""}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-red-500">
                      {r.customerDemands.hardwareDiscount}%
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-red-500">
                      {r.customerDemands.servicesDiscount}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {hwGap === 0 ? (
                        <span className="text-emerald-600 font-bold">Closed (0%)</span>
                      ) : (
                        <span className="text-amber-600 font-bold">{hwGap}% gap</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {r.decision === "ACCEPTED" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          <Check className="w-3 h-3" /> Acquired
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                          Countered
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoundIndex(idx);
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[var(--primary)] text-white shadow-xs"
                            : "bg-[var(--card-hover)] hover:bg-[var(--border)] text-[var(--text-main)]"
                        }`}
                      >
                        {isSelected ? "Viewing" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. QUOTATION LINE ITEMS SIMULATION PREVIEW */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-3 shadow-xs text-xs">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-sm text-[var(--text-main)] font-heading">
            Quotation Line Items Simulated State
          </h4>
          <span className="font-mono text-[var(--text-muted)]">
            Total Value: {formatCurrency(repCounterMetrics.grandTotal)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[11px]">
                <th className="py-2 px-3">Item</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3 text-right">Unit Price</th>
                <th className="py-2 px-3 text-center">Simulated Discount</th>
                <th className="py-2 px-3 text-right">Net Line Total</th>
                <th className="py-2 px-3 text-center">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {repCounterMetrics.simulatedLines.map((line) => (
                <tr key={line.id} className="hover:bg-[var(--card-hover)]/30">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[var(--text-main)]">{line.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">{line.sku}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">{line.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(line.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[var(--primary)]">
                    {line.discountPercent}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">
                    {formatCurrency(line.netLineTotal)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {line.lineMarginPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. BOTTOM ACTION BAR */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
          <Info className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>
            {dealAcquired
              ? "The customer has accepted this simulated deal structure. Click apply to commit the changes to your quotation."
              : "Adjust factors until acceptance probability reaches the acquisition threshold, then simulate customer reaction."}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={`/quotations/${quote.id}`}
            className="btn-outline px-4 py-2.5 text-xs flex-1 sm:flex-initial text-center cursor-pointer"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleApplyNegotiatedDeal}
            className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer shadow-md bg-gradient-to-r from-[var(--primary)] to-indigo-600 hover:opacity-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply Negotiated Deal to Quotation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
