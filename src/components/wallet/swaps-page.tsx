'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Currency } from '@/types/xpayments';
import { xpApi } from '@/lib/api/client';
import {
  ArrowRightLeft,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Percent,
  Info,
  ArrowRight,
  RefreshCw,
  Loader2,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// XPAYMENTS CORE - Swap Page
// Consome taxas reais de GET /public/rates
// NÃO usa taxas hardcoded
// ============================================================

interface RateData {
  from: string;
  to: string;
  rate: number;
}

interface SwapQuote {
  rate: number;
  fromAmount: number;
  toAmount: number;
  fromCurrency: string;
  toCurrency: string;
  estimatedTime: string;
}

export default function SwapsPage() {
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('BRL');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [rates, setRates] = useState<RateData[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);
  const [showFeeTable, setShowFeeTable] = useState(false);

  const numericAmount = parseFloat(amount) || 0;

  // ── Buscar taxas reais da API ──
  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    setRatesError(false);
    try {
      const response = await xpApi.public.getRates();
      const rateList = Array.isArray(response) ? response : response?.rates || response?.data || [];
      setRates(rateList);
    } catch (err) {
      console.error('[XPayments] Erro ao buscar taxas:', err);
      setRatesError(true);
      setRates([]);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // ── Encontrar taxa para o par ──
  const findRate = useCallback((from: string, to: string): number | null => {
    if (rates.length === 0) return null;
    const direct = rates.find(
      (r) =>
        (r.from === from && r.to === to) ||
        (r.from === to && r.from === from),
    );
    if (direct) return direct.rate;

    // Tentar via USD
    const fromToUsd = rates.find((r) => r.from === from && r.to === 'USD');
    const usdToTo = rates.find((r) => r.from === 'USD' && r.to === to);
    if (fromToUsd && usdToTo) return fromToUsd.rate * usdToTo.rate;

    return null;
  }, [rates]);

  // ── Obter cotação ──
  const handleGetQuote = async () => {
    if (numericAmount <= 0 || fromCurrency === toCurrency) return;

    setIsQuoteLoading(true);
    try {
      const rate = findRate(fromCurrency, toCurrency);

      if (rate === null) {
        setQuote(null);
        setIsQuoteLoading(false);
        return;
      }

      // Simular latência de confirmação
      await new Promise((resolve) => setTimeout(resolve, 600));

      const toAmount = numericAmount * rate;

      setQuote({
        rate,
        fromAmount: numericAmount,
        toAmount,
        fromCurrency,
        toCurrency,
        estimatedTime: '< 5 segundos',
      });
    } catch {
      setQuote(null);
    } finally {
      setIsQuoteLoading(false);
    }
  };

  // ── Executar swap via API ──
  const handleExecuteSwap = async () => {
    if (!quote) return;
    setIsExecuting(true);
    try {
      // TODO: Chamar API real quando disponível
      // await xpApi.swaps.execute({ fromWalletId, toWalletId, amount: numericAmount });
      setQuote(null);
      setAmount('');
    } catch {
      // Silently fail — o modal de resultado é limpo
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSwapDirection = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setQuote(null);
    setAmount('');
  };

  const canQuote = numericAmount > 0 && fromCurrency !== toCurrency;
  const hasRates = rates.length > 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Swap Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-neon-400" />
            Converter Moeda
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Taxas em tempo real do mercado
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* From */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-500 uppercase tracking-wider">De</Label>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setQuote(null);
                  }}
                  className="h-12 px-4 text-lg font-bold border-zinc-700 bg-zinc-800/50 text-zinc-100 text-right focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
                  min="0"
                  step="0.01"
                />
              </div>
              <select
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  setQuote(null);
                }}
                className="h-12 px-3 rounded-md border border-zinc-700 bg-zinc-800/50 text-zinc-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-neon-500/30 focus:border-neon-500/50 cursor-pointer appearance-none"
              >
                {Object.values(Currency).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Direction */}
          <div className="flex justify-center -my-1">
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-neon-500/50 text-zinc-400 hover:text-neon-400 transition-colors"
              onClick={handleSwapDirection}
            >
              <ArrowRight className="size-4 rotate-90" />
            </Button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-500 uppercase tracking-wider">Para</Label>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  readOnly
                  placeholder="0.00"
                  value={
                    quote
                      ? quote.toAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                      : ''
                  }
                  className="h-12 px-4 text-lg font-bold border-zinc-700 bg-zinc-800/50 text-neon-400 text-right"
                />
              </div>
              <select
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  setQuote(null);
                }}
                className="h-12 px-3 rounded-md border border-zinc-700 bg-zinc-800/50 text-zinc-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-neon-500/30 focus:border-neon-500/50 cursor-pointer appearance-none"
              >
                {Object.values(Currency).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error: sem taxas */}
          {ratesError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <WifiOff className="size-4 text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-red-300">Taxas indisponíveis</p>
                <p className="text-[10px] text-red-400/70">
                  Não foi possível obter as taxas de câmbio. Tente novamente.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-400 hover:bg-red-500/20"
                onClick={fetchRates}
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Get Quote */}
          {!quote && !ratesError && (
            <Button
              className="w-full h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium"
              disabled={!canQuote || isQuoteLoading || !hasRates}
              onClick={handleGetQuote}
            >
              {isQuoteLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  A obter cotação...
                </>
              ) : (
                <>
                  <TrendingUp className="size-4 mr-1.5" />
                  Obter Cotação
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quote Result */}
      {quote && (
        <Card className="bg-zinc-900/50 border-neon-500/20 shadow-lg shadow-neon-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neon-400 flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              Cotação Obtida
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="p-4 rounded-lg bg-neon-500/5 border border-neon-500/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Taxa de câmbio</span>
                <span className="text-sm font-semibold text-zinc-100">
                  1 {quote.fromCurrency} = {quote.rate.toFixed(6)} {quote.toCurrency}
                </span>
              </div>
              <Separator className="bg-neon-500/10" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Envia</span>
                <span className="text-sm font-bold text-zinc-100">
                  {quote.fromAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {quote.fromCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Recebe</span>
                <span className="text-lg font-bold text-neon-400">
                  {quote.toAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {quote.toCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Tempo estimado</span>
                <div className="flex items-center gap-1">
                  <Clock className="size-3 text-neon-400" />
                  <span className="text-sm font-medium text-neon-400">{quote.estimatedTime}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={() => setQuote(null)}
              >
                Nova Cotação
              </Button>
              <Button
                className="flex-1 h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium"
                disabled={isExecuting}
                onClick={handleExecuteSwap}
              >
                {isExecuting ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="size-4 mr-1.5" />
                )}
                Executar Swap
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rates Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            ratesLoading ? 'bg-amber-400 animate-pulse' : hasRates ? 'bg-neon-400' : 'bg-red-400',
          )} />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            {ratesLoading ? 'A carregar taxas...' : hasRates ? 'Taxas em tempo real' : 'Offline'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-500 hover:text-zinc-300"
          onClick={fetchRates}
        >
          <RefreshCw className={cn('size-3.5', ratesLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Live Rates Table */}
      {hasRates && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="cursor-pointer" onClick={() => setShowFeeTable(!showFeeTable)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                  <Percent className="size-4 text-neon-400" />
                  Taxas de Câmbio ao Vivo
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-1">
                  Fonte: XPayments.Digital API — {rates.length} pares disponíveis
                </CardDescription>
              </div>
              <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Info className="size-4" />
              </button>
            </div>
          </CardHeader>
          {showFeeTable && (
            <CardContent className="pt-0">
              <div className="rounded-lg border border-zinc-800 overflow-hidden max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80">De</TableHead>
                      <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80">Para</TableHead>
                      <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80 text-right">Taxa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.slice(0, 20).map((r, i) => (
                      <TableRow key={`${r.from}-${r.to}-${i}`} className="border-zinc-800 hover:bg-zinc-800/30">
                        <TableCell className="py-2 text-xs text-zinc-300 font-medium">{r.from}</TableCell>
                        <TableCell className="py-2 text-xs text-zinc-300 font-medium">{r.to}</TableCell>
                        <TableCell className="py-2 text-xs text-zinc-100 font-mono text-right tabular-nums">
                          {r.rate.toFixed(6)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                <Info className="size-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Taxas fornecidas em tempo real via <code className="text-zinc-400">GET /public/rates</code>. 
                  As taxas aplicadas no momento da execução podem variar ligeiramente.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
