"use client";

import React, { useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Plus,
  X,
  Tag,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { ICatalogProduct } from "@/config/catalogData";
import { IRankedRecommendation } from "@/config/upsellRules";

interface UpsellCrossSellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: IRankedRecommendation[];
  onAddRecommendation: (product: ICatalogProduct) => void;
  onDismissRecommendation: (ruleId: string) => void;
  currentBlendedMargin: number;
}

export default function UpsellCrossSellDrawer({
  isOpen,
  onClose,
  recommendations,
  onAddRecommendation,
  onDismissRecommendation,
  currentBlendedMargin,
}: UpsellCrossSellDrawerProps) {
  // Listen for Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const formatCurrency = (val: number) => {
    return "₹" + val.toLocaleString("en-IN");
  };

  const getTagStyle = (tag: string | null) => {
    switch (tag) {
      case "PROMOTED":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "POPULAR PAIRING":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "MARGIN BOOSTER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "BUNDLE DEAL":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-[var(--card-hover)] text-[var(--text-muted)] border-[var(--border)]";
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
    >
      {/* 1. Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 2. Slide-Over Panel Container */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-main)] font-heading">
                  Smart Suggestions
                </h3>
                {recommendations.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/25 leading-none">
                    {recommendations.length} Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted)]">
                <span>Current Deal Margin:</span>
                <strong className="text-[var(--text-main)] font-mono">
                  {currentBlendedMargin}%
                </strong>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Floor 18%
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
            title="Close drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            Ranked co-purchase pairings based on your active quotation cart and promotional margins.
          </p>

          {recommendations.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-[var(--card)]/40 border border-dashed border-[var(--border)] space-y-2 mt-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
              <div className="text-sm font-semibold text-[var(--text-main)]">
                Cart Fully Optimized
              </div>
              <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                All recommended add-ons and pairings have been accepted or reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {recommendations.map((rec) => {
                const isBooster = rec.marginDeltaPercent >= 0;
                const deltaFormatted =
                  rec.marginDeltaPercent > 0
                    ? `+${rec.marginDeltaPercent}%`
                    : `${rec.marginDeltaPercent}%`;

                return (
                  <div
                    key={rec.ruleId}
                    className="group relative p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/70 hover:bg-[var(--card)] hover:border-[var(--primary)]/40 transition-all duration-150 space-y-2 shadow-2xs"
                  >
                    {/* Line 1: Tags + SKU + Dismiss */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rec.promotionalTag && (
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border leading-none ${getTagStyle(
                              rec.promotionalTag
                            )}`}
                          >
                            <Tag className="w-2 h-2" />
                            {rec.promotionalTag}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {rec.product.sku}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDismissRecommendation(rec.ruleId)}
                        className="p-1 -mr-1 -mt-1 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line 2: Product Name & Rationale */}
                    <div>
                      <div className="font-semibold text-xs text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                        {rec.product.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5">
                        {rec.rationale}
                      </div>
                    </div>

                    {/* Line 3: Price + Margin Delta + Add Button */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[var(--text-main)]">
                          {formatCurrency(rec.product.basePrice)}
                          {rec.product.isRecurring && (
                            <span className="text-[10px] text-[var(--text-muted)] font-normal">
                              /mo
                            </span>
                          )}
                        </span>

                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border leading-none ${
                            isBooster
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                          title={`Adds ${deltaFormatted} to blended margin (new: ${rec.potentialBlendedMargin}%)`}
                        >
                          <TrendingUp className="w-2.5 h-2.5" />
                          <span>{deltaFormatted} Margin</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddRecommendation(rec.product)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-2xs transition-transform active:scale-95 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Quote</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
