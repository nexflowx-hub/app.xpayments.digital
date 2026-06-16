"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wallet, CreditCard, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/form";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const walletSchema = z.object({
  walletAddress: z.string().superRefine((val, ctx) => {
    const network = ctx.path[0] ? undefined : val; // handled via form-level
    // TRC-20: 34 chars starting with "T"
    if (val.startsWith("T") && val.length === 34) return z.NEVER;
    // ERC-20: 42 chars starting with "0x"
    if (val.startsWith("0x") && val.length === 42) return z.NEVER;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Must be a valid TRC-20 address (34 chars starting with "T") or ERC-20 address (42 chars starting with "0x")',
    });
  }),
  network: z.enum(["TRC-20", "ERC-20"]),
  label: z.string().min(1, "Label is required").max(50, "Label must be 50 characters or less"),
});

type WalletFormValues = z.infer<typeof walletSchema>;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  {
    name: "PIX",
    icon: CreditCard,
    currency: "BRL" as const,
    status: "active" as const,
    fee: "0.99%",
  },
  {
    name: "Credit Card",
    icon: CreditCard,
    currency: "BRL" as const,
    status: "active" as const,
    fee: "3.49%",
  },
  {
    name: "SEPA",
    icon: CreditCard,
    currency: "EUR" as const,
    status: "pending" as const,
    fee: "1.49%",
  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "active" | "pending" }) {
  if (status === "active") {
    return (
      <Badge variant="outline" className="border-usdt/30 text-usdt bg-usdt/10">
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-pending/30 text-pending bg-pending/10">
      Pending Activation
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SettingsBillingView() {
  const [saved, setSaved] = useState(false);

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      walletAddress: "",
      network: "TRC-20",
      label: "",
    },
  });

  function onSubmit(_data: WalletFormValues) {
    // In production, this would call the API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings / Billing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your USDT payout wallet and manage active payment methods.
        </p>
      </div>

      <Separator className="bg-border" />

      {/* ── Section 1: Payout Wallet (USDT) ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-usdt" />
          <h2 className="text-lg font-medium text-foreground">USDT Payout Wallet</h2>
        </div>

        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-base">USDT Payout Wallet</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Configure the wallet where your USDT payouts will be sent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="TXyz...abc123"
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Network</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TRC-20">TRC-20 (Tron)</SelectItem>
                            <SelectItem value="ERC-20">ERC-20 (Ethereum)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Main Operations Wallet"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="bg-usdt text-background hover:bg-usdt/90 font-medium"
                >
                  {saved ? (
                    <span className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Wallet Saved
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Save Wallet
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>

      <Separator className="bg-border" />

      {/* ── Section 2: Active Payment Methods ───────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-usdt" />
          <h2 className="text-lg font-medium text-foreground">Active Payment Methods</h2>
        </div>

        <Card className="bg-surface border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isPending = method.status === "pending";
                return (
                  <div
                    key={method.name}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-4"
                  >
                    {/* Icon + Name */}
                    <div className="flex items-center gap-3 sm:w-48">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-usdt/10">
                        <Icon className="h-4 w-4 text-usdt" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {method.name}
                      </span>
                    </div>

                    {/* Currency Badge */}
                    <div className="sm:w-20">
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {method.currency}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div className="sm:w-44">
                      <StatusBadge status={method.status} />
                    </div>

                    {/* Fee */}
                    <span className="text-sm text-muted-foreground sm:w-20">
                      {method.fee} fee
                    </span>

                    {/* Configure Button */}
                    <div className="sm:ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        className="border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}