"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerNegotiationPortal from "@/components/portal/CustomerNegotiationPortal";

export default function PortalIndexPage() {
  const router = useRouter();

  // Automatically load default demo token for Acme Corp
  return <CustomerNegotiationPortal token="demo-token" initialQuoteId="QT-2026-0043" />;
}
