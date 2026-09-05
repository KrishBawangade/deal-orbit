"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Layers,
  Calendar,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Ban,
  Pencil,
  Building2,
  ShieldCheck,
  ChevronRight,
  Calculator,
  Download,
  Receipt,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import CreditNotesLedgerModal, { ICreditNoteItem } from "./CreditNotesLedgerModal";
import { useRole } from "@/context/RoleContext";

// ==========================================
// DATA STRUCTURES FOR HYBRID BILLING
// ==========================================

export interface IOneTimeLineItem {
  id: string;
  sku: string;
  name: string;
  category: "HARDWARE" | "SERVICES";
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  netLineTotal: number;
  fulfillmentStatus: "FULFILLED" | "PARTIALLY_FULFILLED" | "PROCESSING";
  invoiceNumber: string;
  invoiceStatus: "PAID" | "SENT" | "DRAFT";
}

export interface IRecurringLineItem {
  id: string;
  sku: string;
  name: string;
  category: "SOFTWARE" | "SERVICES";
  contractNumber: string;
  billingFrequency: "MONTHLY" | "QUARTERLY" | "YEARLY";
  unitRate: number; // monthly rate per seat
  quantity: number; // number of seats or units
  recurringAmount: number; // unitRate * quantity
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  status: "ACTIVE" | "MODIFIED" | "CANCELLED";
  cancellationDate?: string;
  cancellationReason?: string;
}

export interface IBillingScheduleRow {
  id: string;
  scheduledDate: string;
  billingPeriod: string;
  contractNumber: string;
  lineName: string;
  frequency: "MONTHLY" | "QUARTERLY" | "YEARLY";
  seats: number;
  projectedAmount: number;
  status: "SCHEDULED" | "PROCESSED" | "PENDING_GENERATION";
  invoiceNumber?: string;
}

export interface IHybridOrder {
  id: string;
  orderNumber: string;
  quoteNumber: string;
  customerName: string;
  customerTier: string;
  contractStartDate: string;
  paymentTerms: string;
  oneTimeLines: IOneTimeLineItem[];
  recurringLines: IRecurringLineItem[];
  billingSchedules: IBillingScheduleRow[];
}

// Initial Realistic Seed Orders
const SEED_ORDERS: IHybridOrder[] = [
  {
    id: "ord-acme-01",
    orderNumber: "SO-2026-0891",
    quoteNumber: "QT-2026-0043",
    customerName: "Acme Corp (Enterprise)",
    customerTier: "GOLD",
    contractStartDate: "2026-09-01",
    paymentTerms: "Net 30",
    oneTimeLines: [
      {
        id: "ot-1",
        sku: "HW-LAPTOP-16",
        name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
        category: "HARDWARE",
        unitPrice: 85000,
        quantity: 20,
        discountPercent: 12.0,
        netLineTotal: 1496000,
        fulfillmentStatus: "PARTIALLY_FULFILLED",
        invoiceNumber: "INV-COMM-2026-041",
        invoiceStatus: "PAID",
      },
      {
        id: "ot-2",
        sku: "SRV-DEPLOY-ONSITE",
        name: "On-Site Hardware Deployment & Provisioning",
        category: "SERVICES",
        unitPrice: 120000,
        quantity: 1,
        discountPercent: 18.0,
        netLineTotal: 98400,
        fulfillmentStatus: "FULFILLED",
        invoiceNumber: "INV-COMM-2026-042",
        invoiceStatus: "PAID",
      },
    ],
    recurringLines: [
      {
        id: "rec-1",
        sku: "SUB-PLATFORM-ENT",
        name: "DealOrbit Cloud Platform Enterprise License",
        category: "SOFTWARE",
        contractNumber: "SUB-2026-0198",
        billingFrequency: "MONTHLY",
        unitRate: 25000,
        quantity: 12,
        recurringAmount: 300000,
        currentPeriodStart: "2026-09-01",
        currentPeriodEnd: "2026-09-30",
        nextBillingDate: "2026-10-01",
        status: "ACTIVE",
      },
      {
        id: "rec-2",
        sku: "SUB-SLA-24X7",
        name: "24/7 Dedicated Cloud Infrastructure Support Tier",
        category: "SERVICES",
        contractNumber: "SUB-2026-0199",
        billingFrequency: "MONTHLY",
        unitRate: 15000,
        quantity: 1,
        recurringAmount: 15000,
        currentPeriodStart: "2026-09-01",
        currentPeriodEnd: "2026-09-30",
        nextBillingDate: "2026-10-01",
        status: "ACTIVE",
      },
    ],
    billingSchedules: [
      {
        id: "sch-1",
        scheduledDate: "2026-10-01",
        billingPeriod: "Oct 01 – Oct 31, 2026",
        contractNumber: "SUB-2026-0198",
        lineName: "Cloud Platform Enterprise License (12 Seats)",
        frequency: "MONTHLY",
        seats: 12,
        projectedAmount: 300000,
        status: "SCHEDULED",
        invoiceNumber: "INV-REC-2026-101",
      },
      {
        id: "sch-2",
        scheduledDate: "2026-10-01",
        billingPeriod: "Oct 01 – Oct 31, 2026",
        contractNumber: "SUB-2026-0199",
        lineName: "24/7 Dedicated Infrastructure Support Tier",
        frequency: "MONTHLY",
        seats: 1,
        projectedAmount: 15000,
        status: "SCHEDULED",
        invoiceNumber: "INV-REC-2026-102",
      },
      {
        id: "sch-3",
        scheduledDate: "2026-11-01",
        billingPeriod: "Nov 01 – Nov 30, 2026",
        contractNumber: "SUB-2026-0198",
        lineName: "Cloud Platform Enterprise License (12 Seats)",
        frequency: "MONTHLY",
        seats: 12,
        projectedAmount: 300000,
        status: "SCHEDULED",
      },
      {
        id: "sch-4",
        scheduledDate: "2026-12-01",
        billingPeriod: "Dec 01 – Dec 31, 2026",
        contractNumber: "SUB-2026-0198",
        lineName: "Cloud Platform Enterprise License (12 Seats)",
        frequency: "MONTHLY",
        seats: 12,
        projectedAmount: 300000,
        status: "SCHEDULED",
      },
    ],
  },
  {
    id: "ord-stark-02",
    orderNumber: "SO-2026-0892",
    quoteNumber: "QT-2026-0044",
    customerName: "Stark Industries (Defense)",
    customerTier: "ENTERPRISE",
    contractStartDate: "2026-08-15",
    paymentTerms: "Net 45",
    oneTimeLines: [
      {
        id: "ot-3",
        sku: "HW-DOCK-4K",
        name: "UltraHD 4K Thunderbolt Docking Station 120W",
        category: "HARDWARE",
        unitPrice: 18500,
        quantity: 20,
        discountPercent: 10.0,
        netLineTotal: 333000,
        fulfillmentStatus: "FULFILLED",
        invoiceNumber: "INV-COMM-2026-039",
        invoiceStatus: "PAID",
      },
    ],
    recurringLines: [
      {
        id: "rec-3",
        sku: "SUB-AI-DEFENSE",
        name: "Autonomous Defense Telemetry & Threat Engine",
        category: "SOFTWARE",
        contractNumber: "SUB-2026-0210",
        billingFrequency: "MONTHLY",
        unitRate: 45000,
        quantity: 10,
        recurringAmount: 450000,
        currentPeriodStart: "2026-09-01",
        currentPeriodEnd: "2026-09-30",
        nextBillingDate: "2026-10-01",
        status: "ACTIVE",
      },
      {
        id: "rec-4",
        sku: "SUB-STANDBY-SLA",
        name: "Hardware Hot-Standby Replacement SLA",
        category: "SERVICES",
        contractNumber: "SUB-2026-0211",
        billingFrequency: "QUARTERLY",
        unitRate: 35000,
        quantity: 1,
        recurringAmount: 105000,
        currentPeriodStart: "2026-07-01",
        currentPeriodEnd: "2026-09-30",
        nextBillingDate: "2026-10-01",
        status: "ACTIVE",
      },
    ],
    billingSchedules: [
      {
        id: "sch-5",
        scheduledDate: "2026-10-01",
        billingPeriod: "Oct 01 – Oct 31, 2026",
        contractNumber: "SUB-2026-0210",
        lineName: "Autonomous Defense Telemetry (10 Seats)",
        frequency: "MONTHLY",
        seats: 10,
        projectedAmount: 450000,
        status: "SCHEDULED",
      },
      {
        id: "sch-6",
        scheduledDate: "2026-10-01",
        billingPeriod: "Q4 (Oct 01 – Dec 31, 2026)",
        contractNumber: "SUB-2026-0211",
        lineName: "Hardware Hot-Standby Replacement SLA",
        frequency: "QUARTERLY",
        seats: 1,
        projectedAmount: 105000,
        status: "SCHEDULED",
      },
    ],
  },
  {
    id: "ord-cyber-03",
    orderNumber: "SO-2026-0893",
    quoteNumber: "QT-2026-0045",
    customerName: "Cyberdyne Systems (Robotics)",
    customerTier: "SILVER",
    contractStartDate: "2026-09-01",
    paymentTerms: "Net 15",
    oneTimeLines: [
      {
        id: "ot-4",
        sku: "HW-SRV-R750",
        name: "Performance Server Node R750 (2U Rackmount)",
        category: "HARDWARE",
        unitPrice: 240000,
        quantity: 2,
        discountPercent: 8.0,
        netLineTotal: 441600,
        fulfillmentStatus: "PROCESSING",
        invoiceNumber: "INV-COMM-2026-048",
        invoiceStatus: "SENT",
      },
    ],
    recurringLines: [
      {
        id: "rec-5",
        sku: "SUB-NEURAL-SAAS",
        name: "Neural Model Pipeline Cloud SaaS",
        category: "SOFTWARE",
        contractNumber: "SUB-2026-0230",
        billingFrequency: "MONTHLY",
        unitRate: 60000,
        quantity: 5,
        recurringAmount: 300000,
        currentPeriodStart: "2026-09-01",
        currentPeriodEnd: "2026-09-30",
        nextBillingDate: "2026-10-01",
        status: "ACTIVE",
      },
    ],
    billingSchedules: [
      {
        id: "sch-7",
        scheduledDate: "2026-10-01",
        billingPeriod: "Oct 01 – Oct 31, 2026",
        contractNumber: "SUB-2026-0230",
        lineName: "Neural Model Pipeline Cloud SaaS (5 Seats)",
        frequency: "MONTHLY",
        seats: 5,
        projectedAmount: 300000,
        status: "SCHEDULED",
      },
    ],
  },
];

const INITIAL_CREDIT_NOTES: ICreditNoteItem[] = [
  {
    id: "cn-1",
    creditNoteNumber: "CN-CANCEL-SUB-2026-0182-9021",
    subscriptionId: "sub-legacy-01",
    salesOrderNumber: "SO-2026-0880",
    customerName: "Global Logistics Network",
    amount: 78500,
    reason: "Subscription cancellation refund (Pro-rata unconsumed 14 days)",
    issuedAt: "2026-08-28",
    status: "APPLIED_TO_BALANCE",
    unconsumedDays: 14,
    totalDaysInPeriod: 30,
  },
  {
    id: "cn-2",
    creditNoteNumber: "CN-MOD-SUB-2026-0175-4412",
    subscriptionId: "sub-legacy-02",
    salesOrderNumber: "SO-2026-0875",
    customerName: "Nexus BioTech Corp",
    amount: 32000,
    reason: "Mid-cycle seat reduction downgrade proration credit",
    issuedAt: "2026-08-20",
    status: "APPLIED_TO_BALANCE",
    unconsumedDays: 16,
    totalDaysInPeriod: 30,
  },
];

export default function SubscriptionBillingScreen() {
  const { currentRole, setRole } = useRole();

  // Orders State
  const [orders, setOrders] = useState<IHybridOrder[]>(SEED_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("ord-acme-01");
  const [activeTab, setActiveTab] = useState<
    "SPLIT_VIEW" | "SCHEDULE_VIEW" | "PRORATION_SIM" | "LEDGER_VIEW"
  >("SPLIT_VIEW");

  // Credit Notes Ledger State
  const [creditNotes, setCreditNotes] = useState<ICreditNoteItem[]>(INITIAL_CREDIT_NOTES);
  const [selectedCreditNote, setSelectedCreditNote] = useState<ICreditNoteItem | null>(null);

  // Active Order Memo
  const currentOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  // Totals for Active Order
  const oneTimeSubtotal = useMemo(
    () => currentOrder.oneTimeLines.reduce((acc, line) => acc + line.netLineTotal, 0),
    [currentOrder]
  );

  const activeRecurringSubtotalMRR = useMemo(
    () =>
      currentOrder.recurringLines
        .filter((l) => l.status !== "CANCELLED")
        .reduce((acc, line) => acc + line.recurringAmount, 0),
    [currentOrder]
  );

  const totalContractAnnualValue = useMemo(
    () => oneTimeSubtotal + activeRecurringSubtotalMRR * 12,
    [oneTimeSubtotal, activeRecurringSubtotalMRR]
  );

  // ==========================================
  // MID-CYCLE PRORATION SIMULATOR STATE
  // ==========================================
  const firstRecurring = currentOrder.recurringLines[0] || {
    id: "sample",
    unitRate: 25000,
    quantity: 12,
    name: "Cloud Platform License",
  };

  const [simLineId, setSimLineId] = useState<string>(firstRecurring.id);
  const [simNewSeats, setSimNewSeats] = useState<number>(firstRecurring.quantity + 4);
  const [simCycleDay, setSimCycleDay] = useState<number>(15); // e.g. Day 15 of 30 days
  const simTotalDays = 30;

  const simSelectedLine = useMemo(
    () =>
      currentOrder.recurringLines.find((l) => l.id === simLineId) ||
      currentOrder.recurringLines[0],
    [currentOrder, simLineId]
  );

  // Proration Math:
  // Days Remaining = D - d
  // Prorated Delta = ((D - d) / D) * (Rate_New - Rate_Old)
  const simUnconsumedDays = Math.max(0, simTotalDays - simCycleDay);
  const simFraction = simUnconsumedDays / simTotalDays;
  const simPreviousRate = (simSelectedLine?.unitRate || 0) * (simSelectedLine?.quantity || 1);
  const simNewRate = (simSelectedLine?.unitRate || 0) * simNewSeats;
  const simRateDelta = simNewRate - simPreviousRate;
  const simProratedAmount = Math.round(simFraction * Math.abs(simRateDelta));
  const simIsCredit = simRateDelta < 0;

  // ==========================================
  // MODALS STATE: MODIFY & CANCEL
  // ==========================================
  const [modifyingLine, setModifyingLine] = useState<IRecurringLineItem | null>(null);
  const [modifySeatsInput, setModifySeatsInput] = useState<number>(12);
  const [modifyEffectiveDay, setModifyEffectiveDay] = useState<number>(15);

  const [cancellingLine, setCancellingLine] = useState<IRecurringLineItem | null>(null);
  const [cancelReason, setCancelReason] = useState<string>(
    "Customer Request — System Consolidation"
  );
  const [cancelEffectiveDay, setCancelEffectiveDay] = useState<number>(15);

  // Open Modify Modal
  const openModifyModal = (line: IRecurringLineItem) => {
    setModifyingLine(line);
    setModifySeatsInput(line.quantity);
    setModifyEffectiveDay(15);
  };

  // Open Cancel Modal
  const openCancelModal = (line: IRecurringLineItem) => {
    setCancellingLine(line);
    setCancelReason("Customer Request — System Consolidation");
    setCancelEffectiveDay(15);
  };

  // Confirm Modify Subscription Execution
  const handleConfirmModify = () => {
    if (!modifyingLine) return;

    const oldRate = modifyingLine.unitRate * modifyingLine.quantity;
    const newRate = modifyingLine.unitRate * modifySeatsInput;
    const rateDelta = newRate - oldRate;
    const unconsumedDays = 30 - modifyEffectiveDay;
    const fraction = unconsumedDays / 30;
    const proratedAmount = Math.round(fraction * Math.abs(rateDelta));
    const isDowngrade = rateDelta < 0;

    // 1. Update line in order state
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id !== currentOrder.id) return ord;
        return {
          ...ord,
          recurringLines: ord.recurringLines.map((l) =>
            l.id === modifyingLine.id
              ? {
                  ...l,
                  quantity: modifySeatsInput,
                  recurringAmount: newRate,
                  status: "MODIFIED",
                }
              : l
          ),
          billingSchedules: ord.billingSchedules.map((sch) =>
            sch.contractNumber === modifyingLine.contractNumber && sch.status === "SCHEDULED"
              ? {
                  ...sch,
                  seats: modifySeatsInput,
                  projectedAmount: newRate,
                  lineName: `${modifyingLine.name} (${modifySeatsInput} Seats)`,
                }
              : sch
          ),
        };
      })
    );

    // 2. Trigger Credit Note (if downgrade) or Invoice (if upgrade)
    if (isDowngrade && proratedAmount > 0) {
      const timestamp = Date.now().toString().slice(-4);
      const newCn: ICreditNoteItem = {
        id: `cn-${Date.now()}`,
        creditNoteNumber: `CN-MOD-${modifyingLine.contractNumber}-${timestamp}`,
        subscriptionId: modifyingLine.id,
        salesOrderNumber: currentOrder.orderNumber,
        customerName: currentOrder.customerName,
        amount: proratedAmount,
        reason: `Mid-cycle seat reduction downgrade (from ${modifyingLine.quantity} to ${modifySeatsInput} seats on Day ${modifyEffectiveDay})`,
        issuedAt: new Date().toISOString().split("T")[0],
        status: "APPLIED_TO_BALANCE",
        unconsumedDays,
        totalDaysInPeriod: 30,
      };
      setCreditNotes((prev) => [newCn, ...prev]);

      toast.success("Subscription Modified — Credit Note Issued!", {
        description: `Downgrade pro-rata credit note ${newCn.creditNoteNumber} for ₹${proratedAmount.toLocaleString("en-IN")} credited to customer account.`,
      });
    } else {
      toast.success("Subscription Modified — Proration Invoice Generated!", {
        description: `Seat upgrade proration invoice #INV-PRORATE-${Date.now().toString().slice(-4)} for ₹${proratedAmount.toLocaleString("en-IN")} issued for ${unconsumedDays} remaining days.`,
      });
    }

    setModifyingLine(null);
  };

  // Confirm Cancel Subscription Execution
  const handleConfirmCancel = () => {
    if (!cancellingLine) return;

    const unconsumedDays = 30 - cancelEffectiveDay;
    const fraction = unconsumedDays / 30;
    const paidRate = cancellingLine.recurringAmount;
    const creditAmount = Math.round(fraction * paidRate);

    // 1. Generate official Credit Note
    const timestamp = Date.now().toString().slice(-4);
    const newCn: ICreditNoteItem = {
      id: `cn-${Date.now()}`,
      creditNoteNumber: `CN-CANCEL-${cancellingLine.contractNumber}-${timestamp}`,
      subscriptionId: cancellingLine.id,
      salesOrderNumber: currentOrder.orderNumber,
      customerName: currentOrder.customerName,
      amount: creditAmount,
      reason: `${cancelReason} (Unconsumed ${unconsumedDays}/30 days balance)`,
      issuedAt: new Date().toISOString().split("T")[0],
      status: "APPLIED_TO_BALANCE",
      unconsumedDays,
      totalDaysInPeriod: 30,
    };
    setCreditNotes((prev) => [newCn, ...prev]);

    // 2. Update order state: mark line as CANCELLED, remove future schedules
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id !== currentOrder.id) return ord;
        return {
          ...ord,
          recurringLines: ord.recurringLines.map((l) =>
            l.id === cancellingLine.id
              ? {
                  ...l,
                  status: "CANCELLED",
                  cancellationDate: new Date().toISOString().split("T")[0],
                  cancellationReason: cancelReason,
                }
              : l
          ),
          billingSchedules: ord.billingSchedules.filter(
            (sch) => sch.contractNumber !== cancellingLine.contractNumber
          ),
        };
      })
    );

    toast.success("Subscription Cancelled & Credit Note Issued!", {
      description: `Official Credit Note ${newCn.creditNoteNumber} for ₹${creditAmount.toLocaleString("en-IN")} created. Future billing schedules purged.`,
    });

    setCancellingLine(null);
  };

  // Immediate Schedule Processing trigger
  const handleProcessSchedule = (schId: string) => {
    setOrders((prev) =>
      prev.map((ord) => ({
        ...ord,
        billingSchedules: ord.billingSchedules.map((sch) => {
          if (sch.id === schId) {
            const invoiceNum = `INV-REC-2026-${Math.floor(100 + Math.random() * 900)}`;
            toast.success(`Recurring Invoice ${invoiceNum} Generated`, {
              description: `Automated debit advice of ₹${sch.projectedAmount.toLocaleString("en-IN")} dispatched for ${sch.lineName}.`,
            });
            return {
              ...sch,
              status: "PROCESSED",
              invoiceNumber: invoiceNum,
            };
          }
          return sch;
        }),
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Role Persona Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-role-finance text-xs py-0.5 px-2.5 flex items-center gap-1 font-semibold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Finance & Operations Workspace</span>
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              &bull; Hybrid Revenue Architecture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)] font-heading">
            Subscription & Billing Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-body)] mt-0.5">
            Unified billing engine separating one-time capital lines from recurring SaaS subscriptions with automated day-count proration and credit note generation.
          </p>
        </div>

        {/* Order Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--card)] p-1.5 rounded-xl border border-[var(--border)] shadow-2xs">
            <Building2 className="w-4 h-4 text-[var(--text-muted)] ml-1.5" />
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="text-xs font-semibold text-[var(--text-main)] bg-transparent border-none focus:outline-none cursor-pointer pr-2"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} &mdash; {o.customerName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* One-Time Capital Revenue */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>One-Time Capital Lines</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] font-mono">
            ₹{oneTimeSubtotal.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Hardware & Setup Invoiced</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue (MRR) */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Monthly Recurring (MRR)</span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            ₹{activeRecurringSubtotalMRR.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-medium">
            ARR: ₹{(activeRecurringSubtotalMRR * 12).toLocaleString("en-IN")} / yr
          </div>
        </div>

        {/* Active Subscriptions Count */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Active Contracts</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] font-mono">
            {currentOrder.recurringLines.filter((l) => l.status === "ACTIVE" || l.status === "MODIFIED").length}{" "}
            <span className="text-xs text-[var(--text-muted)] font-normal">
              / {currentOrder.recurringLines.length} Lines
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            Next Charge: {currentOrder.recurringLines[0]?.nextBillingDate || "N/A"}
          </div>
        </div>

        {/* Credit Notes Ledger Balance */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Issued Credit Notes</span>
            <RotateCcw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            ₹
            {creditNotes
              .reduce((acc, c) => acc + c.amount, 0)
              .toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            {creditNotes.length} auto-generated adjustments
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center border-b border-[var(--border)] gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("SPLIT_VIEW")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "SPLIT_VIEW"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>One-Time & Recurring Line Breakdown</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SCHEDULE_VIEW")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "SCHEDULE_VIEW"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming Billing Schedule</span>
          <span className="h-4 min-w-4 px-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold flex items-center justify-center">
            {currentOrder.billingSchedules.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PRORATION_SIM")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "PRORATION_SIM"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-indigo-500" />
          <span>Mid-Cycle Proration Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LEDGER_VIEW")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "LEDGER_VIEW"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Credit Notes & Invoices Ledger</span>
          <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center">
            {creditNotes.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ONE-TIME & RECURRING LINE SEPARATION BREAKDOWN                     */}
      {/* ========================================================================= */}
      {activeTab === "SPLIT_VIEW" && (
        <div className="space-y-6">
          {/* Info callout for dual-stream architecture */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Dual-Stream Separation Active:</span> Order{" "}
              <strong className="font-mono text-[var(--text-main)]">
                {currentOrder.orderNumber}
              </strong>{" "}
              contains both capital hardware and recurring cloud software. DealOrbit cleanly bifurcates fulfillment and recurring invoicing pipelines to eliminate manual billing reconciliation errors.
            </div>
          </div>

          {/* SECTION A: One-Time Product & Deployment Lines */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--card-hover)]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)] font-heading">
                    One-Time Product & Deployment Lines
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Capital expenditures, hardware assets, and one-off professional setup services
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[var(--text-muted)] font-medium">One-Time Subtotal: </span>
                <span className="font-mono font-bold text-sm text-[var(--text-main)]">
                  ₹{oneTimeSubtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Table of One-time lines */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--card-hover)]/40 text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">Discount</th>
                    <th className="py-3 px-4 text-right">Net Line Total</th>
                    <th className="py-3 px-3 text-center">Fulfillment</th>
                    <th className="py-3 px-4 text-right">Invoice Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {currentOrder.oneTimeLines.map((line) => (
                    <tr
                      key={line.id}
                      className="hover:bg-[var(--card-hover)]/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-main)]">
                          {line.name}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                          {line.sku}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="badge badge-neutral text-[10px]">
                          {line.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        ₹{line.unitPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-center font-bold font-mono">
                        {line.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-600 font-mono">
                        {line.discountPercent > 0 ? `${line.discountPercent}%` : "0%"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--text-main)]">
                        ₹{line.netLineTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`badge text-[10px] py-0.5 px-2 ${
                            line.fulfillmentStatus === "FULFILLED"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {line.fulfillmentStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono text-[11px] font-semibold text-indigo-600">
                          {line.invoiceNumber}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          &bull; {line.invoiceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[var(--card-hover)]/20 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] px-4">
              <span>{currentOrder.oneTimeLines.length} Capital Line Items</span>
              <span>
                Payment Terms: <strong className="text-[var(--text-main)]">{currentOrder.paymentTerms}</strong>
              </span>
            </div>
          </div>

          {/* SECTION B: Recurring Subscription & SaaS Lines */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--card-hover)]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)] font-heading">
                    Recurring Subscription & Support Lines
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Recurring SaaS seats, cloud services, and annual managed SLA support contracts
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[var(--text-muted)] font-medium">Total Monthly MRR: </span>
                <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  ₹{activeRecurringSubtotalMRR.toLocaleString("en-IN")} / mo
                </span>
              </div>
            </div>

            {/* Table of Recurring lines */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--card-hover)]/40 text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Subscription Plan & SKU</th>
                    <th className="py-3 px-3">Contract Ref</th>
                    <th className="py-3 px-3">Cadence</th>
                    <th className="py-3 px-3 text-right">Unit Rate</th>
                    <th className="py-3 px-3 text-center">Seats / Qty</th>
                    <th className="py-3 px-4 text-right">Recurring Amount</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Contract Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {currentOrder.recurringLines.map((line) => (
                    <tr
                      key={line.id}
                      className={`hover:bg-[var(--card-hover)]/40 transition-colors ${
                        line.status === "CANCELLED" ? "opacity-60 bg-slate-500/5" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--text-main)]">
                          {line.name}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                          <span>{line.sku}</span>
                          <span>&bull;</span>
                          <span>Next: {line.nextBillingDate}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs font-bold text-[var(--text-main)]">
                          {line.contractNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="badge badge-primary text-[10px] py-0.5 px-2">
                          {line.billingFrequency}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono">
                        ₹{line.unitRate.toLocaleString("en-IN")}/mo
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold font-mono text-sm text-[var(--text-main)]">
                        {line.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                        ₹{line.recurringAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`badge text-[10px] py-0.5 px-2 ${
                            line.status === "ACTIVE"
                              ? "badge-success"
                              : line.status === "MODIFIED"
                              ? "badge-warning"
                              : "badge-destructive"
                          }`}
                        >
                          {line.status}
                        </span>
                        {line.cancellationDate && (
                          <div className="text-[9px] text-rose-500 font-mono mt-0.5">
                            Purged {line.cancellationDate}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {line.status !== "CANCELLED" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openModifyModal(line)}
                              className="btn-ghost text-xs py-1.5 px-2.5 rounded-lg border border-[var(--border)] flex items-center gap-1 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                              title="Modify seats or rate with day-count proration"
                            >
                              <Pencil className="w-3 h-3 text-[var(--primary)]" />
                              <span>Modify</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openCancelModal(line)}
                              className="btn-ghost text-xs py-1.5 px-2.5 rounded-lg border border-[var(--border)] flex items-center gap-1 hover:border-rose-500 hover:text-rose-600"
                              title="Cancel subscription and issue automatic credit note"
                            >
                              <Ban className="w-3 h-3 text-rose-500" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)] italic">
                            Cancelled &amp; Credited
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[var(--card-hover)]/20 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] px-4">
              <span>{currentOrder.recurringLines.length} Recurring Subscription Contracts</span>
              <span>
                Annualized Contract Run-Rate:{" "}
                <strong className="text-[var(--text-main)] font-mono">
                  ₹{(activeRecurringSubtotalMRR * 12).toLocaleString("en-IN")}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UPCOMING BILLING SCHEDULE                                          */}
      {/* ========================================================================= */}
      {activeTab === "SCHEDULE_VIEW" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs overflow-hidden space-y-0">
          <div className="p-4 sm:p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card-hover)]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)] font-heading">
                  Automated Upcoming Billing Schedule
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Scheduled charge calendar for active contracts with automated debit generation
                </p>
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] flex items-center gap-3">
              <span>Next Scheduled Run: <strong className="text-[var(--text-main)]">2026-10-01</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--card-hover)]/40 text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-3">Billing Cycle Period</th>
                  <th className="py-3 px-4">Contract Line Item</th>
                  <th className="py-3 px-3">Frequency</th>
                  <th className="py-3 px-3 text-center">Billed Seats</th>
                  <th className="py-3 px-4 text-right">Projected Amount</th>
                  <th className="py-3 px-3 text-center">Execution Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {currentOrder.billingSchedules.map((sch) => (
                  <tr
                    key={sch.id}
                    className="hover:bg-[var(--card-hover)]/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--text-main)] flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{sch.scheduledDate}</span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[var(--text-body)]">
                      {sch.billingPeriod}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[var(--text-main)]">
                        {sch.lineName}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        {sch.contractNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="badge badge-neutral text-[10px]">
                        {sch.frequency}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono">
                      {sch.seats}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[var(--text-main)]">
                      ₹{sch.projectedAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`badge text-[10px] py-0.5 px-2 ${
                          sch.status === "PROCESSED"
                            ? "badge-success"
                            : "badge-primary"
                        }`}
                      >
                        {sch.status}
                      </span>
                      {sch.invoiceNumber && (
                        <div className="text-[10px] font-mono text-indigo-600 mt-0.5">
                          {sch.invoiceNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {sch.status === "SCHEDULED" ? (
                        <button
                          type="button"
                          onClick={() => handleProcessSchedule(sch.id)}
                          className="btn-primary text-xs py-1 px-3 shadow-2xs cursor-pointer"
                        >
                          Generate Invoice
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dispatched</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[var(--card-hover)]/20 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center justify-between">
            <span>Automated recurrence runs on the 1st of every month at 00:00 UTC</span>
            <span className="font-semibold text-[var(--text-main)]">
              Scheduled Cycle Total: ₹
              {currentOrder.billingSchedules
                .reduce((acc, s) => acc + s.projectedAmount, 0)
                .toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MID-CYCLE PRORATION CALCULATOR SIMULATOR                            */}
      {/* ========================================================================= */}
      {activeTab === "PRORATION_SIM" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Controls (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)] font-heading">
                  Interactive Mid-Cycle Proration Simulator
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Simulate seat alterations or tier modifications to preview exact day-count proration invoices or credit notes
                </p>
              </div>
            </div>

            {/* Select Target Contract */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-main)] block">
                Target Recurring Contract Line
              </label>
              <select
                value={simLineId}
                onChange={(e) => {
                  setSimLineId(e.target.value);
                  const l = currentOrder.recurringLines.find((x) => x.id === e.target.value);
                  if (l) setSimNewSeats(l.quantity + 4);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                {currentOrder.recurringLines
                  .filter((l) => l.status !== "CANCELLED")
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} &mdash; {l.contractNumber} ({l.quantity} Current Seats @ ₹{l.unitRate.toLocaleString("en-IN")}/mo)
                    </option>
                  ))}
              </select>
            </div>

            {/* Seat Adjustment Slider & Input */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--card-hover)]/50 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-main)]">
                  Adjust Proposed Seat Count:
                </span>
                <span className="font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                  {simNewSeats} Seats{" "}
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    ({simNewSeats > (simSelectedLine?.quantity || 0) ? `+${simNewSeats - (simSelectedLine?.quantity || 0)} Upgrade` : `${simNewSeats - (simSelectedLine?.quantity || 0)} Downgrade`})
                  </span>
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={50}
                value={simNewSeats}
                onChange={(e) => setSimNewSeats(parseInt(e.target.value, 10) || 1)}
                className="w-full accent-[var(--primary)] cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>1 Seat (Min)</span>
                <span>Current: {simSelectedLine?.quantity || 0} Seats</span>
                <span>50 Seats (Max)</span>
              </div>
            </div>

            {/* Cycle Day Slider: Day d of 30 days */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--card-hover)]/50 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-main)]">
                  Effective Mutation Day in Billing Cycle:
                </span>
                <span className="font-mono font-bold text-base text-[var(--text-main)]">
                  Day {simCycleDay} of 30 Days
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={29}
                value={simCycleDay}
                onChange={(e) => setSimCycleDay(parseInt(e.target.value, 10) || 1)}
                className="w-full accent-[var(--primary)] cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Day 1 (Cycle Start)</span>
                <span className="font-semibold text-indigo-600 font-mono">
                  {simUnconsumedDays} Days Remaining
                </span>
                <span>Day 29 (Cycle End)</span>
              </div>
            </div>

            {/* Apply Directly Button */}
            {simSelectedLine && (
              <button
                type="button"
                onClick={() => {
                  setModifyingLine(simSelectedLine);
                  setModifySeatsInput(simNewSeats);
                  setModifyEffectiveDay(simCycleDay);
                }}
                className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Commit Modification to Subscription</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right: Proration Mathematics & Resulting Trigger (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/40 via-[var(--card)] to-[var(--card)] p-6 shadow-md space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block mb-1">
                Enterprise Proration Engine
              </span>
              <h4 className="font-bold text-lg text-[var(--text-main)] font-heading">
                Mathematical Breakdown
              </h4>
            </div>

            {/* Mathematical Formula Preview */}
            <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs space-y-2">
              <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
                Official Formula:
              </div>
              <div className="font-mono text-xs bg-[var(--background)] p-2 rounded-lg text-indigo-700 dark:text-indigo-300 font-bold">
                Proration = ((D - d) / D) &times; (Rate_New - Rate_Old)
              </div>
              <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Where <strong className="text-[var(--text-main)]">D = 30</strong> total billing days,{" "}
                <strong className="text-[var(--text-main)]">d = {simCycleDay}</strong> elapsed days, and unconsumed fraction ={" "}
                <strong className="text-[var(--text-main)] font-mono">{simUnconsumedDays}/30 ({Math.round(simFraction * 100)}%)</strong>.
              </div>
            </div>

            {/* Rate Differences */}
            <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Previous Monthly Charge:</span>
                <span className="font-mono font-bold text-[var(--text-main)]">
                  ₹{simPreviousRate.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">New Proposed Monthly Charge:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{simNewRate.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-muted)]">Monthly Delta:</span>
                <span
                  className={`font-mono font-bold ${
                    simRateDelta >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {simRateDelta >= 0 ? "+" : ""}₹{simRateDelta.toLocaleString("en-IN")} / mo
                </span>
              </div>
            </div>

            {/* Resulting Outcome Trigger */}
            <div
              className={`p-4 rounded-xl border ${
                simIsCredit
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-300"
                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-300"
              } space-y-1.5`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {simIsCredit ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    <span>Automatic Credit Note Trigger</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 text-indigo-600" />
                    <span>Immediate Proration Adjustment Invoice</span>
                  </>
                )}
              </div>

              <div className="text-2xl font-black font-mono">
                ₹{simProratedAmount.toLocaleString("en-IN")}
              </div>

              <p className="text-[11px] opacity-90 leading-snug">
                {simIsCredit
                  ? `Because seats are decreasing mid-cycle, an official Credit Note for ₹${simProratedAmount.toLocaleString("en-IN")} will be automatically applied to the customer ledger.`
                  : `An immediate proration invoice for ₹${simProratedAmount.toLocaleString("en-IN")} will be issued to cover the additional ${simNewSeats - (simSelectedLine?.quantity || 0)} seats for the remaining ${simUnconsumedDays} days.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CREDIT NOTES & INVOICES LEDGER                                     */}
      {/* ========================================================================= */}
      {activeTab === "LEDGER_VIEW" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs overflow-hidden space-y-0">
          <div className="p-4 sm:p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card-hover)]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)] font-heading">
                  Official Credit Notes &amp; Adjustment Ledger
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Audit trail of auto-generated credit notes from mid-cycle contract modifications and cancellations
                </p>
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] font-medium">
              Total Credited:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{creditNotes.reduce((a, b) => a + b.amount, 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--card-hover)]/40 text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Credit Note #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-4">Audit Reason</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-4 text-right">Credit Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {creditNotes.map((cn) => (
                  <tr
                    key={cn.id}
                    className="hover:bg-[var(--card-hover)]/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedCreditNote(cn)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {cn.creditNoteNumber}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[var(--text-main)]">
                      {cn.customerName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[var(--text-muted)]">
                      {cn.salesOrderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-body)] max-w-xs truncate">
                      {cn.reason}
                    </td>
                    <td className="py-3.5 px-3 text-[var(--text-muted)] font-mono">
                      {cn.issuedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{cn.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="badge badge-success text-[10px] py-0.5 px-2">
                        {cn.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCreditNote(cn);
                        }}
                        className="btn-ghost text-xs py-1 px-2.5 border border-[var(--border)] flex items-center gap-1 hover:border-[var(--primary)] ml-auto"
                      >
                        <FileText className="w-3 h-3 text-[var(--primary)]" />
                        <span>View Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: MODIFY SUBSCRIPTION MODAL                                        */}
      {/* ========================================================================= */}
      {modifyingLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[var(--border)] bg-[var(--card-hover)]/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)] font-heading">
                    Modify Subscription Seats &amp; Prorate
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {modifyingLine.contractNumber} &bull; {modifyingLine.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModifyingLine(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-[var(--text-body)]">
              {/* Current Status */}
              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                    Current Active Seats
                  </span>
                  <div className="font-bold text-sm text-[var(--text-main)] font-mono">
                    {modifyingLine.quantity} Seats
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                    Current Monthly Charge
                  </span>
                  <div className="font-bold text-sm text-indigo-600 font-mono">
                    ₹{modifyingLine.recurringAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Adjust Seats */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-main)]">
                  New Desired Seat Count
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={modifySeatsInput}
                    onChange={(e) => setModifySeatsInput(parseInt(e.target.value, 10) || 1)}
                    className="w-24 p-2 font-mono font-bold text-sm border border-[var(--border)] rounded-xl bg-[var(--background)] text-center text-[var(--text-main)]"
                  />
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Seats @ ₹{modifyingLine.unitRate.toLocaleString("en-IN")}/mo each
                  </span>
                </div>
              </div>

              {/* Effective Day Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Effective Day in Current 30-Day Period:</span>
                  <span className="font-mono text-indigo-600 font-bold">
                    Day {modifyEffectiveDay} ({30 - modifyEffectiveDay} days unconsumed)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={29}
                  value={modifyEffectiveDay}
                  onChange={(e) => setModifyEffectiveDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
              </div>

              {/* Live Proration Result Summary */}
              {(() => {
                const oldRate = modifyingLine.unitRate * modifyingLine.quantity;
                const newRate = modifyingLine.unitRate * modifySeatsInput;
                const rateDelta = newRate - oldRate;
                const unconsumedDays = 30 - modifyEffectiveDay;
                const fraction = unconsumedDays / 30;
                const proratedAmount = Math.round(fraction * Math.abs(rateDelta));
                const isDowngrade = rateDelta < 0;

                return (
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDowngrade
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-indigo-500/10 border-indigo-500/30"
                    } space-y-1`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      {isDowngrade ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400">
                            Automatic Credit Note: ₹{proratedAmount.toLocaleString("en-IN")}
                          </span>
                        </>
                      ) : (
                        <>
                          <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-indigo-700 dark:text-indigo-400">
                            Immediate Proration Charge: ₹{proratedAmount.toLocaleString("en-IN")}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {isDowngrade
                        ? `Reducing seats by ${modifyingLine.quantity - modifySeatsInput} will immediately issue a credit note for unconsumed ${unconsumedDays} days.`
                        : `Increasing seats by ${modifySeatsInput - modifyingLine.quantity} will generate an immediate proration invoice for the remaining ${unconsumedDays} days.`}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--card-hover)]/30 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModifyingLine(null)}
                className="btn-ghost text-xs py-2 px-4 border border-[var(--border)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModify}
                className="btn-primary text-xs py-2 px-4"
              >
                Save &amp; Generate Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CANCEL SUBSCRIPTION MODAL                                        */}
      {/* ========================================================================= */}
      {cancellingLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[var(--card)] rounded-2xl border border-rose-500/30 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[var(--border)] bg-rose-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 flex items-center justify-center font-bold">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 font-heading">
                    Cancel Subscription Contract
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {cancellingLine.contractNumber} &bull; {cancellingLine.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCancellingLine(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-[var(--text-body)]">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 space-y-1">
                <span className="font-bold">Automated Refund Policy:</span>
                <p className="text-[11px]">
                  Contract termination calculates unconsumed service days based on the exact formula:{" "}
                  <code className="font-mono font-bold">Credit = ((D - d) / D) &times; Paid_Rate</code>. An official Credit Note will be issued automatically.
                </p>
              </div>

              {/* Reason selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-main)]">
                  Cancellation Reason
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-main)]"
                >
                  <option value="Customer Request — System Consolidation">
                    Customer Request — System Consolidation
                  </option>
                  <option value="Customer Request — Project Scope Reduced">
                    Customer Request — Project Scope Reduced
                  </option>
                  <option value="Insolvency or Contract Renegotiation">
                    Insolvency or Contract Renegotiation
                  </option>
                  <option value="Cooling-off Period Early Termination">
                    Cooling-off Period Early Termination (100% Refund)
                  </option>
                </select>
              </div>

              {/* Effective Day Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Termination Date in Cycle:</span>
                  <span className="font-mono text-[var(--text-main)] font-bold">
                    Day {cancelEffectiveDay} of 30
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={29}
                  value={cancelEffectiveDay}
                  onChange={(e) => setCancelEffectiveDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Calculated Credit Note Preview */}
              {(() => {
                const unconsumed = 30 - cancelEffectiveDay;
                const credit = Math.round((unconsumed / 30) * cancellingLine.recurringAmount);

                return (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Pro-Rata Credit Note Trigger
                      </span>
                      <span className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                        ₹{credit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {unconsumed} unconsumed days remaining will be credited to {currentOrder.customerName}&apos;s balance ledger under new Credit Note.
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--card-hover)]/30 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingLine(null)}
                className="btn-ghost text-xs py-2 px-4 border border-[var(--border)]"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors"
              >
                Confirm Cancellation &amp; Issue Credit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Note Inspection Slip Modal */}
      <CreditNotesLedgerModal
        creditNote={selectedCreditNote}
        onClose={() => setSelectedCreditNote(null)}
      />
    </div>
  );
}
