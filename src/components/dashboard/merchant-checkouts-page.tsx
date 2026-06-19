'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Store, Plus, Copy, Check, RefreshCw, AlertCircle,
  Palette, Link2, ExternalLink, CircleDot, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { xpApi, type MerchantStore, XPaymentsApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ============================================================
// Merchant Checkouts (Stores) Page
// GET  /api/v1/merchant/:merchantId/stores   → list
// POST /api/v1/merchant/:merchantId/stores   → create
// Payment URL → https://checkout.xpayments.digital/pay/[STORE_ID]
// ============================================================

const CHECKOUT_BASE_URL = 'https://checkout.xpayments.digital/pay';

// ── Status badge config ──
const STATUS_STYLES: Record<string, string> = {
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  suspended:'bg-red-500/15 text-red-400 border-red-500/30',
  pending:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  suspended: 'Suspenso',
  pending: 'Pendente',
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

// ── Create Store Dialog ──
function CreateStoreDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (store: MerchantStore) => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [successUrl, setSuccessUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setPrimaryColor('#10b981');
    setSuccessUrl('');
    setWebhookUrl('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const merchantId = useAuthStore.getState().user?.id;
    if (!merchantId) return;

    setSubmitting(true);
    try {
      const store = await xpApi.merchant.createStore(merchantId, {
        name: name.trim(),
        primaryColor: primaryColor || undefined,
        successUrl: successUrl.trim() || undefined,
        webhookUrl: webhookUrl.trim() || undefined,
      });
      toast({
        title: 'Checkout criado',
        description: `"${name.trim()}" está pronto para receber pagamentos.`,
      });
      resetForm();
      onOpenChange(false);
      onCreated(store);
    } catch (err: unknown) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao criar checkout.';
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="bg-[#0f0f12] border-white/[0.08] text-zinc-100 sm:max-w-[460px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Store className="size-4 text-emerald-400" />
            Criar Novo Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Nome da Loja *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Loja Principal"
              className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              disabled={submitting}
            />
          </div>

          {/* Primary Color */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Cor Primária</Label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer size-10"
                  disabled={submitting}
                />
                <div
                  className="size-10 rounded-xl border border-white/[0.08] cursor-pointer flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Palette className="size-4 text-white/80 mix-blend-difference" />
                </div>
              </div>
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#10b981"
                className="h-10 flex-1 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 font-mono focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
                disabled={submitting}
                maxLength={7}
              />
            </div>
          </div>

          {/* Success URL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Success URL (opcional)</Label>
            <Input
              value={successUrl}
              onChange={(e) => setSuccessUrl(e.target.value)}
              placeholder="https://seusite.com/obrigado"
              className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              disabled={submitting}
            />
          </div>

          {/* Webhook URL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Webhook URL (opcional)</Label>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://seusite.com/webhook/xpayments"
              className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            className={cn(
              'gap-2 text-white',
              'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
              'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
              'disabled:opacity-40 disabled:shadow-none',
            )}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {submitting ? 'A criar...' : 'Criar Checkout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Skeleton Loading ──
function StoresSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ──
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center justify-center size-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
        <Store className="size-7 text-zinc-600" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-300 mb-1">Nenhum checkout criado</h3>
      <p className="text-xs text-zinc-600 mb-5 max-w-[260px]">
        Crie o seu primeiro checkout para começar a receber pagamentos.
      </p>
      <Button
        onClick={onCreateClick}
        className={cn(
          'gap-2 text-white text-sm',
          'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
          'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
        )}
      >
        <Plus className="size-4" />
        Criar Primeiro Checkout
      </Button>
    </div>
  );
}

// ── Store Card (Grid item) ──
function StoreCard({
  store,
  copiedId,
  onCopy,
}: {
  store: MerchantStore;
  copiedId: string | null;
  onCopy: (id: string) => void;
}) {
  const status = store.status?.toUpperCase() || 'ACTIVE';
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.active;
  const statusLabel = STATUS_LABELS[status] || status;
  const paymentUrl = `${CHECKOUT_BASE_URL}/${store.id}`;
  const isCopied = copiedId === store.id;

  const color = store.primaryColor || '#10b981';

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors group">
      {/* Top row: name + status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="shrink-0 size-10 rounded-xl flex items-center justify-center border border-white/[0.08]"
            style={{ backgroundColor: `${color}15` }}
          >
            <Store className="size-4" style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">{store.name || '—'}</p>
            <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{store.id}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0', statusStyle)}
        >
          <CircleDot className="size-2.5 mr-1" />
          {statusLabel}
        </Badge>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 mb-4 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Palette className="size-3" />
          <span>Cor:</span>
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block size-3 rounded-sm border border-white/[0.1]"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-zinc-400">{color}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>{formatDate(store.createdAt)}</span>
        </div>
      </div>

      {/* Payment URL + Copy */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
          <p className="text-[11px] font-mono text-zinc-500 truncate">{paymentUrl}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(store.id)}
          className={cn(
            'shrink-0 h-9 gap-1.5 px-3 text-xs rounded-lg border transition-all duration-200',
            isCopied
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              : 'text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12] hover:bg-white/[0.04]',
          )}
        >
          {isCopied ? (
            <>
              <Check className="size-3.5" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copiar Link
            </>
          )}
        </Button>
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center justify-center size-9 rounded-lg border border-white/[0.06] text-zinc-500 hover:text-zinc-200 hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors"
          aria-label="Abrir link de pagamento"
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function MerchantCheckoutsPage() {
  const { toast } = useToast();
  const merchantId = useAuthStore((s) => s.user?.id);

  const [stores, setStores] = useState<MerchantStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Fetch stores ──
  const fetchStores = useCallback(async (isRefresh = false) => {
    if (!merchantId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const data = await xpApi.merchant.getStores(merchantId);
      setStores(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao carregar checkouts.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // ── Handle copy ──
  const handleCopy = (storeId: string) => {
    const url = `${CHECKOUT_BASE_URL}/${storeId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(storeId);
      toast({
        title: 'Link copiado',
        description: 'O link de pagamento foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(() => {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    });
  };

  // ── Handle create callback ──
  const handleCreated = (store: MerchantStore) => {
    setStores((prev) => [store, ...prev]);
  };

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Store className="size-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Checkouts de Pagamento</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {loading ? 'A carregar...' : `${stores.length} checkout${stores.length !== 1 ? 's' : ''} configurado${stores.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchStores(true)}
            disabled={refreshing || loading}
            className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-white/[0.06] rounded-lg"
          >
            <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
            Atualizar
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className={cn(
              'gap-2 text-white text-sm h-9 rounded-lg',
              'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
              'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
            )}
          >
            <Plus className="size-4" />
            Criar Novo Checkout
          </Button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle className="size-4 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-300">Erro ao carregar checkouts</p>
            <p className="text-[11px] text-red-400/70 mt-0.5 truncate">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchStores()}
            className="h-7 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 shrink-0 rounded-lg"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && <StoresSkeleton />}

      {/* ── Empty State ── */}
      {!loading && !error && stores.length === 0 && (
        <EmptyState onCreateClick={() => setShowCreate(true)} />
      )}

      {/* ── Stores Grid ── */}
      {!loading && stores.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {/* ── Info Banner ── */}
      {!loading && stores.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <Link2 className="size-4 text-zinc-500 shrink-0" />
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Cada checkout gera um <span className="text-zinc-400 font-mono">https://checkout.xpayments.digital/pay/[ID]</span> único.
            Partilhe o link com os seus clientes para receber pagamentos.
            A cor primária personaliza a experiência de checkout.
          </p>
        </div>
      )}

      {/* ── Create Dialog ── */}
      <CreateStoreDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleCreated}
      />
    </div>
  );
}