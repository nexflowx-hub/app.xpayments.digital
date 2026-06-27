'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { xpApi, type Product } from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Types — Alinhados com o Prisma
// ---------------------------------------------------------------------------

interface PaymentLink {
  id: string;
  storeId?: string;
  name?: string;
  amountFiat?: number | string;
  currency?: string;
  description?: string;
  urlCode?: string;
  url?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
}

// Extrator numérico seguro — nunca rebenta com undefined / NaN / string
function safeNum(val: unknown, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
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
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('BRL');
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
      setFormName(product.name);
      setFormDescription(product.description || '');
      setFormAmount(String(safeNum(product.priceFiat)));
      if (['EUR', 'USD', 'BRL', 'USDT'].includes(product.currency)) {
        setFormCurrency(product.currency);
      }
    }
  }, [products]);

  // ── Reset form ──
  const resetForm = useCallback(() => {
    setFormName('');
    setFormAmount('');
    setFormCurrency('BRL');
    setFormDescription('');
    setFormProductId('');
  }, []);

  // ── Create link via API ──
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const resolvedAmount = safeNum(formAmount);

      const payload = {
        name: formName || 'Cobrança', // Obrigatório no Prisma
        amountFiat: resolvedAmount,   // Corrigido: envia amountFiat em vez de amount
        currency: formCurrency || 'BRL',
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
    } catch (error) {
      console.error('[XPayments] Erro na criação do link:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getFullUrl = (urlCode?: string) =>
    urlCode ? `https://checkout.xpayments.digital/pay/${urlCode}` : '';

  const handleCopyLink = (id: string, urlCode?: string) => {
    if (!urlCode) return;
    navigator.clipboard.writeText(getFullUrl(urlCode));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const currencySymbols: Record<string, string> = { EUR: '€', BRL: 'R$', USDT: '₮', USD: '$' };

  const stats = {
    active: links.filter((l) => l.isActive !== false && l.status !== 'cancelled').length,
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : links.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
                <LinkIcon className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-base font-semibold text-zinc-300 mb-1">Sem links de pagamento</h3>
              <p className="text-sm text-zinc-500 mb-4 text-center max-w-sm">
                Crie o seu primeiro link de pagamento para começar a faturar.
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
                    <TableHead className="text-zinc-400 text-xs font-medium">Nome / Link</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium text-right">Montante</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Moeda</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Estado</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Criado em</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => {
                    const statusCfg = LINK_STATUS_CONFIG[link.status ?? 'active'] || LINK_STATUS_CONFIG['active'];
                    const amountSafe = safeNum(link.amountFiat);

                    return (
                      <TableRow key={link.id} className="border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                        <TableCell>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm text-zinc-200 font-medium truncate">
                              {link.name || 'Pagamento'}
                            </span>
                            <code className="text-[10px] text-zinc-500 font-mono truncate max-w-[220px]">
                              {link.urlCode ? `/pay/${link.urlCode}` : (link.url || '—')}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono text-zinc-200 whitespace-nowrap">
                          {currencySymbols[link.currency ?? ''] ?? ''}{amountSafe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] bg-white/[0.04] text-zinc-300 border-white/[0.08] px-2 py-0 h-5">
                            {link.currency ?? '—'}
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
                              onClick={() => handleCopyLink(link.id, link.urlCode)}
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
                              onClick={() => {
                                const url = link.urlCode ? getFullUrl(link.urlCode) : link.url;
                                if (url) window.open(url, '_blank', 'noopener');
                              }}
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
            {/* ── Nome da Cobrança ── */}
            <div className="space-y-1.5">
              <Label htmlFor="link-name" className="text-xs font-medium text-zinc-400">
                Nome da Cobrança *
              </Label>
              <Input
                id="link-name"
                type="text"
                placeholder="Ex: Plano Premium Mensal"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

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
                          {currencySymbols[product.currency ?? ''] ?? ''}{safeNum(product.priceFiat).toFixed(2)}
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
                  <SelectItem value="BRL" className="text-zinc-200 focus:bg-white/[0.04]">BRL — Real Brasileiro</SelectItem>
                  <SelectItem value="EUR" className="text-zinc-200 focus:bg-white/[0.04]">EUR — Euro</SelectItem>
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
                placeholder="Ex: Assinatura mensal do plano premium"
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