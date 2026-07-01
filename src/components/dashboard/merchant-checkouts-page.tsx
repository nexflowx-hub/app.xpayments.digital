'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Store, Plus, Copy, Check, RefreshCw, AlertCircle,
  Palette, Globe, Webhook, Loader2, CircleDot, Pencil, Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { xpApi, type MerchantStore, XPaymentsApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Card, CardContent,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================
// Stores / Integrações API — Gestor de Lojas Virtuais
// O Store ID é usado pelos plugins (WooCommerce / Walluxe) e pela
// API B2B para gerar sessões dinâmicas de pagamento.
// ============================================================

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
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return '—';
  }
}

// ── Store Form Dialog (Create / Edit) ──
function StoreFormDialog({
  open,
  onOpenChange,
  onSaved,
  editStore,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (store: MerchantStore) => void;
  editStore?: MerchantStore | null;
}) {
  const isEdit = !!editStore;

  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [successUrl, setSuccessUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (open && editStore) {
      setName(editStore.name || '');
      setPrimaryColor(editStore.primaryColor || '#10b981');
      setSuccessUrl(editStore.successUrl || '');
      setWebhookUrl(editStore.webhookUrl || '');
    } else if (open) {
      setName('');
      setPrimaryColor('#10b981');
      setSuccessUrl('');
      setWebhookUrl('');
    }
  }, [open, editStore]);

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
      const payload = {
        name: name.trim(),
        primaryColor: primaryColor || undefined,
        successUrl: successUrl.trim() || undefined,
        webhookUrl: webhookUrl.trim() || undefined,
      };

      const store = await xpApi.merchant.createStore(merchantId, payload);
      toast.success(isEdit ? 'Loja atualizada' : 'Loja criada', {
        description: `"${name.trim()}" ${isEdit ? 'atualizada' : 'pronta'} para integração.`,
      });
      resetForm();
      onOpenChange(false);
      onSaved(store);
    } catch (err: unknown) {
      const msg = err instanceof XPaymentsApiError ? err.message : `Erro ao ${isEdit ? 'atualizar' : 'criar'} loja.`;
      toast.error('Erro', {
        description: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="bg-[#0f0f12] border-white/[0.08] text-zinc-100 sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Store className="size-4 text-emerald-400" />
            {isEdit ? 'Editar Loja' : 'Nova Loja Virtual'}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs">
            Configure o branding e os webhooks para a integração B2B.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Store Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Nome da Loja *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Walluxe Oficial, MyShop WooCommerce"
              className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              disabled={submitting}
            />
          </div>

          {/* Primary Color */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Cor Principal (Hex)</Label>
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
            <Label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Globe className="size-3" />
              URL de Sucesso (pós-pagamento)
            </Label>
            <Input
              value={successUrl}
              onChange={(e) => setSuccessUrl(e.target.value)}
              placeholder="https://seusite.com/pagamento-confirmado"
              className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              disabled={submitting}
            />
          </div>

          {/* Webhook URL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Webhook className="size-3" />
              Webhook URL
            </Label>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://seusite.com/api/webhooks/xpayments"
              className="h-10 bg-white/[0.03] border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              disabled={submitting}
            />
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              Receba notificações POST em tempo real sobre o estado dos pagamentos desta loja.
            </p>
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
            {submitting ? 'A guardar...' : isEdit ? 'Guardar Alterações' : 'Criar Loja'}
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
      <h3 className="text-sm font-semibold text-zinc-300 mb-1">Nenhuma loja virtual configurada</h3>
      <p className="text-xs text-zinc-600 mb-5 max-w-[300px]">
        Crie a sua primeira loja para obter o Store ID necessário para integrar com o plugin WooCommerce, Walluxe ou a API B2B.
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
        Criar Primeira Loja
      </Button>
    </div>
  );
}

// ── Store Card ──
function StoreCard({
  store,
  copiedId,
  onCopyId,
  onEdit,
}: {
  store: MerchantStore;
  copiedId: string | null;
  onCopyId: (id: string) => void;
  onEdit: (store: MerchantStore) => void;
}) {
  const status = (store.status ?? 'active').toLowerCase();
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.active;
  const statusLabel = STATUS_LABELS[status] || status;
  const color = store.primaryColor || '#10b981';
  const isCopied = copiedId === `id-${store.id}`;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
      {/* Top row: icon + name + status */}
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
            <p className="text-[10px] text-zinc-600 mt-0.5">{formatDate(store.createdAt)}</p>
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

      {/* ── Store ID — critical for B2B integration ── */}
      <div className="mb-4">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Store ID</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
            <code className="text-xs font-mono text-zinc-300 block truncate">{store.id}</code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopyId(store.id)}
            className={cn(
              'shrink-0 h-9 gap-1.5 px-3 text-xs rounded-lg border transition-all duration-200',
              isCopied
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12] hover:bg-white/[0.04]',
            )}
          >
            {isCopied ? (
              <><Check className="size-3.5" /> Copiado</>
            ) : (
              <><Copy className="size-3.5" /> Copiar ID</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Branding details ── */}
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
        {store.webhookUrl && (
          <div className="flex items-center gap-1.5">
            <Webhook className="size-3 text-emerald-500" />
            <span className="text-emerald-400/70">Webhook ativo</span>
          </div>
        )}
      </div>

      {/* ── URLs ── */}
      <div className="space-y-1.5 text-[10px] text-zinc-500">
        {store.successUrl && (
          <div className="flex items-center gap-1.5 truncate">
            <Globe className="size-3 shrink-0" />
            <span className="truncate">{store.successUrl}</span>
          </div>
        )}
        {store.webhookUrl && (
          <div className="flex items-center gap-1.5 truncate">
            <Webhook className="size-3 shrink-0" />
            <span className="truncate font-mono">{store.webhookUrl}</span>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-white/[0.04]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(store)}
          className="h-7 gap-1.5 px-2.5 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] rounded-lg"
        >
          <Pencil className="size-3" />
          Editar
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function MerchantCheckoutsPage() {

  const [stores, setStores] = useState<MerchantStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editStore, setEditStore] = useState<MerchantStore | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Fetch stores (on-mount only) ──
  useEffect(() => {
    let cancelled = false;
    const mid = useAuthStore.getState().user?.id;
    if (!mid) return;

    setLoading(true);
    setError('');

    xpApi.merchant.getStores(mid)
      .then((data) => {
        if (cancelled) return;
        setStores(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao carregar lojas.';
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Manual refresh ──
  const fetchStores = useCallback(async (isRefresh = false) => {
    const mid = useAuthStore.getState().user?.id;
    if (!mid) return;

    if (isRefresh) setRefreshing(true);
    setError('');

    try {
      const data = await xpApi.merchant.getStores(mid);
      setStores(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao carregar lojas.';
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Copy Store ID ──
  const handleCopyId = (storeId: string) => {
    navigator.clipboard.writeText(storeId).then(() => {
      setCopiedId(`id-${storeId}`);
      toast.success('Store ID copiado', {
        description: 'Cole este ID no plugin WooCommerce / Walluxe ou nas chamadas à API B2B.',
      });
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(() => {
      toast.error('Erro', {
        description: 'Não foi possível copiar o Store ID.',
      });
    });
  };

  // ── Store saved (create or edit) ──
  const handleSaved = (store: MerchantStore) => {
    setStores((prev) => {
      const idx = prev.findIndex((s) => s.id === store.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = store;
        return next;
      }
      return [store, ...prev];
    });
    setEditStore(null);
  };

  // ── Edit handler ──
  const handleEdit = (store: MerchantStore) => {
    setEditStore(store);
    setShowCreate(true);
  };

  // ── Dialog close — clear edit ──
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditStore(null);
    }
    setShowCreate(open);
  };

  // ── Stats ──
  const activeStores = stores.filter((s) => (s.status ?? 'active').toLowerCase() === 'active').length;

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Store className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{stores.length}</p>
              <p className="text-xs text-zinc-500">Total de Lojas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CircleDot className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{activeStores}</p>
              <p className="text-xs text-zinc-500">Lojas Ativas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Stores / Integrações API</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {loading ? 'A carregar...' : `Gestão de lojas virtuais para integração com plugins e API B2B`}
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
            onClick={() => { setEditStore(null); setShowCreate(true); }}
            className={cn(
              'gap-2 text-white text-sm h-9 rounded-lg',
              'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
              'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
            )}
          >
            <Plus className="size-4" />
            Nova Loja
          </Button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle className="size-4 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-300">Erro ao carregar lojas</p>
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
        <EmptyState onCreateClick={() => { setEditStore(null); setShowCreate(true); }} />
      )}

      {/* ── Stores Grid ── */}
      {!loading && stores.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              copiedId={copiedId}
              onCopyId={handleCopyId}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* ── Info Banner ── */}
      {!loading && stores.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <Webhook className="size-4 text-zinc-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              O <span className="text-zinc-400 font-mono font-medium">Store ID</span> é o identificador único da loja para integração com a API B2B.
              Utilize-o nos plugins WooCommerce, Walluxe ou nas chamadas diretas ao endpoint de sessões de pagamento.
            </p>
            <p className="text-[10px] text-zinc-600 font-mono">
              POST /api/v1/payments/sessions → {`{ "storeId": "<ID>" }`}
            </p>
          </div>
        </div>
      )}

      {/* ── Form Dialog ── */}
      <StoreFormDialog
        open={showCreate}
        onOpenChange={handleDialogChange}
        onSaved={handleSaved}
        editStore={editStore}
      />
    </div>
  );
}