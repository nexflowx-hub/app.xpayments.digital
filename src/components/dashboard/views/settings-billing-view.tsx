"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Settings / Billing
// ─────────────────────────────────────────────────────────────────────────────
// WHITE-LABEL ENFORCEMENT: No provider names are ever shown.
// All payment methods use the provider-abstraction layer for display.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Wallet,
  CreditCard,
  Zap,
  Landmark,
  ArrowLeftRight,
  Settings2,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  toDisplayMethod,
  getCategoryLabel,
  type InternalProvider,
  type DisplayMethod,
} from "@/lib/provider-abstraction";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const walletSchema = z.object({
  walletAddress: z.string().superRefine((val, ctx) => {
    // TRC-20: 34 chars starting with "T"
    if (val.startsWith("T") && val.length === 34) return z.NEVER;
    // ERC-20: 42 chars starting with "0x"
    if (val.startsWith("0x") && val.length === 42) return z.NEVER;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Must be a valid TRC-20 address (34 chars, starts with "T") or ERC-20 (42 chars, starts with "0x")',
    });
  }),
  network: z.enum(["TRC-20", "ERC-20"]),
  label: z
    .string()
    .min(1, "Label is required")
    .max(50, "Label must be 50 characters or less"),
});

type WalletFormValues = z.infer<typeof walletSchema>;

// ─── Mock Data (simulating API response with providerUsed field) ─────────────
// In production this comes from: GET /api/v1/merchant/payment-methods
// The providerUsed field is internal and MUST be abstracted before rendering.

const MOCK_ACTIVE_PROVIDERS: {
  providerUsed: InternalProvider;
  status: "active" | "pending" | "disabled";
  fee: string;
}[] = [
  { providerUsed: "misticpay_pix", status: "active", fee: "0.99%" },
  { providerUsed: "stripe_card_brl", status: "active", fee: "3.49%" },
  { providerUsed: "mollie_sepa", status: "pending", fee: "1.49%" },
  { providerUsed: "misticpay_crypto", status: "active", fee: "1.00%" },
];

// ─── Network Icon Component ──────────────────────────────────────────────────
// Renders ONLY network badges (Visa, Mastercard, PIX) — never provider names.

function NetworkIconBadge({ networkId }: { networkId: string }) {
  const config: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    visa: { icon: CreditCard, color: "text-blue-400", bg: "bg-blue-400/10" },
    mastercard: { icon: CreditCard, color: "text-orange-400", bg: "bg-orange-400/10" },
    amex: { icon: CreditCard, color: "text-sky-300", bg: "bg-sky-300/10" },
    pix: { icon: Zap, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    sepa: { icon: Landmark, color: "text-blue-300", bg: "bg-blue-300/10" },
    usdt: { icon: ArrowLeftRight, color: "text-usdt", bg: "bg-usdt/10" },
    usdc: { icon: ArrowLeftRight, color: "text-blue-400", bg: "bg-blue-400/10" },
    bank: { icon: Landmark, color: "text-muted-foreground", bg: "bg-muted" },
  };

  const cfg = config[networkId] ?? {
    icon: CreditCard,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
  };
  const Icon = cfg.icon;

  return (
    <div
      className={`flex h-6 w-6 items-center justify-center rounded ${cfg.bg}`}
      title={networkId.toUpperCase()}
    >
      <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "active" | "pending" | "disabled" }) {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="border-usdt/30 text-usdt bg-usdt/10"
        >
          Active
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-pending/30 text-pending bg-pending/10"
        >
          Pending Activation
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-border text-muted-foreground bg-muted">
          Disabled
        </Badge>
      );
  }
}

// ─── Payment Method Row (White-Label) ────────────────────────────────────────

function PaymentMethodRow({
  method,
  status,
  fee,
}: {
  method: DisplayMethod;
  status: "active" | "pending" | "disabled";
  fee: string;
}) {
  const isPending = status === "pending";
  const isDisabled = status === "disabled";

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4">
      {/* Method Info + Networks */}
      <div className="flex flex-1 items-start gap-3 sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised border border-border">
          {method.category === "instant" && (
            <Zap className="h-4 w-4 text-emerald-400" />
          )}
          {method.category === "card" && (
            <CreditCard className="h-4 w-4 text-blue-400" />
          )}
          {method.category === "bank_transfer" && (
            <Landmark className="h-4 w-4 text-blue-300" />
          )}
          {method.category === "crypto" && (
            <ArrowLeftRight className="h-4 w-4 text-usdt" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {method.label}
            </span>
            {method.isInstant && (
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400"
              >
                Instant
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{method.description}</p>
          {/* Network Badges — icons ONLY, no provider text */}
          <div className="flex items-center gap-1.5 mt-1">
            {method.networks.map((nw) => (
              <NetworkIconBadge key={nw.id} networkId={nw.id} />
            ))}
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="sm:w-16 shrink-0">
        <Badge variant="outline" className="border-border text-muted-foreground">
          {method.currency}
        </Badge>
      </div>

      {/* Status */}
      <div className="sm:w-40 shrink-0">
        <StatusBadge status={status} />
      </div>

      {/* Fee */}
      <span className="text-sm text-muted-foreground sm:w-16 shrink-0 text-right">
        {fee}
      </span>

      {/* Action */}
      <div className="sm:ml-auto shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || isDisabled}
          className="border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          Configure
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SettingsBillingView() {
  const [saved, setSaved] = useState(false);

  // ⚠️ WHITE-LABEL: We call toDisplayMethod() to strip provider identity
  const displayMethods = MOCK_ACTIVE_PROVIDERS.map((m) => ({
    method: toDisplayMethod(m.providerUsed),
    status: m.status,
    fee: m.fee,
  }));

  // Group by category
  const grouped = displayMethods.reduce(
    (acc, item) => {
      const cat = item.method.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, typeof displayMethods>
  );

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      walletAddress: "",
      network: "TRC-20",
      label: "",
    },
  });

  function onSubmit(_data: WalletFormValues) {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Settings / Billing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your USDT payout wallet and manage active payment methods.
        </p>
      </div>

      <Separator className="bg-border" />

      {/* White-Label Notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-xblue/10 bg-xblue/[0.03] px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-xblue" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          XPayments manages all payment processing infrastructure transparently.
          Your configured methods are optimized for the best approval rates and
          settlement speed. No third-party gateway configuration required.
        </p>
      </div>

      {/* ── Section 1: Payout Wallet (USDT) ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-usdt" />
          <h2 className="text-base font-medium text-foreground">
            USDT Payout Wallet
          </h2>
        </div>

        <Card className="bg-surface border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">
              Wallet Configuration
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Configure the wallet where your USDT settlements will be sent.
              All payouts are processed in USDT (Tether) on your chosen network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Wallet Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="TXyz...abc123"
                            className="h-9 border-border bg-card font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-usdt/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Network</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 border-border bg-card text-xs">
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TRC-20">
                              TRC-20 (Tron Network)
                            </SelectItem>
                            <SelectItem value="ERC-20">
                              ERC-20 (Ethereum Network)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel className="text-xs">Label</FormLabel>
                      <FormDescription className="text-[10px]">
                        A nickname to identify this wallet (e.g. &quot;Main
                        Operations&quot;)
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="e.g. Main Operations Wallet"
                          className="h-9 border-border bg-card text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="sm"
                  className="bg-usdt text-background hover:bg-usdt/90 font-medium text-xs"
                >
                  <Wallet className="mr-1.5 h-3.5 w-3.5" />
                  {saved ? "Wallet Saved ✓" : "Save Wallet"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>

      <Separator className="bg-border" />

      {/* ── Section 2: Payment Methods (WHITE-LABEL) ─────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-usdt" />
          <h2 className="text-base font-medium text-foreground">
            Active Payment Methods
          </h2>
        </div>

        {/* Render grouped by category */}
        {Object.entries(grouped).map(([category, methods]) => (
          <Card key={category} className="bg-surface border-border">
            <CardHeader className="px-4 py-3 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
                {getCategoryLabel(category as DisplayMethod["category"])}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {methods.map((item) => (
                  <PaymentMethodRow
                    key={item.method.label + item.method.currency}
                    method={item.method}
                    status={item.status}
                    fee={item.fee}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Info footer */}
        <div className="flex items-start gap-2 rounded-lg border border-border bg-card/50 px-4 py-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Payment methods are managed and optimized by XPayments for maximum
            approval rates. Network icons represent accepted card brands and
            payment networks. Contact support to request additional methods.
          </p>
        </div>
      </section>
    </div>
  );
}