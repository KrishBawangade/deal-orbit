"use client";

import React from "react";

/**
 * Reusable shimmer block with glowing wave sweep
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
 * Shimmer skeleton row matching Quotations table headers exactly:
 * [Quote ID] [Customer Account] [Grand Total] [Gross Margin] [Risk Assessment] [Status] [Last Updated] [Actions]
 */
export function QuotationRowSkeleton({ index }: { index: number }) {
  // Vary widths slightly across rows for hyper-realistic look
  const idWidths = ["w-24", "w-28", "w-22", "w-26", "w-24", "w-28"];
  const nameWidths = ["w-32", "w-44", "w-36", "w-40", "w-32", "w-48"];
  const totalWidths = ["w-24", "w-20", "w-28", "w-22", "w-26", "w-24"];

  const idWidth = idWidths[index % idWidths.length];
  const nameWidth = nameWidths[index % nameWidths.length];
  const totalWidth = totalWidths[index % totalWidths.length];

  return (
    <tr className="border-b border-[var(--border-subtle)]/70">
      {/* 1. Quote ID */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <ShimmerBox className="w-3.5 h-3.5 rounded shrink-0 opacity-70" />
          <ShimmerBox className={`${idWidth} h-4 rounded`} />
        </div>
      </td>

      {/* 2. Customer Account & Tier */}
      <td className="px-4 py-3.5">
        <div className="space-y-1.5">
          <ShimmerBox className={`${nameWidth} h-4 rounded`} />
          <div className="flex items-center gap-1.5">
            <ShimmerBox className="w-14 h-3 rounded" />
            <span className="text-[var(--text-muted)]/30 text-[10px]">•</span>
            <ShimmerBox className="w-20 h-3 rounded" />
            <span className="text-[var(--text-muted)]/30 text-[10px]">•</span>
            <ShimmerBox className="w-14 h-3 rounded" />
          </div>
        </div>
      </td>

      {/* 3. Grand Total */}
      <td className="px-4 py-3.5">
        <ShimmerBox className={`${totalWidth} h-5 rounded`} />
      </td>

      {/* 4. Gross Margin */}
      <td className="px-4 py-3.5">
        <ShimmerBox className="w-16 h-5 rounded-full" />
      </td>

      {/* 5. Risk Assessment */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <ShimmerBox className="w-3.5 h-3.5 rounded-full shrink-0" />
          <ShimmerBox className="w-28 h-4 rounded" />
        </div>
      </td>

      {/* 6. Status */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <ShimmerBox className="w-20 h-5 rounded-md" />
        </div>
      </td>

      {/* 7. Last Updated */}
      <td className="px-4 py-3.5">
        <ShimmerBox className="w-16 h-3.5 rounded" />
      </td>

      {/* 8. Actions */}
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <ShimmerBox className="w-16 h-6 rounded-lg ml-auto" />
        </div>
      </td>
    </tr>
  );
}

/**
 * Shimmer skeleton table body
 */
export function QuotationsTableSkeleton({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <QuotationRowSkeleton key={i} index={i} />
      ))}
    </>
  );
}

/**
 * Shimmer pagination footer
 */
export function QuotationsPaginationSkeleton() {
  return (
    <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--card)]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
      <ShimmerBox className="h-4 w-48 rounded" />
      <div className="flex items-center gap-2">
        <ShimmerBox className="h-7 w-16 rounded-lg" />
        <ShimmerBox className="h-4 w-24 rounded" />
        <ShimmerBox className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}
