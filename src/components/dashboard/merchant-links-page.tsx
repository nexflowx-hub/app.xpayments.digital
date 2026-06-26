'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Link as LinkIcon,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  DollarSign,
  FileText,
  RefreshCw,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { xpApi, type Product } from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentLink {
  id: string;
  merchantId?: string;
  amount: number;
  currency: string;
  description: string;
  status: 'active' | 'expired' | 'paid' | 'cancelled';
  url: string;
  transactions?: number;
  volume?: number;
  createdAt: string;
}

const LINK_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  paid: { label: 'Pago', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  expired: { label: 'Expirado', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MerchantLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('EUR');
  const [formDescription, setFormDescription] = useState('');
  const [formProductId, setFormProductId] = useState<string>('');

  // Product catalog (for link association)
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // ── Fetch links from API (on-mount only) ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    xpApi.merchant.getPaymentLinks()
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setLinks(data);
        } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as Record<string, unknown>).data)) {
          setLinks((data as Record<string, unknown>).data as PaymentLink[]);
        }
      })
      .catch(() => {
        // Silently fail — show empty state
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Fetch products when dialog opens ──
  useEffect(() => {
    if (!createDialogOpen) return;
    let cancelled = false;
    setProductsLoading(true);

    xpApi.merchant.getProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => { cancelled = true; };
  }, [createDialogOpen]);

  // ── When a product is selected, auto-fill fields ──
  const handleProductSelect = useCallback((productId: string) => {
    setFormProductId(productId);
    if (!productId || productId === '__none__') return;
    const product = products.find((p) => p.id === productId);
    if (product) {
      setFormDescription(product.name);
      setFormAmount(String(product.priceFiat));
      if (['EUR', 'USD', 'BRL', 'USDT'].includes(product.currency)) {
        setFormCurrency(product.currency);
      }
    }
  }, [products]);

  // ── Reset form ──
  const resetForm = useCallback(() => {
    setFormAmount('');
    setFormCurrency('EUR');
    setFormDescription('');
    setFormProductId('');
  }, []);

  // ── Create link via API ──
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(formAmount) || 0,
        currency: formCurrency,
        description: formDescription || undefined,
        ...(formProductId && formProductId !== '__none__' ? { productId: formProductId } : {}),
      };
      const result = await xpApi.merchant.createPaymentLink(payload) as Record<string, unknown> | PaymentLink;
      const newLink = (result && 'data' in result ? (result as Record<string, unknown>).data : result) as PaymentLink | undefined;
      if (newLink) {
        setLinks((prev) => [newLink, ...prev]);
      }
      setCreateDialogOpen(false);
      resetForm();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const currencySymbols: Record<string, string> = { EUR: '€', BRL: 'R$', USDT: '₮', USD: '$' };

  const stats = {
    active: links.filter((l) => l.status === 'active').length,
    paid: links.filter((l) => l.status === 'paid').length,
    total: links.length,
  };

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <LinkIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{stats.active}</p>
              <p className="text-xs text-zinc-500">Links Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{stats.paid}</p>
              <p className="text-xs text-zinc-500">Pagos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{stats.total}</p>
              <p className="text-xs text-zinc-500">Total de Links</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Links Table ── */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-emerald-400" />
              Links de Pagamento
            </CardTitle>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="sm"
              className={cn(
                'gap-2 text-white text-xs font-semibold h-8',
                'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
                'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Criar Novo Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {links.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
                <LinkIcon className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-base font-semibold text-zinc-300 mb-1">Sem links de pagamento</h3>
              <p className="text-sm text-zinc-500 mb-4 text-center max-w-sm">
                Crie o seu primeiro link de pagamento para começar a receber.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className={cn(
                  'gap-2 text-white text-sm',
                  'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
                  'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
                )}
              >
                <Plus className="h-4 w-4" />
                Criar Primeiro Link
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-400 text-xs font-medium">Link</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium text-right">Montante</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Moeda</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Estado</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Criado em</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => {
                    const statusCfg = LINK_STATUS_CONFIG[link.status];
                    return (
                      <TableRow key={link.id} className="border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            <code className="text-xs text-zinc-300 font-mono truncate max-w-[200px]">
                              {link.url}
                            </code>
                          </div>
                          {link.description && (
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{link.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono text-zinc-200 whitespace-nowrap">
                          {currencySymbols[link.currency] ?? ''}{link.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] bg-white/[0.04] text-zinc-300 border-white/[0.08] px-2 py-0 h-5">
                            {link.currency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px] px-2 py-0 h-5', statusCfg.color)}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                          {formatDate(link.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => handleCopyLink(link.id, link.url)}
                              aria-label="Copiar link"
                            >
                              {copiedId === link.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                              aria-label="Abrir link"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Create Link Dialog ── */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setCreateDialogOpen(open);
        }}
      >
        <DialogContent className="bg-[#0f0f12] border-white/[0.08] text-zinc-100 sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" />
              Criar Link de Pagamento
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Gere um link de pagamento que pode partilhar com os seus clientes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            {/* ── Associate to Product ── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Package className="size-3" />
                Associar a Produto do Catálogo
                <span className="text-zinc-600">(opcional)</span>
              </Label>
              <Select value={formProductId} onValueChange={handleProductSelect}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 h-10">
                  <SelectValue placeholder={productsLoading ? 'A carregar produtos...' : 'Selecionar produto'} />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f12] border-white/[0.08]">
                  <SelectItem value="__none__" className="text-zinc-400 focus:bg-white/[0.04]">
                    Nenhum produto
                  </SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id} className="text-zinc-200 focus:bg-white/[0.04]">
                      <span className="flex items-center gap-2">
                        {product.name}
                        <span className="text-zinc-500 text-xs ml-auto">
                          {currencySymbols[product.currency] ?? ''}{product.priceFiat.toFixed(2)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* ── Amount ── */}
            <div className="space-y-1.5">
              <Label htmlFor="link-amount" className="text-xs font-medium text-zinc-400">Montante *</Label>
              <Input
                id="link-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            {/* ── Currency ── */}
            <div className="space-y-1.5">
              <Label htmlFor="link-currency" className="text-xs font-medium text-zinc-400">Moeda</Label>
              <Select value={formCurrency} onValueChange={setFormCurrency}>
                <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f12] border-white/[0.08]">
                  <SelectItem value="EUR" className="text-zinc-200 focus:bg-white/[0.04]">EUR — Euro</SelectItem>
                  <SelectItem value="BRL" className="text-zinc-200 focus:bg-white/[0.04]">BRL — Real Brasileiro</SelectItem>
                  <SelectItem value="USDT" className="text-zinc-200 focus:bg-white/[0.04]">USDT — Tether</SelectItem>
                  <SelectItem value="USD" className="text-zinc-200 focus:bg-white/[0.04]">USD — Dólar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ── Description ── */}
            <div className="space-y-1.5">
              <Label htmlFor="link-desc" className="text-xs font-medium text-zinc-400">Descrição</Label>
              <Input
                id="link-desc"
                placeholder="Ex: Plano Premium Mensal"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            {/* ── Selected product indicator ── */}
            {formProductId && formProductId !== '__none__' && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20">
                <Package className="size-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-emerald-300">
                  Link associado ao produto do catálogo — o checkout exibirá a imagem e detalhes do produto.
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !formAmount || parseFloat(formAmount) <= 0}
              className={cn(
                'w-full mt-2 gap-2 text-white font-semibold h-10',
                'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
                'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
                'disabled:opacity-40 disabled:shadow-none',
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A gerar link...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Gerar Link de Pagamento
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
