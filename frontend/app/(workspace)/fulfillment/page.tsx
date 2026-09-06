import { Metadata } from "next";
import FulfillmentOrdersList from "@/components/fulfillment/FulfillmentOrdersList";

export const metadata: Metadata = {
  title: "Fulfillment & Orders Queue | DealOrbit",
  description:
    "Operations queue displaying confirmed sales orders awaiting warehouse split, stock allocation, and dispatch.",
};

export default function FulfillmentPage() {
  return <FulfillmentOrdersList />;
}
