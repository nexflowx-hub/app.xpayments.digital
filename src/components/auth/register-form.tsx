"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Merchant Registration Form
// ─────────────────────────────────────────────────────────────────────────────
// On successful registration, shows a modal alerting the user to copy
// their secretKey (only shown once).

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Store,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Key,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  registerSchema,
  type RegisterFormData,
  type RegisterResponse,
} from "@/lib/auth-schemas";
import { xpaymentsApi, XPaymentsApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";
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
import { Separator } from "@/components/ui/separator";

// ─── Password Strength Indicator ────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.met).length;

  const color =
    strength <= 1
      ? "text-destructive"
      : strength <= 2
        ? "text-pending"
        : strength <= 3
          ? "text-foreground"
          : "text-usdt";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength
                ? strength <= 1
                  ? "bg-destructive"
                  : strength <= 2
                    ? "bg-pending"
                    : strength <= 3
                      ? "bg-foreground/40"
                      : "bg-usdt"
                : "bg-surface-raised"
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((check) => (
          <span
            key={check.label}
            className={`text-[10px] transition-colors ${
              check.met ? color : "text-muted-foreground/40"
            }`}
          >
            {check.met ? "✓" : "○"} {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Success Modal (Secret Key) ─────────────────────────────────────────────

function SecretKeyModal({
  response,
  onContinue,
}: {
  response: RegisterResponse;
  onContinue: () => void;
}) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);

  function copyKey() {
    navigator.clipboard.writeText(response.secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Success icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-usdt/10 border border-usdt/20">
          <ShieldCheck className="h-7 w-7 text-usdt" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t("auth.account_created")}
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {t("auth.start_accepting")}
          </p>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Keys */}
      <div className="flex flex-col gap-4">
        {/* Public Key */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("developers.public_key")}
          </span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3">
            <code className="flex-1 truncate text-xs font-mono text-foreground/80">
              {response.publicKey}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(response.publicKey);
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Secret Key (highlighted) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-destructive">
              {t("developers.secret_key")}
            </span>
            <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-destructive">
              {t("auth.save_secret_now")}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <Key className="h-4 w-4 shrink-0 text-destructive" />
            <code className="flex-1 break-all text-xs font-mono text-foreground/80">
              {response.secretKey}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="shrink-0 rounded-md bg-destructive/10 px-2 py-1 text-destructive hover:bg-destructive/20 transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Warning */}
      <div className="flex items-start gap-2.5 rounded-lg border border-pending/20 bg-pending/5 p-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-pending" />
        <p
          className="text-[11px] leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: t("auth.secret_key_warning") }}
        />
      </div>

      {/* CTA */}
      <Button
        onClick={onContinue}
        className="h-10 w-full bg-usdt text-background font-semibold text-sm hover:bg-usdt/90 focus-visible:ring-usdt/50"
      >
        {t("auth.saved_key_continue")}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Registration Form ──────────────────────────────────────────────────────

export function RegisterForm() {
  const { setRegistrationData, setAuthView } = useAuthStore();
  const { t } = useT();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [registrationData, setRegistrationDataLocal] =
    useState<RegisterResponse | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      storeName: "",
      email: "",
      password: "",
    },
  });

  const watchPassword = form.watch("password");

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await xpaymentsApi.register({
        storeName: data.storeName,
        email: data.email,
        password: data.password,
      });
      setRegistrationDataLocal(response);
    } catch (error) {
      if (error instanceof XPaymentsApiError) {
        const body = error.body as { message?: string } | undefined;
        setApiError(body?.message ?? error.message);
      } else {
        setApiError(t("auth.unexpected_error"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinue() {
    if (!registrationData) return;
    setRegistrationData(
      registrationData.token,
      registrationData.user,
      registrationData.secretKey
    );
  }

  // Show secret key modal after successful registration
  if (registrationData) {
    return <SecretKeyModal response={registrationData} onContinue={handleContinue} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {t("auth.create_account")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.start_accepting")}
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  {t("auth.store_name")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("auth.store_name_placeholder")}
                      autoComplete="organization"
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
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-10 border-border bg-surface pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-usdt/30"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                {watchPassword && (
                  <FormDescription className="mt-1">
                    <PasswordStrength password={watchPassword} />
                  </FormDescription>
                )}
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
                {t("auth.creating_account")}
              </>
            ) : (
              <>
                {t("auth.create_account")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{t("auth.already_have_account")}</span>
          <button
            type="button"
            onClick={() => setAuthView("login")}
            className="font-medium text-usdt hover:text-usdt/80 transition-colors"
          >
            {t("auth.sign_in")}
          </button>
        </div>
      </div>
    </div>
  );
}