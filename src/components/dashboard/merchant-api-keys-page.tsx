'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Key,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Shield,
  RefreshCw,
  WifiOff,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { xpApi, XPaymentsApiError } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// XPAYMENTS CORE - API Keys Management
// GET    /merchant/api-keys          → [{ id, name, publicKey, secretKey, isActive, createdAt }]
// POST   /merchant/api-keys/generate → { apiKey, storeName }
// DELETE /merchant/api-keys/:id      → { success }
// ============================================================

interface ApiKeyRecord {
  id: string;
  name?: string;
  publicKey?: string;
  secretKey?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface NewKeyData {
  apiKey: string;
  storeName?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskKey(key: string): string {
  if (!key || key.length <= 12) return '••••••••';
  return key.slice(0, 12) + '••••••••••••••••••••';
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MerchantApiKeysPage() {
  const { toast } = useToast();

  // ── State ──
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [newGeneratedKey, setNewGeneratedKey] = useState<NewKeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedSecretIds, setRevealedSecretIds] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch keys (on-mount only) ──
  useEffect(() => {
    let cancelled = false;

    async function loadKeys() {
      setLoading(true);
      setError(null);
      try {
        const response = await xpApi.merchant.getApiKeys();
        if (cancelled) return;
        const keyList = Array.isArray(response) ? response : response ? [response] : [];
        setKeys(keyList as ApiKeyRecord[]);
      } catch (err) {
        if (cancelled) return;
        console.error('[XPayments] Erro ao buscar API keys:', err);
        setError('Não foi possível carregar as chaves API. Verifique a sua conexão.');
        setKeys([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadKeys();

    // Cleanup: prevent setState on unmounted component
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Generate new key ──
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await xpApi.merchant.generateApiKey();
      const apiKey = (response as Record<string, unknown>)?.apiKey || (response as Record<string, unknown>)?.key || '';
      const storeName = (response as Record<string, unknown>)?.storeName as string | undefined;

      setNewGeneratedKey({ apiKey: String(apiKey), storeName });
      setCreateDialogOpen(false);

      // Re-fetch keys to get the updated list
      const updated = await xpApi.merchant.getApiKeys();
      const keyList = Array.isArray(updated) ? updated : updated ? [updated] : [];
      setKeys(keyList as ApiKeyRecord[]);

      toast({
        title: 'Chave gerada',
        description: 'Nova chave API criada com sucesso.',
      });
    } catch (err) {
      console.error('[XPayments] Erro ao gerar API key:', err);
      const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao gerar nova chave.';
      toast({
        title: 'Erro',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  }, [toast]);

  // ── Copy to clipboard ──
  const handleCopy = useCallback((id: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedId(id);
      toast({
        title: 'Copiado',
        description: 'Chave copiada para a área de transferência.',
      });
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar.',
        variant: 'destructive',
      });
    });
  }, [toast]);

  // ── Toggle secret key visibility ──
  const handleToggleReveal = useCallback((id: string) => {
    setRevealedSecretIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Delete API key ──
  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);

    xpApi.merchant
      .deleteApiKey(id)
      .then(() => {
        // Optimistic: remove from state immediately
        setKeys((prev) => prev.filter((k) => k.id !== id));
        toast({
          title: 'Chave eliminada',
          description: 'A chave API foi removida com sucesso.',
        });
      })
      .catch((err) => {
        console.error('[XPayments] Erro ao eliminar API key:', err);
        const msg = err instanceof XPaymentsApiError ? err.message : 'Erro ao eliminar a chave.';
        toast({
          title: 'Erro',
          description: msg,
          variant: 'destructive',
        });
      })
      .finally(() => {
        setDeletingId(null);
      });
  }, [toast]);

  const hasKeys = keys.length > 0;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
        <Shield className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-zinc-200">Segurança das Chaves API</p>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            As suas chaves API permitem acesso programático à sua conta XPayments.Digital.
            Nunca partilhe as suas chaves secretas. Rotacione periodicamente.
          </p>
        </div>
      </div>

      {/* New Key Generated Alert */}
      {newGeneratedKey && (
        <Card className="bg-emerald-500/[0.08] border-emerald-500/25">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-300">Nova Chave Gerada com Sucesso</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Chave API</span>
                {newGeneratedKey.storeName && (
                  <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 bg-zinc-900">
                    {newGeneratedKey.storeName}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-emerald-300 bg-zinc-800/50 rounded px-3 py-2 break-all select-all">
                  {newGeneratedKey.apiKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-8 text-emerald-400 hover:bg-emerald-500/20"
                  onClick={() => handleCopy('new', newGeneratedKey.apiKey)}
                >
                  {copiedId === 'new' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-amber-300/70">
              Guarde esta chave num local seguro. Não será possível voltar a vê-la.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-500 hover:text-zinc-300"
              onClick={() => setNewGeneratedKey(null)}
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <WifiOff className="size-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 flex-1">{error}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-400 hover:bg-red-500/20"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-zinc-500" />
          <span className="text-sm text-zinc-500 ml-2">A carregar chaves...</span>
        </div>
      )}

      {/* Keys Table */}
      {!loading && (
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-400" />
                  Chaves API
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-1">
                  {hasKeys ? 'Chaves ativas na sua conta' : 'Nenhuma chave API registada'}
                </CardDescription>
              </div>
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
                Gerar Nova Chave
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {hasKeys ? (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-zinc-400 text-xs font-medium">Nome</TableHead>
                      <TableHead className="text-zinc-400 text-xs font-medium">Public Key</TableHead>
                      <TableHead className="text-zinc-400 text-xs font-medium">Secret Key</TableHead>
                      <TableHead className="text-zinc-400 text-xs font-medium">Estado</TableHead>
                      <TableHead className="text-zinc-400 text-xs font-medium">Criada em</TableHead>
                      <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((keyData) => {
                      const id = keyData.id;
                      const publicKey = keyData.publicKey || '';
                      const secretKey = keyData.secretKey || '';
                      const isRevealed = revealedSecretIds.has(id);
                      const isDeleting = deletingId === id;

                      return (
                        <TableRow key={id} className="border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                          {/* Name */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                                <Key className="h-3.5 w-3.5 text-emerald-400" />
                              </div>
                              <span className="text-sm text-zinc-200 font-medium">
                                {keyData.name || 'Chave API'}
                              </span>
                            </div>
                          </TableCell>

                          {/* Public Key */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono text-zinc-400 rounded px-2 py-1 bg-white/[0.03] max-w-[220px] truncate">
                                {publicKey || '—'}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] shrink-0"
                                onClick={() => handleCopy(`pub-${id}`, publicKey)}
                                aria-label="Copiar public key"
                              >
                                {copiedId === `pub-${id}` ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>

                          {/* Secret Key (masked with eye-reveal) */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className={cn(
                                'text-xs font-mono rounded px-2 py-1 bg-white/[0.03] max-w-[220px] truncate',
                                isRevealed ? 'text-amber-300' : 'text-zinc-400',
                              )}>
                                {isRevealed ? secretKey : maskKey(secretKey)}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] shrink-0"
                                onClick={() => handleToggleReveal(id)}
                                aria-label={isRevealed ? 'Ocultar' : 'Mostrar'}
                              >
                                {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] shrink-0"
                                onClick={() => handleCopy(`sec-${id}`, secretKey)}
                                aria-label="Copiar secret key"
                              >
                                {copiedId === `sec-${id}` ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                                keyData.isActive !== false
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
                              )}
                            >
                              {keyData.isActive !== false ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>

                          {/* Created At */}
                          <TableCell>
                            <span className="text-xs text-zinc-500 whitespace-nowrap">
                              {formatDate(keyData.createdAt)}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-500/10 shrink-0"
                              onClick={() => handleDelete(id)}
                              disabled={isDeleting}
                              aria-label="Eliminar chave"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Key className="size-10 text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-400 mb-1">Nenhuma chave API encontrada</p>
                <p className="text-xs text-zinc-600">Clique em &quot;Gerar Nova Chave&quot; para criar a sua primeira integração.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generate Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[#0f0f12] border-white/[0.08] text-zinc-100 sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-400" />
              Gerar Nova Chave API
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Será feita uma chamada a POST /merchant/api-keys/generate para gerar uma nova chave S2S.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/80 leading-relaxed">
                A chave gerada será mostrada apenas uma vez. Guarde-a num local seguro (ex: gestor de segredos).
                A chamada é feita diretamente ao backend XPayments.Digital.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className={cn(
                'w-full gap-2 text-white font-semibold',
                'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
                'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
              )}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A gerar chave via API...
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