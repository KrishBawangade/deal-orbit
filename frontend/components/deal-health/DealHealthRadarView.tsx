"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Clock,
  Percent,
  Truck,
  ShieldAlert,
  ShieldCheck,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Sliders,
  Filter,
  Search,
  Bell,
  Building2,
  User,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/context/RoleContext";
import { useDealHealth, IDealHealthAlertItem } from "@/context/DealHealthContext";
import NudgeModal from "./NudgeModal";
import EscalationModal from "./EscalationModal";
import SlaConfigModal from "./SlaConfigModal";

export default function DealHealthRadarView() {
  const { activeUser } = useRole();
  const {
    alerts,
    slaConfig,
    sendNudge,
    escalateDeal,
    resolveAlert,
    updateSlaConfig,
    activeCount,
    criticalCount,
  } = useDealHealth();

  // Active filter tab
  const [filterTab, setFilterTab] = useState<"ALL" | "STALLED_DEAL" | "DISCOUNT_ANOMALY" | "DELIVERY_SLIPPAGE">("ALL");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "CRITICAL_HIGH">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [activeNudgeAlert, setActiveNudgeAlert] = useState<IDealHealthAlertItem | null>(null);
  const [activeEscalationAlert, setActiveEscalationAlert] = useState<IDealHealthAlertItem | null>(null);
  const [isSlaConfigOpen, setIsSlaConfigOpen] = useState(false);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (alert.isResolved) return false;
      if (filterTab !== "ALL" && alert.alertType !== filterTab) return false;
      if (severityFilter === "CRITICAL_HIGH" && alert.severity !== "HIGH") {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          alert.quoteNumber.toLowerCase().includes(q) ||
          alert.customerName.toLowerCase().includes(q) ||
          alert.repName.toLowerCase().includes(q) ||
          alert.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alerts, filterTab, severityFilter, searchQuery]);

  const stalledCount = alerts.filter((a) => !a.isResolved && a.alertType === "STALLED_DEAL").length;
  const anomalyCount = alerts.filter((a) => !a.isResolved && a.alertType === "DISCOUNT_ANOMALY").length;
  const slippageCount = alerts.filter((a) => !a.isResolved && a.alertType === "DELIVERY_SLIPPAGE").length;

  const handleSendNudgeConfirm = (alertId: string, customMessage: string) => {
    sendNudge(alertId, customMessage);
    toast.success("Automated follow-up nudge dispatched to sales representative", { duration: 4000 });
  };

  const handleEscalateConfirm = (alertId: string, targetRole: string, rationale: string) => {
    escalateDeal(alertId, targetRole, rationale);
    toast.error(`Deal escalated directly to ${targetRole}`, { duration: 5000 });
  };

  const handleResolveAlert = (alertId: string, quoteNumber: string) => {
    resolveAlert(alertId);
    toast.success(`Alert on ${quoteNumber} marked as resolved.`, { duration: 3000 });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Executive Radar Overview */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] font-heading">
              Deal Health & Anomaly Radar
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Continuous operational surveillance across deal velocity, discount statistical variances (&gt;2.5σ), and multi-warehouse logistics SLA buffers.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSlaConfigOpen(true)}
              className="btn-outline text-xs py-2 px-4 flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Sliders className="w-4 h-4 text-[var(--primary)]" />
              <span>Configure Detection SLAs</span>
            </button>

            <Link
              href="/quotations"
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <span>View All Quotations</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Radar Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Anomalies */}
        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">Active Radar Alerts</span>
            <Activity className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-main)]">
            {activeCount}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <span className="text-red-600 dark:text-red-400 font-bold">{criticalCount} Critical</span>
            <span>requiring immediate intervention</span>
          </div>
        </div>

        {/* Metric 2: Stalled Deals */}
        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">Stalled Deals (&gt;{slaConfig.stalledDaysThreshold}d)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {stalledCount}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Quotations inactive in customer review
          </div>
        </div>

        {/* Metric 3: Discount Anomalies */}
        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">Discount Variance (&gt;{slaConfig.anomalySigmaThreshold}σ)</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {anomalyCount}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Proposals exceeding rep moving averages
          </div>
        </div>

        {/* Metric 4: Delivery Promise Slippage */}
        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">Delivery Promise Slippage</span>
            <Truck className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
            {slippageCount}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Logistics carrier ETA exceeding customer SLA
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-2xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterTab === "ALL"
                ? "bg-[var(--primary)] text-white shadow-2xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
            }`}
          >
            All Alerts ({activeCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("STALLED_DEAL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterTab === "STALLED_DEAL"
                ? "bg-amber-600 text-white shadow-2xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Stalled Deals ({stalledCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("DISCOUNT_ANOMALY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterTab === "DISCOUNT_ANOMALY"
                ? "bg-purple-600 text-white shadow-2xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Discount Anomalies ({anomalyCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("DELIVERY_SLIPPAGE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterTab === "DELIVERY_SLIPPAGE"
                ? "bg-red-600 text-white shadow-2xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery Slippage ({slippageCount})</span>
          </button>
        </div>

        {/* Severity Toggle & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search quote, rep, or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setSeverityFilter((prev) => (prev === "ALL" ? "CRITICAL_HIGH" : "ALL"))
            }
            className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1 ${
              severityFilter === "CRITICAL_HIGH"
                ? "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400 font-bold"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <Filter className="w-3 h-3" />
            <span className="hidden sm:inline">Critical Only</span>
          </button>
        </div>
      </div>

      {/* 4. Anomaly Alert Cards Grid */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-[var(--text-main)]">
              All Commercial Radar Systems Nominal
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              No active stalled deals, discount anomalies, or logistics slippages match your current filters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isStalled = alert.alertType === "STALLED_DEAL";
            const isDiscount = alert.alertType === "DISCOUNT_ANOMALY";
            const isDelivery = alert.alertType === "DELIVERY_SLIPPAGE";

            const severityBadgeColor =
              alert.severity === "HIGH"
                ? "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                : alert.severity === "MEDIUM"
                ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";

            return (
              <div
                key={alert.id}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-xs hover:border-[var(--primary)]/30 transition-all space-y-4"
              >
                {/* Alert Top Row: Badges, Quote ID, Rep, Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Direct Quote Link */}
                    <Link
                      href={`/quotations/${alert.quoteNumber}`}
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Open quotation in review mode"
                    >
                      <span>{alert.quoteNumber}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {/* Alert Type Pill */}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--text-main)] flex items-center gap-1">
                      {isStalled && <Clock className="w-3 h-3 text-amber-500" />}
                      {isDiscount && <Percent className="w-3 h-3 text-purple-500" />}
                      {isDelivery && <Truck className="w-3 h-3 text-red-500" />}
                      <span>{alert.alertType.replace("_", " ")}</span>
                    </span>

                    {/* Severity Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityBadgeColor}`}
                    >
                      {alert.severity}
                    </span>

                    {/* Client Name */}
                    <span className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{alert.customerName}</span>
                    </span>
                  </div>

                  {/* Right: Rep & Time */}
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[var(--primary)]" />
                      <span>Rep: <strong className="text-[var(--text-main)]">{alert.repName}</strong></span>
                    </span>
                    <span>•</span>
                    <span>{alert.createdAt}</span>
                  </div>
                </div>

                {/* Main Alert Content: Description & Metric Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  {/* Left: Narrative Description (7 cols) */}
                  <div className="lg:col-span-7 space-y-2">
                    <p className="text-xs text-[var(--text-body)] leading-relaxed font-medium">
                      {alert.description}
                    </p>

                    {/* Recommendation Callout */}
                    <div className="p-3 rounded-xl bg-[var(--background)]/80 border border-[var(--border)] text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="text-[var(--text-main)] block text-[11px]">
                          Recommended Managerial Action:
                        </strong>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          {alert.recommendation}
                        </p>
                      </div>
                    </div>

                    {/* Notification Dispatched / Escalated Status Tag */}
                    {alert.nudgeSent && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Follow-up Nudge Dispatched to {alert.repName}</span>
                      </div>
                    )}
                    {alert.escalated && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Escalated to {alert.escalatedTo}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Metric vs Benchmark Comparison (5 cols) */}
                  <div className="lg:col-span-5 p-4 rounded-xl bg-[var(--background)]/60 border border-[var(--border)] space-y-2 text-xs">
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-medium">
                      <span>Telemetry Metric:</span>
                      <span className="font-mono font-bold text-red-600 dark:text-red-400">
                        {alert.metricValue} {alert.metricUnit}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-medium">
                      <span>Configured Benchmark / SLA:</span>
                      <span className="font-mono font-bold text-[var(--text-main)]">
                        {alert.benchmarkValue} {alert.metricUnit}
                      </span>
                    </div>

                    {/* Progress Ratio Bar */}
                    <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          alert.severity === "HIGH"
                            ? "bg-red-500"
                            : alert.severity === "MEDIUM"
                            ? "bg-orange-500"
                            : "bg-amber-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (alert.metricValue / (alert.benchmarkValue * 1.5)) * 100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] pt-0.5">
                      <span>Threshold: {alert.benchmarkValue}</span>
                      <span className="font-semibold text-red-600">
                        Variance: +{(alert.metricValue - alert.benchmarkValue).toFixed(1)} {alert.metricUnit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Open Quote Directly */}
                    <Link
                      href={`/quotations/${alert.quoteNumber}`}
                      className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Open Quotation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Send Nudge Button */}
                    <button
                      type="button"
                      onClick={() => setActiveNudgeAlert(alert)}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Send Nudge</span>
                    </button>

                    {/* Escalate Button */}
                    <button
                      type="button"
                      onClick={() => setActiveEscalationAlert(alert)}
                      className="btn-ghost text-xs py-1.5 px-3 border border-[var(--border)] flex items-center gap-1.5 cursor-pointer text-[var(--text-muted)] hover:text-red-600 hover:border-red-300"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      <span>Escalate</span>
                    </button>
                  </div>

                  {/* Dismiss / Mark Resolved */}
                  <button
                    type="button"
                    onClick={() => handleResolveAlert(alert.id, alert.quoteNumber)}
                    className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] underline transition-colors cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <NudgeModal
        isOpen={Boolean(activeNudgeAlert)}
        onClose={() => setActiveNudgeAlert(null)}
        alert={activeNudgeAlert}
        onSendNudge={handleSendNudgeConfirm}
      />

      <EscalationModal
        isOpen={Boolean(activeEscalationAlert)}
        onClose={() => setActiveEscalationAlert(null)}
        alert={activeEscalationAlert}
        onEscalate={handleEscalateConfirm}
      />

      <SlaConfigModal
        isOpen={isSlaConfigOpen}
        onClose={() => setIsSlaConfigOpen(false)}
        config={slaConfig}
        onSaveConfig={updateSlaConfig}
      />
    </div>
  );
}
