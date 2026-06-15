"use client";

import {
  ArrowDownLeft,
  Clock,
  Lock,
  Wallet,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BalanceCard {
  id: string;
  label: string;
  amount: string;
  change?: string;
  changeType?: "positive" | "neutral" | "negative";
  icon: React.ElementType;
  variant: "incoming" | "pending" | "risk" | "available";
}

// ─── Data (mock — will be replaced by API calls) ─────────────────────────────

const balanceCards: BalanceCard[] = [
  {
    id: "incoming",
    label: "Incoming",
    amount: "$1,200.00",
    change: "+3.2% vs last hour",
    changeType: "positive",
    icon: ArrowDownLeft,
    variant: "incoming",
  },
  {
    id: "pending",
    label: "Pending",
    amount: "$5,400.00",
    change: "D+1 to D+3 settlement",
    changeType: "neutral",
    icon: Clock,
    variant: "pending",
  },
  {
    id: "risk-reserve",
    label: "Risk Reserve",
    amount: "$2,150.00",
    change: "Held by compliance",
    changeType: "negative",
    icon: Lock,
    variant: "risk",
  },
  {
    id: "available",
    label: "Available to Withdraw",
    amount: "$3,000.00",
    change: "Ready for payout",
    changeType: "positive",
    icon: Wallet,
    variant: "available",
  },
];

// ─── Variant Styles ──────────────────────────────────────────────────────────

const variantStyles: Record<
  BalanceCard["variant"],
  {
    card: string;
    iconWrapper: string;
    iconColor: string;
    amountColor: string;
    glow?: string;
  }
> = {
  incoming: {
    card: "border-white/[0.04] bg-card hover:border-white/[0.08] transition-colors",
    iconWrapper: "bg-white/[0.06]",
    iconColor: "text-incoming",
    amountColor: "text-foreground",
  },
  pending: {
    card: "border-pending/[0.12] bg-card hover:border-pending/[0.20] transition-colors",
    iconWrapper: "bg-pending/[0.10]",
    iconColor: "text-pending",
    amountColor: "text-foreground",
    glow: "glow-pending",
  },
  risk: {
    card: "border-risk/[0.12] bg-card hover:border-risk/[0.20] transition-colors",
    iconWrapper: "bg-risk/[0.10]",
    iconColor: "text-risk",
    amountColor: "text-foreground",
    glow: "glow-risk",
  },
  available: {
    card:
      "border-usdt/[0.18] bg-card hover:border-usdt/[0.30] transition-colors relative overflow-hidden",
    iconWrapper: "bg-usdt/[0.15]",
    iconColor: "text-usdt",
    amountColor: "text-usdt text-glow-usdt",
    glow: "glow-usdt",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function BalanceOverviewCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {balanceCards.map((card) => {
        const style = variantStyles[card.variant];
        const Icon = card.icon;

        return (
          <Card
            key={card.id}
            className={`group relative rounded-xl border py-5 ${style.card} ${style.glow ?? ""}`}
          >
            {/* Subtle gradient overlay for the "Available" card */}
            {card.variant === "available" && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-usdt/[0.03] via-transparent to-transparent" />
            )}

            <CardContent className="relative p-5">
              {/* Top row: Label + Icon */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </span>
                </div>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.iconWrapper}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${style.iconColor}`} />
                </div>
              </div>

              {/* Amount */}
              <div className="mt-4 flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold tabular-nums tracking-tight ${style.amountColor}`}
                  >
                    {card.amount}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground/80">
                    USDT
                  </span>
                </div>

                {/* Change / Status line */}
                {card.change && (
                  <div className="flex items-center gap-1.5">
                    {card.changeType === "positive" && (
                      <TrendingUp className="h-3 w-3 text-usdt" />
                    )}
                    {card.changeType === "negative" && (
                      <Lock className="h-3 w-3 text-risk" />
                    )}
                    <span
                      className={`text-[11px] ${
                        card.changeType === "positive"
                          ? "text-usdt/80"
                          : card.changeType === "negative"
                            ? "text-risk/70"
                            : "text-muted-foreground"
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA: Only for "Available to Withdraw" */}
              {card.variant === "available" && (
                <Button
                  className="mt-5 h-9 w-full gap-2 rounded-lg border-0 bg-usdt text-xs font-semibold text-background shadow-none transition-all hover:bg-usdt/90 hover:shadow-lg hover:shadow-usdt/20"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Request Payout
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}