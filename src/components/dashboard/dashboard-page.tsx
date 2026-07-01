'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Wallet,
  ShieldAlert,
  RefreshCw,
  AlertCircle,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Inbox,
} from 'lucide-react';
import {
  xpApi,
  XPaymentsApiError,
  type MerchantDashboardTransaction,
} from '@/lib/api/client';
import type { AnalyticsOverview, RiskProfile } from '@/types/xpayments';
import { cn } from '@/lib/utils';

// ============================================================
// XPAYMENTS CORE — Merchant Dashboard V2
//
// Endpoints:
//   GET /wallets               → saldo disponível
//   GET /analytics/overview    → BI (faturação, conversão, revenue)
//   GET /risk/profile          → Risk Engine (score, reserva)
//   GET /merchant/:id/transactions → transações
//
// O middleware authenticateMerchant extrai o merchantId do JWT,
// pelo que não precisamos de o passar no URL para analytics/risk/crm.
// ============================================================

// ── Status Badge Styles ──

const TX_STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  SUCCESS: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PENDING_GATEWAY: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  INCOMING: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  PROCESSING: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  FAILED: 'bg-red-500/15 text-red-400 border-red-500/30',
  BLOCKED: 'bg-red-500/15 text-red-400 border-red-500/30',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function getStatusStyle(status: string | null | undefined): string {
  if (!status) return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
  return TX_STATUS_STYLES[status.toUpperCase()] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
}

function getStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  const labels: Record<string, string> = {
    COMPLETED: 'Concluído',
    SUCCESS: 'Sucesso',
    PENDING: 'Pendente',
    PENDING_GATEWAY: 'Gateway',
    INCOMING: 'Entrante',
    PROCESSING: 'Processando',
    FAILED: 'Falhou',
    BLOCKED: 'Bloqueado',
    REJECTED: 'Rejeitado',
  };
  return labels[status.toUpperCase()] || status;
}

// ── Format helpers ──

function formatUSDT(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return '₮ 0.00';
  return `₮ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFiat(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null || !isFinite(amount) || !currency) return '';
  const symbols: Record<string, string> = { EUR: '€', BRL: 'R$', USD: '$' };
  const symbol = symbols[currency.toUpperCase()] || currency;
  return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function truncateId(id: string): string {
  if (!id) return '—';
  return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

// ============================================================
// BI Card Component
// ============================================================

function BiCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  subValue,
  valueColor,
  isLoading,
  children,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subValue?: string;
  valueColor?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
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
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <>
          <p className={cn('text-2xl font-bold tabular-nums tracking-tight', valueColor || 'text-zinc-100')}>
            {value}
          </p>
          {subValue && <p className="text-[11px] text-zinc-600 mt-1">{subValue}</p>}
          {children}
        </>
      )}
    </div>
  );
}

// ============================================================
// Transactions Table Component
// ============================================================

function TransactionsTable({
  transactions,
  isLoading,
}: {
  transactions: MerchantDashboardTransaction[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="h-3 w-56 mt-1.5" />
        </div>
        <div className="divide-y divide-white/[0.04]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-200">Histórico Recente</h3>
        </div>
        <p className="text-xs text-zinc-600 mt-0.5">
          Últimas {transactions.length} transações
        </p>
      </div>

      {/* Content */}
      {transactions.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <Inbox className="size-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Sem transações registadas</p>
          <p className="text-xs text-zinc-600 mt-1">As transações aparecerão aqui após a primeira operação</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-5 py-3">
                    ID Transação
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                    Loja
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                    Montante (USDT)
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                    Fiat
                  </TableHead>
                  <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-5 py-3">
                    Data
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.04] transition-colors"
                  >
                    <TableCell className="px-5 py-3">
                      <span className="text-xs text-zinc-400 font-mono">
                        {truncateId(tx.id)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-zinc-300 truncate max-w-[180px] block">
                        {tx.store?.name || tx.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <span className="text-sm text-zinc-200 tabular-nums font-medium">
                        {formatUSDT(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <span className="text-xs text-zinc-500 tabular-nums">
                        {formatFiat(tx.fiatAmount, tx.fiatCurrency)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                          getStatusStyle(tx.status),
                        )}
                      >
                        {getStatusLabel(tx.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-right">
                      <span className="text-xs text-zinc-500">
                        {formatDateTime(tx.createdAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/[0.04]">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {truncateId(tx.id)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0 rounded-md border',
                      getStatusStyle(tx.status),
                    )}
                  >
                    {getStatusLabel(tx.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-200 font-medium truncate">
                      {tx.store?.name || tx.description || '—'}
                    </p>
                    {tx.fiatAmount != null && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {formatFiat(tx.fiatAmount, tx.fiatCurrency)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-zinc-200 tabular-nums font-semibold shrink-0 ml-3">
                    {formatUSDT(tx.amount)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600 mt-1.5">
                  {formatDateTime(tx.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// Main Component — Merchant Dashboard V2
// ============================================================

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  // ── States ──
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [risk, setRisk] = useState<RiskProfile | null>(null);
  const [transactions, setTransactions] = useState<MerchantDashboardTransaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      // 🚀 Dispara todas as chamadas em paralelo para o novo Backend V2!
      const [walletData, analyticsData, riskData, txData] = await Promise.all([
        xpApi.wallets.list(),          // Wallet Real-Time
        xpApi.analytics.getOverview(), // Motor de BI
        xpApi.risk.getProfile(),       // Risk Engine
        xpApi.merchant.getTransactions(user?.id || '', { limit: 10 }),
      ]);

      // Atualiza Estados
      if (Array.isArray(walletData) && walletData.length > 0) {
        const first = walletData[0] as Record<string, unknown>;
        setWalletBalance(typeof first.balance === 'number' ? first.balance : 0);
      }
      setAnalytics(analyticsData);
      setRisk(riskData);

      // Tratamento da tabela de transações (array ou paginado)
      if (Array.isArray(txData)) {
        setTransactions(txData);
      } else if (txData && Array.isArray((txData as { data: MerchantDashboardTransaction[] }).data)) {
        setTransactions((txData as { data: MerchantDashboardTransaction[] }).data);
      } else {
        setTransactions([]);
      }
    } catch (err: unknown) {
      if (err instanceof XPaymentsApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar o motor financeiro V2');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <TrendingUp className="size-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Performance da Loja</h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Powered by XPayments Analytics
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-white/[0.06]"
        >
          <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
          {refreshing ? 'A sincronizar...' : 'Atualizar Dados'}
        </Button>
      </div>

      {/* ── ALERTA DE ERRO ── */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle className="size-4 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-300">Erro ao carregar dados</p>
            <p className="text-[11px] text-red-400/70 mt-0.5 truncate">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchData()}
            className="h-7 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 shrink-0"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── BUSINESS INTELLIGENCE CARDS ── */}
      {!loading && analytics && risk ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Cartão 1: Saldo Disponível */}
          <BiCard
            icon={Wallet}
            iconBg="bg-emerald-500/[0.06]"
            iconColor="text-emerald-500"
            label="Saldo Disponível"
            value={`₮ ${walletBalance.toFixed(2)}`}
            valueColor="text-emerald-400"
          />

          {/* Cartão 2: Faturação Mensal */}
          <BiCard
            icon={BarChart3}
            iconBg="bg-sky-500/[0.06]"
            iconColor="text-sky-500"
            label="Faturação (Mês)"
            value={`$ ${analytics.timeframes.month.toFixed(2)}`}
            valueColor="text-sky-400"
            subValue={`Hoje: $ ${analytics.timeframes.today.toFixed(2)}`}
          />

          {/* Cartão 3: Taxa de Conversão */}
          <BiCard
            icon={PieChart}
            iconBg="bg-amber-500/[0.06]"
            iconColor="text-amber-500"
            label="Conversão"
            value={`${analytics.conversion.rate}%`}
            valueColor="text-amber-400"
            subValue={`${analytics.conversion.successful} pagamentos concluídos`}
          />

          {/* Cartão 4: Trust & Safety / Risk Score */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className={cn(
                'flex items-center justify-center size-9 rounded-lg',
                risk.riskScore < 40 ? 'bg-green-500/[0.06]' : 'bg-red-500/[0.06]',
              )}>
                <ShieldAlert className={cn(
                  'size-4',
                  risk.riskScore < 40 ? 'text-green-500' : 'text-red-500',
                )} />
              </div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Trust &amp; Safety
              </span>
            </div>
            <p className={cn(
              'text-2xl font-bold tabular-nums relative z-10',
              risk.riskScore < 40 ? 'text-green-400' : 'text-red-400',
            )}>
              {risk.riskScore} / 100
            </p>
            <p className="text-[11px] text-zinc-600 mt-1 relative z-10">
              {risk.reserve.active
                ? `Reserva ativa (${risk.reserve.percentRetained}%)`
                : 'Conta Saudável'}
            </p>

            {/* Security status badge */}
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                  risk.securityStatus === 'SAFE'
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                )}
              >
                {risk.securityStatus === 'SAFE' ? '✓ Seguro' : '⚠ Revisão'}
              </Badge>
            </div>

            {/* Risk score bar background */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  risk.riskScore < 40 ? 'bg-green-500/60' : risk.riskScore < 70 ? 'bg-amber-500/60' : 'bg-red-500/60',
                )}
                style={{ width: `${Math.min(risk.riskScore, 100)}%` }}
              />
            </div>
          </div>

        </div>
      ) : (
        /* Loading skeleton for BI cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* ── TRANSACTIONS TABLE ── */}
      <TransactionsTable transactions={transactions} isLoading={loading} />
    </div>
  );
}