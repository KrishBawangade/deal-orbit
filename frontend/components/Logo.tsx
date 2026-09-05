"use client";

import { useId } from "react";
import Link from "next/link";

export interface LogoProps {
  /** Size preset of the logo */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether to show the "DealOrbit" wordmark */
  showText?: boolean;
  /** Optional secondary subtitle underneath the wordmark */
  subtitle?: string;
  /** Whether to show the subtitle */
  showSubtitle?: boolean;
  /** Optional destination link (wraps in Next.js Link if provided) */
  href?: string;
  /** Additional container classes */
  className?: string;
}

const sizeConfig = {
  sm: {
    iconSize: "w-7 h-7",
    textSize: "text-sm",
    subtitleSize: "text-[10px]",
    gap: "gap-2",
  },
  md: {
    iconSize: "w-9 h-9",
    textSize: "text-base",
    subtitleSize: "text-[11px]",
    gap: "gap-2.5",
  },
  lg: {
    iconSize: "w-11 h-11",
    textSize: "text-xl",
    subtitleSize: "text-xs",
    gap: "gap-3",
  },
  xl: {
    iconSize: "w-14 h-14",
    textSize: "text-2xl",
    subtitleSize: "text-sm",
    gap: "gap-3.5",
  },
};

/**
 * Reusable Standalone DealOrbit Icon Symbol
 */
export function LogoIcon({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const id = useId();
  const gradId = `deal-orbit-grad-${id.replace(/:/g, "")}`;
  const ringId = `deal-orbit-ring-${id.replace(/:/g, "")}`;
  const { iconSize } = sizeConfig[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] p-1.5 shadow-md shadow-[var(--primary)]/20 ${iconSize} ${className}`}
      aria-label="DealOrbit Emblem"
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-white"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="0"
            y1="0"
            x2="36"
            y2="36"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#c7d2fe" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient
            id={ringId}
            x1="0"
            y1="18"
            x2="36"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#a5f3fc" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Ambient Back Glow */}
        <circle cx="18" cy="18" r="13" fill="#ffffff" fillOpacity="0.12" />

        {/* Outer Orbital Trajectory Ring */}
        <ellipse
          cx="18"
          cy="18"
          rx="15"
          ry="6.5"
          transform="rotate(-28 18 18)"
          stroke={`url(#${ringId})`}
          strokeWidth="1.75"
          strokeDasharray="4 2"
        />

        {/* Inner Counter-Orbit Path */}
        <ellipse
          cx="18"
          cy="18"
          rx="13.5"
          ry="5"
          transform="rotate(32 18 18)"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="1.25"
        />

        {/* Central Core Nucleus (The Deal) */}
        <circle cx="18" cy="18" r="5.5" fill={`url(#${gradId})`} />
        <circle cx="16.2" cy="16.2" r="1.75" fill="#ffffff" fillOpacity="0.9" />

        {/* Orbiting Satellite Node 1 */}
        <circle cx="29.5" cy="11.5" r="2.2" fill="#ffffff" />

        {/* Orbiting Satellite Node 2 */}
        <circle cx="6.5" cy="24.5" r="1.6" fill="#a5f3fc" />
      </svg>
    </div>
  );
}

/**
 * Reusable DealOrbit Logo Component
 *
 * Usage:
 * ```tsx
 * // Default logo (Icon + Wordmark)
 * <Logo />
 *
 * // Small logo for dense headers
 * <Logo size="sm" />
 *
 * // Just the icon mark
 * <Logo showText={false} />
 *
 * // Clickable logo linking to homepage
 * <Logo href="/" />
 *
 * // Large brand mark with custom subtitle
 * <Logo size="lg" showSubtitle subtitle="Self-Governing Operations" />
 * ```
 */
export default function Logo({
  size = "md",
  showText = true,
  subtitle = "Sales Operations",
  showSubtitle = false,
  href,
  className = "",
}: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <div
      className={`inline-flex items-center ${config.gap} select-none group transition-opacity hover:opacity-95 ${className}`}
    >
      <LogoIcon size={size} />

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span
            className={`font-heading font-extrabold tracking-tight text-[var(--text-main)] ${config.textSize}`}
          >
            Deal
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              Orbit
            </span>
          </span>

          {showSubtitle && (
            <span
              className={`text-[var(--text-muted)] font-medium pt-1 block leading-none ${config.subtitleSize}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}

export { Logo, Logo as DealOrbitLogo };
