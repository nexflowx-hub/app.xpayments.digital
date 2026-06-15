"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BalanceOverviewCards } from "@/components/dashboard/balance-overview-cards";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMerchantDashboard } from "@/hooks/use-merchant-dashboard";

// ─── Test Merchant UUID (until auth flow is ready) ────────────────────────────

const MERCHANT_ID = "00000000-0000-0000-0000-000000000000";

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useMerchantDashboard({ merchantId: MERCHANT_ID });

  const lastSync = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />

        <main className="flex-1 px-4 py-6 md:px-6">
          {/* ── Page Header ── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Overview
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Real-time balance across all settlement states. All values in
                USDT.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Last sync indicator */}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <Activity className="h-3 w-3" />
                <span>Synced {lastSync}</span>
                {isFetching && (
                  <RefreshCw className="ml-1 h-3 w-3 animate-spin text-usdt" />
                )}
              </div>

              {/* Manual refresh */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-surface"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          <Separator className="my-6 bg-border" />

          {/* ── Environment Notice ── */}
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-usdt/10 bg-usdt/[0.03] px-4 py-2.5">
            <Badge
              variant="outline"
              className="border-usdt/20 bg-usdt/5 text-[9px] font-semibold uppercase tracking-widest text-usdt"
            >
              API Connected
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              Fetching from{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-foreground/70">
                api.xpayments.digital
              </code>{" "}
              · Merchant{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-foreground/70">
                {MERCHANT_ID.slice(0, 8)}…
              </code>
            </span>
          </div>

          {/* ── 4 Balance Cards (API-driven) ── */}
          <BalanceOverviewCards
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
          />

          {/* ── Error detail (dev) ── */}
          {isError && error && (
            <pre className="mt-4 overflow-auto rounded-lg bg-destructive/5 p-3 text-[10px] font-mono text-destructive/80 max-h-24">
              {error.message}
            </pre>
          )}

          {/* ── Placeholder for future dashboard content ── */}
          <div className="mt-8 rounded-xl border border-dashed border-border/50 p-8 text-center">
            <p className="text-sm text-muted-foreground/40">
              Transactions table &amp; charts will be rendered here.
            </p>
          </div>
        </main>

        {/* ── Sticky Footer ── */}
        <footer className="mt-auto border-t border-border bg-background/60 px-4 py-3 backdrop-blur-sm md:px-6">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
            <span>© 2025 XPayments.Digital</span>
            <span>Settlement Engine v1.0.0</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}