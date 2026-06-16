'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { xpApi } from '@/lib/api/client';

// ============================================================
// XPAYMENTS CORE - API Keys Management
// Conectado às rotas reais do backend:
//   GET  /merchant/api-keys      → { apiKey: "sk_live_...", storeName: "..." }
//   POST /merchant/api-keys/generate → { apiKey: "sk_live_..." }
// ============================================================

interface ApiKeyData {
  apiKey?: string;
  storeName?: string;
}

interface NewKeyData {
  apiKey: string;
  storeName?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return key.slice(0, 12) + '••••••••••••••••••••';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MerchantApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [newGeneratedKey, setNewGeneratedKey] = useState<NewKeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // ── Buscar chaves existentes ──
  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await xpApi.merchant.getApiKeys();
      // A API pode devolver um objeto ou array
      const keyList = Array.isArray(response) ? response : [response];
      setKeys(keyList);
    } catch (err) {
      console.error('[XPayments] Erro ao buscar API keys:', err);
      setError('Não foi possível carregar as chaves API. Verifique a sua conexão.');
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // ── Gerar nova chave via API ──
  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await xpApi.merchant.generateApiKey();
      const newKey: NewKeyData = {
        apiKey: response?.apiKey || response?.key || 'Erro ao gerar',
        storeName: response?.storeName,
      };
      setNewGeneratedKey(newKey);
      // Atualizar lista
      await fetchKeys();
      setCreateDialogOpen(false);
    } catch (err) {
      console.error('[XPayments] Erro ao gerar API key:', err);
      setError('Erro ao gerar nova chave. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = (id: string, key: string) => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasKeys = keys.length > 0;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
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
        <Card className="bg-neon-500/10 border-neon-500/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-neon-400" />
              <p className="text-sm font-semibold text-neon-300">Nova Chave Gerada com Sucesso</p>
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
                <code className="flex-1 text-xs font-mono text-neon-300 bg-zinc-800/50 rounded px-3 py-2 break-all select-all">
                  {newGeneratedKey.apiKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-8 text-neon-400 hover:bg-neon-500/20"
                  onClick={() => handleCopyKey('new', newGeneratedKey.apiKey)}
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <WifiOff className="size-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 flex-1">{error}</p>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/20" onClick={fetchKeys}>
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
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <Key className="h-4 w-4 text-neon-400" />
                  Chaves API
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-1">
                  {hasKeys ? 'Chaves ativas na sua conta' : 'Nenhuma chave API registada'}
                </CardDescription>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                size="sm"
                className="gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white text-xs font-semibold shadow-lg shadow-neon-900/20 h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                Gerar Nova Chave
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {hasKeys ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 text-xs font-medium">Loja</TableHead>
                      <TableHead className="text-zinc-400 text-xs font-medium">Chave API</TableHead>
                      <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((keyData, index) => {
                      const id = `key-${index}`;
                      const keyStr = keyData.apiKey || '';
                      const isRevealed = revealedIds.has(id);

                      return (
                        <TableRow key={id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neon-500/10 border border-neon-500/20 shrink-0">
                                <Key className="h-3.5 w-3.5 text-neon-400" />
                              </div>
                              <span className="text-sm text-zinc-200 font-medium">
                                {keyData.storeName || 'Chave API'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className={cn(
                                'text-xs font-mono rounded px-2 py-1 bg-zinc-800/50 max-w-[280px] truncate',
                                isRevealed ? 'text-neon-300' : 'text-zinc-400',
                              )}>
                                {isRevealed ? keyStr : maskKey(keyStr)}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 shrink-0"
                                onClick={() => handleToggleReveal(id)}
                                aria-label={isRevealed ? 'Ocultar' : 'Mostrar'}
                              >
                                {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-neon-400 hover:bg-neon-500/10"
                              onClick={() => handleCopyKey(id, keyStr)}
                              aria-label="Copiar"
                            >
                              {copiedId === id ? (
                                <Check className="h-3.5 w-3.5 text-neon-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
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
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Key className="h-5 w-5 text-neon-400" />
              Gerar Nova Chave API
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Será feita uma chamada a POST /merchant/api-keys/generate para gerar uma nova chave S2S.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/80 leading-relaxed">
                A chave gerada será mostrada apenas uma vez. Guarde-a num local seguro (ex: gestor de segredos).
                A chamada é feita diretamente ao backend XPayments.Digital.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white font-semibold shadow-lg shadow-neon-900/20"
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
