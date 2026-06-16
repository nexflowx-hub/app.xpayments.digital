'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  mockTransactions,
  currencySymbols,
  currencyColors,
  transactionTypeLabels,
  transactionStatusColors,
} from '@/lib/mock-data';
import {
  TransactionType,
  TransactionStatus,
  Currency,
} from '@/types/xpayments';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  CreditCard,
  Users,
  AlertCircle,
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const STATUS_LABELS: Record<TransactionStatus, string> = {
  [TransactionStatus.INCOMING]: 'Entrada',
  [TransactionStatus.PENDING]: 'Pendente',
  [TransactionStatus.COMPLETED]: 'Concluído',
  [TransactionStatus.BLOCKED]: 'Bloqueado',
  [TransactionStatus.FAILED]: 'Falhado',
};

const TYPE_ICONS: Record<TransactionType, React.ReactNode> = {
  [TransactionType.PROXY_INCOMING]: <ArrowDownLeft className="size-3.5" />,
  [TransactionType.SETTLEMENT]: <CreditCard className="size-3.5" />,
  [TransactionType.PAYOUT]: <ArrowUpRight className="size-3.5" />,
  [TransactionType.SWAP]: <Repeat className="size-3.5" />,
  [TransactionType.TRANSFER]: <Users className="size-3.5" />,
  [TransactionType.FEE]: <AlertCircle className="size-3.5" />,
};

function getAmountColor(type: TransactionType, status: TransactionStatus): string {
  if (status === TransactionStatus.COMPLETED && (type === TransactionType.PROXY_INCOMING || type === TransactionType.SETTLEMENT)) {
    return 'text-neon-400';
  }
  if (status === TransactionStatus.COMPLETED && type === TransactionType.TRANSFER) {
    return 'text-neon-400';
  }
  if (status === TransactionStatus.INCOMING) {
    return 'text-neon-400';
  }
  if (status === TransactionStatus.PENDING) {
    return 'text-orange-400';
  }
  if (status === TransactionStatus.FAILED) {
    return 'text-red-400';
  }
  if (type === TransactionType.PAYOUT) {
    return 'text-red-400';
  }
  if (type === TransactionType.FEE) {
    return 'text-zinc-500';
  }
  return 'text-zinc-200';
}

function getAmountPrefix(type: TransactionType): string {
  if (type === TransactionType.PROXY_INCOMING || type === TransactionType.SETTLEMENT) return '+';
  if (type === TransactionType.PAYOUT) return '-';
  if (type === TransactionType.FEE) return '-';
  if (type === TransactionType.TRANSFER) return '+';
  return '';
}

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = useMemo(() => {
    let result = [...mockTransactions];

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((tx) => tx.status === statusFilter);
    }

    // Date filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((tx) => new Date(tx.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((tx) => new Date(tx.createdAt) <= to);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(q) ||
          tx.id.toLowerCase().includes(q) ||
          tx.proxyReference?.toLowerCase().includes(q) ||
          tx.currency.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'date') {
        return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return dir * (a.amount - b.amount);
    });

    return result;
  }, [typeFilter, statusFilter, dateFrom, dateTo, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleResetFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo || search;

  // Pagination page numbers
  const pageNumbers: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= safeCurrentPage - 1 && i <= safeCurrentPage + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
      pageNumbers.push('...');
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="size-4 text-zinc-500" />
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Filtros</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] text-zinc-500 hover:text-zinc-300 ml-auto px-2"
                onClick={handleResetFilters}
              >
                Limpar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
              <Input
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-8 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-600 text-xs focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
              />
            </div>
            {/* Type */}
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 border-zinc-700 bg-zinc-800/50 text-zinc-200 text-xs focus:ring-neon-500/30 focus:border-neon-500/50">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all" className="text-xs text-zinc-300">Todos os tipos</SelectItem>
                {Object.entries(transactionTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs text-zinc-300">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Status */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 border-zinc-700 bg-zinc-800/50 text-zinc-200 text-xs focus:ring-neon-500/30 focus:border-neon-500/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all" className="text-xs text-zinc-300">Todos os status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs text-zinc-300">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Date Range */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-zinc-500" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 pl-7 border-zinc-700 bg-zinc-800/50 text-zinc-200 text-xs focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50 [color-scheme:dark]"
                />
              </div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full border-zinc-700 bg-zinc-800/50 text-zinc-200 text-xs focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50 [color-scheme:dark]"
                placeholder="Até"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {filteredTransactions.length} transação{filteredTransactions.length !== 1 ? 'ões' : ''} encontrada{filteredTransactions.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtradas)'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] text-zinc-500 hover:text-zinc-300 gap-1 px-2"
        >
          <Download className="size-3" />
          Exportar
        </Button>
      </div>

      {/* Transactions Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          {paginatedTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead
                      className="text-xs text-zinc-500 font-medium bg-zinc-900/80 cursor-pointer hover:text-zinc-300 select-none"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Data
                        <ArrowUpDown className={`size-3 ${sortField === 'date' ? 'text-neon-400' : ''}`} />
                      </div>
                    </TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80">Tipo</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80 hidden md:table-cell">Descrição</TableHead>
                    <TableHead
                      className="text-xs text-zinc-500 font-medium bg-zinc-900/80 text-right cursor-pointer hover:text-zinc-300 select-none"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        Montante
                        <ArrowUpDown className={`size-3 ${sortField === 'amount' ? 'text-neon-400' : ''}`} />
                      </div>
                    </TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80 text-right hidden sm:table-cell">Taxa</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => {
                    const amountColor = getAmountColor(tx.type, tx.status);
                    const prefix = getAmountPrefix(tx.type);
                    const symbol = currencySymbols[tx.currency];
                    const typeLabel = transactionTypeLabels[tx.type];
                    const statusLabel = STATUS_LABELS[tx.status];
                    const statusColor = transactionStatusColors[tx.status];

                    return (
                      <TableRow key={tx.id} className="border-zinc-800/60 hover:bg-zinc-800/20">
                        <TableCell className="py-3">
                          <div>
                            <p className="text-xs text-zinc-200 font-medium">
                              {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-[10px] text-zinc-600 font-mono">
                              {new Date(tx.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400">
                              {TYPE_ICONS[tx.type]}
                            </div>
                            <span className="text-xs font-medium text-zinc-300 hidden sm:inline">
                              {typeLabel}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {tx.currency}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          <div className="max-w-[200px]">
                            <p className="text-xs text-zinc-300 truncate">{tx.description || '-'}</p>
                            {tx.proxyReference && (
                              <p className="text-[10px] text-zinc-600 font-mono truncate mt-0.5">
                                {tx.proxyReference}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <p className={`text-sm font-semibold ${amountColor}`}>
                            {prefix}{symbol} {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 text-right hidden sm:table-cell">
                          <span className="text-xs text-zinc-500">
                            {tx.feeApplied > 0
                              ? `${symbol} ${tx.feeApplied.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 h-5 border ${statusColor}`}
                          >
                            {statusLabel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="size-16 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-4">
                <Inbox className="size-7 text-zinc-600" />
              </div>
              <h3 className="text-sm font-medium text-zinc-300 mb-1">Sem transações</h3>
              <p className="text-xs text-zinc-500 text-center max-w-sm">
                {hasActiveFilters
                  ? 'Nenhuma transação corresponde aos filtros selecionados. Tente ajustar os filtros.'
                  : 'Ainda não existem transações nesta carteira.'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 h-8 text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  onClick={handleResetFilters}
                >
                  <Filter className="size-3 mr-1.5" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredTransactions.length > ITEMS_PER_PAGE && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`h-8 text-xs border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 ${safeCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              />
            </PaginationItem>
            {pageNumbers.map((page, idx) => {
              if (page === '...') {
                return (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <span className="flex size-8 items-center justify-center text-xs text-zinc-600">...</span>
                  </PaginationItem>
                );
              }
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page as number)}
                    isActive={safeCurrentPage === page}
                    className={`h-8 text-xs cursor-pointer ${
                      safeCurrentPage === page
                        ? 'bg-neon-500/20 text-neon-400 border-neon-500/30 hover:bg-neon-500/30'
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`h-8 text-xs border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 ${safeCurrentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
