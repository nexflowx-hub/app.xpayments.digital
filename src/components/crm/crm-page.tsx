'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { xpApi, XPaymentsApiError } from '@/lib/api/client';
import type { CustomerCRM } from '@/types/xpayments';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Users,
  Search,
  RefreshCw,
  TrendingUp,
  Crown,
  AlertCircle,
  UserCircle,
} from 'lucide-react';

// ============================================================
// XPAYMENTS CRM — Customer Relationship Management
// GET /customers → CustomerCRM[]
// ============================================================

// ── Format helpers ──

function formatLTV(value: number): string {
  if (!isFinite(value)) return '₮ 0.00';
  return `₮ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getInitial(name: string | null, email: string): string {
  if (name && name.trim()) return name.trim().charAt(0).toUpperCase();
  return email.charAt(0).toUpperCase();
}

// ── Avatar with initial letter ──

function CustomerAvatar({ name, email }: { name: string | null; email: string }) {
  const initial = getInitial(name, email);
  return (
    <div className="flex items-center justify-center size-8 rounded-full bg-sky-500/[0.08] border border-sky-500/20 shrink-0">
      <span className="text-xs font-semibold text-sky-400">{initial}</span>
    </div>
  );
}

// ── KPI Card ──

function KpiCard({
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
          <Skeleton className="h-8 w-32" />
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

// ============================================================
// Main Component
// ============================================================

export default function CrmPage() {
  const [customers, setCustomers] = useState<CustomerCRM[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await xpApi.crm.getCustomers();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (err: unknown) {
      if (err instanceof XPaymentsApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar dados de clientes');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q),
    );
  }, [customers, search]);

  // ── Computed KPIs ──
  const kpis = useMemo(() => {
    const total = customers.length;
    const avgLtv =
      total > 0
        ? customers.reduce((sum, c) => sum + (c.stats.lifetimeValueUSDT || 0), 0) / total
        : 0;
    const topCustomer =
      customers.length > 0
        ? customers.reduce(
            (best, c) => (c.stats.lifetimeValueUSDT > (best.stats.lifetimeValueUSDT || 0) ? c : best),
            customers[0],
          )
        : null;
    return { total, avgLtv, topCustomer };
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl border border-sky-500/20 bg-sky-500/10">
            <Users className="size-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Clientes &amp; CRM</h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Gestão de clientes com LTV e métricas de fidelização
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchCustomers(true)}
          disabled={refreshing}
          className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-white/[0.06]"
        >
          <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
          {refreshing ? 'A sincronizar...' : 'Atualizar Dados'}
        </Button>
      </div>

      {/* ── ERROR ── */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle className="size-4 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-300">Erro ao carregar clientes</p>
            <p className="text-[11px] text-red-400/70 mt-0.5 truncate">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchCustomers()}
            className="h-7 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 shrink-0"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={Users}
          iconBg="bg-sky-500/[0.06]"
          iconColor="text-sky-500"
          label="Total Clientes"
          value={String(kpis.total)}
          isLoading={loading}
        />
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-emerald-500/[0.06]"
          iconColor="text-emerald-500"
          label="Ticket Médio (LTV)"
          value={formatLTV(kpis.avgLtv)}
          isLoading={loading}
        />
        <KpiCard
          icon={Crown}
          iconBg="bg-amber-500/[0.06]"
          iconColor="text-amber-500"
          label="Maior Comprador"
          value={kpis.topCustomer ? kpis.topCustomer.name || kpis.topCustomer.email : '—'}
          subValue={kpis.topCustomer ? formatLTV(kpis.topCustomer.stats.lifetimeValueUSDT) : undefined}
          isLoading={loading}
        />
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none" />
        <Input
          placeholder="Pesquisar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-10 bg-white/[0.02] border-white/[0.06] text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-sky-500/30 focus-visible:border-sky-500/40 rounded-xl"
        />
      </div>

      {/* ── TABLE ── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20 ml-auto" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <UserCircle className="size-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              {search ? 'Nenhum cliente encontrado para esta pesquisa' : 'Sem clientes registados'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              {search
                ? 'Tenta pesquisar por outro nome ou email'
                : 'Os clientes aparecerão aqui após a primeira compra'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-5 py-3">
                      Cliente
                    </th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                      Nº Compras
                    </th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">
                      LTV (USDT)
                    </th>
                    <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-5 py-3">
                      Última Compra
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((customer) => (
                    <tr
                      key={customer.id}
                      className="bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar name={customer.name} email={customer.email} />
                          <div className="min-w-0">
                            <p className="text-sm text-zinc-200 font-medium truncate">
                              {customer.name || 'Sem nome'}
                            </p>
                            <p className="text-[11px] text-zinc-500 truncate">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-zinc-300 tabular-nums">
                          {customer.stats.totalPurchases}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-emerald-400 tabular-nums font-medium">
                          {formatLTV(customer.stats.lifetimeValueUSDT)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs text-zinc-500">
                          {formatDateTime(customer.stats.lastPurchaseAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/[0.04]">
              {filtered.map((customer) => (
                <div
                  key={customer.id}
                  className="px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CustomerAvatar name={customer.name} email={customer.email} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200 font-medium truncate">
                        {customer.name || 'Sem nome'}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pl-11">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase">Compras</p>
                        <p className="text-xs text-zinc-300 tabular-nums">
                          {customer.stats.totalPurchases}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase">LTV</p>
                        <p className="text-xs text-emerald-400 tabular-nums font-medium">
                          {formatLTV(customer.stats.lifetimeValueUSDT)}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-600">
                      {formatDateTime(customer.stats.lastPurchaseAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}