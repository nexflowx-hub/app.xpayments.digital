'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ShoppingCart, Plus, ExternalLink, Copy, Check, Settings, CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// Merchant Checkouts Page
// Configuração de checkouts de pagamento para merchants
// ============================================================

interface CheckoutData {
  id: string;
  name: string;
  currency: string;
  amount: number | null;
  status: 'active' | 'inactive' | 'expired';
  transactions: number;
  volume: number;
  createdAt: string;
  url?: string;
}

const mockCheckouts: CheckoutData[] = [
  {
    id: 'chk_001',
    name: 'Checkout Principal - EUR',
    currency: 'EUR',
    amount: null,
    status: 'active',
    transactions: 342,
    volume: 85420.50,
    createdAt: '2024-11-15T10:00:00Z',
    url: 'https://pay.xpayments.digital/checkout/chk_001',
  },
  {
    id: 'chk_002',
    name: 'Checkout USDT Fixo',
    currency: 'USDT',
    amount: 500,
    status: 'active',
    transactions: 156,
    volume: 78000.00,
    createdAt: '2024-12-01T14:00:00Z',
    url: 'https://pay.xpayments.digital/checkout/chk_002',
  },
  {
    id: 'chk_003',
    name: 'Checkout BRL - Marketplace',
    currency: 'BRL',
    amount: null,
    status: 'inactive',
    transactions: 89,
    volume: 34500.00,
    createdAt: '2024-10-20T09:00:00Z',
  },
  {
    id: 'chk_004',
    name: 'Checkout Promo Black Friday',
    currency: 'USD',
    amount: 99.99,
    status: 'expired',
    transactions: 523,
    volume: 52294.77,
    createdAt: '2024-11-20T08:00:00Z',
  },
];

function formatCurrency(amount: number, currency: string): string {
  const code = (currency || '').trim();
  if (code === 'USDT') {
    return `₮ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (code === 'BTC') {
    return `₿ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
  }
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-neon-500/15 text-neon-400 border-neon-500/30' },
  inactive: { label: 'Inativo', color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },
  expired: { label: 'Expirado', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
};

export default function MerchantCheckoutsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalVolume = mockCheckouts.reduce((acc, c) => acc + c.volume, 0);
  const totalTransactions = mockCheckouts.reduce((acc, c) => acc + c.transactions, 0);
  const activeCheckouts = mockCheckouts.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Checkouts de Pagamento</h2>
          <p className="text-sm text-zinc-400">Configuração e gestão dos checkouts de pagamento</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white">
              <Plus className="w-4 h-4" />
              Novo Checkout
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Checkout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Nome do Checkout</Label>
                <Input
                  placeholder="Ex: Checkout Principal"
                  className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Moeda</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['EUR', 'BRL', 'USD', 'USDT'].map((cur) => (
                    <button
                      key={cur}
                      className="py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-sm font-medium text-zinc-300 hover:border-neon-500/30 hover:bg-neon-500/5 transition-colors"
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Valor Fixo (opcional)</Label>
                <Input
                  type="number"
                  placeholder="Deixe vazio para valor aberto"
                  className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
                />
                <p className="text-[10px] text-zinc-500">Se não definir valor, o cliente poderá escolher o montante</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <CreditCard className="w-4 h-4 text-neon-400 shrink-0" />
                <span className="text-[11px] text-zinc-400">
                  O checkout será acessível via URL pública após a criação
                </span>
              </div>
              <Button className="w-full bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white">
                Criar Checkout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Checkouts Ativos</p>
            <p className="text-2xl font-bold text-zinc-100">{activeCheckouts}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Volume Total</p>
            <p className="text-2xl font-bold text-neon-400">{formatCurrency(totalVolume, 'EUR')}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Transações</p>
            <p className="text-2xl font-bold text-zinc-100">{totalTransactions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Checkouts Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500 text-xs">Nome</TableHead>
                <TableHead className="text-zinc-500 text-xs">Moeda</TableHead>
                <TableHead className="text-zinc-500 text-xs">Valor</TableHead>
                <TableHead className="text-zinc-500 text-xs">Estado</TableHead>
                <TableHead className="text-zinc-500 text-xs text-right">Transações</TableHead>
                <TableHead className="text-zinc-500 text-xs text-right">Volume</TableHead>
                <TableHead className="text-zinc-500 text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCheckouts.map((checkout) => {
                const status = statusConfig[checkout.status];
                return (
                  <TableRow key={checkout.id} className="border-zinc-800 hover:bg-zinc-800/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-zinc-500" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{checkout.name}</p>
                          <p className="text-[10px] text-zinc-600">{checkout.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300">
                        {checkout.currency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300 tabular-nums">
                      {checkout.amount ? formatCurrency(checkout.amount, checkout.currency) : 'Aberto'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300 tabular-nums text-right">
                      {checkout.transactions}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300 tabular-nums text-right">
                      {formatCurrency(checkout.volume, checkout.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {checkout.url && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-zinc-200"
                              onClick={() => handleCopy(checkout.url!, checkout.id)}
                            >
                              {copiedId === checkout.id ? (
                                <Check className="w-3.5 h-3.5 text-neon-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-zinc-200"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-400 hover:text-zinc-200"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── White-Label Payment Methods (NO gateway names) ── */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-neon-400" />
            Métodos de Pagamento Disponíveis
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">
            Redes de pagamento aceitas nos seus checkouts. Todas as rotas são geridas pela XPayments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Visa', color: 'text-sky-300' },
              { label: 'Mastercard', color: 'text-orange-400' },
              { label: 'MBWAY', color: 'text-red-400' },
              { label: 'PIX', color: 'text-neon-300' },
              { label: 'USDT', color: 'text-neon-400' },
              { label: 'BTC', color: 'text-amber-400' },
              { label: 'Amex', color: 'text-cyan-300' },
              { label: 'Multibanco', color: 'text-red-300' },
              { label: 'Bizum', color: 'text-violet-400' },
              { label: 'EUR', color: 'text-zinc-200' },
              { label: 'USD', color: 'text-green-400' },
              { label: 'BRL', color: 'text-neon-400' },
            ].map((method) => (
              <div
                key={method.label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:border-neon-500/20 hover:bg-zinc-800/30 transition-colors"
              >
                <div className={cn('text-xs font-bold', method.color)}>{method.label}</div>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-neon-500 animate-pulse" />
                  <span className="text-[9px] text-zinc-500">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
        <Settings className="w-5 h-5 text-zinc-500 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-zinc-300">Configuração Avançada</p>
          <p className="text-[11px] text-zinc-500">
            Personalize o design, tempo de expiração, moedas aceites e webhooks de notificação em cada checkout.
            Contate o suporte para configurações empresariais.
          </p>
        </div>
      </div>
    </div>
  );
}
