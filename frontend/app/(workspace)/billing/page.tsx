import { Metadata } from "next";
import SubscriptionBillingScreen from "@/components/billing/SubscriptionBillingScreen";

export const metadata: Metadata = {
  title: "Subscription & Billing Management | DealOrbit",
  description:
    "Finance and Operations screen for hybrid revenue architecture, one-time vs recurring line separation, upcoming billing schedules, mid-cycle proration, and automated credit notes.",
};

export default function BillingPage() {
  return <SubscriptionBillingScreen />;
}
