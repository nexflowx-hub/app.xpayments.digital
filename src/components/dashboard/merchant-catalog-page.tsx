'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Package, Plus, Pencil, Trash2, Loader2, RefreshCw,
  Image as ImageIcon, X, Search, AlertCircle, ShoppingBag, Tag,
  MoreHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { xpApi, type Product, type MerchantStore, XPaymentsApiError } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ============================================================
// Price formatter
// ============================================================

function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function formatPrice(amount: unknown, currency: string): string {
  const symbols: Record<string, string> = { EUR: '€', USD: '$', BRL: 'R$', USDT: '₮' };
  const safe = safeNum(amount);
  return `${symbols[currency] || currency} ${safe.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================================
// Type for form data
// ============================================================

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  priceFiat: string;
  currency: string;
  storeId: string;
  images: string[];
  isActive: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  category: '',
  priceFiat: '',
  currency: 'EUR',
  storeId: '',
  images: [],
  isActive: true,
};

const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'BRL', label: 'BRL (R$)' },
  { value: 'USDT', label: 'USDT (₮)' },
];

// ============================================================
// Thumbnail component
// ============================================================

function ProductThumbnail({ src }: { src?: string }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="size-10 rounded-lg bg-zinc-800/60 border border-white/[0.06] flex items-center justify-center shrink-0">
        <ImageIcon className="size-4 text-zinc-600" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="size-10 rounded-lg object-cover border border-white/[0.06] shrink-0 bg-zinc-800"
      onError={() => setErrored(true)}
    />
  );
}

// ============================================================
// Stats Cards
// ============================================================

function StatsCards({ products, loading }: { products: Product[]; loading: boolean }) {
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const uniqueCategories = new Set(products.map((p) => p.category).filter(Boolean)).size;

  const stats = [
    {
      label: 'Total de Produtos',
      value: totalProducts,
      icon: Package,
      accent: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Produtos Ativos',
      value: activeProducts,
      icon: ShoppingBag,
      accent: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Categorias',
      value: uniqueCategories,
      icon: Tag,
      accent: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-white/[0.02] border-white/[0.06] rounded-xl"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardDescription className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </CardDescription>
            <div className={cn('flex items-center justify-center size-8 rounded-lg border', stat.bg)}>
              <stat.icon className={cn('size-4', stat.accent)} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// Product Sheet (Create / Edit)
// ============================================================

function ProductSheet({
  open,
  onOpenChange,
  editingProduct,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  onSaved: (product: Product) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM });
  const [imageInput, setImageInput] = useState('');
  const [stores, setStores] = useState<MerchantStore[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editingProduct;

  // Fetch stores when sheet opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const merchantId = useAuthStore.getState().user?.id;
    if (!merchantId) return;

    setStoresLoading(true);
    xpApi.merchant.getStores(merchantId)
      .then((data) => {
        if (cancelled) return;
        setStores(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (cancelled) return;
      })
      .finally(() => {
        if (!cancelled) setStoresLoading(false);
      });

    return () => { cancelled = true; };
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (open && editingProduct) {
      setForm({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        category: editingProduct.category || '',
        priceFiat: String(editingProduct.priceFiat),
        currency: editingProduct.currency || 'EUR',
        storeId: editingProduct.storeId || '',
        images: editingProduct.images ? [...editingProduct.images] : [],
        isActive: editingProduct.isActive ?? true,
      });
    } else if (open) {
      setForm({ ...EMPTY_FORM });
    }
    setImageInput('');
    }, [open, editingProduct]);

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setImageInput('');
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.priceFiat || !form.storeId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome, preço e selecione uma loja.',
        variant: 'destructive',
      });
      return;
    }

    const priceNum = parseFloat(form.priceFiat);
    if (isNaN(priceNum) || priceNum < 0) {
      toast({
        title: 'Preço inválido',
        description: 'Insira um valor numérico válido.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
        priceFiat: priceNum,
        currency: form.currency,
        storeId: form.storeId,
        slug: form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        images: form.images,
        isActive: form.isActive,
      };

      let product: Product;
      if (isEditing && editingProduct) {
        product = await xpApi.merchant.updateProduct(editingProduct.id, payload);
        toast({
          title: 'Produto atualizado',
          description: `"${form.name.trim()}" foi atualizado com sucesso.`,
        });
      } else {
        product = await xpApi.merchant.createProduct(payload);
        toast({
          title: 'Produto criado',
          description: `"${form.name.trim()}" foi adicionado ao catálogo.`,
        });
      }

      onOpenChange(false);
      onSaved(product);
    } catch (err: unknown) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao salvar produto.';
      toast({
        title: 'Erro',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-[#0f0f12] border-white/[0.08] sm:max-w-[520px] w-full overflow-y-auto"
      >
        <SheetHeader className="pt-6 pb-2 px-6">
          <SheetTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            {isEditing ? (
              <>
                <Pencil className="size-4 text-emerald-400" />
                Editar Produto
              </>
            ) : (
              <>
                <Plus className="size-4 text-emerald-400" />
                Novo Produto
              </>
            )}
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-500">
            {isEditing
              ? 'Atualize as informações do produto abaixo.'
              : 'Preencha os dados para adicionar um novo produto ao catálogo.'}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-4 space-y-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Ex: Camiseta Premium"
              className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              disabled={submitting}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descreva o produto..."
              rows={3}
              className="bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 resize-none"
              disabled={submitting}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Categoria</Label>
            <Input
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              placeholder="Ex: Vestuário"
              className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              disabled={submitting}
            />
          </div>

          {/* Price + Currency row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">Preço *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.priceFiat}
                onChange={(e) => updateField('priceFiat', e.target.value)}
                placeholder="0.00"
                className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">Moeda</Label>
              <Select
                value={form.currency}
                onValueChange={(v) => updateField('currency', v)}
                disabled={submitting}
              >
                <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f12] border-white/[0.08]">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-zinc-100 focus:bg-white/[0.06] focus:text-zinc-100">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loja */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Loja *</Label>
            <Select
              value={form.storeId}
              onValueChange={(v) => updateField('storeId', v)}
              disabled={submitting || storesLoading}
            >
              <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20">
                <SelectValue placeholder={storesLoading ? 'A carregar lojas...' : 'Selecione uma loja'} />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f12] border-white/[0.08]">
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-zinc-100 focus:bg-white/[0.06] focus:text-zinc-100">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Imagens */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-400">Imagens</Label>

            {/* Existing images */}
            {form.images.length > 0 && (
              <div className="space-y-2">
                {form.images.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                      <p className="text-xs font-mono text-zinc-400 truncate">{url}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImage(idx)}
                      className="h-8 w-8 shrink-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                      disabled={submitting}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new image */}
            <div className="flex items-center gap-2">
              <Input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="h-9 flex-1 bg-white/[0.03] border-white/[0.08] text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
                disabled={submitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={handleAddImage}
                disabled={!imageInput.trim() || submitting}
                className="h-9 px-3 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0"
              >
                Adicionar
              </Button>
            </div>
          </div>

          {/* Ativo Switch */}
          <div className="flex items-center justify-between py-1">
            <div>
              <Label className="text-xs font-medium text-zinc-400">Produto ativo</Label>
              <p className="text-[11px] text-zinc-600 mt-0.5">Produtos inativos não aparecem no catálogo público.</p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
              disabled={submitting}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] h-10 rounded-lg"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.priceFiat || !form.storeId || submitting}
              className={cn(
                'flex-1 gap-2 text-white h-10 rounded-lg',
                'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
                'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
                'disabled:opacity-40 disabled:shadow-none',
              )}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEditing ? (
                <Pencil className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {submitting ? 'A guardar...' : isEditing ? 'Atualizar' : 'Criar Produto'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// Table Skeleton
// ============================================================

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function MerchantCatalogPage() {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // ── Fetch products on mount ──
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    xpApi.merchant.getProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao carregar produtos.';
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Refresh callback ──
  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError('');

    try {
      const data = await xpApi.merchant.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao carregar produtos.';
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Open create sheet ──
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setSheetOpen(true);
  };

  // ── Open edit sheet ──
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setSheetOpen(true);
  };

  // ── Handle saved (create or update) ──
  const handleSaved = useCallback((product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
  }, []);

  // ── Delete product ──
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const productName = deleteTarget.name || 'Produto';
    const id = deleteTarget.id;

    // Optimistic removal
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);

    try {
      await xpApi.merchant.deleteProduct(id);
      toast({
        title: 'Produto eliminado',
        description: `"${productName}" foi removido do catálogo.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao eliminar produto.';
      toast({
        title: 'Erro',
        description: msg,
        variant: 'destructive',
      });
      // Re-fetch to restore correct state
      fetchProducts();
    }
  }, [deleteTarget, toast, fetchProducts]);

  // ── Filtered products ──
  const filteredProducts = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()) ||
        p.store?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Package className="size-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Catálogo de Produtos</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {loading
                ? 'A carregar...'
                : `${products.length} produto${products.length !== 1 ? 's' : ''} no catálogo`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchProducts(true)}
            disabled={refreshing || loading}
            className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-white/[0.06] rounded-lg"
          >
            <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
            Atualizar
          </Button>
          <Button
            onClick={handleOpenCreate}
            className={cn(
              'gap-2 text-white text-sm h-9 rounded-lg',
              'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
              'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
            )}
          >
            <Plus className="size-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <StatsCards products={products} loading={loading} />

      {/* ── Error Banner ── */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle className="size-4 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-300">Erro ao carregar produtos</p>
            <p className="text-[11px] text-red-400/70 mt-0.5 truncate">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchProducts()}
            className="h-7 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 shrink-0 rounded-lg"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── Search bar ── */}
      {!loading && !error && products.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, categoria ou loja..."
            className="h-9 pl-9 bg-white/[0.03] border-white/[0.06] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-lg"
          />
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && <TableSkeleton />}

      {/* ── Empty State ── */}
      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
            <Package className="size-7 text-zinc-600" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-1">Nenhum produto cadastrado</h3>
          <p className="text-xs text-zinc-600 mb-5 max-w-[300px]">
            Adicione o seu primeiro produto para começar a vender através da plataforma XPayments.
          </p>
          <Button
            onClick={handleOpenCreate}
            className={cn(
              'gap-2 text-white text-sm',
              'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
              'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
            )}
          >
            <Plus className="size-4" />
            Criar Primeiro Produto
          </Button>
        </div>
      )}

      {/* ── Search no results ── */}
      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="size-8 text-zinc-700 mb-3" />
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Nenhum resultado encontrado</h3>
          <p className="text-xs text-zinc-600">Tente alterar os termos da pesquisa.</p>
        </div>
      )}

      {/* ── Products Table ── */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider h-10 w-12 pl-4">Imagem</TableHead>
                  <TableHead className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider h-10">Nome</TableHead>
                  <TableHead className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider h-10">Preço</TableHead>
                  <TableHead className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider h-10 hidden sm:table-cell">Categoria</TableHead>
                  <TableHead className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider h-10 hidden md:table-cell">Loja</TableHead>
                  <TableHead className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider h-10">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider h-10 text-right pr-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Thumbnail */}
                    <TableCell className="pl-4 py-3">
                      <ProductThumbnail src={product.images?.[0]} />
                    </TableCell>

                    {/* Name */}
                    <TableCell className="py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-100 truncate max-w-[200px]">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-[11px] text-zinc-500 truncate max-w-[200px] mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="py-3">
                      <span className="text-sm font-semibold text-zinc-100">
                        {formatPrice(product.priceFiat, product.currency)}
                      </span>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-3 hidden sm:table-cell">
                      {product.category ? (
                        <span className="text-xs text-zinc-400">{product.category}</span>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </TableCell>

                    {/* Store */}
                    <TableCell className="py-3 hidden md:table-cell">
                      <span className="text-xs text-zinc-400 truncate block max-w-[160px]">
                        {product.store?.name || product.storeId}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                          product.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
                        )}
                      >
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 pr-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0f0f12] border-white/[0.08]">
                          <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                            <Pencil className="size-3.5 mr-2" /> Editar Produto
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.06]" />
                          <DropdownMenuItem onClick={() => setDeleteTarget(product)} className="text-red-400 focus:text-red-300">
                            <Trash2 className="size-3.5 mr-2" /> Eliminar Produto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── Product Sheet ── */}
      <ProductSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingProduct={editingProduct}
        onSaved={handleSaved}
      />

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0f0f12] border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Eliminar Produto</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem a certeza que pretende eliminar <strong className="text-zinc-200">{deleteTarget?.name}</strong>? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-zinc-400">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}