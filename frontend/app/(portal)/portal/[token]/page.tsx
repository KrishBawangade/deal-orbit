"use client";

import React, { use } from "react";
import CustomerNegotiationPortal from "@/components/portal/CustomerNegotiationPortal";

export default function CustomerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;

  return <CustomerNegotiationPortal token={token} />;
}
