"use client";

import React, { use } from "react";
import FulfillmentSplitScreen from "@/components/fulfillment/FulfillmentSplitScreen";

export default function OrderFulfillmentDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.orderId;

  return <FulfillmentSplitScreen initialOrderId={orderId} />;
}
