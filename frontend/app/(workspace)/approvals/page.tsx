"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ApprovalsInboxView from "@/components/approvals/ApprovalsInboxView";

function ApprovalsContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId") || undefined;

  return <ApprovalsInboxView initialQuoteId={quoteId} />;
}

export default function ApprovalsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--text-muted)] animate-pulse">
          Loading governance approval inbox...
        </div>
      }
    >
      <ApprovalsContent />
    </Suspense>
  );
}
