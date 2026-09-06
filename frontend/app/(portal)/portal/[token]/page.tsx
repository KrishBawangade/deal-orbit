"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomerQuotationsHub from "@/components/portal/CustomerQuotationsHub";
import CustomerNegotiationPortal from "@/components/portal/CustomerNegotiationPortal";

function CustomerPortalInner({ token }: { token: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteFromUrl = searchParams.get("quote");

  const resolvedToken = token === "demo-token" || token === "default" ? "cust-001" : token;

  // If the route itself is a direct quote ID like QT-2026-0043
  const isDirectQuoteRoute = resolvedToken.toUpperCase().startsWith("QT-");

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    quoteFromUrl || (isDirectQuoteRoute ? resolvedToken : null)
  );

  useEffect(() => {
    if (token === "demo-token" || token === "default") {
      router.replace("/portal/cust-001");
    }
  }, [token, router]);

  useEffect(() => {
    if (quoteFromUrl) {
      setSelectedQuoteId(quoteFromUrl);
    } else if (!isDirectQuoteRoute) {
      setSelectedQuoteId(null);
    }
  }, [quoteFromUrl, isDirectQuoteRoute]);

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    router.push(`/portal/${resolvedToken}?quote=${quoteId}`);
  };

  const handleBackToHub = () => {
    setSelectedQuoteId(null);
    router.push(`/portal/${resolvedToken}`);
  };

  // If a quotation is selected, open the negotiation page for that quotation
  if (selectedQuoteId) {
    return (
      <CustomerNegotiationPortal
        token={resolvedToken}
        initialQuoteId={selectedQuoteId}
        onBackToHub={handleBackToHub}
      />
    );
  }

  // Otherwise, first show all the quotations of the customer!
  return (
    <CustomerQuotationsHub
      customerToken={resolvedToken}
      onSelectQuote={handleSelectQuote}
    />
  );
}

export default function CustomerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading Customer Quotations...</p>
        </div>
      }
    >
      <CustomerPortalInner token={token} />
    </Suspense>
  );
}
