'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  ArrowDownUp,
  FileText,
  ShieldCheck,
  Eye,
  Inbox,
} from 'lucide-react';
import { xpApi } from '@/lib/api/client';
import { useBaaSStore } from '@/stores/baas-store';
import { useAuthStore } from '@/stores/auth-store';

// ── Types ──

interface StoreBalance {
  available: number;
  pending: number;
  incoming: number;
  currency: string;
}

interface StatementEntry {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  date: string;
  reference?: string;
}

interface StatementResponse {
  entries: StatementEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Helpers ──

function formatCurrency(amount: number, currency: string): string {
  const code = (currency || '').trim().toUpperCase();
  if (code === 'USDT') return `₮ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (code === 'BTC') return `₿ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTransactionIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'credit':
    case 'deposit':
    case 'incoming':
    case 'settlement':
    case 'refund':
      return ArrowDownLeft;
    case 'debit':
    case 'withdrawal':
    case 'payment':
    case 'fee':
    case 'chargeback':
      return ArrowUpRight;
    case 'transfer':
    case 'swap':
    default:
      return ArrowDownUp;
  }
}

function isCreditType(type: string): boolean {
  const creditTypes = ['credit', 'deposit', 'incoming', 'settlement', 'refund'];
  return creditTypes.includes(type?.toLowerCase());
}

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'confirmed':
    case 'settled':
      return {
        label: 'Concluído',
        className: 'border-neon-500/30 bg-neon-500/10 text-neon-400',
      };
    case 'pending':
    case 'processing':
      return {
        label: 'Pendente',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      };
    case 'incoming':
      return {
        label: 'A receber',
        className: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      };
    case 'failed':
    case 'rejected':
    case 'cancelled':
      return {
        label: 'Falhou',
        className: 'border-red-500/30 bg-red-500/10 text-red-400',
      };
    case 'blocked':
    case 'held':
      return {
        label: 'Bloqueado',
        className: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
      };
    default:
      return {
        label: status || '—',
        className: 'border-zinc-600/30 bg-zinc-500/10 text-zinc-400',
      };
  }
}

const PAGE_SIZE = 10;

// ── Balance Card Skeleton ──

function BalanceCardSkeleton() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 py-4">
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-24 bg-zinc-800" />
        <Skeleton className="h-8 w-36 bg-zinc-800" />
        <Skeleton className="h-2 w-20 bg-zinc-800" />
      </CardContent>
    </Card>
  );
}

// ── Statement Row Skeleton ──

function StatementRowSkeleton() {
  return (
    <TableRow className="border-zinc-800/60">
      <TableCell>
        <Skeleton className="h-4 w-20 bg-zinc-800" />
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40 bg-zinc-800" />
          <Skeleton className="h-3 w-24 bg-zinc-800" />
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-4 w-28 bg-zinc-800" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-24 bg-zinc-800 ml-auto" />
      </TableCell>
      <TableCell className="text-right hidden md:table-cell">
        <Skeleton className="h-5 w-16 bg-zinc-800 ml-auto" />
      </TableCell>
    </TableRow>
  );
}

// ── Main Component ──

export default function AccountManagerDashboard() {
  const scope = useBaaSStore((s) => s.scope);
  const user = useAuthStore((s) => s.user);
  const storeId = scope?.storeId;
  const storeName = scope?.storeName;

  const [balance, setBalance] = useState<StoreBalance | null>(null);
  const [statement, setStatement] = useState<StatementResponse | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingStatement, setLoadingStatement] = useState(true);
  const [errorBalance, setErrorBalance] = useState<string | null>(null);
  const [errorStatement, setErrorStatement] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch Balance ──

  const fetchBalance = useCallback(async () => {
    if (!storeId) {
      setLoadingBalance(false);
      return;
    }
    setLoadingBalance(true);
    setErrorBalance(null);
    try {
      const data = await xpApi.baas.getStoreBalance();
      setBalance(data);
    } catch (err) {
      console.error('[BaaS Dashboard] Failed to fetch balance:', err);
      setErrorBalance('Não foi possível carregar o saldo. Tente novamente.');
    } finally {
      setLoadingBalance(false);
    }
  }, [storeId]);

  // ── Fetch Statement ──

  const fetchStatement = useCallback(
    async (page: number = 1) => {
      if (!storeId) {
        setLoadingStatement(false);
        return;
      }
      setLoadingStatement(true);
      setErrorStatement(null);
      try {
        const data = await xpApi.baas.getStatement({
          page,
          pageSize: PAGE_SIZE,
        });
        setStatement(data);
      } catch (err) {
        console.error('[BaaS Dashboard] Failed to fetch statement:', err);
        setErrorStatement(
          'Não foi possível carregar o extrato. Tente novamente.'
        );
      } finally {
        setLoadingStatement(false);
      }
    },
    [storeId]
  );

  // ── Effects ──

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    fetchStatement(currentPage);
  }, [fetchStatement, currentPage]);

  const handleRetryAll = () => {
    fetchBalance();
    fetchStatement(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ── Render ──

  const displayName = storeName || user?.organizationName || 'Loja';
  const displayStoreId = storeId || '—';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ========== Store Info Header ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl bg-neon-500/10 p-2.5">
            <Building2 className="size-5 text-neon-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              {displayName}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 border-zinc-700 text-zinc-500 font-mono"
              >
                ID: {displayStoreId}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0 h-4 border-neon-500/30 bg-neon-500/10 text-neon-400"
              >
                <Eye className="size-2.5 mr-1" />
                Visão da Loja: {displayName}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetryAll}
          disabled={loadingBalance || loadingStatement}
          className="text-zinc-400 hover:text-zinc-200 h-8 px-3 gap-2"
        >
          <RefreshCw
            className={`size-3.5 ${
              loadingBalance || loadingStatement
                ? 'animate-spin'
                : ''
            }`}
          />
          <span className="text-xs">Atualizar</span>
        </Button>
      </div>

      {/* ========== Balance Cards ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loadingBalance ? (
          <>
            <BalanceCardSkeleton />
            <BalanceCardSkeleton />
            <BalanceCardSkeleton />
          </>
        ) : errorBalance ? (
          <div className="sm:col-span-3">
            <Card className="bg-zinc-900/50 border-zinc-800 py-4">
              <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
                <AlertCircle className="size-5 text-red-400 shrink-0" />
                <div className="text-center sm:text-left">
                  <p className="text-sm text-red-400 font-medium">
                    {errorBalance}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Verifique a sua conexão ou tente mais tarde.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchBalance}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 px-3 text-xs shrink-0"
                >
                  <RefreshCw className="size-3 mr-1" />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Available Balance */}
            <Card className="bg-zinc-900/50 border-zinc-800 py-4">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-lg bg-neon-500/10 p-1.5">
                    <Wallet className="size-3.5 text-neon-400" />
                  </div>
                  <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                    Disponível
                  </span>
                </div>
                <p className="text-2xl font-bold text-neon-400 tracking-tight">
                  {balance
                    ? formatCurrency(balance.available, balance.currency)
                    : '—'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  Saldo disponível para movimentações
                </p>
              </CardContent>
            </Card>

            {/* Pending Balance */}
            <Card className="bg-zinc-900/50 border-zinc-800 py-4">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-lg bg-amber-500/10 p-1.5">
                    <Clock className="size-3.5 text-amber-400" />
                  </div>
                  <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                    Pendente
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-400 tracking-tight">
                  {balance
                    ? formatCurrency(balance.pending, balance.currency)
                    : '—'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  Valores em processamento
                </p>
              </CardContent>
            </Card>

            {/* Incoming Balance */}
            <Card className="bg-zinc-900/50 border-zinc-800 py-4">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-lg bg-neon-500/10 p-1.5">
                    <ArrowDownLeft className="size-3.5 text-neon-400" />
                  </div>
                  <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                    A Receber
                  </span>
                </div>
                <p className="text-2xl font-bold text-neon-400 tracking-tight">
                  {balance
                    ? formatCurrency(balance.incoming, balance.currency)
                    : '—'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  Receitas previstas
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ========== Prominent Total Balance (when available) ========== */}
      {!loadingBalance && balance && !errorBalance && (
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-2 px-8 py-4">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
              Saldo Total
            </span>
            <span className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight">
              {formatCurrency(
                balance.available + balance.pending + balance.incoming,
                balance.currency
              )}
            </span>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] text-neon-500">
                {formatCurrency(balance.available, balance.currency)} disponível
              </span>
              <span className="text-[10px] text-zinc-600">•</span>
              <span className="text-[10px] text-amber-500">
                {formatCurrency(balance.pending, balance.currency)} pendente
              </span>
              <span className="text-[10px] text-zinc-600">•</span>
              <span className="text-[10px] text-neon-500">
                {formatCurrency(balance.incoming, balance.currency)} a receber
              </span>
            </div>
          </div>
        </div>
      )}

      <Separator className="bg-zinc-800/60" />

      {/* ========== Bank Statement (Extrato Bancário) ========== */}
      <Card className="bg-zinc-900/50 border-zinc-800 py-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg bg-neon-500/10 p-2">
                <FileText className="size-4 text-neon-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-zinc-100">
                  Extrato Bancário
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Histórico de movimentações da loja
                </CardDescription>
              </div>
            </div>
            {statement && !loadingStatement && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0 h-5 border-zinc-700 text-zinc-500"
              >
                {statement.total} movimentações
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingStatement ? (
            /* ── Loading State ── */
            <div className="space-y-1">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/60 hover:bg-transparent">
                    <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9">
                      Data
                    </TableHead>
                    <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9">
                      Descrição
                    </TableHead>
                    <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9 hidden sm:table-cell">
                      Referência
                    </TableHead>
                    <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9 text-right">
                      Valor
                    </TableHead>
                    <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9 text-right hidden md:table-cell">
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StatementRowSkeleton key={i} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : errorStatement ? (
            /* ── Error State ── */
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="flex items-center justify-center rounded-full bg-red-500/10 p-3">
                <AlertCircle className="size-6 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-red-400 font-medium">
                  {errorStatement}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Não foi possível obter os dados do extrato.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchStatement(currentPage)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 px-4 text-xs gap-2"
              >
                <RefreshCw className="size-3" />
                Tentar novamente
              </Button>
            </div>
          ) : !statement || statement.entries.length === 0 ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex items-center justify-center rounded-full bg-zinc-800 p-4">
                <Inbox className="size-8 text-zinc-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-400 font-medium">
                  Nenhuma movimentação encontrada
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  O extrato desta loja está vazio. As movimentações
                  aparecerão aqui assim que houver atividade.
                </p>
              </div>
            </div>
          ) : (
            /* ── Statement Table ── */
            <>
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800/60 hover:bg-transparent">
                      <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9">
                        Data
                      </TableHead>
                      <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9">
                        Descrição
                      </TableHead>
                      <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9 hidden sm:table-cell">
                        Referência
                      </TableHead>
                      <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9 text-right">
                        Valor
                      </TableHead>
                      <TableHead className="text-[10px] text-zinc-500 uppercase tracking-wider h-9 text-right hidden md:table-cell">
                        Estado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.entries.map((entry) => {
                      const isCredit = isCreditType(entry.type);
                      const Icon = getTransactionIcon(entry.type);
                      const statusConfig = getStatusConfig(entry.status);

                      return (
                        <TableRow
                          key={entry.id}
                          className="border-zinc-800/60 hover:bg-zinc-800/30"
                        >
                          {/* Date */}
                          <TableCell className="py-3">
                            <span className="text-xs text-zinc-400">
                              {formatDate(entry.date)}
                            </span>
                          </TableCell>

                          {/* Description */}
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex items-center justify-center rounded-lg p-1.5 shrink-0 ${
                                  isCredit
                                    ? 'bg-neon-500/10'
                                    : 'bg-red-500/10'
                                }`}
                              >
                                <Icon
                                  className={`size-3.5 ${
                                    isCredit
                                      ? 'text-neon-400'
                                      : 'text-red-400'
                                  }`}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-zinc-200 truncate">
                                  {entry.description || '—'}
                                </p>
                                <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                                  {entry.type}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Reference */}
                          <TableCell className="py-3 hidden sm:table-cell">
                            {entry.reference ? (
                              <span className="text-xs text-zinc-500 font-mono">
                                {entry.reference}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-600">—</span>
                            )}
                          </TableCell>

                          {/* Amount */}
                          <TableCell className="py-3 text-right">
                            <span
                              className={`text-sm font-semibold ${
                                isCredit
                                  ? 'text-neon-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {isCredit ? '+' : '-'}{' '}
                              {formatCurrency(entry.amount, entry.currency)}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-3 text-right hidden md:table-cell">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0 h-5 border ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* ── Pagination ── */}
              {statement.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/60">
                  <p className="text-xs text-zinc-500">
                    Página {statement.page} de {statement.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(statement.page - 1)
                      }
                      disabled={statement.page <= 1 || loadingStatement}
                      className="h-7 px-2.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-3.5" />
                      <span className="text-xs">Anterior</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(statement.page + 1)
                      }
                      disabled={
                        statement.page >= statement.totalPages ||
                        loadingStatement
                      }
                      className="h-7 px-2.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
                    >
                      <span className="text-xs">Seguinte</span>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ========== Footer Notice ========== */}
      <div className="flex items-center justify-center gap-2 py-4">
        <ShieldCheck className="size-3.5 text-zinc-600" />
        <p className="text-[11px] text-zinc-600 text-center">
          Acesso limitado à visão da loja — Dados sujeitos ao contexto do
          Account Manager atribuído
        </p>
      </div>
    </div>
  );
}
