"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Admin Login Form
// ─────────────────────────────────────────────────────────────────────────────
// Visually distinct: crimson/red accents to indicate restricted zone.
// Requires MFA code in addition to email + password.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldAlert,
  Mail,
  Lock,
  Hash,
  Loader2,
  ArrowRight,
  AlertCircle,
  Fingerprint,
} from "lucide-react";
import { adminLoginSchema, type AdminLoginFormData } from "@/lib/auth-schemas";
import { xpaymentsApi, XPaymentsApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminLoginForm() {
  const { setAdmin, setAuthView } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      mfaCode: "",
    },
  });

  async function onSubmit(data: AdminLoginFormData) {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await xpaymentsApi.adminLogin({
        email: data.email,
        password: data.password,
        mfaCode: data.mfaCode,
      });
      setAdmin(response.token, response.user);
    } catch (error) {
      if (error instanceof XPaymentsApiError) {
        const body = error.body as { message?: string } | undefined;
        setApiError(body?.message ?? error.message);
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Admin Console
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Multi-factor authentication required
        </p>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
        <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          This is a <span className="font-medium text-red-400">restricted area</span>.
          All actions are monitored and logged. Unauthorized access attempts will
          be reported.
        </p>
      </div>

      {/* API Error */}
      {apiError && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs text-destructive">
            {apiError}
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Admin Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="admin@xpayments.digital"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-10 border-border bg-surface pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-red-400/30"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="h-10 border-border bg-surface pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-red-400/30"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mfaCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  MFA Code
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      autoComplete="one-time-code"
                      disabled={isLoading}
                      className="h-10 border-border bg-surface pl-10 font-mono text-sm tracking-[0.3em] text-foreground placeholder:text-muted-foreground/50 placeholder:tracking-normal focus-visible:ring-red-400/30"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-[10px] text-muted-foreground/50">
                  6-digit code from your authenticator app
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-1 h-10 w-full bg-red-500 text-white font-semibold text-sm hover:bg-red-500/90 focus-visible:ring-red-400/50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying MFA...
              </>
            ) : (
              <>
                Access Admin Panel
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setAuthView("login")}
          className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        >
          ← Back to Merchant Login
        </button>
      </div>
    </div>
  );
}