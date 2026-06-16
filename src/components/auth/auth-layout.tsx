"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Shared Auth Layout
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen dark layout with animated grid, moving lines, and payment logos ticker.
// Uses the official XPayments circular logo with dual neon glow.

import type { ReactNode } from "react";
import Image from "next/image";
import { useT, useI18nStore } from "@/lib/i18n";
import { AnimatedBackground } from "@/components/animated-background";
import { PaymentLogosTicker } from "@/components/payment-logos-ticker";

interface AuthLayoutProps {
  children: ReactNode;
  /** Override the default branding subtitle */
  subtitle?: string;
  /** "admin" applies crimson accents; default (merchant) uses dual neon */
  variant?: "merchant" | "admin";
}

export function AuthLayout({
  children,
  subtitle,
  variant = "merchant",
}: AuthLayoutProps) {
  const { t, locale } = useT();
  const { setLocale } = useI18nStore();

  const resolvedSubtitle =
    subtitle ?? t("auth.high_risk_gateway");

  const badgeText =
    variant === "admin" ? t("auth.restricted_access") : t("auth.merchant_portal");
  const badgeClass =
    variant === "admin"
      ? "border-red-500/20 bg-red-500/5 text-red-400"
      : "border-xblue/20 bg-xblue/5 text-xblue";

  function toggleLocale() {
    setLocale(locale === "pt-BR" ? "en" : "pt-BR");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background overflow-hidden">
      {/* Animated Background — grid + moving lines + particles */}
      <AnimatedBackground />

      {/* Dual neon radial glow behind card */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px] bg-xblue/[0.05]" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px] bg-usdt/[0.05]" />

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
            <p className="text-xs text-muted-foreground">{resolvedSubtitle}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${badgeClass}`}
          >
            {badgeText}
          </span>
        </div>

        {/* Form Card */}
        <div className="relative w-full rounded-xl border border-border bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
          {/* Language toggle — top-right corner */}
          <button
            type="button"
            onClick={toggleLocale}
            className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-md border border-border bg-surface/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          >
            <span className={locale === "pt-BR" ? "text-foreground font-semibold" : ""}>{t("lang.pt")}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className={locale === "en" ? "text-foreground font-semibold" : ""}>{t("lang.en")}</span>
          </button>
          {children}
          {/* Copyright */}
          <p className="mt-5 text-center text-[11px] text-muted-foreground/50">
            © 2026 XPayments.Digital — {t("footer.settlement_engine")}
          </p>
        </div>
      </div>

      {/* Payment Logos Ticker — bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <PaymentLogosTicker />
      </div>
    </div>
  );
}