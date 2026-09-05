"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AlertType, AlertSeverity } from "@/types";

export interface IDealHealthAlertItem {
  id: string;
  quotationId: string;
  quoteNumber: string;
  customerName: string;
  repName: string;
  repEmail: string;
  alertType: AlertType;
  severity: AlertSeverity;
  metricValue: number;
  benchmarkValue: number;
  metricUnit: string;
  description: string;
  recommendation: string;
  createdAt: string;
  stalledDays?: number;
  isResolved?: boolean;
  nudgeSent?: boolean;
  nudgeSentAt?: string;
  escalated?: boolean;
  escalatedTo?: string;
  escalatedAt?: string;
}

export interface ISlaConfig {
  stalledDaysThreshold: number; // e.g. 7 days
  anomalySigmaThreshold: number; // e.g. 2.5 sigma
  deliveryBufferHours: number; // e.g. 48 hours
}

const INITIAL_ALERTS: IDealHealthAlertItem[] = [
  {
    id: "alert-01",
    quotationId: "QT-2026-0038",
    quoteNumber: "QT-2026-0038",
    customerName: "Beta Industries",
    repName: "Sam Seller",
    repEmail: "sam.seller@dealorbit.io",
    alertType: "STALLED_DEAL",
    severity: "MEDIUM",
    metricValue: 8.0,
    benchmarkValue: 7.0,
    metricUnit: "days inactive",
    stalledDays: 8,
    description: "Quotation inactive in CUSTOMER_REVIEW for 8 consecutive days without client interaction (SLA: 7 days).",
    recommendation: "Send automated follow-up nudge to Sam Seller or trigger procurement reminder.",
    createdAt: "Today at 08:00",
  },
  {
    id: "alert-02",
    quotationId: "QT-2026-0043",
    quoteNumber: "QT-2026-0043",
    customerName: "Acme Corp",
    repName: "Sam Seller",
    repEmail: "sam.seller@dealorbit.io",
    alertType: "DISCOUNT_ANOMALY",
    severity: "HIGH",
    metricValue: 18.0,
    benchmarkValue: 9.2,
    metricUnit: "% discount",
    description: "Proposed On-Site Deployment discount (18.0%) exceeds rep's 90-day historical moving average (9.2%) by > 2.8σ.",
    recommendation: "Review margin impact with Sales Manager Morgan Manager before re-publishing quote.",
    createdAt: "Today at 10:30",
  },
  {
    id: "alert-03",
    quotationId: "QT-2026-0044",
    quoteNumber: "QT-2026-0044",
    customerName: "Stark Enterprises",
    repName: "Sam Seller",
    repEmail: "sam.seller@dealorbit.io",
    alertType: "DELIVERY_SLIPPAGE",
    severity: "HIGH",
    metricValue: 7.0,
    benchmarkValue: 3.0,
    metricUnit: "days lead time",
    description: "Carrier transit and warehouse assembly lead time (7 days) breaches promised customer SLA delivery window (3 days).",
    recommendation: "Authorize expedited multi-warehouse auto-split to East Depot or notify customer of revised SLA.",
    createdAt: "Today at 11:15",
  },
  {
    id: "alert-04",
    quotationId: "QT-2026-0045",
    quoteNumber: "QT-2026-0045",
    customerName: "Wayne Logistics",
    repName: "Sam Seller",
    repEmail: "sam.seller@dealorbit.io",
    alertType: "STALLED_DEAL",
    severity: "LOW",
    metricValue: 9.0,
    benchmarkValue: 7.0,
    metricUnit: "days inactive",
    stalledDays: 9,
    description: "Quotation draft untouched for 9 days. Deal velocity score has dropped by 35%.",
    recommendation: "Nudge rep to schedule commercial sync or archive proposal.",
    createdAt: "Yesterday at 15:45",
  },
];

interface DealHealthContextType {
  alerts: IDealHealthAlertItem[];
  slaConfig: ISlaConfig;
  sendNudge: (alertId: string, customMessage?: string) => void;
  escalateDeal: (alertId: string, targetRole: string, rationale: string) => void;
  resolveAlert: (alertId: string) => void;
  updateSlaConfig: (newConfig: Partial<ISlaConfig>) => void;
  activeCount: number;
  criticalCount: number;
}

const DealHealthContext = createContext<DealHealthContextType | null>(null);

const STORAGE_KEY = "dealorbit_health_alerts_data";
const SLA_STORAGE_KEY = "dealorbit_health_sla_config";

export function DealHealthProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<IDealHealthAlertItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_ALERTS;
  });

  const [slaConfig, setSlaConfig] = useState<ISlaConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SLA_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      stalledDaysThreshold: 7,
      anomalySigmaThreshold: 2.5,
      deliveryBufferHours: 48,
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    }
  }, [alerts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SLA_STORAGE_KEY, JSON.stringify(slaConfig));
    }
  }, [slaConfig]);

  const sendNudge = useCallback((alertId: string, customMessage?: string) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== alertId) return alert;
        return {
          ...alert,
          nudgeSent: true,
          nudgeSentAt: "Just now",
          description: customMessage
            ? `${alert.description} [Nudge Sent: "${customMessage}"]`
            : `${alert.description} [Automated Follow-up Nudge Dispatched to ${alert.repEmail}]`,
        };
      })
    );
  }, []);

  const escalateDeal = useCallback((alertId: string, targetRole: string, rationale: string) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== alertId) return alert;
        return {
          ...alert,
          escalated: true,
          escalatedTo: targetRole,
          escalatedAt: "Just now",
          severity: "HIGH",
          description: `${alert.description} [Escalated to ${targetRole}: "${rationale}"]`,
        };
      })
    );
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== alertId) return alert;
        return {
          ...alert,
          isResolved: true,
        };
      })
    );
  }, []);

  const updateSlaConfig = useCallback((newConfig: Partial<ISlaConfig>) => {
    setSlaConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const activeCount = activeAlerts.length;
  const criticalCount = activeAlerts.filter((a) => a.severity === "HIGH").length;

  return (
    <DealHealthContext.Provider
      value={{
        alerts,
        slaConfig,
        sendNudge,
        escalateDeal,
        resolveAlert,
        updateSlaConfig,
        activeCount,
        criticalCount,
      }}
    >
      {children}
    </DealHealthContext.Provider>
  );
}

export function useDealHealth() {
  const context = useContext(DealHealthContext);
  if (!context) {
    throw new Error("useDealHealth must be used within a DealHealthProvider");
  }
  return context;
}
