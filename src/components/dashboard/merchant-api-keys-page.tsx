'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Key, Plus, Copy, Check, Eye, EyeOff, Trash2,
  Loader2, AlertTriangle, Shield, RefreshCw, WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { xpApi, XPaymentsApiError } from '@/lib/api/client';

// ============================================================
// XPAYMENTS CORE - API Keys Management
//   GET    /merchant/api-keys         → [{ id, name, publicKey, secretKey, isActive, createdAt }]
//   POST   /merchant/api-keys/generate → { publicKey, secretKey, ... }
//   DELETE /merchant/api-keys/:id      → 204 / 200
// ============================================================

interface ApiKeyItem {
  id: string;
  name?: string;
  publicKey?: string;
  secretKey?: string;
  isActive?: boolean;
  createdAt?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskKey(key: string): string {
  if (!key || key.length <= 10) return '••••••••••';
  return key.slice(0, 10) + '••••••••••••••••';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MerchantApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newGeneratedKey, setNewGeneratedKey] = useState<{ publicKey: string; secretKey: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null); // "pub-{id}" | "sec-{id}" | "new-pub" | "new-sec"
  const [revealedRow, setRevealedRow] = useState<string | null>(null); // row id showing secretKey
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch keys ──
  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await xpApi.merchant.getApiKeys();
      const list = Array.isArray(response) ? response : response ? [response] : [];
      setKeys(list as ApiKeyItem[]);
    } catch (err) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao carregar chaves.';
      setError(msg);
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // ── Generate new key ──
  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await xpApi.merchant.generateApiKey() as Record<string, unknown>;
      const pubKey = (response?.publicKey as string) || (response?.apiKey as string) || '';
      const secKey = (response?.secretKey as string) || '';
      const name = response?.name as string | undefined;

      if (!pubKey) {
        toast.error('Erro: a API não devolveu uma chave pública.');
        return;
      }

      setNewGeneratedKey({ publicKey: pubKey, secretKey: secKey, name });
      await fetchKeys();
      setCreateDialogOpen(false);
      toast.success('Chave API gerada com sucesso.');
    } catch (err) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao gerar chave.';
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  // ── Delete key ──
  const handleDelete = async (id: string, name?: string) => {
    setDeletingId(id);
    try {
      await xpApi.merchant.deleteApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      if (revealedRow === id) setRevealedRow(null);
      toast.success(`Chave "${name || id}" eliminada.`);
    } catch (err) {
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao eliminar chave.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Copy to clipboard ──
  const handleCopy = (fieldId: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success('Copiado para a área de transferência.');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Toggle reveal secret ──
  const handleToggleReveal = (id: string) => {
    setRevealedRow((prev) => (prev === id ? null : id));
  };

  const hasKeys = keys.length > 0;

  // ── Copy button helper ──
  const CopyBtn = ({ fieldId, text }: { fieldId: string; text: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] shrink-0"
      onClick={() => handleCopy(fieldId, text)}
      aria-label="Copiar"
    >
      {copiedField === fieldId ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Key className="size-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Chaves API</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {loading ? 'A carregar...' : `${keys.length} chave${keys.length !== 1 ? 's' : ''} registada${keys.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchKeys()}
            disabled={loading}
            className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-white/[0.06] rounded-lg"
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Atualizar
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="sm"
            className="gap-2 text-white text-xs font-semibold h-8 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.2)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Gerar Nova Chave
          </Button>
        </div>
      </div>

      {/* ── Security Banner ── */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
        <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-zinc-200">Segurança das Chaves API</p>
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
            As chaves públicas identificam a sua integração. As chaves secretas autenticam pedidos — nunca as partilhe. Rotacione periodicamente.
          </p>
        </div>
      </div>

      {/* ── New Key Generated Alert ── */}
      {newGeneratedKey && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-300">Nova Chave Gerada com Sucesso</p>
          </div>
          <div className="space-y-3">
            {/* Public Key */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Public Key</span>
                {newGeneratedKey.name && (
                  <Badge variant="outline" className="text-[10px] border-white/[0.08] text-zinc-400 bg-white/[0.03]">
                    {newGeneratedKey.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-zinc-200 bg-white/[0.04] rounded-lg px-3 py-2 break-all select-all">
                  {newGeneratedKey.publicKey}
                </code>
                <CopyBtn fieldId="new-pub" text={newGeneratedKey.publicKey} />
              </div>
            </div>
            {/* Secret Key */}
            {newGeneratedKey.secretKey && (
              <div className="p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/15 space-y-2">
                <span className="text-[10px] text-amber-400/80 uppercase tracking-wider">Secret Key</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-amber-200 bg-amber-500/[0.06] rounded-lg px-3 py-2 break-all select-all">
                    {newGeneratedKey.secretKey}
                  </code>
                  <CopyBtn fieldId="new-sec" text={newGeneratedKey.secretKey} />
                </div>
              </div>
            )}
          </div>
          <p className="text-[10px] text-amber-400/60">
            Guarde a Secret Key num local seguro. Não será possível voltar a vê-la.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-500 hover:text-zinc-300"
            onClick={() => setNewGeneratedKey(null)}
          >
            Fechar
          </Button>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.06] border border-red-500/20">
          <WifiOff className="size-4 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-300">Erro ao carregar chaves</p>
            <p className="text-[11px] text-red-400/70 mt-0.5 truncate">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 shrink-0 rounded-lg"
            onClick={fetchKeys}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-5 animate-spin text-zinc-500" />
          <span className="text-sm text-zinc-500 ml-2">A carregar chaves...</span>
        </div>
      )}

      {/* ── Keys Table ── */}
      {!loading && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {/* Table Header */}
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-zinc-200">Chaves Registadas</h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              {hasKeys ? 'Clique no olho para revelar a Secret Key da linha' : 'Nenhuma chave API registada'}
            </p>
          </div>

          {hasKeys ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-5 py-3">Nome</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">Chave</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">Estado</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-4 py-3">Criada em</th>
                      <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-5 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {keys.map((item) => {
                      const showSecret = revealedRow === item.id;
                      const displayKey = showSecret
                        ? (item.secretKey || item.publicKey || '')
                        : (item.publicKey || '');

                      return (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center size-7 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0">
                                <Key className="size-3 text-zinc-500" />
                              </div>
                              <span className="text-sm text-zinc-200 font-medium truncate max-w-[160px]">
                                {item.name || 'Chave API'}
                              </span>
                            </div>
                          </td>

                          {/* Key */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <code
                                className={cn(
                                  'text-xs font-mono rounded px-2 py-1 bg-white/[0.03] max-w-[240px] truncate block',
                                  showSecret ? 'text-amber-300' : 'text-zinc-400',
                                )}
                                title={displayKey}
                              >
                                {showSecret ? displayKey : maskKey(displayKey)}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] shrink-0"
                                onClick={() => handleToggleReveal(item.id)}
                                aria-label={showSecret ? 'Ocultar secret' : 'Revelar secret'}
                              >
                                {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <CopyBtn fieldId={`key-${item.id}`} text={displayKey} />
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                                item.isActive !== false
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
                              )}
                            >
                              {item.isActive !== false ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-zinc-500">{formatDate(item.createdAt)}</span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                              onClick={() => handleDelete(item.id, item.name)}
                              disabled={deletingId === item.id}
                              aria-label="Eliminar chave"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/[0.04]">
                {keys.map((item) => {
                  const showSecret = revealedRow === item.id;
                  const displayKey = showSecret
                    ? (item.secretKey || item.publicKey || '')
                    : (item.publicKey || '');

                  return (
                    <div key={item.id} className="px-4 py-4 space-y-3">
                      {/* Top row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex items-center justify-center size-7 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0">
                            <Key className="size-3 text-zinc-500" />
                          </div>
                          <span className="text-sm text-zinc-200 font-medium truncate">
                            {item.name || 'Chave API'}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0',
                            item.isActive !== false
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
                          )}
                        >
                          {item.isActive !== false ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>

                      {/* Key display */}
                      <div className="flex items-center gap-1.5">
                        <code
                          className={cn(
                            'flex-1 text-xs font-mono rounded px-2 py-1.5 bg-white/[0.03] truncate block',
                            showSecret ? 'text-amber-300' : 'text-zinc-400',
                          )}
                        >
                          {showSecret ? displayKey : maskKey(displayKey)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] shrink-0"
                          onClick={() => handleToggleReveal(item.id)}
                          aria-label={showSecret ? 'Ocultar' : 'Revelar'}
                        >
                          {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <CopyBtn fieldId={`key-${item.id}`} text={displayKey} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={deletingId === item.id}
                          aria-label="Eliminar"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>

                      <p className="text-[10px] text-zinc-600">{formatDate(item.createdAt)}</p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Key className="size-10 text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-400 mb-1">Nenhuma chave API encontrada</p>
              <p className="text-xs text-zinc-600">Clique em &quot;Gerar Nova Chave&quot; para criar a sua primeira integração.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Generate Dialog ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[#0f0f12] border-white/[0.08] text-zinc-100 sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" />
              Gerar Nova Chave API
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Será gerado um par de chaves (Public + Secret) para autenticação S2S.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/80 leading-relaxed">
                A Secret Key será mostrada apenas uma vez. Guarde-a num local seguro (ex: gestor de segredos).
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full gap-2 text-white font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.2)] disabled:opacity-40"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A gerar chave...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Gerar Nova Chave
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}