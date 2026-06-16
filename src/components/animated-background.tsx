"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Animated Background
// ─────────────────────────────────────────────────────────────────────────────
// Animated grid + moving lines that create a "living" tech environment.
// Uses CSS animations only (no JS overhead) with the dual neon palette.

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate random line positions once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lines = container.querySelectorAll<HTMLDivElement>(".anim-line");
    lines.forEach((line) => {
      const top = Math.random() * 100;
      const delay = Math.random() * 12;
      const duration = 8 + Math.random() * 10;
      const opacity = 0.03 + Math.random() * 0.06;
      line.style.top = `${top}%`;
      line.style.animationDelay = `${delay}s`;
      line.style.animationDuration = `${duration}s`;
      line.style.opacity = String(opacity);
    });
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Animated grid */}
      <div className="absolute inset-0 animate-grid-bg opacity-[0.035]" />

      {/* Moving horizontal lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`h-${i}`}
          className="anim-line absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-xblue/60 to-transparent animate-scan-h"
        />
      ))}

      {/* Moving vertical lines */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`v-${i}`}
          className="anim-line absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-usdt/50 to-transparent animate-scan-v"
        />
      ))}

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`p-${i}`}
          className="absolute h-1 w-1 rounded-full animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
            background: i % 2 === 0 ? "var(--xblue)" : "var(--usdt)",
            opacity: 0.15 + Math.random() * 0.2,
          }}
        />
      ))}

      {/* Corner glow accents */}
      <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-xblue/[0.03] blur-[100px] animate-pulse-slow" />
      <div className="absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-usdt/[0.03] blur-[100px] animate-pulse-slow [animation-delay:4s]" />
    </div>
  );
}