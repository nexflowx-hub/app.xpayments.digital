'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { xpApi, XPaymentsApiError } from '@/lib/api/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShieldCheck,
  Lock,
  Store,
  AlertTriangle,
  Loader2,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──

interface CheckoutSession {
  amountFiat: number;
  currency: string;
  storeName: string;
  logoUrl?: string;
  primaryColor?: string;
}

interface CheckoutFormData {
  fullName: string;
  email: string;
  taxId: string;
}

// ── Helpers ──

function formatAmount(amount: number, currency: string): string {
  const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '\u20ac', BRL: 'R$' };
  return symbols[currency.toUpperCase()] || currency;
}

// ── Sub-components ──

function SessionSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="h-14 w-14 rounded-2xl mx-auto mb-4 bg-white/[0.04]" />
        <Skeleton className="h-5 w-40 mx-auto mb-2 bg-white/[0.04]" />
        <Skeleton className="h-3 w-24 mx-auto bg-white/[0.03]" />
      </div>

      {/* Amount card skeleton */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
        <Skeleton className="h-4 w-20 mb-3 bg-white/[0.03]" />
        <Skeleton className="h-10 w-48 mx-auto mb-1 bg-white/[0.05]" />
        <Skeleton className="h-3 w-16 mx-auto bg-white/[0.03]" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 bg-white/[0.03]" />
          <Skeleton className="h-11 w-full rounded-xl bg-white/[0.04]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 bg-white/[0.03]" />
          <Skeleton className="h-11 w-full rounded-xl bg-white/[0.04]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-white/[0.03]" />
          <Skeleton className="h-11 w-full rounded-xl bg-white/[0.04]" />
        </div>
      </div>

      <Skeleton className="h-12 w-full rounded-xl bg-white/[0.04]" />
    </div>
  );
}

function SessionError({ message }: { message: string }) {
  return (
    <div className="w-full max-w-md mx-auto text-center animate-fade-in">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 mx-auto mb-5">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Sess\u00e3o Expirada ou Inv\u00e1lida
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
          {message}
        </p>
      </div>
      <p className="mt-6 text-xs text-zinc-600">
        Se acredita que isto \u00e9 um erro, contacte o suporte da loja.
      </p>
    </div>
  );
}

// ── Main Checkout Page ──

export default function CheckoutPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  // State
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    taxId: '',
  });
  const [emailTouched, setEmailTouched] = useState(false);

  // ── Fetch session on mount ──
  useEffect(() => {
    if (!sessionId) {
      setError('ID de sess\u00e3o n\u00e3o fornecido no URL.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSession() {
      try {
        const data = await xpApi.checkout.getSession(sessionId);
        if (!cancelled) {
          setSession(data);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof XPaymentsApiError) {
          if (err.status === 404 || err.status === 410) {
            setError('Esta sess\u00e3o de pagamento n\u00e3o existe ou j\u00e1 foi utilizada.');
          } else if (err.status === 401) {
            setError('Esta sess\u00e3o de pagamento expirou ou n\u00e3o \u00e9 v\u00e1lida.');
          } else {
            setError(err.message || 'Ocorreu um erro ao carregar a sess\u00e3o de pagamento.');
          }
        } else {
          setError('N\u00e3o foi poss\u00edvel conectar ao servidor de pagamentos.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSession();
    return () => { cancelled = true; };
  }, [sessionId]);

  // ── Form handlers ──
  const updateField = useCallback(
    (field: keyof CheckoutFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (field === 'email') setEmailTouched(false);
        setSubmitError(null);
      },
    [],
  );

  const isEmailInvalid = emailTouched && formData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Validate email
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setEmailTouched(true);
        setSubmitError('Insira um email v\u00e1lido.');
        return;
      }

      if (!sessionId) return;
      setSubmitting(true);

      try {
        // The price is NEVER sent by the client — only the sessionId + customer details
        const result = await xpApi.checkout.initiate({
          sessionId,
          customerDetails: {
            email: formData.email,
            fullName: formData.fullName || undefined,
            taxId: formData.taxId || undefined,
          },
        });

        // Redirect to the gateway checkout URL if provided
        if (result?.gateway && result?.checkoutData) {
          const checkoutData = result.checkoutData as { checkoutUrl?: string; redirectUrl?: string; url?: string };
          const redirectUrl = checkoutData.checkoutUrl || checkoutData.redirectUrl || checkoutData.url;
          if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
          }
        }

        // If no redirect URL, show success state (gateway handles UI)
        setSession((prev) => prev ? { ...prev, storeName: 'Pagamento processado com sucesso!' } : prev);
      } catch (err: unknown) {
        if (err instanceof XPaymentsApiError) {
          setSubmitError(err.message || 'Falha ao processar o pagamento.');
        } else {
          setSubmitError('N\u00e3o foi poss\u00edvel conectar ao servidor.');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [sessionId, formData],
  );

  // ── Render ──

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020817] px-4 py-8">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#020817] via-[#040d1a] to-[#020817] pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* XPayments brand badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#2563eb]">
            <span className="text-[10px] font-extrabold text-white">XP</span>
          </div>
          <span className="text-xs font-semibold tracking-tight text-zinc-500">XPayments</span>
        </div>

        {loading && <SessionSkeleton />}

        {error && !loading && <SessionError message={error} />}

        {session && !loading && !error && (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto animate-fade-in"
          >
            {/* ── Store Header ── */}
            <div className="text-center mb-6">
              {session.logoUrl ? (
                <img
                  src={session.logoUrl}
                  alt={session.storeName}
                  className="h-14 w-14 rounded-2xl mx-auto mb-4 object-cover border border-white/[0.06] bg-white/[0.04]"
                />
              ) : (
                <div
                  className="flex items-center justify-center h-14 w-14 rounded-2xl mx-auto mb-4 border border-white/[0.06]"
                  style={{ backgroundColor: session.primaryColor ? `${session.primaryColor}15` : 'rgba(255,255,255,0.03)' }}
                >
                  <Store
                    className="h-6 w-6"
                    style={{ color: session.primaryColor || '#2563eb' }}
                  />
                </div>
              )}
              <h2 className="text-base font-semibold text-white">{session.storeName}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Pagamento seguro via XPayments</p>
            </div>

            {/* ── Amount Card ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">
                Valor a Pagar
              </p>
              <p className="text-3xl font-bold tracking-tight text-white tabular-nums">
                {formatAmount(session.amountFiat, session.currency)}
              </p>
              <p className="text-xs text-zinc-600 mt-1.5">
                {session.currency.toUpperCase()} \u00b7 Pre\u00e7o bloqueado na sess\u00e3o
              </p>
            </div>

            {/* ── Customer Details ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Dados do Cliente
                </span>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="checkout-name" className="text-xs font-medium text-zinc-400">
                  Nome Completo <span className="text-zinc-600">(opcional)</span>
                </Label>
                <Input
                  id="checkout-name"
                  type="text"
                  placeholder="Jo\u00e3o Silva"
                  value={formData.fullName}
                  onChange={updateField('fullName')}
                  autoComplete="name"
                  className="h-11 border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-zinc-600 focus-visible:border-[#2563eb]/40 focus-visible:ring-[#2563eb]/15 rounded-xl"
                />
              </div>

              {/* Email (required) */}
              <div className="space-y-1.5">
                <Label htmlFor="checkout-email" className="text-xs font-medium text-zinc-400">
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="checkout-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={updateField('email')}
                  onBlur={() => setEmailTouched(true)}
                  autoComplete="email"
                  required
                  className={cn(
                    'h-11 border bg-white/[0.03] text-sm text-white placeholder:text-zinc-600 rounded-xl focus-visible:ring-[#2563eb]/15',
                    isEmailInvalid
                      ? 'border-red-500/40 focus-visible:border-red-500/60'
                      : 'border-white/[0.08] focus-visible:border-[#2563eb]/40',
                  )}
                />
                {isEmailInvalid && (
                  <p className="text-[11px] text-red-400 mt-1">Insira um email v\u00e1lido.</p>
                )}
              </div>

              {/* Tax ID */}
              <div className="space-y-1.5">
                <Label htmlFor="checkout-taxid" className="text-xs font-medium text-zinc-400">
                  NIF / CPF <span className="text-zinc-600">(opcional)</span>
                </Label>
                <Input
                  id="checkout-taxid"
                  type="text"
                  placeholder={session.currency.toUpperCase() === 'BRL' ? '000.000.000-00' : '123456789'}
                  value={formData.taxId}
                  onChange={updateField('taxId')}
                  autoComplete="off"
                  className="h-11 border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-zinc-600 focus-visible:border-[#2563eb]/40 focus-visible:ring-[#2563eb]/15 rounded-xl"
                />
              </div>
            </div>

            {/* ── Submit Error ── */}
            {submitError && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">{submitError}</p>
              </div>
            )}

            {/* ── Pay Button ── */}
            <Button
              type="submit"
              disabled={submitting || !formData.email}
              className="h-12 w-full gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-[0_12px_32px_-10px_rgba(37,99,235,0.6)] transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A processar pagamento...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pagar {formatAmount(session.amountFiat, session.currency)}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>

            {/* ── Security Footer ── */}
            <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-zinc-600">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Pagamento Seguro</span>
              </div>
              <span className="text-zinc-800">\u2022</span>
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                <span>Encripta\u00e7\u00e3o SSL</span>
              </div>
              <span className="text-zinc-800">\u2022</span>
              <span>Pre\u00e7o Bloqueado</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}