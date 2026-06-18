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
  Clock,
  ArrowDownLeft,
  ShieldAlert,
  RefreshCw,
  AlertCircle,
  Activity,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import {
  xpApi,
  XPaymentsApiError,
  type MerchantDashboardResponse,
  type MerchantDashboardTransaction,
} from '@/lib/api/client';
import { cn } from '@/lib/utils';

// ============================================================
// XPAYMENTS CORE — Merchant Dashboard (Ledger Engine View)
//
// Endpoints:
//   GET /merchant/:merchantId/dashboard  → balances (AVAILABLE, PENDING, INCOMING, RESERVE)
//   GET /merchant/:merchantId/transactions → last N transactions
//
// merchantId comes from useAuthStore.user.id
// ============================================================

// ── Ledger Card Config ──

interface LedgerCardConfig {
  key: keyof NonNullable<MerchantDashboardResponse['balances']>;
  label: string;
  icon: React.ElementType;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  iconColor: string;
}

const LEDGER_CARDS: LedgerCardConfig[] = [
  {
    key: 'available',
    label: 'Disponível (USDT)',
    icon: Wallet,
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    bgColor: 'bg-emerald-500/[0.06]',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'pending',
    label: 'Em Processamento',
    icon: Clock,
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    bgColor: 'bg-amber-500/[0.06]',
    iconColor: 'text-amber-500',
  },
  {
    key: 'incoming',
    label: 'Volume Entrante',
    icon: ArrowDownLeft,
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-500/20',
    bgColor: 'bg-sky-500/[0.06]',
    iconColor: 'text-sky-500',
  },
  {
    key: 'reserve',
    label: 'Reserva de Risco',
    icon: ShieldAlert,
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    bgColor: 'bg-purple-500/[0.06]',
    iconColor: 'text-purple-500',
  },
];

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
// Ledger Card Component
// ============================================================

function LedgerCard({
  config,
  value,
  isLoading,
}: {
  config: LedgerCardConfig;
  value: number | undefined;
  isLoading: boolean;
}) {
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-colors',
        'border-white/[0.06] bg-white/[0.02]',
        'hover:bg-white/[0.04]',
        config.borderColor,
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('flex items-center justify-center size-9 rounded-lg', config.bgColor)}>
          <Icon className={cn('size-4', config.iconColor)} />
        </div>
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          {config.label}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <>
          <p className={cn('text-2xl font-bold tabular-nums tracking-tight', config.accentColor)}>
            {formatUSDT(value)}
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">Ledger Engine</p>
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
// Main Component — Merchant Dashboard
// ============================================================

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [dashboard, setDashboard] = useState<MerchantDashboardResponse | null>(null);
  const [transactions, setTransactions] = useState<MerchantDashboardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const merchantId = user?.id || '';

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const [dashData, txData] = await Promise.all([
        xpApi.merchant.getDashboard(merchantId),
        xpApi.merchant.getTransactions(merchantId, { limit: 10 }),
      ]);

      setDashboard(dashData);

      // Handle both array and paginated response
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
        setError('Erro ao carregar dados do dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const balances = dashboard?.balances;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <TrendingUp className="size-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Dashboard Financeiro</h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Visão geral Ledger Engine {user?.organizationName ? `· ${user.organizationName}` : ''}
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
          {refreshing ? 'A atualizar...' : 'Atualizar'}
        </Button>
      </div>

      {/* ── Error State ── */}
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

      {/* ── Ledger Cards (4 columns) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {LEDGER_CARDS.map((card) => (
          <LedgerCard
            key={card.key}
            config={card}
            value={balances?.[card.key]}
            isLoading={loading}
          />
        ))}
      </div>

      {/* ── Transactions Table ── */}
      <TransactionsTable transactions={transactions} isLoading={loading} />
    </div>
  );
}