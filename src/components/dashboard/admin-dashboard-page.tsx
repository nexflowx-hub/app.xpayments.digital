'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Users,
  DollarSign,
  Activity,
  RefreshCw,
  AlertCircle,
  WifiOff,
  Store,
  ChevronRight,
} from 'lucide-react';
import { xpApi, type AdminStatsResponse, type AdminMerchant } from '@/lib/api/client';
import { XPaymentsApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';

// ============================================================
// Super Admin Overview — Dark Minimalist
// Fetches:
//   GET /api/v1/admin/stats  → stats cards
//   GET /api/v1/admin/merchants → merchants table
// ============================================================

// ── Tier badge styling ──
const TIER_STYLES: Record<string, string> = {
  TIER_A_PREMIUM: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  TIER_B_PRO: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  TIER_C_STARTER: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  TIER_0_UNVERIFIED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  TIER_1_BASIC: 'bg-neon-500/15 text-neon-400 border-neon-500/30',
  TIER_2_VERIFIED: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  TIER_3_CORPORATE: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

function getTierStyle(tier: string): string {
  return TIER_STYLES[tier] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
}

// ── Status badge styling ──
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  SUSPENDED: 'bg-red-500/15 text-red-400 border-red-500/30',
  BLOCKED: 'bg-red-500/15 text-red-400 border-red-500/30',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status?.toUpperCase()] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
}

// ── Format helpers ──
function formatUSDT(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

// ── Stat Card Component ──
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center size-9 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <Icon className="size-4 text-zinc-500" />
        </div>
        {isLoading && <Skeleton className="h-4 w-16" />}
      </div>
      {isLoading ? (
        <>
          <Skeleton className="h-7 w-28 mb-1.5" />
          <Skeleton className="h-3.5 w-20" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums tracking-tight">{value}</p>
          <p className="text-xs text-zinc-500 mt-1">{label}</p>
          {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  );
}

// ── Merchants Table Component ──
function MerchantsTable({
  merchants,
  isLoading,
}: {
  merchants: AdminMerchant[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64 mt-2" />
        </div>
        <div className="divide-y divide-white/[0.04]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Table Header */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-zinc-200">Lojistas Registados</h3>
        <p className="text-xs text-zinc-600 mt-0.5">
          {merchants.length} merchant{merchants.length !== 1 ? 's' : ''} encontrado{merchants.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      {merchants.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <Users className="size-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Nenhum lojista encontrado</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-5 py-3">
                    Merchant
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                    Tier Level
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                    Lojas Ativas
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                    Status
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-5 py-3">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {merchants.map((m) => (
                  <tr
                    key={m.id}
                    className="bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-8 rounded-full bg-white/[0.06] border border-white/[0.08] shrink-0">
                          <span className="text-xs font-semibold text-zinc-400">
                            {(m.name || 'M').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{m.name || '—'}</p>
                          <p className="text-xs text-zinc-600 truncate">{m.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                          getTierStyle(m.tier),
                        )}
                      >
                        {m.tier || '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-zinc-300 tabular-nums">
                        {m.activeStores ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-md border capitalize',
                          getStatusStyle(m.status),
                        )}
                      >
                        {m.status || '—'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-zinc-300 tabular-nums font-medium">
                        {m.totalVolume ? formatUSDT(m.totalVolume) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/[0.04]">
            {merchants.map((m) => (
              <div key={m.id} className="px-4 py-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center size-8 rounded-full bg-white/[0.06] border border-white/[0.08] shrink-0">
                      <span className="text-xs font-semibold text-zinc-400">
                        {(m.name || 'M').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{m.name || '—'}</p>
                      <p className="text-xs text-zinc-600 truncate">{m.email || '—'}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0',
                      getStatusStyle(m.status),
                    )}
                  >
                    {m.status || '—'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 ml-[42px]">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                      getTierStyle(m.tier),
                    )}
                  >
                    {m.tier || '—'}
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    <Store className="size-3 inline mr-0.5 -mt-0.5" />
                    {m.activeStores ?? 0} loja{(m.activeStores ?? 0) !== 1 ? 's' : ''}
                  </span>
                  {m.totalVolume != null && (
                    <span className="text-xs text-zinc-400 ml-auto tabular-nums font-medium">
                      {formatUSDT(m.totalVolume)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const [statsData, merchantsData] = await Promise.all([
        xpApi.admin.getStats(),
        xpApi.admin.getMerchants(),
      ]);

      setStats(statsData);
      setMerchants(Array.isArray(merchantsData) ? merchantsData : []);
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <Shield className="size-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-zinc-100">Super Admin Overview</h2>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-semibold px-2.5 py-0.5 hover:bg-emerald-500/20">
                Master System
              </Badge>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              Monitorização em tempo real da plataforma XPayments.Digital
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

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Merchants Ativos"
          value={stats ? formatNumber(stats.activeMerchants) : '—'}
          sub={stats ? `de ${formatNumber(stats.totalMerchants)} registados` : undefined}
          isLoading={loading}
        />
        <StatCard
          icon={DollarSign}
          label="Volume Total (USDT)"
          value={stats ? formatUSDT(stats.totalVolumeUSDT) : '—'}
          sub={stats ? `${formatNumber(stats.totalTransactions)} transações` : undefined}
          isLoading={loading}
        />
        <StatCard
          icon={Activity}
          label="Motor de Routing"
          value="Operational"
          isLoading={false}
        />
      </div>

      {/* ── Routing Status Detail ── */}
      <div className="flex items-center gap-3 px-1">
        <div className="relative flex items-center justify-center">
          <span className="absolute size-3 rounded-full bg-emerald-500/40 animate-ping" />
          <span className="relative size-2 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs text-zinc-500">
          Todos os sistemas operacionais
          {stats?.pendingTickets != null && stats.pendingTickets > 0 && (
            <>
              {' · '}
              <span className="text-amber-400">
                {stats.pendingTickets} ticket{stats.pendingTickets !== 1 ? 's' : ''} pendente{stats.pendingTickets !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </span>
      </div>

      {/* ── Merchants Table ── */}
      <MerchantsTable merchants={merchants} isLoading={loading} />
    </div>
  );
}