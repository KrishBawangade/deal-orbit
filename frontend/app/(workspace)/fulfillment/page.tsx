import { Metadata } from "next";
import FulfillmentSplitScreen from "@/components/fulfillment/FulfillmentSplitScreen";

export const metadata: Metadata = {
  title: "Fulfillment & Warehouse Split | DealOrbit",
  description:
    "Operations view displaying recommended warehouse split for orders based on live stock, shipments count, and cost calculation.",
};

export default function FulfillmentPage() {
  return <FulfillmentSplitScreen />;
}
