"use client";

import React from "react";

/* 
 * 5 curated floating 3D circular discs:
 * Pearlescent white with subtle violet-sky iridescent warmth,
 * floating in the outer periphery.
 */
const BUBBLES = [
  // Far upper-left margin
  { x: 2,  y: 26, size: 90,  dur: 9.5, delay: 0,   driftX: 8,  driftY: -24 },

  // Top header open gap (positioned with safe clearance so it stays fully visible)
  { x: 44, y: 11, size: 75,  dur: 8.5, delay: 2.2, driftX: 6,  driftY: -16 },

  // Far upper-right margin (safe top clearance)
  { x: 89, y: 12, size: 90,  dur: 9.5, delay: 0.8, driftX: -8, driftY: -18 },
  { x: 93, y: 50, size: 100, dur: 10.5, delay: 1.8, driftX: 10, driftY: -28 },

  // Lower right negative space
  { x: 74, y: 86, size: 85,  dur: 8.8, delay: 2.5, driftX: -8, driftY: -22 },
];

export default function OrbitalBackground() {
  return (
    <div
      className="absolute inset-x-0 top-0 h-[1050px] pointer-events-none overflow-hidden z-0 select-none"
      style={{
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(216, 180, 254, 0.28) 0%, rgba(244, 114, 182, 0.16) 35%, rgba(255, 255, 255, 0) 70%), linear-gradient(180deg, #fdf4ff 0%, #faf5ff 15%, #f8fafc 45%, #ffffff 100%)",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes orb-disc-float {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(var(--dx), var(--dy), 0);
          }
        }
        @keyframes orb-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orb-spin-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>

      {/* Subtle hairline grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.7,
        }}
      />

      {/* Atmospheric Mesh Aura 1: Top-center vibrant violet-magenta aura */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "950px",
          height: "650px",
          background: "radial-gradient(ellipse at center, rgba(192, 132, 252, 0.28) 0%, rgba(244, 114, 182, 0.18) 35%, rgba(129, 140, 248, 0.12) 55%, transparent 75%)",
          borderRadius: "50%",
        }}
      />

      {/* Atmospheric Mesh Aura 2: Left pink/rose ambient glow */}
      <div
        className="absolute top-1/4 -left-32 pointer-events-none"
        style={{
          width: "550px",
          height: "600px",
          background: "radial-gradient(circle, rgba(244, 114, 182, 0.16) 0%, rgba(251, 207, 232, 0.08) 45%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Atmospheric Mesh Aura 3: Right violet/cyan ambient glow */}
      <div
        className="absolute top-1/3 -right-32 pointer-events-none"
        style={{
          width: "600px",
          height: "650px",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, rgba(199, 210, 254, 0.10) 45%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* FLOATING 3D PEARLESCENT DISCS */}
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: "radial-gradient(circle at 32% 28%, #ffffff 0%, #faf5ff 45%, #f3e8ff 75%, #e0e7ff 100%)",
            opacity: 0.95,
            boxShadow: `
              0 ${Math.round(b.size * 0.18)}px ${Math.round(b.size * 0.38)}px -2px rgba(168, 85, 247, 0.22),
              0 ${Math.round(b.size * 0.06)}px ${Math.round(b.size * 0.14)}px rgba(244, 114, 182, 0.16),
              inset 0 2px 3.5px rgba(255, 255, 255, 0.98),
              inset 0 -2px 3px rgba(224, 231, 255, 0.5)
            `,
            border: "1px solid rgba(255, 255, 255, 0.95)",
            animation: `orb-disc-float ${b.dur}s ease-in-out ${b.delay}s infinite`,
            willChange: "transform",
            ["--dx" as string]: `${b.driftX}px`,
            ["--dy" as string]: `${b.driftY}px`,
          }}
        />
      ))}

      {/* Delicate orbital tracks */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] pointer-events-none"
        style={{ opacity: 0.18 }}
      >
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            border: "1px dashed rgba(168, 85, 247, 0.35)",
            animation: "orb-spin-cw 160s linear infinite",
            willChange: "transform",
          }}
        >
          <div
            className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-purple-400"
            style={{ boxShadow: "0 0 10px 3px rgba(192, 132, 252, 0.6)" }}
          />
        </div>
        <div
          className="absolute inset-[130px] rounded-full flex items-center justify-center"
          style={{
            border: "1px solid rgba(244, 114, 182, 0.35)",
            animation: "orb-spin-ccw 110s linear infinite",
            willChange: "transform",
          }}
        >
          <div
            className="absolute top-1/2 -right-1.5 w-2.5 h-2.5 rounded-full bg-pink-400"
            style={{ boxShadow: "0 0 8px 2px rgba(244, 114, 182, 0.6)" }}
          />
        </div>
      </div>

      {/* Smooth bottom edge fade overlay */}
      <div
        className="absolute inset-x-0 bottom-0 h-56 pointer-events-none"
        style={{ background: "linear-gradient(to top, #ffffff 15%, rgba(255, 255, 255, 0.8) 55%, transparent 100%)" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(253, 244, 255, 0.4), transparent)" }}
      />
    </div>
  );
}
