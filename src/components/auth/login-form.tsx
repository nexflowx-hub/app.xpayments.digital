"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Merchant Login Form
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/auth-schemas";
import { xpaymentsApi, XPaymentsApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const { setMerchant, setAuthView } = useAuthStore();
  const { t } = useT();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await xpaymentsApi.login({
        email: data.email,
        password: data.password,
      });
      setMerchant(response.token, response.user);
    } catch (error) {
      if (error instanceof XPaymentsApiError) {
        // Try to extract message from API error body
        const body = error.body as { message?: string } | undefined;
        setApiError(body?.message ?? error.message);
      } else {
        setApiError(t("auth.unexpected_error"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {t("auth.welcome_back")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.sign_in_subtitle")}
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
                  {t("auth.email")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="merchant@store.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-10 border-border bg-surface pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-usdt/30"
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
                  {t("auth.password")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="h-10 border-border bg-surface pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-usdt/30"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-1 h-10 w-full bg-usdt text-background font-semibold text-sm hover:bg-usdt/90 focus-visible:ring-usdt/50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("auth.authenticating")}
              </>
            ) : (
              <>
                {t("auth.sign_in")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{t("auth.no_account")}</span>
          <button
            type="button"
            onClick={() => setAuthView("register")}
            className="font-medium text-usdt hover:text-usdt/80 transition-colors"
          >
            {t("auth.create_one")}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setAuthView("admin-login")}
          className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        >
          {t("auth.admin_access")}
        </button>
      </div>
    </div>
  );
}