// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Shared Auth Layout
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen dark layout with subtle grid background.
// Uses the official XPayments logo.
// Variant "admin" applies crimson accents; default (merchant) uses USDT neon green.

import type { ReactNode } from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
  /** Override the default branding subtitle */
  subtitle?: string;
  /** "admin" applies crimson accents; default (merchant) uses USDT neon green */
  variant?: "merchant" | "admin";
}

export function AuthLayout({
  children,
  subtitle = "High-Risk Payment Gateway",
  variant = "merchant",
}: AuthLayoutProps) {
  const badgeText =
    variant === "admin" ? "Restricted Access" : "Merchant Portal";
  const badgeClass =
    variant === "admin"
      ? "border-red-500/20 bg-red-500/5 text-red-400"
      : "border-usdt/20 bg-usdt/5 text-usdt";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial glow behind card */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] ${
          variant === "admin" ? "bg-red-500/[0.04]" : "bg-usdt/[0.03]"
        }`}
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        {/* Branding — Official Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo-xpayments.png"
            alt="XPayments.Digital"
            width={140}
            height={48}
            priority
            className="h-12 w-auto object-contain brightness-0 invert [filter:brightness(0)_invert(1)]"
          />
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${badgeClass}`}
          >
            {badgeText}
          </span>
        </div>

        {/* Form Card */}
        <div className="w-full rounded-xl border border-border bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/50">
          © 2025 XPayments.Digital — Settlement Engine v1.0.0
        </p>
      </div>
    </div>
  );
}