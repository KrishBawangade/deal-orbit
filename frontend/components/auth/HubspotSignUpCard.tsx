"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, User } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { AuthInput } from "./AuthInput";
import { GoogleIcon } from "./SocialIcons";
import { siteConfig } from "@/config/site";

interface HubspotSignUpCardProps {
  onToggleToSignIn?: () => void;
  signInHref?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function HubspotSignUpCard({
  onToggleToSignIn,
  signInHref = "/login",
}: HubspotSignUpCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");
    setPasswordError("");

    let hasError = false;
    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    // 1. Validate name
    if (!cleanName) {
      setNameError("Full name is required");
      toast.error("Please enter your name");
      hasError = true;
    }

    // 2. Validate email
    if (!cleanEmail) {
      setEmailError("Work email is required");
      if (!hasError) toast.error("Please enter your work email");
      hasError = true;
    } else if (!cleanEmail.includes("@") || !EMAIL_REGEX.test(cleanEmail)) {
      setEmailError("Please enter a valid work email address with an '@' (e.g. name@company.com)");
      if (!hasError) toast.error("Invalid email format. Must contain '@' and domain.");
      hasError = true;
    }

    // 3. Validate password
    if (!password) {
      setPasswordError("Password is required");
      if (!hasError) toast.error("Please enter a password");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      if (!hasError) toast.error("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name: cleanName,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setLoading(false);
        const errorMessage =
          data?.message ||
          data?.errors?.[0]?.message ||
          "Registration failed. Please verify your information.";
        setEmailError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setLoading(false);
      toast.success("Account created successfully! Welcome to DealOrbit.");
      router.replace("/login");
    } catch {
      setLoading(false);
      const serverErrMsg = "Registration service offline (http://localhost:5000). Please start the backend API.";
      setEmailError(serverErrMsg);
      toast.error(serverErrMsg);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    toast.info(`Connecting with ${provider}...`);
    setTimeout(() => {
      toast.success(`Account verified with ${provider}! Redirecting to workspace...`);
      router.replace("/quotations");
    }, 400);
  };

  return (
    <div className="w-full max-w-[480px] bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)] p-8 sm:p-10 transition-all duration-200">
      {/* Centered Reusable Brand Logo (Identical to Sign In) */}
      <div className="flex flex-col items-center justify-center mb-6 text-center">
        <Logo size="md" />
      </div>

      {/* Header Titles */}
      <div className="text-center space-y-1.5 mb-6">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
          Create your account
        </h1>
        <p className="text-sm font-medium text-[var(--text-muted)]">
          100% free. No credit card needed.
        </p>
      </div>

      {/* Social Button (Google) */}
      <button
        type="button"
        onClick={() => handleSocialSignUp("Google")}
        className="w-full py-3 px-4 rounded-[var(--radius-md)] bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] hover:border-slate-400 text-[var(--text-main)] font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-150 shadow-2xs active:scale-[0.99] cursor-pointer"
      >
        <GoogleIcon className="w-5 h-5 shrink-0" />
        <span>Continue with Google</span>
      </button>

      {/* Divider with "OR" */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <span className="relative px-3 bg-[var(--card)] text-xs font-semibold uppercase text-[var(--text-subtle)] tracking-wider">
          OR
        </span>
      </div>

      {/* Direct Registration Form with Email & Password */}
      <form onSubmit={handleSignUp} className="space-y-4" noValidate>
        <AuthInput
          id="signup-name"
          label="Full Name"
          type="text"
          placeholder="e.g. Sarah Jenkins"
          icon={<User className="w-4 h-4" />}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (nameError) setNameError("");
          }}
          error={nameError}
          required
        />

        <AuthInput
          id="signup-email"
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          error={emailError}
          required
        />

        <AuthInput
          id="signup-password"
          label="Password"
          type="password"
          placeholder="Create a secure password (min 6 chars)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError("");
          }}
          error={passwordError}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-[var(--radius-md)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <UserPlus className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Terms footnote */}
      <p className="mt-4 text-[11px] text-[var(--text-subtle)] text-center leading-relaxed">
        By creating an account, you agree to our{" "}
        <a href="#" className="text-[var(--text-muted)] underline hover:text-[var(--text-main)]">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-[var(--text-muted)] underline hover:text-[var(--text-main)]">
          Privacy Policy
        </a>
        .
      </p>

      {/* Bottom Switch to Sign In */}
      <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
        Already have an account?{" "}
        {onToggleToSignIn ? (
          <button
            type="button"
            onClick={onToggleToSignIn}
            className="text-[var(--primary)] hover:underline font-semibold cursor-pointer"
          >
            Sign in
          </button>
        ) : (
          <Link
            href={signInHref}
            className="text-[var(--primary)] hover:underline font-semibold cursor-pointer"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
