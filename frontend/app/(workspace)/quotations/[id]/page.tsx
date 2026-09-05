"use client";

import React, { use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import QuotationBuilder from "@/components/quotations/QuotationBuilder";
import { useQuotations } from "@/context/QuotationsContext";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const quoteId = unwrappedParams.id;
  const { getQuotation } = useQuotations();
  const router = useRouter();

  const existingQuote = getQuotation(quoteId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/quotations"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quotations</span>
        </Link>
      </div>

      <QuotationBuilder initialQuote={existingQuote} />
    </div>
  );
}
