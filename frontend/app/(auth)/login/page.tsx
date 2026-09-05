import { Metadata } from "next";
import Link from "next/link";
import { ZohoSignInCard } from "@/components/auth/ZohoSignInCard";

export const metadata: Metadata = {
  title: "Sign in | DealOrbit",
  description: "Sign in to your DealOrbit Workspace to manage deals, approvals, and quotations.",
};

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center animate-fadeIn">
      <ZohoSignInCard signUpHref="/signup" />
    </div>
  );
}
