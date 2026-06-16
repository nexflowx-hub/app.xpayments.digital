"use client";

import { useState, useCallback } from "react";
import { Plus, CreditCard, Link2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PaymentLinksTable } from "./data-table";
import { CreateLinkSheet } from "./create-link-sheet";
import { fetchPaymentLinks, createPaymentLink } from "./mock-data";
import type { CreateLinkFormValues } from "./types";
import { useT } from "@/lib/i18n";

// ─── Query Keys ──────────────────────────────────────────────────────────────

const paymentLinkKeys = {
  all: ["payment-links"] as const,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PaymentLinksView() {
  const queryClient = useQueryClient();
  const { t } = useT();
  const [sheetOpen, setSheetOpen] = useState(false);

  // ── Fetch Links ──
  const {
    data: links = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: paymentLinkKeys.all,
    queryFn: fetchPaymentLinks,
  });

  // ── Create Link Mutation ──
  const createMutation = useMutation({
    mutationFn: createPaymentLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentLinkKeys.all });
      setSheetOpen(false);
      toast.success(t("payment_links.link_created"), {
        description: t("payment_links.link_ready"),
      });
    },
    onError: () => {
      toast.error(t("payment_links.failed_create"), {
        description: t("payment_links.failed_create_desc"),
      });
    },
  });

  const handleCreateLink = useCallback(
    (values: CreateLinkFormValues) => {
      createMutation.mutate(values);
    },
    [createMutation]
  );

  // ── Stats ──
  const activeLinks = links.filter((l) => l.status === "active").length;
  const totalSales = links.reduce((sum, l) => sum + l.sales, 0);
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {t("payment_links.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("payment_links.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setSheetOpen(true)}
          className="gap-2 bg-usdt text-xs font-semibold text-background shadow-none hover:bg-usdt/90 hover:shadow-lg hover:shadow-usdt/20"
        >
          <Plus className="h-4 w-4" />
          {t("payment_links.create_new")}
        </Button>
      </div>

      <Separator className="bg-border" />

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: t("payment_links.total_links"),
            value: links.length.toString(),
            icon: CreditCard,
            color: "text-foreground",
          },
          {
            label: t("payment_links.active"),
            value: activeLinks.toString(),
            icon: Link2,
            color: "text-usdt",
          },
          {
            label: t("payment_links.total_sales"),
            value: totalSales.toLocaleString(),
            icon: CreditCard,
            color: "text-foreground",
          },
          {
            label: t("payment_links.total_clicks"),
            value: totalClicks.toLocaleString(),
            icon: Link2,
            color: "text-foreground",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3"
          >
            <stat.icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Error State ── */}
      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <Badge
            variant="outline"
            className="border-destructive/30 bg-destructive/10 text-destructive"
          >
            {t("payment_links.error")}
          </Badge>
          <span className="text-xs text-destructive">
            {error?.message ?? t("payment_links.failed_load")}
          </span>
        </div>
      )}

      {/* ── Data Table ── */}
      <PaymentLinksTable
        data={links}
        isLoading={isLoading}
        onCreateNew={() => setSheetOpen(true)}
      />

      {/* ── Create Link Sheet ── */}
      <CreateLinkSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={handleCreateLink}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}