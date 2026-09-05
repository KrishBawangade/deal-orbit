import { Metadata } from "next";
import { ForgotPasswordCard } from "@/components/auth/ForgotPasswordCard";

export const metadata: Metadata = {
  title: "Forgot Password | DealOrbit",
  description: "Reset your DealOrbit account password to regain access to your deals and quotes.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center animate-fadeIn">
      <ForgotPasswordCard signInHref="/login" />
    </div>
  );
}
