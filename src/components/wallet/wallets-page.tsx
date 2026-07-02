'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { currencySymbols, currencyColors } from '@/lib/formatting';
import type { Currency } from '@/types/xpayments';
import { xpApi, XPaymentsApiError } from '@/lib/api/client';
import { useNavStore } from '@/stores/nav-store';
import { cn } from '@/lib/utils';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  QrCode,
  TrendingUp,
  CircleDollarSign,
  Inbox,
} from 'lucide-react';

// ============================================================
// XPAYMENTS CORE — Wallets Page (V2)
//
// GET /wallets → [{ id, walletReference, currency, blockchainAddress,
//                  available, pending, reserve, balance, createdAt, updatedAt }]
//
// O backend devolve saldos segregados (Prisma):
//   available  → saldo livre para uso
//   pending    → aguardando confirmação
//   reserve    → retido por política de risco
// ============================================================

// ── Wallet type (loose — backend may add fields) ──

interface WalletData {
  id: string;
  walletReference?: string;
  currency: string;
  blockchainAddress?: string | null;
  balance?: number;
  available?: number;
  pending?: number;
  reserve?: number;
  balanceBlocked?: number;
  balanceIncoming?: number;
  balanceAvailable?: number;
  balancePending?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// ── Approximate rates to EUR for portfolio aggregation ──

const APPROX_RATES: Record<string, number> = {
  EUR: 1,
  BRL: 0.18,
  USDT: 0.93,
  USD: 0.92,
};

// ── Format helpers ──

function formatWalletCurrency(value: number, currency: string): string {
  const sym = currencySymbols[currency as Currency] || currency;
  const safe = Number(value) || 0;
  return `${sym} ${safe.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── KPI Card (matches dashboard BiCard pattern) ──

function WalletKpi({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  subValue,
  isLoading,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subValue?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('flex items-center justify-center size-9 rounded-lg', iconBg)}>
          <Icon className={cn('size-4', iconColor)} />
        </div>
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums tracking-tight">{value}</p>
          {subValue && <p className="text-[11px] text-zinc-600 mt-1">{subValue}</p>}
        </>
      )}
    </div>
  );
}

// ── Safe number extractor (handles Prisma Decimal strings) ──

function safeNum(val: unknown): number {
  if (typeof val === 'number') return isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const n = parseFloat(val);
    return isFinite(n) ? n : 0;
  }
  return 0;
}

// ============================================================
// Main Component
// ============================================================

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const setPage = useNavStore((s) => s.setPage);

  const fetchWallets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await xpApi.wallets.list();
      if (Array.isArray(res)) setWallets(res);
      else if (res && typeof res === 'object' && Array.isArray((res as { data: unknown }).data)) {
        setWallets((res as { data: WalletData[] }).data);
      } else {
        setWallets([]);
      }
    } catch (err: unknown) {
      if (err instanceof XPaymentsApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Erro ao carregar carteiras');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  // ── Computed values ──

  const uniqueCurrencies = useMemo(
    () => new Set(wallets.map((w) => w.currency)),
    [wallets],
  );

  const totalPortfolio = useMemo(
    () =>
      wallets.reduce((sum, w) => {
        const avail = safeNum(w.available ?? w.balanceAvailable);
        const rate = APPROX_RATES[w.currency] || 1;
        return sum + avail * rate;
      }, 0),
    [wallets],
  );

  const totalPending = useMemo(
    () =>
      wallets.reduce((sum, w) => sum + safeNum(w.pending ?? w.balancePending ?? w.balanceIncoming), 0),
    [wallets],
  );

  const totalReserve = useMemo(
    () => wallets.reduce((sum, w) => sum + safeNum(w.reserve ?? w.balanceBlocked), 0),
    [wallets],
  );

  const handleCopyAddress = (address: string, walletId: string) => {
    navigator.clipboard.writeText(address).catch(() => {});
    setCopiedId(walletId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <Wallet className="size-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Contas Digitais</h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Saldo segregado — Disponível, Pendente e Reserva
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchWallets(true)}
          disabled={refreshing}
          className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-white/[0.06]"
        >
          <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
          {refreshing ? 'A sincronizar...' : 'Atualizar'}
        </Button>
      </div>

      {/* ── ERROR ── */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle className="size-4 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-300">Erro ao carregar carteiras</p>
            <p className="text-[11px] text-red-400/70 mt-0.5 truncate">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchWallets()}
            className="h-7 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 shrink-0"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <WalletKpi
          icon={TrendingUp}
          iconBg="bg-emerald-500/[0.06]"
          iconColor="text-emerald-500"
          label="Portfolio Total"
          value={`€ ${totalPortfolio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue="Estimativa em EUR"
          isLoading={loading}
        />
        <WalletKpi
          icon={Wallet}
          iconBg="bg-sky-500/[0.06]"
          iconColor="text-sky-500"
          label="Carteiras"
          value={String(wallets.length)}
          subValue="Contas ativas"
          isLoading={loading}
        />
        <WalletKpi
          icon={CircleDollarSign}
          iconBg="bg-amber-500/[0.06]"
          iconColor="text-amber-500"
          label="A Receber"
          value={formatWalletCurrency(totalPending, 'USDT')}
          subValue="Entradas pendentes globais"
          isLoading={loading}
        />
        <WalletKpi
          icon={Lock}
          iconBg="bg-red-500/[0.06]"
          iconColor="text-red-500"
          label="Em Reserva"
          value={formatWalletCurrency(totalReserve, 'USDT')}
          subValue="Retido por política de risco"
          isLoading={loading}
        />
      </div>

      {/* ── LOADING SKELETON ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-40" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-16 text-center">
          <Inbox className="size-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Sem carteiras registadas</p>
          <p className="text-xs text-zinc-600 mt-1">As carteiras serão criadas automaticamente após o primeiro depósito</p>
        </div>
      ) : (
        /* ── WALLET CARDS ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((wallet) => {
            const isExpanded = expandedId === wallet.id;
            const colorClass = currencyColors[wallet.currency as Currency] || 'text-zinc-400';
            const symbol = currencySymbols[wallet.currency as Currency] || wallet.currency;

            // Compatibilidade com campos reais do Prisma (available, pending, reserve)
            // e fallback para campos antigos (balanceAvailable, balancePending, etc.)
            const available = safeNum(wallet.available ?? wallet.balanceAvailable);
            const pending = safeNum(wallet.pending ?? wallet.balancePending);
            const reserve = safeNum(wallet.reserve ?? wallet.balanceBlocked);
            const totalBalance = available + pending + reserve;

            return (
              <div
                key={wallet.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-colors duration-200"
              >
                {/* Card Header */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20">
                        <span className={cn('text-lg font-bold', colorClass)}>
                          {wallet.currency}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">
                          Carteira {wallet.currency}
                        </p>
                        <p className="text-xs text-zinc-600 font-mono mt-0.5">
                          {wallet.walletReference || wallet.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-2 py-0 h-5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                    >
                      Ativa
                    </Badge>
                  </div>
                </div>

                {/* Balance */}
                <div className="px-5 space-y-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Saldo Disponível</p>
                    <p className={cn('text-2xl font-bold tabular-nums', colorClass)}>
                      {formatWalletCurrency(available, wallet.currency)}
                    </p>
                  </div>

                  {/* Balance Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-md bg-amber-500/[0.06] flex items-center justify-center">
                        <Clock className="size-3.5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase">Pendente</p>
                        <p className="text-xs font-medium text-zinc-300 tabular-nums">
                          {symbol} {pending.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-md bg-red-500/[0.06] flex items-center justify-center">
                        <Lock className="size-3.5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase">Reserva / Risco</p>
                        <p className="text-xs font-medium text-zinc-300 tabular-nums">
                          {symbol} {reserve.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="size-7 rounded-md bg-emerald-500/[0.06] flex items-center justify-center">
                        <Wallet className="size-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase">Total Contabilístico</p>
                        <p className="text-xs font-medium text-zinc-300 tabular-nums">
                          {symbol} {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Address */}
                  {wallet.blockchainAddress && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <QrCode className="size-4 text-zinc-500 shrink-0" />
                      <p className="text-xs text-zinc-400 font-mono truncate flex-1">
                        {wallet.blockchainAddress}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 h-auto shrink-0 text-zinc-500 hover:text-zinc-300"
                        onClick={() => handleCopyAddress(wallet.blockchainAddress!, wallet.id)}
                      >
                        {copiedId === wallet.id ? (
                          <Check className="size-3 text-emerald-400" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Expand Button */}
                <div className="px-5 pt-3">
                  <div className="border-t border-white/[0.04] pt-3">
                    <Button
                      variant="ghost"
                      className="w-full h-8 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] gap-1"
                      onClick={() => setExpandedId(isExpanded ? null : wallet.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="size-3.5" />
                          Ocultar Detalhes
                        </>
                      ) : (
                        <>
                          <ChevronDown className="size-3.5" />
                          Detalhes
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5">
                    <div className="space-y-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">ID da Carteira</p>
                          <p className="text-xs text-zinc-300 font-mono mt-0.5">{wallet.id}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Referência</p>
                          <p className="text-xs text-zinc-300 font-mono mt-0.5">
                            {wallet.walletReference || '—'}
                          </p>
                        </div>
                        {wallet.createdAt && (
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Criada em</p>
                            <p className="text-xs text-zinc-300 mt-0.5">
                              {new Date(wallet.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                        {wallet.updatedAt && (
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Última atividade</p>
                            <p className="text-xs text-zinc-300 mt-0.5">
                              {new Date(wallet.updatedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                      {wallet.blockchainAddress && (
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Endereço Blockchain</p>
                          <p className="text-xs text-emerald-400 font-mono mt-0.5 break-all">
                            {wallet.blockchainAddress}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => setPage('deposits')}
                          className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <ArrowDownLeft className="size-3.5 mr-1.5" />
                          Depositar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPage('swaps')}
                          className="flex-1 h-8 text-xs border-white/[0.06] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
                        >
                          <TrendingUp className="size-3.5 mr-1.5" />
                          Converter (Swap)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPage('payouts')}
                          className="flex-1 h-8 text-xs border-white/[0.06] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
                        >
                          <ArrowUpRight className="size-3.5 mr-1.5" />
                          Sacar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}