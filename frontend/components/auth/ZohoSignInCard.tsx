"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { AuthInput } from "./AuthInput";
import { GoogleIcon } from "./SocialIcons";
import { DemoUserPicker } from "./DemoUserPicker";
import { siteConfig } from "@/config/site";
import { IDemoUser, getDemoUserByEmail, isDemoCredential } from "@/config/demoUsers";

interface ZohoSignInCardProps {
  onToggleToSignUp?: () => void;
  signUpHref?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ZohoSignInCard({
  onToggleToSignUp,
  signUpHref = "/signup",
}: ZohoSignInCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const performDemoLogin = (user: IDemoUser) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("dealorbit_token", `demo_token_${user.role.toLowerCase()}`);
      localStorage.setItem("dealorbit_user", JSON.stringify(user));
      toast.success(`Welcome, ${user.name}! Signed in as ${user.roleLabel}`);
      router.push(user.defaultPath || "/");
    }, 350);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    let hasError = false;
    const cleanEmail = email.trim();

    // 1. Validate email
    if (!cleanEmail) {
      setEmailError("Email address is required");
      toast.error("Please enter your email address");
      hasError = true;
    } else if (!cleanEmail.includes("@") || !EMAIL_REGEX.test(cleanEmail)) {
      setEmailError("Please enter a valid email address with an '@' (e.g. name@company.com)");
      toast.error("Invalid email format. Must contain '@' and domain.");
      hasError = true;
    }

    // 2. Validate password
    if (!password) {
      setPasswordError("Password is required");
      if (!hasError) toast.error("Please enter your password");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      if (!hasError) toast.error("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Check credentials against demo accounts
        const demoUser = getDemoUserByEmail(cleanEmail);
        if (demoUser && demoUser.password === password) {
          performDemoLogin(demoUser);
          return;
        }

        setLoading(false);
        setPasswordError("Incorrect credentials");
        toast.error("Incorrect credentials");
        return;
      }

      setLoading(false);
      toast.success("Welcome back to DealOrbit!");
      if (data?.data?.tokens?.accessToken) {
        localStorage.setItem("dealorbit_token", data.data.tokens.accessToken);
      }
      router.push("/");
    } catch {
      // Offline fallback: check credentials against demo accounts
      const demoUser = getDemoUserByEmail(cleanEmail);
      if (demoUser && demoUser.password === password) {
        performDemoLogin(demoUser);
        return;
      }

      setLoading(false);
      setPasswordError("Incorrect credentials");
      toast.error("Incorrect credentials");
    }
  };

  const handleGoogleSignIn = () => {
    toast.info("Connecting to Google authentication...");
    setTimeout(() => {
      toast.success("Signed in with Google!");
      router.push("/");
    }, 800);
  };

  return (
    <div className="w-full max-w-[480px] bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)] p-8 sm:p-10 transition-all duration-200">
      {/* Centered Brand Logo (Identical to Sign Up) */}
      <div className="flex flex-col items-center justify-center mb-6 text-center">
        <Logo size="md" />
      </div>

      {/* Header Titles */}
      <div className="text-center space-y-1.5 mb-6">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
          Sign in
        </h1>
        <p className="text-sm font-medium text-[var(--text-muted)]">
          to access your DealOrbit Workspace
        </p>
      </div>

      {/* Sign in with Google option */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full py-3 px-4 rounded-[var(--radius-md)] bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] hover:border-slate-400 text-[var(--text-main)] font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-150 shadow-2xs active:scale-[0.99] cursor-pointer"
      >
        <GoogleIcon className="w-5 h-5 shrink-0" />
        <span>Sign in with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <span className="relative px-3 bg-[var(--card)] text-xs font-semibold uppercase text-[var(--text-subtle)] tracking-wider">
          OR
        </span>
      </div>

      {/* Demo Role Accounts Quick Switcher */}
      <div className="mb-5">
        <DemoUserPicker
          activeEmail={email}
          onSelectUser={(user) => {
            setEmail(user.email);
            setPassword(user.password);
            setEmailError("");
            setPasswordError("");
            toast.info(`Filled credentials for ${user.roleLabel}`);
          }}
        />
      </div>

      {/* Direct Authentication Form with Strict Validation */}
      <form onSubmit={handleSignIn} className="space-y-4" noValidate>
        <AuthInput
          id="signin-email"
          label="Email address"
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
          id="signin-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError("");
          }}
          error={passwordError}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-[var(--primary)] hover:underline font-medium cursor-pointer"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-[var(--radius-md)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white font-semibold text-sm shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Sign-up prompt */}
      <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
        Don&apos;t have a DealOrbit account?{" "}
        {onToggleToSignUp ? (
          <button
            type="button"
            onClick={onToggleToSignUp}
            className="text-[var(--primary)] hover:underline font-semibold cursor-pointer"
          >
            Sign up now
          </button>
        ) : (
          <Link
            href={signUpHref}
            className="text-[var(--primary)] hover:underline font-semibold cursor-pointer"
          >
            Sign up now
          </Link>
        )}
      </div>
    </div>
  );
}
