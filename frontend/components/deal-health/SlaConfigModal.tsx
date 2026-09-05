"use client";

import React, { useState } from "react";
import {
  Sliders,
  Check,
  X,
  Shield,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import type { ISlaConfig } from "@/context/DealHealthContext";

interface SlaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ISlaConfig;
  onSaveConfig: (newConfig: Partial<ISlaConfig>) => void;
}

export default function SlaConfigModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: SlaConfigModalProps) {
  const [stalledDays, setStalledDays] = useState(config.stalledDaysThreshold);
  const [anomalySigma, setAnomalySigma] = useState(config.anomalySigmaThreshold);
  const [bufferHours, setBufferHours] = useState(config.deliveryBufferHours);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      stalledDaysThreshold: stalledDays,
      anomalySigmaThreshold: anomalySigma,
      deliveryBufferHours: bufferHours,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[var(--card-hover)] to-[var(--card)] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)] font-heading">
                Configure Health Radar SLAs
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Adjust sensitivity rules for anomaly detection engines.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Stalled Days Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-main)]">
                Stalled Quotation Inactivity SLA:
              </label>
              <span className="font-mono font-bold text-[var(--primary)]">{stalledDays} Days</span>
            </div>
            <input
              type="range"
              min="3"
              max="21"
              step="1"
              value={stalledDays}
              onChange={(e) => setStalledDays(parseInt(e.target.value, 10) || 7)}
              className="w-full accent-[var(--primary)] cursor-pointer"
            />
            <p className="text-[10px] text-[var(--text-muted)]">
              Emits a `STALLED_DEAL` alert when a quote is untouched beyond this threshold.
            </p>
          </div>

          {/* Sigma Sensitivity Input */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-main)]">
                Discount Anomaly Statistical Threshold:
              </label>
              <span className="font-mono font-bold text-[var(--primary)]">
                {anomalySigma.toFixed(1)}σ Deviation
              </span>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.0"
              step="0.1"
              value={anomalySigma}
              onChange={(e) => setAnomalySigma(parseFloat(e.target.value) || 2.5)}
              className="w-full accent-[var(--primary)] cursor-pointer"
            />
            <p className="text-[10px] text-[var(--text-muted)]">
              Flags discounts exceeding the sales representative&apos;s 90-day moving average by this standard deviation.
            </p>
          </div>

          {/* Delivery Buffer Input */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-main)]">
                Delivery Promise Safety Buffer:
              </label>
              <span className="font-mono font-bold text-[var(--primary)]">{bufferHours} Hours</span>
            </div>
            <input
              type="range"
              min="12"
              max="96"
              step="12"
              value={bufferHours}
              onChange={(e) => setBufferHours(parseInt(e.target.value, 10) || 48)}
              className="w-full accent-[var(--primary)] cursor-pointer"
            />
            <p className="text-[10px] text-[var(--text-muted)]">
              Minimum logistics buffer required between promised customer delivery date and warehouse carrier ETA.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline text-xs py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Policies</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
