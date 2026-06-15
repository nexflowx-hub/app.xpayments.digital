"use client";

import {
  ArrowDownLeft,
  Clock,
  Lock,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  FileSearch,
  Ban,
  RefreshCw,
  AlertTriangle,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MerchantDashboardBalances } from "@/lib/api-client";

// ─── USDT Formatter ──────────────────────────────────────────────────────────

function formatUsdt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─── Types ───────────────────────────────────────────────────────────────────

type CardVariant = "incoming" | "pending" | "risk" | "available";

interface PrimaryCardDef {
  id: string;
  label: string;
  description: string;
  variant: CardVariant;
  icon: React.ElementType;
  changeType: "positive" | "neutral" | "negative";
  /** Key mapping into the API response */
  dataKey: keyof MerchantDashboardBalances;
}

interface SecondaryStateDef {
  id: string;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  dataKey: keyof MerchantDashboardBalances;
}

// ─── Card Definitions ────────────────────────────────────────────────────────

const primaryCards: PrimaryCardDef[] = [
  {
    id: "incoming",
    label: "Incoming",
    description: "Funds just received",
    variant: "incoming",
    icon: ArrowDownLeft,
    changeType: "positive",
    dataKey: "INCOMING",
  },
  {
    id: "pending",
    label: "Pending",
    description: "In transit D+1 to D+3",
    variant: "pending",
    icon: Clock,
    changeType: "neutral",
    dataKey: "PENDING",
  },
  {
    id: "risk-reserve",
    label: "Risk Reserve",
    description: "Held by compliance",
    variant: "risk",
    icon: Lock,
    changeType: "negative",
    dataKey: "RESERVE",
  },
  {
    id: "available",
    label: "Available to Withdraw",
    description: "Ready for payout",
    variant: "available",
    icon: Wallet,
    changeType: "positive",
    dataKey: "AVAILABLE",
  },
];

const secondaryStates: SecondaryStateDef[] = [
  {
    id: "cleared",
    label: "Cleared",
    icon: ShieldCheck,
    colorClass: "text-emerald-400/70",
    dataKey: "CLEARED",
  },
  {
    id: "audit",
    label: "Under Audit",
    icon: FileSearch,
    colorClass: "text-cyan-400/70",
    dataKey: "AUDIT",
  },
  {
    id: "blocked",
    label: "Blocked",
    icon: Ban,
    colorClass: "text-red-400/70",
    dataKey: "BLOCKED",
  },
];

// ─── Variant Styles ──────────────────────────────────────────────────────────

const variantStyles: Record<
  CardVariant,
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

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card className="rounded-xl border border-border/50 bg-card py-5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-8 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="col-span-full rounded-xl border border-destructive/20 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center gap-3 p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <WifiOff className="h-5 w-5 text-destructive" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Unable to fetch balance data
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check your connection or try again later.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 border-border text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Primary Cards Grid ──────────────────────────────────────────────────────

function PrimaryCards({ data }: { data: MerchantDashboardBalances }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {primaryCards.map((def) => {
        const style = variantStyles[def.variant];
        const Icon = def.icon;
        const amount = data[def.dataKey];

        return (
          <Card
            key={def.id}
            className={`group relative rounded-xl border py-5 ${style.card} ${style.glow ?? ""}`}
          >
            {def.variant === "available" && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-usdt/[0.03] via-transparent to-transparent" />
            )}

            <CardContent className="relative p-5">
              {/* Label + Icon */}
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {def.label}
                </span>
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
                    {formatUsdt(amount)}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground/80">
                    USDT
                  </span>
                </div>

                {/* Description line */}
                <div className="flex items-center gap-1.5">
                  {def.changeType === "positive" && (
                    <TrendingUp className="h-3 w-3 text-usdt" />
                  )}
                  {def.changeType === "negative" && (
                    <Lock className="h-3 w-3 text-risk" />
                  )}
                  <span
                    className={`text-[11px] ${
                      def.changeType === "positive"
                        ? "text-usdt/80"
                        : def.changeType === "negative"
                          ? "text-risk/70"
                          : "text-muted-foreground"
                    }`}
                  >
                    {def.description}
                  </span>
                </div>
              </div>

              {/* CTA — Available only */}
              {def.variant === "available" && (
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

// ─── Secondary States Bar ────────────────────────────────────────────────────

function SecondaryStates({ data }: { data: MerchantDashboardBalances }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {secondaryStates.map((def) => {
        const Icon = def.icon;
        const amount = data[def.dataKey];

        return (
          <div
            key={def.id}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3"
          >
            <Icon className={`h-4 w-4 shrink-0 ${def.colorClass}`} />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {def.label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatUsdt(amount)}{" "}
                <span className="text-[10px] font-medium text-muted-foreground/60">
                  USDT
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Exported Component ─────────────────────────────────────────────────

interface BalanceOverviewCardsProps {
  data?: MerchantDashboardBalances;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry: () => void;
}

export function BalanceOverviewCards({
  data,
  isLoading,
  isError,
  onRetry,
}: BalanceOverviewCardsProps) {
  // ── Loading ──
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // ── Error ──
  if (isError || !data) {
    return <ErrorState onRetry={onRetry} />;
  }

  // ── Loaded — check if all zeros (first time / no data) ──
  const totalBalance =
    data.INCOMING +
    data.PENDING +
    data.RESERVE +
    data.AVAILABLE;

  const allSecondaryZero =
    data.CLEARED === 0 && data.AUDIT === 0 && data.BLOCKED === 0;

  return (
    <div>
      {/* 4 Primary Cards */}
      <PrimaryCards data={data} />

      {/* Total indicator when non-zero */}
      {totalBalance > 0 && (
        <div className="mt-4 flex items-center gap-2 px-1">
          <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-[11px] text-muted-foreground/60">
            Total across all states:{" "}
            <span className="font-semibold text-foreground/80">
              {formatUsdt(totalBalance)} USDT
            </span>
          </span>
        </div>
      )}

      {/* 3 Secondary states — only show when non-zero */}
      {!allSecondaryZero && <SecondaryStates data={data} />}
    </div>
  );
}