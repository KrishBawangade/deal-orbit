import { redirect } from "next/navigation";

/**
 * Dashboard route redirects to canonical /quotations workspace
 */
export default function DashboardPage() {
  redirect("/quotations");
}
