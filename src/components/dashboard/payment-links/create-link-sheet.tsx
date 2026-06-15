"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Loader2,
  ImageIcon,
  Calendar,
  Link2,
  Info,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CurrencyCode, CreateLinkFormValues } from "./types";

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const createLinkSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name too long"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Must be a valid positive number"
    ),
  currency: z.enum(["BRL", "EUR", "USD", "USDT"] as const, {
    message: "Select a currency",
  }),
  description: z.string().max(500, "Description too long").optional().default(""),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional()
    .default(""),
  isReusable: z.boolean().default(true),
  collectShipping: z.boolean().default(false),
  collectTaxId: z.boolean().default(false),
  expiresAt: z.string().optional().default(""),
});

// ─── Currency options ─────────────────────────────────────────────────────────

const currencies: { value: CurrencyCode; label: string; symbol: string }[] = [
  { value: "BRL", label: "BRL — Brazilian Real", symbol: "R$" },
  { value: "EUR", label: "EUR — Euro", symbol: "€" },
  { value: "USD", label: "USD — US Dollar", symbol: "$" },
  { value: "USDT", label: "USDT — Tether", symbol: "₮" },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface CreateLinkSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLinkFormValues) => void;
  isSubmitting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateLinkSheet({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateLinkSheetProps) {
  const form = useForm<z.infer<typeof createLinkSchema>>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      name: "",
      amount: "",
      currency: "USD",
      description: "",
      imageUrl: "",
      isReusable: true,
      collectShipping: false,
      collectTaxId: false,
      expiresAt: "",
    },
  });

  // Reset form when sheet closes
  const handleClose = (value: boolean) => {
    if (!value) {
      form.reset();
    }
    onOpenChange(value);
  };

  const handleSubmit = (values: z.infer<typeof createLinkSchema>) => {
    onSubmit(values as CreateLinkFormValues);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg border-border bg-background p-0 overflow-y-auto"
      >
        {/* ── Header ── */}
        <SheetHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-usdt/15">
              <Plus className="h-4 w-4 text-usdt" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold text-foreground">
                Create Payment Link
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Generate a hosted checkout link for your product or service.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Form ── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-6 p-6"
          >
            {/* ── Product Information ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                Product Information
              </h3>

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground">
                      Product / Charge Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Premium VPN Subscription"
                        className="border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-usdt/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount + Currency */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-foreground">
                        Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="border-border bg-surface text-xs text-foreground tabular-nums placeholder:text-muted-foreground focus-visible:ring-usdt/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-foreground">
                        Currency
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="border-border bg-surface text-xs text-foreground w-full focus:ring-usdt/30">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border-border">
                          {currencies.map((c) => (
                            <SelectItem
                              key={c.value}
                              value={c.value}
                              className="text-xs text-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of what the customer will receive..."
                        className="border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-usdt/30 min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Optional. Shown on the hosted checkout page.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-border" />

            {/* ── Image ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                Product Image
              </h3>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground">
                      Image URL
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <div className="relative flex-1">
                          <ImageIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="https://example.com/product-image.jpg"
                            className="border-border bg-surface pl-8 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-usdt/30"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </div>
                    {/* Drag & Drop visual placeholder */}
                    <div className="mt-2 flex h-28 items-center justify-center rounded-lg border border-dashed border-border/70 bg-surface/50 transition-colors hover:border-muted-foreground/30">
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                        <span className="text-[11px] text-muted-foreground/60">
                          Drag &amp; drop or paste image URL
                        </span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-border" />

            {/* ── Configuration Toggles ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                Configuration
              </h3>

              {/* Reusable vs Single Use */}
              <FormField
                control={form.control}
                name="isReusable"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border bg-surface/50 p-3.5">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel className="text-xs font-medium text-foreground cursor-pointer">
                        Reusable Link
                      </FormLabel>
                      <FormDescription className="text-[10px]">
                        Allow multiple purchases. Uncheck for single-use (one sale, then expires).
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Collect Shipping */}
              <FormField
                control={form.control}
                name="collectShipping"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border bg-surface/50 p-3.5">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel className="text-xs font-medium text-foreground cursor-pointer">
                        Collect Shipping Address
                      </FormLabel>
                      <FormDescription className="text-[10px]">
                        Ask buyers for their delivery address at checkout.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Collect Tax ID */}
              <FormField
                control={form.control}
                name="collectTaxId"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border bg-surface/50 p-3.5">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel className="text-xs font-medium text-foreground cursor-pointer">
                        Collect Tax ID (CPF / NIF)
                      </FormLabel>
                      <FormDescription className="text-[10px]">
                        Require buyer to provide a tax identification number.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-border" />

            {/* ── Advanced ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Advanced
                </h3>
              </div>

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        Expiration Date (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="border-border bg-surface text-xs text-foreground focus-visible:ring-usdt/30 [color-scheme:dark]"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Leave empty for no expiration. Only applies to reusable links.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Submit ── */}
            <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/90 pt-5 backdrop-blur-sm">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full gap-2 bg-usdt text-xs font-semibold text-background shadow-none transition-all hover:bg-usdt/90 hover:shadow-lg hover:shadow-usdt/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Link...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Create Payment Link
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}