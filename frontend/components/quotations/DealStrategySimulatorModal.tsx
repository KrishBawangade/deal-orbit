"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Truck,
  CheckCircle2,
  X,
  Sliders,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Package,
  Layers,
  HeartHandshake,
  DollarSign,
  Info,
} from "lucide-react";
import { QuotationLineItem } from "@/context/QuotationsContext";
import { ICustomerAccount } from "@/config/catalogData";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

export interface SimulationApplyPayload {
  scenarioId: string;
  hardwareDiscount: number;
  serviceDiscount: number;
  bundleSku?: string;
  paymentTerms?: string;
  notes?: string;
}

interface DealStrategySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  customer: ICustomerAccount;
  cartLines: QuotationLineItem[];
  currentBlendedMargin: number;
  currentRiskScore: number;
  grandTotal: number;
  onApplyScenario: (payload: SimulationApplyPayload) => void;
}

type ScenarioTab = "SCENARIO_A" | "SCENARIO_B" | "SCENARIO_C" | "CUSTOM";

export default function DealStrategySimulatorModal({
  isOpen,
  onClose,
  quoteId,
  customer,
  cartLines,
  currentBlendedMargin,
  currentRiskScore,
  grandTotal,
  onApplyScenario,
}: DealStrategySimulatorModalProps) {
  // Scenario Selection
  const [activeTab, setActiveTab] = useState<ScenarioTab>("SCENARIO_B");

  // What-If Custom Overrides
  const [customHwDiscount, setCustomHwDiscount] = useState<number>(10);
  const [customSrvDiscount, setCustomSrvDiscount] = useState<number>(8);
  const [includeBundle, setIncludeBundle] = useState<boolean>(true);
  const [customTerms, setCustomTerms] = useState<string>(customer.paymentTerms || "Net 30");

  // Baseline discount corridors based on Customer Tier
  const tierCeilings = customer.tierCeilings || { HARDWARE: 15, SERVICES: 10, SOFTWARE: 20 };
  const baselineCorridorMin = customer.tier === "ENTERPRISE" ? 10 : customer.tier === "GOLD" ? 8 : 5;
  const baselineCorridorMax = customer.tier === "ENTERPRISE" ? 15 : customer.tier === "GOLD" ? 12 : 10;

  // Compute live What-If simulation numbers
  const simulationResults = useMemo(() => {
    // 1. Scenario A: Status Quo / Match Concession
    const scenAHwDisc = Math.min(25, baselineCorridorMax + 3);
    const scenASrvDisc = 15;
    const scenAMargin = Math.max(12, Math.round((currentBlendedMargin - 4.5) * 10) / 10);
    const scenARisk = 58;
    const scenAApproval = "Two-Tier (Sales Manager + Finance)";
    const scenAWinRate = 78;
    const scenACounterRate = 18;
    const scenAWalkAway = 4;

    // 2. Scenario B: AI Recommended (Balanced Optimal + Bundle)
    const scenBHwDisc = baselineCorridorMin + 2; // e.g., 10%
    const scenBSrvDisc = 8;
    const scenBMargin = Math.round((currentBlendedMargin + 3.2) * 10) / 10;
    const scenBRisk = 28;
    const scenBApproval = "Tier-1 (Sales Manager Review)";
    const scenBWinRate = 68;
    const scenBCounterRate = 27;
    const scenBWalkAway = 5;

    // 3. Scenario C: Velocity Fast-Track (Zero Approval)
    const scenCHwDisc = Math.max(3, baselineCorridorMin - 2); // e.g., 6%
    const scenCSrvDisc = 5;
    const scenCMargin = Math.round((currentBlendedMargin + 5.8) * 10) / 10;
    const scenCRisk = 14;
    const scenCApproval = "None (Auto-Approved / Direct Fulfillment)";
    const scenCWinRate = 48;
    const scenCCounterRate = 42;
    const scenCWalkAway = 10;

    // 4. Custom What-If
    const hwImpact = (customHwDiscount - 10) * -0.65;
    const srvImpact = (customSrvDiscount - 8) * -0.35;
    const bundleBoost = includeBundle ? 2.1 : 0;
    const computedCustomMargin = Math.max(
      8,
      Math.min(35, Math.round((currentBlendedMargin + hwImpact + srvImpact + bundleBoost) * 10) / 10)
    );
    const computedCustomRisk = Math.max(
      10,
      Math.min(
        85,
        Math.round(
          20 +
            (customHwDiscount > tierCeilings.HARDWARE ? (customHwDiscount - tierCeilings.HARDWARE) * 6 : 0) +
            (customSrvDiscount > tierCeilings.SERVICES ? (customSrvDiscount - tierCeilings.SERVICES) * 8 : 0) +
            (computedCustomMargin < 15 ? 20 : 0)
        )
      )
    );
    const computedCustomApproval =
      computedCustomRisk > 50 || computedCustomMargin < 15
        ? "Two-Tier (Sales Manager + Finance)"
        : computedCustomRisk > 25
        ? "Tier-1 (Sales Manager Review)"
        : "None (Auto-Approved / Direct Fulfillment)";

    // Customer Behavioral Psychology Probability Model
    const discountSurplus = customHwDiscount - baselineCorridorMin;
    const customWin = Math.max(20, Math.min(92, Math.round(55 + discountSurplus * 3.5 + (includeBundle ? 8 : 0))));
    const customWalkAway = Math.max(3, Math.min(35, Math.round(18 - discountSurplus * 2)));
    const customCounter = Math.max(5, 100 - customWin - customWalkAway);

    return {
      SCENARIO_A: {
        id: "SCENARIO_A",
        name: "Status Quo (Customer Demand Match)",
        tag: "Customer Demand",
        tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        hwDiscount: scenAHwDisc,
        srvDiscount: scenASrvDisc,
        margin: scenAMargin,
        deltaMargin: scenAMargin - currentBlendedMargin,
        riskScore: scenARisk,
        approval: scenAApproval,
        shipments: 2,
        winRate: scenAWinRate,
        counterRate: scenACounterRate,
        walkAwayRate: scenAWalkAway,
        terms: customer.paymentTerms,
        bundleSku: undefined,
        rationale:
          "Accedes directly to aggressive customer pricing demands. Guarantees high instant acceptance, but causes a 4.5% margin hit and requires slow Two-Tier managerial and finance escalation.",
      },
      SCENARIO_B: {
        id: "SCENARIO_B",
        name: "AI Recommended Strategy (Value Bundle)",
        tag: "Recommended ⚡",
        tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        hwDiscount: scenBHwDisc,
        srvDiscount: scenBSrvDisc,
        margin: scenBMargin,
        deltaMargin: scenBMargin - currentBlendedMargin,
        riskScore: scenBRisk,
        approval: scenBApproval,
        shipments: 1,
        winRate: scenBWinRate,
        counterRate: scenBCounterRate,
        walkAwayRate: scenBWalkAway,
        terms: customer.paymentTerms,
        bundleSku: "WAR-ACC-2YR",
        rationale:
          "The commercial sweet spot. Confines hardware concessions within historical corridor, bundles a high-margin 2-Year Care Pack, boosts gross profit by +3.2%, and eliminates Finance approval.",
      },
      SCENARIO_C: {
        id: "SCENARIO_C",
        name: "Velocity Fast-Track (Zero Approval)",
        tag: "Zero Approval",
        tagColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        hwDiscount: scenCHwDisc,
        srvDiscount: scenCSrvDisc,
        margin: scenCMargin,
        deltaMargin: scenCMargin - currentBlendedMargin,
        riskScore: scenCRisk,
        approval: scenCApproval,
        shipments: 1,
        winRate: scenCWinRate,
        counterRate: scenCCounterRate,
        walkAwayRate: scenCWalkAway,
        terms: customer.paymentTerms,
        bundleSku: undefined,
        rationale:
          "Protects maximum margin floor (+5.8% gain) and falls comfortably under all discount ceilings. Enables zero-latency quotation approval and routes straight to fulfillment.",
      },
      CUSTOM: {
        id: "CUSTOM",
        name: "Custom What-If Sandbox",
        tag: "Interactive Sandbox",
        tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        hwDiscount: customHwDiscount,
        srvDiscount: customSrvDiscount,
        margin: computedCustomMargin,
        deltaMargin: computedCustomMargin - currentBlendedMargin,
        riskScore: computedCustomRisk,
        approval: computedCustomApproval,
        shipments: 1,
        winRate: customWin,
        counterRate: customCounter,
        walkAwayRate: customWalkAway,
        terms: customTerms,
        bundleSku: includeBundle ? "WAR-ACC-2YR" : undefined,
        rationale:
          "Real-time evaluation based on your dynamic discount sliders, commercial terms, and bundle selections.",
      },
    };
  }, [
    currentBlendedMargin,
    baselineCorridorMax,
    baselineCorridorMin,
    customer.paymentTerms,
    customHwDiscount,
    customSrvDiscount,
    includeBundle,
    customTerms,
    tierCeilings.HARDWARE,
    tierCeilings.SERVICES,
  ]);

  if (!isOpen) return null;

  const activeScenario = simulationResults[activeTab];

  const handleApplyClick = () => {
    onApplyScenario({
      scenarioId: activeScenario.id,
      hardwareDiscount: activeScenario.hwDiscount,
      serviceDiscount: activeScenario.srvDiscount,
      bundleSku: activeScenario.bundleSku,
      paymentTerms: activeScenario.terms,
      notes: `Applied ${activeScenario.name} from Deal Strategy Simulator`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card-hover)]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">
                  Deal Strategy Simulator
                </h2>
                <span className="badge badge-role-rep text-[10px] font-semibold">
                  Sales Rep Exclusive
                </span>
                <span className="font-mono text-xs text-[var(--primary)] font-bold px-2 py-0.5 rounded bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                  {quoteId} (Draft)
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Simulate internal business consequences vs. empirical customer negotiation psychology before submitting.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT BODY (Scrollable) */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* 1. ACTIVE QUOTATION BASELINE STRIP */}
          <div className="bg-[var(--card-hover)] p-4 rounded-xl border border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">Customer Account</span>
              <span className="font-semibold text-sm text-[var(--text-main)]">{customer.name}</span>
              <span className="badge badge-accent text-[10px] font-bold block mt-0.5 w-fit">
                {customer.tier} TIER
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">Draft Proposal Value</span>
              <span className="font-bold text-sm text-[var(--text-main)] font-heading">
                {formatCurrency(grandTotal)}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                {cartLines.length} Cart Line Items
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">Current Blended Margin</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                {currentBlendedMargin}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                Baseline margin floor
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">Negotiation Corridor</span>
              <span className="font-semibold text-sm text-[var(--text-main)] font-mono">
                {baselineCorridorMin}% – {baselineCorridorMax}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                Customer accepted range
              </span>
            </div>
          </div>

          {/* 2. SCENARIO SWITCHER TABS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-3">
            {(["SCENARIO_B", "SCENARIO_A", "SCENARIO_C", "CUSTOM"] as ScenarioTab[]).map((tabKey) => {
              const scen = simulationResults[tabKey];
              const isSelected = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                      : "bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  <span>{scen.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isSelected ? "bg-white/20 text-white" : scen.tagColor
                    }`}
                  >
                    {scen.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. SCENARIO RATIONALE */}
          <div className="bg-[var(--card-hover)]/70 p-3.5 rounded-xl border border-[var(--border-subtle)] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-main)] block">Strategy Intelligence:</span>
              <p className="text-[11px] text-[var(--text-body)] mt-0.5 leading-relaxed">
                {activeScenario.rationale}
              </p>
            </div>
          </div>

          {/* 4. WHAT-IF CUSTOM SANDBOX SLIDERS (Visible when CUSTOM tab active) */}
          {activeTab === "CUSTOM" && (
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Interactive What-If Parameters</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setCustomHwDiscount(10);
                    setCustomSrvDiscount(8);
                    setIncludeBundle(true);
                  }}
                  className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Sliders</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Slider 1: Hardware Discount */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span>Hardware Concession:</span>
                    <span className="font-mono font-bold text-[var(--primary)]">{customHwDiscount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={customHwDiscount}
                    onChange={(e) => setCustomHwDiscount(Number(e.target.value))}
                    className="w-full accent-[var(--primary)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>0% (Full Margin)</span>
                    <span>Ceiling: {tierCeilings.HARDWARE}%</span>
                    <span>25% (High Risk)</span>
                  </div>
                </div>

                {/* Slider 2: Services Discount */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span>Services Concession:</span>
                    <span className="font-mono font-bold text-[var(--primary)]">{customSrvDiscount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={customSrvDiscount}
                    onChange={(e) => setCustomSrvDiscount(Number(e.target.value))}
                    className="w-full accent-[var(--primary)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>0% (Full Margin)</span>
                    <span>Ceiling: {tierCeilings.SERVICES}%</span>
                    <span>25% (High Risk)</span>
                  </div>
                </div>
              </div>

              {/* Bundle Switch & Terms */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeBundle}
                    onChange={(e) => setIncludeBundle(e.target.checked)}
                    className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-0 cursor-pointer"
                  />
                  <span className="font-medium text-[var(--text-main)]">
                    Bundle 2-Yr Care Pack (WAR-ACC-2YR) with 5% promotion (+2.1% blended margin)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">Terms:</span>
                  <select
                    value={customTerms}
                    onChange={(e) => setCustomTerms(e.target.value)}
                    className="bg-[var(--card)] text-[var(--text-main)] border border-[var(--border)] rounded px-2 py-1 text-xs"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. DUAL-SIDED IMPACT COMPARISON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SIDE 1: BUSINESS REALITY EVALUATOR */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 font-bold text-[var(--text-main)] font-heading">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Business Reality Evaluator</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Internal Impact</span>
              </div>

              <div className="space-y-2.5">
                {/* Gross Margin % */}
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Projected Gross Margin:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-sm text-[var(--text-main)]">
                      {activeScenario.margin}%
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        activeScenario.deltaMargin >= 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {activeScenario.deltaMargin >= 0 ? `+${activeScenario.deltaMargin}%` : `${activeScenario.deltaMargin}%`}
                    </span>
                  </div>
                </div>

                {/* Risk Score */}
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Blended Risk Score:</span>
                  <span
                    className={`badge text-[10px] font-bold ${
                      activeScenario.riskScore <= 20
                        ? "badge-success"
                        : activeScenario.riskScore <= 50
                        ? "badge-warning"
                        : "badge-destructive"
                    }`}
                  >
                    {activeScenario.riskScore} / 100
                  </span>
                </div>

                {/* Required Approval Chain */}
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Governance Chain:</span>
                  <span className="font-semibold text-[var(--text-main)] text-right">
                    {activeScenario.approval}
                  </span>
                </div>

                {/* Warehouse Split */}
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Logistics Fulfillment:</span>
                  <span className="font-medium text-[var(--text-main)] flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{activeScenario.shipments} Shipment{activeScenario.shipments > 1 ? "s" : ""} Required</span>
                  </span>
                </div>

                {/* Bundled SKU Indicator */}
                {activeScenario.bundleSku && (
                  <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 shrink-0" />
                    <span>Bundles <strong>2-Yr Enterprise Care Pack</strong> (WAR-ACC-2YR)</span>
                  </div>
                )}
              </div>
            </div>

            {/* SIDE 2: CUSTOMER NEGOTIATION PSYCHOLOGY */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 font-bold text-[var(--text-main)] font-heading">
                  <HeartHandshake className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Customer Reality (Behavioral)</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Buyer Psychology</span>
              </div>

              {/* Multi-Segment Probability Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium">
                  <span>Predicted Buyer Response</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {activeScenario.winRate}% Acceptance Probability
                  </span>
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--border)]">
                  <div
                    className="bg-emerald-500 transition-all duration-300"
                    style={{ width: `${activeScenario.winRate}%` }}
                    title={`Acceptance: ${activeScenario.winRate}%`}
                  />
                  <div
                    className="bg-amber-400 transition-all duration-300"
                    style={{ width: `${activeScenario.counterRate}%` }}
                    title={`Counter-Offer: ${activeScenario.counterRate}%`}
                  />
                  <div
                    className="bg-red-500 transition-all duration-300"
                    style={{ width: `${activeScenario.walkAwayRate}%` }}
                    title={`Walk-away Risk: ${activeScenario.walkAwayRate}%`}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-[var(--text-muted)] pt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Accept ({activeScenario.winRate}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Counter ({activeScenario.counterRate}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Walk-away ({activeScenario.walkAwayRate}%)</span>
                  </div>
                </div>
              </div>

              {/* Customer Acceptance Corridor Feedback */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Offered HW Discount:</span>
                  <span className="font-bold text-[var(--text-main)] font-mono">{activeScenario.hwDiscount}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Offered Services Discount:</span>
                  <span className="font-bold text-[var(--text-main)] font-mono">{activeScenario.srvDiscount}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Commercial Terms:</span>
                  <span className="font-semibold text-[var(--text-main)]">{activeScenario.terms}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card-hover)]/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span>
              Applying this scenario updates the active draft cart lines and recalculates margins automatically.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline px-4 py-2 text-xs flex-1 sm:flex-initial cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyClick}
              className="btn-primary px-5 py-2 text-xs font-bold flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer shadow-md bg-gradient-to-r from-[var(--primary)] to-indigo-600 hover:opacity-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Apply {activeScenario.name.split(" ")[0]} to Draft Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
