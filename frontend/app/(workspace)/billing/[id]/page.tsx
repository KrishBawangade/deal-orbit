"use client";

import React, { use } from "react";
import SubscriptionBillingScreen from "@/components/billing/SubscriptionBillingScreen";

export default function ContractBillingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  return <SubscriptionBillingScreen initialOrderId={id} />;
}
