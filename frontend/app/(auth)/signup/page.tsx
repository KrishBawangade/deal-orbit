import { Metadata } from "next";
import Link from "next/link";
import { HubspotSignUpCard } from "@/components/auth/HubspotSignUpCard";

export const metadata: Metadata = {
  title: "Create Account | DealOrbit",
  description: "Join DealOrbit 100% free with no credit card required. Experience intelligent quoting & deal governance.",
};

export default function SignUpPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center animate-fadeIn">
      <HubspotSignUpCard signInHref="/login" />
    </div>
  );
}
