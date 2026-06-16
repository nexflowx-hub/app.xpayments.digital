'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useNavStore } from '@/stores/nav-store';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Wallet,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  DollarSign,
  ArrowRight,
  RefreshCw,
  WifiOff,
  ServerCrash,
} from 'lucide-react';
import { xpApi } from '@/lib/api/client';
import {
  currencySymbols,
  currencyColors,
  transactionTypeLabels,
  transactionStatusColors,
} from '@/lib/mock-data';
import type { Wallet as XPaymentsWallet, Transaction as XPaymentsTransaction } from '@/types/xpayments';
import { Currency, TransactionType, TransactionStatus } from '@/types/xpayments';

// ============================================================
// XPAYMENTS CORE — Dashboard Page (Live API)
// 
// Dados servidos por:
//   GET /dashboard/wallets  → { success: true, data: Wallet[] }
//   GET /dashboard/transactions → { success: true, data: Transaction[] }
//
// Fallback para mock data se API indisponível.
// ============================================================

// --- Types for API response (flexíveis, toleram nulls) ---
interface DashboardWallet {
  id: string;
  walletReference?: string | null;
  currency: string;
  balanceAvailable?: number;
  balancePending?: number;
  balanceIncoming?: number;
  balanceBlocked?: number;
  blockchainAddress?: string | null;
}

interface DashboardTransaction {
  id: string;
  walletId?: string | null;
  type?: string | null;
  status?: string | null;
  amount?: number;
  feeApplied?: number;
  currency?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// --- Helpers ---

const fmt = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const safeNum = (v: number | null | undefined, fallback = 0): number =>
  typeof v === 'number' && isFinite(v) ? v : fallback;

const safeCurrency = (c: string | null | undefined): Currency => {
  if (c && Object.values(Currency).includes(c as Currency)) return c as Currency;
  return Currency.USD;
};

const safeTxType = (t: string | null | undefined): TransactionType => {
  if (t && Object.values(TransactionType).includes(t as TransactionType))
    return t as TransactionType;
  return TransactionType.TRANSFER;
};

const safeTxStatus = (s: string | null | undefined): TransactionStatus => {
  if (s && Object.values(TransactionStatus).includes(s as TransactionStatus))
    return s as TransactionStatus;
  return TransactionStatus.PENDING;
};

const CURRENCY_FLAGS: Record<Currency, string> = {
  [Currency.EUR]: '🇪🇺',
  [Currency.BRL]: '🇧🇷',
  [Currency.USDT]: '₮',
  [Currency.USD]: '🇺🇸',
};

const INCOMING_TYPES: TransactionType[] = [
  TransactionType.PROXY_INCOMING,
  TransactionType.SETTLEMENT,
  TransactionType.TRANSFER,
];

function isIncoming(type: TransactionType, status: TransactionStatus): boolean {
  if (type === TransactionType.TRANSFER && status !== TransactionStatus.INCOMING) {
    return false;
  }
  return INCOMING_TYPES.includes(type);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function statusLabel(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.COMPLETED: return 'Concluído';
    case TransactionStatus.PENDING: return 'Pendente';
    case TransactionStatus.INCOMING: return 'A receber';
    case TransactionStatus.FAILED: return 'Falhou';
    case TransactionStatus.BLOCKED: return 'Bloqueado';
    default: return status;
  }
}

// --- Sparkline SVG Generator (decorative) ---
function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8 opacity-60" fill="none">
      <polyline points={points} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================
// SKELETON LOADING COMPONENTS
// ============================================================

function StatCardSkeleton() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 py-4">
      <CardContent className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function WalletCardSkeleton() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 py-4">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-2.5 w-12" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 py-3 border-b border-zinc-800/60">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-3.5 w-48" />
      </div>
      <div className="text-right shrink-0 space-y-1">
        <Skeleton className="h-3.5 w-24 ml-auto" />
        <Skeleton className="h-2.5 w-16 ml-auto" />
      </div>
      <div className="text-right shrink-0 hidden md:block space-y-1">
        <Skeleton className="h-3 w-16 rounded-full ml-auto" />
        <Skeleton className="h-2.5 w-20 ml-auto" />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Wallets */}
      <Card className="bg-zinc-900/50 border-zinc-800 py-4">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-7 w-20" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <WalletCardSkeleton />
            <WalletCardSkeleton />
            <WalletCardSkeleton />
            <WalletCardSkeleton />
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="bg-zinc-900/50 border-zinc-800 py-4">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-7 w-20" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <TransactionRowSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// ERROR STATE
// ============================================================

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-red-500/20 py-8">
        <CardContent className="flex flex-col items-center justify-center text-center py-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 mb-4">
            <ServerCrash className="size-7 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-1">
            Erro ao carregar dados
          </h3>
          <p className="text-sm text-zinc-500 mb-5 max-w-md">
            {message}
          </p>
          <Button
            variant="outline"
            onClick={onRetry}
            className="gap-2 text-zinc-400 border-zinc-700 hover:text-zinc-200"
          >
            <RefreshCw className="size-3.5" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  gradientFrom,
  gradientTo,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 py-4">
      <CardContent className="flex items-start gap-4">
        <div
          className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} p-2.5 shrink-0`}
        >
          <Icon className="size-5 text-zinc-100" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-400 truncate">{label}</p>
          <p className="text-2xl font-bold text-zinc-100 mt-0.5 truncate">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {trendUp ? (
              <TrendingUp className="size-3.5 text-neon-400" />
            ) : (
              <TrendingDown className="size-3.5 text-red-400" />
            )}
            <span className={`text-xs font-medium ${trendUp ? 'text-neon-400' : 'text-red-400'}`}>
              {trend}
            </span>
            <span className="text-xs text-zinc-500 ml-1">vs. mês anterior</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// WALLET CARD
// ============================================================

function WalletCard({ wallet }: { wallet: DashboardWallet }) {
  const currency = safeCurrency(wallet.currency);
  const colorClass = currencyColors[currency];
  const symbol = currencySymbols[currency];
  const flag = CURRENCY_FLAGS[currency];

  const balanceAvailable = safeNum(wallet.balanceAvailable);
  const balancePending = safeNum(wallet.balancePending);
  const balanceIncoming = safeNum(wallet.balanceIncoming);
  const balanceBlocked = safeNum(wallet.balanceBlocked);

  const total = balanceAvailable + balancePending + balanceIncoming + balanceBlocked;
  const availablePct = total > 0 ? (balanceAvailable / total) * 100 : 0;

  const sparkData = [
    balanceAvailable * 0.7,
    balanceAvailable * 0.85,
    balanceAvailable * 0.75,
    balanceAvailable * 0.9,
    balanceAvailable * 0.95,
    balanceAvailable * 0.88,
    balanceAvailable,
  ];

  const sparkColor =
    currency === Currency.EUR
      ? '#60a5fa'
      : currency === Currency.BRL
        ? '#4ade80'
        : currency === Currency.USDT
          ? '#34d399'
          : '#fbbf24';

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 py-4">
      <CardContent className="space-y-4">
        {/* Currency header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{flag}</span>
            <span className={`text-sm font-semibold ${colorClass}`}>
              {currency}
            </span>
            {wallet.walletReference && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 border-zinc-700 text-zinc-500"
              >
                {wallet.walletReference}
              </Badge>
            )}
          </div>
          <Wallet className="size-4 text-zinc-500" />
        </div>

        {/* Balance rows */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Disponível</span>
            <span className={`text-sm font-semibold ${colorClass}`}>
              {symbol} {fmt(balanceAvailable)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Pendente</span>
            <span className="text-sm font-medium text-zinc-300">
              {symbol} {fmt(balancePending)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">A receber</span>
            <span className="text-sm font-medium text-zinc-300">
              {symbol} {fmt(balanceIncoming)}
            </span>
          </div>
          {balanceBlocked > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Bloqueado</span>
              <span className="text-sm font-medium text-red-400/70">
                {symbol} {fmt(balanceBlocked)}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
              Utilização
            </span>
            <span className="text-[10px] text-zinc-500">{availablePct.toFixed(0)}% disponível</span>
          </div>
          <Progress value={availablePct} className="h-1.5 bg-zinc-800" />
        </div>

        {/* Sparkline */}
        <MiniSparkline values={sparkData} color={sparkColor} />
      </CardContent>
    </Card>
  );
}

// ============================================================
// TRANSACTION ROW
// ============================================================

function TransactionRow({ tx }: { tx: DashboardTransaction }) {
  const txType = safeTxType(tx.type);
  const txStatus = safeTxStatus(tx.status);
  const currency = safeCurrency(tx.currency);
  const incoming = isIncoming(txType, txStatus);
  const symbol = currencySymbols[currency];
  const amount = safeNum(tx.amount);
  const fee = safeNum(tx.feeApplied);
  const prefix = incoming ? '+' : '-';

  const typeBg = incoming
    ? 'bg-neon-500/10 text-neon-400 border-neon-500/20'
    : txType === TransactionType.SWAP
      ? 'bg-neon-500/10 text-neon-400 border-neon-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';

  const typeLabel = transactionTypeLabels[txType] || tx.type || '—';

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      {/* Icon */}
      <div
        className={`flex items-center justify-center rounded-lg p-2 shrink-0 ${
          incoming ? 'bg-neon-500/10' : 'bg-red-500/10'
        }`}
      >
        {incoming ? (
          <ArrowDownLeft className="size-4 text-neon-400" />
        ) : (
          <ArrowUpRight className="size-4 text-red-400" />
        )}
      </div>

      {/* Type + Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-4 border ${typeBg}`}
          >
            {typeLabel}
          </Badge>
        </div>
        <p className="text-sm text-zinc-300 truncate mt-0.5">
          {tx.description || 'Sem descrição'}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5 hidden sm:block">
          {symbol} {currency}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${incoming ? 'text-neon-400' : 'text-red-400'}`}>
          {prefix} {symbol} {fmt(amount)}
        </p>
        {fee > 0 && (
          <p className="text-[10px] text-zinc-500">Taxa: {symbol} {fmt(fee)}</p>
        )}
      </div>

      {/* Status + Date */}
      <div className="text-right shrink-0 hidden md:block">
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 h-4 border ${transactionStatusColors[txStatus] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'}`}
        >
          {statusLabel(txStatus)}
        </Badge>
        <p className="text-[10px] text-zinc-500 mt-1">{formatDate(tx.createdAt)}</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD PAGE
// ============================================================

export default function DashboardPage() {
  const { setPage } = useNavStore();
  const { getUserRole } = useAuthStore();
  const role = getUserRole();

  // --- State ---
  const [wallets, setWallets] = useState<DashboardWallet[]>([]);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'mock' | 'none'>('none');

  // --- Data Fetch ---
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [walletsRes, txsRes] = await Promise.all([
        xpApi.dashboard.getWallets(),
        xpApi.dashboard.getTransactions({ limit: 20 }),
      ]);

      const walletsData = Array.isArray(walletsRes) ? walletsRes : [];
      const txsData = Array.isArray(txsRes) ? txsRes : [];

      if (walletsData.length > 0 || txsData.length > 0) {
        setWallets(walletsData);
        setTransactions(txsData);
        setDataSource('api');
      } else {
        // API respondeu mas sem dados — mostrar estado vazio
        setWallets([]);
        setTransactions([]);
        setDataSource('api');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro de conexão';

      if (msg.includes('Network Error') || msg.includes('timeout') || msg.includes('404')) {
        setError(
          'Não foi possível conectar ao servidor XPayments.Digital. ' +
          'Verifique sua conexão ou tente novamente mais tarde.'
        );
      } else {
        setError(msg);
      }
      setDataSource('none');
      setWallets([]);
      setTransactions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Computed Stats ---
  const totalBalance = wallets.reduce(
    (sum, w) => sum + safeNum(w.balanceAvailable), 0
  );
  const totalPending = wallets.reduce(
    (sum, w) => sum + safeNum(w.balancePending), 0
  );
  const totalIncoming = wallets.reduce(
    (sum, w) => sum + safeNum(w.balanceIncoming), 0
  );

  // Transactions this month
  const now = new Date();
  const thisMonthTxs = transactions.filter((tx) => {
    if (!tx.createdAt) return false;
    try {
      const txDate = new Date(tx.createdAt);
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    } catch {
      return false;
    }
  });

  // Recent transactions (sorted by date, most recent first)
  const recentTxs = [...transactions]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  // Quick actions visibility
  const showQuickActions = ['customer', 'merchant', 'super_merchant'].includes(role);

  // --- Loading State ---
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // --- Error State ---
  if (error) {
    return <DashboardError message={error} onRetry={() => fetchDashboardData(true)} />;
  }

  return (
    <div className="space-y-6">
      {/* Data Source Indicator + Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dataSource === 'api' ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-neon-400 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                XPayments.Digital API — Live
              </span>
            </>
          ) : (
            <>
              <WifiOff className="size-3 text-amber-500" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                Sem dados disponíveis
              </span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="text-xs text-zinc-500 hover:text-zinc-300 h-7 gap-1.5"
        >
          <RefreshCw className={`size-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* ========== 1. Summary Stats Row ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Saldo Total"
          value={`€ ${fmt(totalBalance)}`}
          trend="+12.5%"
          trendUp={true}
          gradientFrom="from-neon-600/40"
          gradientTo="to-neon-600/20"
        />
        <StatCard
          icon={Clock}
          label="Valor Pendente"
          value={`€ ${fmt(totalPending)}`}
          trend="-3.2%"
          trendUp={false}
          gradientFrom="from-amber-600/40"
          gradientTo="to-orange-600/20"
        />
        <StatCard
          icon={ArrowDownLeft}
          label="A Receber"
          value={`€ ${fmt(totalIncoming)}`}
          trend="+8.1%"
          trendUp={true}
          gradientFrom="from-neon-600/40"
          gradientTo="to-cyan-600/20"
        />
        <StatCard
          icon={AlertCircle}
          label="Transações Este Mês"
          value={thisMonthTxs.length.toString()}
          trend="+24%"
          trendUp={true}
          gradientFrom="from-violet-600/40"
          gradientTo="to-purple-600/20"
        />
      </div>

      {/* ========== 2. Wallet Overview ========== */}
      <Card className="bg-zinc-900/50 border-zinc-800 py-4">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-100">
              Carteiras
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-zinc-200 h-7 px-2"
              onClick={() => setPage('wallets')}
            >
              Ver Todas
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {wallets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {wallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Wallet className="size-10 mb-3 opacity-30" />
              <p className="text-sm font-medium text-zinc-400 mb-1">Nenhuma carteira encontrada</p>
              <p className="text-xs text-zinc-600">
                As carteiras aparecerão aqui assim que forem criadas na sua conta.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== 3. Recent Transactions ========== */}
      <Card className="bg-zinc-900/50 border-zinc-800 py-4">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-100">
              Transações Recentes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-zinc-200 h-7 px-2"
              onClick={() => setPage('transactions')}
            >
              Ver Todas
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentTxs.length > 0 ? (
              recentTxs.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <ArrowLeftRight className="size-10 mb-3 opacity-30" />
                <p className="text-sm font-medium text-zinc-400 mb-1">Nenhuma transação encontrada</p>
                <p className="text-xs text-zinc-600">
                  O histórico de transações aparecerá aqui após o primeiro movimento.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ========== 4. Quick Actions ========== */}
      {showQuickActions && (
        <Card className="bg-zinc-900/50 border-zinc-800 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold text-zinc-100">
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => setPage('deposits')}
                className="h-12 bg-neon-600/20 border border-neon-500/30 text-neon-400 hover:bg-neon-600/30 hover:text-neon-300 font-medium text-sm gap-2"
                variant="outline"
              >
                <ArrowDownLeft className="size-4" />
                Depositar
              </Button>
              <Button
                onClick={() => setPage('swaps')}
                className="h-12 bg-neon-600/20 border border-neon-500/30 text-neon-400 hover:bg-neon-600/30 hover:text-neon-300 font-medium text-sm gap-2"
                variant="outline"
              >
                <ArrowLeftRight className="size-4" />
                Swap
              </Button>
              <Button
                onClick={() => setPage('payouts')}
                className="h-12 bg-amber-600/20 border border-amber-500/30 text-amber-400 hover:bg-amber-600/30 hover:text-amber-300 font-medium text-sm gap-2"
                variant="outline"
              >
                <ArrowUpRight className="size-4" />
                Sacar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
