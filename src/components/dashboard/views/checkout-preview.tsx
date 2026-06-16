"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Checkout Preview
// ─────────────────────────────────────────────────────────────────────────────
// WHITE-LABEL CHECKOUT: The end customer sees ONLY "Secured by XPayments".
// No Stripe, MisticPay, SumUp, Mollie, or any third-party branding is shown.
// This preview simulates what checkout.xpayments.digital renders for customers.

import { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Zap,
  ArrowLeftRight,
  Lock,
  ShieldCheck,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Mock Payment Data ───────────────────────────────────────────────────────

const ORDER = {
  merchant: "CryptoVault Store",
  description: "Premium VPN — Annual Subscription",
  amount: "R$ 199,90",
  currency: "BRL",
  orderId: "#XPD-847291",
};

type PaymentTab = "card" | "pix" | "crypto";

// ─── Component ───────────────────────────────────────────────────────────────

export function CheckoutPreview() {
  const [activeTab, setActiveTab] = useState<PaymentTab>("card");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Checkout Preview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preview of the white-label hosted checkout experience.
          No third-party branding is exposed to the end customer.
        </p>
      </div>

      <Separator className="bg-border" />

      {/* White-Label Notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-usdt/10 bg-usdt/[0.03] px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-usdt" />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-foreground">
            White-Label Checkout Active
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            The checkout page displayed below uses only XPayments branding.
            No gateway provider names, logos, or identifiers are visible to
            the paying customer. All payment processing is abstracted.
          </p>
        </div>
      </div>

      {/* ── Checkout Simulation ──────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-lg flex-col items-center">
        {/* Checkout Card */}
        <div className="w-full rounded-2xl border border-border bg-card shadow-2xl shadow-black/30">
          {/* Checkout Header — XPayments branding ONLY */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-xpayments.png"
                alt="XPayments"
                width={100}
                height={32}
                className="h-6 w-auto object-contain brightness-0 invert opacity-80"
              />
            </div>
            <Badge
              variant="outline"
              className="border-usdt/20 bg-usdt/5 text-[9px] font-semibold uppercase tracking-widest text-usdt"
            >
              <Lock className="mr-1 h-2.5 w-2.5" />
              Secured
            </Badge>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Order Summary
            </p>
            <div className="mt-3 flex flex-col gap-2 rounded-xl bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {ORDER.description}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {ORDER.merchant}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {ORDER.amount}
                </span>
              </div>
              <Separator className="bg-border my-1" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Order ID</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {ORDER.orderId}
                </span>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Payment Method Tabs — Generic names ONLY */}
          <div className="px-6 pt-5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([
                {
                  id: "card" as const,
                  icon: CreditCard,
                  label: "Cartão",
                  color: "border-blue-500/30 bg-blue-500/5",
                  activeColor: "border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/20",
                },
                {
                  id: "pix" as const,
                  icon: Zap,
                  label: "PIX",
                  color: "border-emerald-500/30 bg-emerald-500/5",
                  activeColor: "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20",
                },
                {
                  id: "crypto" as const,
                  icon: ArrowLeftRight,
                  label: "Crypto",
                  color: "border-usdt/30 bg-usdt/5",
                  activeColor: "border-usdt/50 bg-usdt/10 ring-1 ring-usdt/20",
                },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                    activeTab === tab.id ? tab.activeColor : `${tab.color} hover:opacity-80`
                  }`}
                >
                  <tab.icon
                    className={`h-5 w-5 ${
                      activeTab === tab.id
                        ? tab.id === "card"
                          ? "text-blue-400"
                          : tab.id === "pix"
                            ? "text-emerald-400"
                            : "text-usdt"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Form Area */}
          <div className="px-6 py-5">
            {activeTab === "card" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Enter your card details
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">
                      Card Number
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        placeholder="0000 0000 0000 0000"
                        disabled
                        className="h-9 border-border bg-surface text-xs font-mono pr-16"
                      />
                      {/* Network badges — icons only, NO provider names */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="flex h-5 w-7 items-center justify-center rounded bg-blue-500/10">
                          <CreditCard className="h-3 w-3 text-blue-400" />
                        </div>
                        <div className="flex h-5 w-7 items-center justify-center rounded bg-orange-500/10">
                          <CreditCard className="h-3 w-3 text-orange-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        Expiry
                      </Label>
                      <Input
                        placeholder="MM/YY"
                        disabled
                        className="mt-1 h-9 border-border bg-surface text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        CVV
                      </Label>
                      <Input
                        placeholder="•••"
                        disabled
                        className="mt-1 h-9 border-border bg-surface text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">
                      Cardholder Name
                    </Label>
                    <Input
                      placeholder="Name on card"
                      disabled
                      className="mt-1 h-9 border-border bg-surface text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pix" && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                    <Zap className="h-8 w-8" />
                    <span className="text-[10px]">QR Code PIX</span>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Scan the QR code with your banking app to complete the payment
                  instantly.
                </p>
                <Badge
                  variant="outline"
                  className="border-emerald-500/20 bg-emerald-500/5 text-[10px] font-semibold text-emerald-400"
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Instant Payment
                </Badge>
              </div>
            )}

            {activeTab === "crypto" && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-full rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
                        Send USDT to
                      </span>
                      <code className="text-xs font-mono text-foreground">
                        TXyz...abc123
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="h-7 border-border text-[10px]"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="mt-3 flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed border-usdt/20 bg-usdt/5">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                      <ArrowLeftRight className="h-8 w-8" />
                      <span className="text-[10px]">Wallet QR</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Send the exact USDT amount. Payment confirms after blockchain
                  verification.
                </p>
              </div>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Pay Button */}
          <div className="px-6 py-5">
            <Button
              disabled
              className="h-11 w-full bg-usdt text-background font-semibold text-sm hover:bg-usdt/90"
            >
              Pay {ORDER.amount}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {/* Footer — ONLY XPayments branding, zero third-party */}
          <div className="border-t border-border px-6 py-3">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/40">
                Secured by{" "}
                <span className="font-medium text-muted-foreground/60">
                  XPayments
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* White-label verification checklist */}
        <div className="mt-6 w-full rounded-xl border border-border bg-surface p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
            White-Label Compliance Checklist
          </h3>
          <div className="flex flex-col gap-2.5">
            {[
              "No Stripe logo or text visible",
              "No MisticPay, SumUp, or Mollie references",
              "Card form says 'Enter your card details' — generic",
              "Only XPayments logo shown in checkout header",
              "Footer shows 'Secured by XPayments' exclusively",
              "Network icons (Visa/MC) — no provider badges",
              "QR codes contain no third-party branding",
              "All payment method names are generic (Cartão, PIX, Crypto)",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-usdt" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}