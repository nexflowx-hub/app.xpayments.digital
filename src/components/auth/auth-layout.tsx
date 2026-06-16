// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Shared Auth Layout
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen dark layout with subtle grid background.
// Uses the official XPayments circular logo with dual neon glow.
// Variant "admin" applies crimson accents; default (merchant) uses dual neon.

import type { ReactNode } from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
  /** Override the default branding subtitle */
  subtitle?: string;
  /** "admin" applies crimson accents; default (merchant) uses dual neon */
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
      : "border-xblue/20 bg-xblue/5 text-xblue";

  const glowClass =
    variant === "admin"
      ? "bg-red-500/[0.04]"
      : "bg-gradient-radial from-xblue/[0.06] via-usdt/[0.03] to-transparent";

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

      {/* Dual neon radial glow behind card */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px] bg-xblue/[0.04]"
      />
      <div
        className="pointer-events-none absolute right-1/4 top-1/3 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px] bg-usdt/[0.04]"
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        {/* Branding — Official Circular Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-xblue/20 via-transparent to-usdt/20 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full overflow-hidden glow-dual">
              <Image
                src="/logo-xpayments.png"
                alt="XPayments.Digital"
                width={80}
                height={80}
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gradient-xpayments">
              XPayments
            </h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
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