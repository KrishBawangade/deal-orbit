"use client";

import React from "react";

/**
 * Universal glowing shimmer box
 */
export function ShimmerBox({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`shimmer ${className}`} style={style} />;
}

/**
 * Universal metric/stat tile skeleton
 */
export function ShimmerMetricTile({
  label,
  icon: Icon,
  iconBg = "bg-indigo-500/10",
  iconColor = "text-indigo-500",
  valueWidth = "w-24",
  subWidth = "w-32",
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  valueWidth?: string;
  subWidth?: string;
}) {
  return (
    <div className="card-glass p-4 rounded-xl border border-[var(--border)]/70 flex items-center justify-between">
      <div className="space-y-1.5 w-full pr-3">
        <div className="text-xs text-[var(--text-muted)] font-medium">{label}</div>
        <ShimmerBox className={`h-7 ${valueWidth} rounded-md`} />
        <ShimmerBox className={`h-3 ${subWidth} rounded`} />
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 opacity-40" />
        </div>
      )}
    </div>
  );
}

/**
 * Shimmer deal/contract card skeleton for grids and kanban columns
 */
export function ShimmerCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-glass p-4 rounded-xl border border-[var(--border)] space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <ShimmerBox className="h-4 w-28 rounded" />
        <ShimmerBox className="h-4 w-14 rounded-full" />
      </div>
      <ShimmerBox className="h-5 w-36 rounded" />
      <div className="flex items-center gap-2 pt-1">
        <ShimmerBox className="h-3 w-16 rounded" />
        <span className="text-[var(--text-muted)]/20">•</span>
        <ShimmerBox className="h-3 w-20 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
        <ShimmerBox className="h-3 w-20 rounded" />
        <ShimmerBox className="h-6 w-16 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Mini pill skeleton for badges, counts, and filters
 */
export function ShimmerPill({ className = "w-4 h-3" }: { className?: string }) {
  return <span className={`inline-block rounded shimmer align-middle opacity-70 ${className}`} />;
}
