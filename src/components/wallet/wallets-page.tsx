'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  currencySymbols,
  currencyColors,
} from '@/lib/formatting';
import type { Currency } from '@/types/xpayments';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  QrCode,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react';

function formatCurrency(value: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  return `${symbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const APPROX_RATES: Record<string, number> = {
  EUR: 1,
  BRL: 5.35,
  USDT: 0.93,
  USD: 1.08,
};

export default function WalletsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPortfolio = useMemo(() => {
    return [].reduce((sum: number, w: any) => {
      return sum + (w.balanceAvailable ?? 0) * (APPROX_RATES[w.currency] || 1);
    }, 0);
  }, []);

  const totalIncoming = useMemo(() => {
    return [].reduce((sum: number, w: any) => sum + (w.balanceIncoming ?? 0), 0);
  }, []);

  const handleCopyAddress = (address: string, walletId: string) => {
    navigator.clipboard.writeText(address).catch(() => {});
    setCopiedId(walletId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 col-span-1 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-neon-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Portfolio Total</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              € {totalPortfolio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Estimativa em EUR</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="size-4 text-neon-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Carteiras</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{0}</p>
            <p className="text-xs text-zinc-500 mt-1">Ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <CircleDollarSign className="size-4 text-amber-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">A Receber</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              € {totalIncoming.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Entradas pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="size-4 text-purple-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Câmbio</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">4</p>
            <p className="text-xs text-zinc-500 mt-1">Moedas suportadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {([] as any[]).map((wallet: any) => {
          const isExpanded = expandedId === wallet.id;
          const colorClass = currencyColors[wallet.currency];
          const symbol = currencySymbols[wallet.currency];
          const totalBalance = wallet.balanceAvailable + wallet.balancePending + wallet.balanceIncoming + wallet.balanceBlocked;

          return (
            <Card
              key={wallet.id}
              className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors duration-200"
            >
              {/* Card Header */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-neon-500/10 border border-neon-500/20">
                      <span className={`text-lg font-bold ${colorClass}`}>
                        {wallet.currency}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-zinc-100">
                        Carteira {wallet.currency}
                      </CardTitle>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        {wallet.walletReference}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0 h-5 border-neon-500/30 text-neon-400 bg-neon-500/10"
                  >
                    Ativa
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Primary Balance */}
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Saldo Disponível</p>
                  <p className={`text-2xl font-bold ${colorClass}`}>
                    {formatCurrency(wallet.balanceAvailable, wallet.currency)}
                  </p>
                </div>

                {/* Balance Breakdown - Always visible */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-md bg-yellow-500/10 flex items-center justify-center">
                      <Clock className="size-3.5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">Pendente</p>
                      <p className="text-xs font-medium text-zinc-300">
                        {symbol} {wallet.balancePending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-md bg-neon-500/10 flex items-center justify-center">
                      <ArrowDownLeft className="size-3.5 text-neon-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">Entrada</p>
                      <p className="text-xs font-medium text-zinc-300">
                        {symbol} {wallet.balanceIncoming.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-md bg-red-500/10 flex items-center justify-center">
                      <Lock className="size-3.5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">Bloqueado</p>
                      <p className="text-xs font-medium text-zinc-300">
                        {symbol} {wallet.balanceBlocked.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-md bg-neon-500/10 flex items-center justify-center">
                      <Wallet className="size-3.5 text-neon-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase">Total</p>
                      <p className="text-xs font-medium text-zinc-300">
                        {symbol} {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blockchain Address */}
                {wallet.blockchainAddress && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
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
                        <Check className="size-3 text-neon-400" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Expand/Collapse - Details Button */}
                <Separator className="bg-zinc-800" />
                <Button
                  variant="ghost"
                  className="w-full h-8 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 gap-1"
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

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">ID da Carteira</p>
                        <p className="text-xs text-zinc-300 font-mono mt-0.5">{wallet.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Referência</p>
                        <p className="text-xs text-zinc-300 font-mono mt-0.5">{wallet.walletReference}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Criada em</p>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          {new Date(wallet.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Última atividade</p>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          {new Date(wallet.updatedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {wallet.blockchainAddress && (
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Endereço Blockchain</p>
                        <p className="text-xs text-neon-400 font-mono mt-0.5 break-all">
                          {wallet.blockchainAddress}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/20"
                      >
                        <ArrowDownLeft className="size-3.5 mr-1.5" />
                        Depositar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        <ArrowUpRight className="size-3.5 mr-1.5" />
                        Sacar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
