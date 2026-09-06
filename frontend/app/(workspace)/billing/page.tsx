import { Metadata } from "next";
import SubscriptionContractsList from "@/components/billing/SubscriptionContractsList";

export const metadata: Metadata = {
  title: "Subscription & Billing Portfolio | DealOrbit",
  description:
    "Finance and Operations portfolio directory for enterprise hybrid revenue contracts, active SaaS subscriptions, proration engine, and automated credit notes.",
};

export default function BillingPage() {
  return <SubscriptionContractsList />;
}
