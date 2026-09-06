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
      <QuotationBuilder initialQuote={existingQuote} />
    </div>
  );
}
