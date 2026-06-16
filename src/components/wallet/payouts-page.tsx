'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { xpApi } from '@/lib/api/client';
import type { PayoutRequest, PayoutResponse, Wallet } from '@/types/xpayments';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  Info,
  CheckCircle2,
  Clock,
  Loader2,
  Wallet,
  AlertCircle,
} from 'lucide-react';

// ── Types ──

type DestinationCurrency = 'USDT' | 'EUR' | 'BRL';

interface CurrencyOption {
  value: DestinationCurrency;
  label: string;
  description: string;
  placeholder: string;
}

const CURRENCY_OPTIONS: CurrencyOption[] = [
  {
    value: 'USDT',
    label: 'USDT (Crypto — Instantâneo)',
    description: 'Crypto — Instantâneo',
    placeholder: 'Endereço da carteira de destino (TRC-20, ERC-20, etc.)',
  },
  {
    value: 'EUR',
    label: 'EUR (Transferência Bancária — D+1 OTC)',
    description: 'Transferência Bancária — D+1 OTC',
    placeholder: 'IBAN do destinatário (Ex: PT50 1234 5678 9012 3456 7890 12)',
  },
  {
    value: 'BRL',
    label: 'BRL (PIX — D+1 OTC)',
    description: 'PIX — D+1 OTC',
    placeholder: 'Chave PIX do destinatário (CPF, Email, Telefone ou Chave Aleatória)',
  },
];

function formatUSDT(value: number): string {
  return `₮ ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function truncateMiddle(str: string, maxLen = 20): string {
  if (str.length <= maxLen) return str;
  const start = str.slice(0, Math.ceil(maxLen / 2) + 2);
  const end = str.slice(-(Math.floor(maxLen / 2) - 2));
  return `${start}...${end}`;
}

// ── Component ──

export default function PayoutsPage() {
  // ── State: Wallet Data ──
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);

  // ── State: Form ──
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<DestinationCurrency | ''>('');
  const [destinationInfo, setDestinationInfo] = useState('');

  // ── State: Submission ──
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [payoutResult, setPayoutResult] = useState<PayoutResponse | null>(null);

  // ── Derived ──
  const usdtWallet = wallets.find((w) => w.currency === 'USDT');
  const availableBalance = usdtWallet?.balanceAvailable ?? 0;
  const numericAmount = parseFloat(amount) || 0;

  const selectedCurrencyOption = CURRENCY_OPTIONS.find((opt) => opt.value === selectedCurrency);
  const placeholderText = selectedCurrencyOption?.placeholder ?? '';
  const isFiat = selectedCurrency === 'EUR' || selectedCurrency === 'BRL';

  // ── Validation ──
  const validationError = (() => {
    if (numericAmount <= 0) return 'O montante deve ser maior que zero.';
    if (numericAmount > availableBalance) return 'Saldo disponível insuficiente.';
    if (!selectedCurrency) return 'Selecione a moeda de recebimento.';
    if (!destinationInfo.trim()) return 'Preencha os detalhes de destino.';
    return null;
  })();

  const canSubmit = !validationError && numericAmount > 0 && selectedCurrency !== '' && destinationInfo.trim() !== '';

  // ── Fetch Wallets ──
  const fetchWallets = useCallback(async () => {
    try {
      setLoadingWallets(true);
      const data = await xpApi.wallets.list();
      if (Array.isArray(data)) {
        setWallets(data);
      }
    } catch {
      // Silently fail — user sees skeleton state
    } finally {
      setLoadingWallets(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  // ── Handlers ──
  const handleUseMax = () => {
    if (availableBalance > 0) {
      setAmount(availableBalance.toString());
    }
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value as DestinationCurrency);
    setDestinationInfo('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const request: PayoutRequest = {
        amountUSDT: numericAmount,
        requestedCurrency: selectedCurrency as PayoutRequest['requestedCurrency'],
        destinationInfo: destinationInfo.trim(),
      };

      const result = await xpApi.payouts.create(request);
      setPayoutResult(result);
      setSubmitted(true);
      toast.success('Payout solicitado com sucesso!');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao solicitar o payout. Tente novamente.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setSelectedCurrency('');
    setDestinationInfo('');
    setSubmitted(false);
    setPayoutResult(null);
  };

  // ── Render ──

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ─────────────────────────────────────────────
          HERO: USDT Available Balance
          ───────────────────────────────────────────── */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden relative">
        {/* Subtle neon glow background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-500/[0.03] to-transparent pointer-events-none" />
        <CardHeader className="pb-2 relative">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="size-4 text-neon-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Saldo Disponível para Payout
            </span>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {loadingWallets ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-48 bg-zinc-800" />
              <Skeleton className="h-4 w-64 bg-zinc-800" />
            </div>
          ) : usdtWallet ? (
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-neon-400 text-neon-glow tracking-tight">
                {formatUSDT(availableBalance)}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                USDT disponível para payout
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl text-zinc-400 font-medium">
                Conecte-se para ver o seu saldo
              </p>
              <p className="text-sm text-zinc-600 mt-1">
                Nenhuma carteira USDT encontrada.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────
          PAYOUT FORM
          ───────────────────────────────────────────── */}
      {!submitted && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <ArrowUpRight className="size-4 text-neon-400" />
              Solicitar Payout
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-5">
            {/* ── Montante (USDT) ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                  Montante (USDT)
                </Label>
                <button
                  type="button"
                  className="text-[11px] text-neon-400 hover:text-neon-300 font-medium transition-colors"
                  onClick={handleUseMax}
                >
                  Usar máximo
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                  ₮
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 pl-8 pr-4 text-2xl font-bold border-zinc-700 bg-zinc-800/50 text-zinc-100 text-right focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
                  min="0"
                  step="0.01"
                />
              </div>
              {/* Inline validation feedback */}
              {numericAmount > availableBalance && availableBalance > 0 && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3" />
                  Saldo insuficiente
                </p>
              )}
            </div>

            {/* ── Moeda de Recebimento ── */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                Moeda de Recebimento
              </Label>
              <Select
                value={selectedCurrency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger className="w-full h-11 border-zinc-700 bg-zinc-800/50 text-zinc-100 focus:ring-neon-500/30 focus:border-neon-500/50">
                  <SelectValue placeholder="Selecione a moeda de recebimento" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Detalhes de Destino ── */}
            {selectedCurrency && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                  Detalhes de Destino
                </Label>
                <Textarea
                  placeholder={placeholderText}
                  value={destinationInfo}
                  onChange={(e) => setDestinationInfo(e.target.value)}
                  className="min-h-24 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-600 text-sm focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50 resize-none"
                />
              </div>
            )}

            {/* ── Disclaimer Alert ── */}
            <Alert className="bg-amber-500/5 border-amber-500/20 text-amber-400">
              <Info className="size-4 text-amber-400" />
              <AlertDescription className="text-xs text-amber-400">
                Os pedidos de Payout em Fiat (EUR/BRL) são processados
                manualmente pelo nosso balcão financeiro (OTC) num prazo de
                D+1. Payouts em USDT (crypto) são processados automaticamente.
              </AlertDescription>
            </Alert>

            {/* ── Submit Button ── */}
            <Button
              className="w-full h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium transition-all duration-200"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  <ArrowUpRight className="size-4 mr-1.5" />
                  Solicitar Payout
                  {numericAmount > 0 && ` — ${formatUSDT(numericAmount)}`}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─────────────────────────────────────────────
          SUCCESS STATE
          ───────────────────────────────────────────── */}
      {submitted && payoutResult && (
        <Card className="bg-zinc-900/50 border-neon-500/30 shadow-lg shadow-neon-500/5">
          <CardContent className="p-6 space-y-5">
            {/* Success Icon */}
            <div className="text-center space-y-2">
              <div className="inline-flex size-14 rounded-full bg-neon-500/10 border border-neon-500/20 items-center justify-center">
                <CheckCircle2 className="size-7 text-neon-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">
                Payout Solicitado com Sucesso
              </h3>
            </div>

            {/* Payout Details */}
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Montante</span>
                <span className="text-sm font-bold text-neon-400">
                  {formatUSDT(payoutResult.amountUSDT)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Moeda de Recebimento</span>
                <span className="text-sm font-medium text-zinc-200">
                  {payoutResult.requestedCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Detalhes de Destino</span>
                <span className="text-xs font-mono text-zinc-300 max-w-[200px] truncate text-right">
                  {truncateMiddle(payoutResult.destinationInfo)}
                </span>
              </div>
              <Separator className="bg-zinc-700/50" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Payout ID</span>
                <span className="text-xs font-mono text-zinc-400">
                  {payoutResult.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Previsão de Receção</span>
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                  <Clock className="size-3" />
                  {payoutResult.estimatedArrival}
                </span>
              </div>
            </div>

            {/* Fiat Warning */}
            {(payoutResult.requestedCurrency === 'EUR' || payoutResult.requestedCurrency === 'BRL') && (
              <Alert className="bg-amber-500/5 border-amber-500/20 text-amber-400">
                <Clock className="size-4 text-amber-400" />
                <AlertDescription className="text-xs text-amber-400">
                  Este payout em {payoutResult.requestedCurrency} será processado
                  manualmente pelo nosso balcão financeiro (OTC). O prazo estimado
                  é D+1 (próximo dia útil).
                </AlertDescription>
              </Alert>
            )}

            {/* Crypto Message */}
            {payoutResult.requestedCurrency === 'USDT' && (
              <Alert className="bg-neon-500/5 border-neon-500/20">
                <CheckCircle2 className="size-4 text-neon-400" />
                <AlertDescription className="text-xs text-neon-400/80">
                  O seu payout em USDT está a ser processado automaticamente. A
                  transferência será concluída em poucos minutos após a confirmação
                  na blockchain.
                </AlertDescription>
              </Alert>
            )}

            {/* New Payout Button */}
            <Button
              variant="outline"
              className="w-full h-10 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              onClick={handleReset}
            >
              Novo Payout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
