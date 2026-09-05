"use client";

import Image from "next/image";

interface DealOrbitLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function DealOrbitLogo({
  className = "",
  size = "md",
  showText = true,
}: DealOrbitLogoProps) {
  const sizeMap = {
    sm: { img: 32, text: "text-base", sub: "text-[9px]" },
    md: { img: 40, text: "text-lg", sub: "text-[10px]" },
    lg: { img: 52, text: "text-xl", sub: "text-xs" },
    xl: { img: 68, text: "text-2xl", sub: "text-xs" },
  };

  const { img, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0 overflow-hidden rounded-xl bg-white shadow-xs border border-slate-100 p-0.5">
        <Image
          src="/dealorbit-logo.png"
          alt="DealOrbit Logo"
          width={img}
          height={img}
          className="object-contain w-auto h-auto max-w-full max-h-full"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-heading font-extrabold tracking-tight leading-none ${text}`}>
            <span className="text-slate-900">Deal</span>
            <span className="text-blue-600">Orbit</span>
          </span>
          <span className={`uppercase font-bold text-slate-400 tracking-wider mt-0.5 ${sub}`}>
            Sales Operations
          </span>
        </div>
      )}
    </div>
  );
}
