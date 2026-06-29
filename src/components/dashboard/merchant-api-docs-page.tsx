'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Tooltip already includes TooltipProvider internally — no wrapper needed
import {
  Shield,
  Webhook,
  Package,
  Copy,
  Check,
  Terminal,
  Zap,
  AlertTriangle,
  Key,
  Eye,
  Info,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth-store';
import { xpApi, type MerchantStore } from '@/lib/api/client';

// ============================================================
// Types
// ============================================================

interface ApiKeyRecord {
  id: string;
  name?: string;
  publicKey?: string;
  secretKey?: string;
  isActive?: boolean;
}

interface HydrationState {
  activeStoreId: string;
  activeSecretKey: string;
  loading: boolean;
}

// ============================================================
// CodeBlock — with copy + language badge
// ============================================================

function CodeBlock({
  code,
  language = 'json',
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast({ title: 'Copiado!', description: 'Código copiado para a área de transferência.' });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code, toast]);

  return (
    <div className={cn('relative rounded-xl bg-zinc-900/80 border border-white/[0.06] overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.015]">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.04] transition-colors"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-xs font-mono text-emerald-300/90 leading-relaxed whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

// ============================================================
// MethodBadge — colored HTTP verb
// ============================================================

function MethodBadge({ method }: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' }) {
  const colorMap: Record<string, string> = {
    GET: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PATCH: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <Badge
      variant="outline"
      className={cn('font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border', colorMap[method])}
    >
      {method}
    </Badge>
  );
}

// ============================================================
// EndpointCard — documents one endpoint
// ============================================================

function EndpointCard({
  method,
  path,
  title,
  description,
  code,
  codeLang,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  code: string;
  codeLang?: string;
}) {
  return (
    <Card className="bg-white/[0.02] border-white/[0.06]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <MethodBadge method={method} />
          <code className="text-sm font-mono text-emerald-300/80 break-all">{path}</code>
        </div>
        <CardTitle className="text-sm text-zinc-200 mt-2">{title}</CardTitle>
        <p className="text-zinc-500 text-xs leading-relaxed">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <CodeBlock code={code} language={codeLang || 'json'} />
      </CardContent>
    </Card>
  );
}

// ============================================================
// AIBlock — highlighted AI prompt panel
// ============================================================

function AIBlock({
  title,
  description,
  prompt,
  icon: Icon,
}: {
  title: string;
  description: string;
  prompt: string;
  icon: React.ElementType;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      toast({ title: 'Prompt copiado!', description: 'Cole no ChatGPT, Cursor ou Claude para obter a integração completa.' });
      setTimeout(() => setCopied(false), 2500);
    });
  }, [prompt, toast]);

  return (
    <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent">
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/[0.06] blur-3xl" />
      <CardHeader className="relative pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
            <Icon className="size-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm text-emerald-300 font-semibold">{title}</CardTitle>
            <p className="text-zinc-500 text-xs mt-0.5">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0 space-y-4">
        <div className="relative rounded-xl bg-zinc-950/60 border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.015]">
            <div className="flex items-center gap-2">
              <Terminal className="size-3 text-zinc-600" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">prompt</span>
            </div>
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
              pronto a copiar
            </Badge>
          </div>
          <pre className="p-4 overflow-x-auto max-h-72 overflow-y-auto">
            <code className="text-[11px] sm:text-xs font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">{prompt}</code>
          </pre>
        </div>
        <Button
          onClick={handleCopy}
          className={cn(
            'w-full h-11 text-sm font-semibold transition-all duration-300',
            copied
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
          )}
        >
          {copied ? (
            <>
              <Check className="size-4 mr-2" />
              Prompt Copiado!
            </>
          ) : (
            <>
              <Copy className="size-4 mr-2" />
              Copiar Prompt
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SecurityAlert — amber/red warning card
// ============================================================

function SecurityAlert({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-amber-500/20 bg-amber-500/[0.03]">
      <CardContent className="flex items-start gap-3 pt-5">
        <div className="flex items-center justify-center size-9 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0 mt-0.5">
          <AlertTriangle className="size-4 text-amber-400" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm leading-relaxed text-zinc-300">{children}</div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// InfoTip — inline tooltip wrapper
// ============================================================

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-3.5 text-zinc-500 cursor-help inline" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs text-zinc-300 bg-zinc-800 border-white/[0.08]">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================
// Loading Skeleton for whole page
// ============================================================

function DocsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center space-y-4">
        <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function MerchantApiDocsPage() {
  // ── Dynamic Hydration State ──
  const [hydration, setHydration] = useState<HydrationState>({
    activeStoreId: '[SEU_STORE_ID]',
    activeSecretKey: '[SUA_SECRET_KEY]',
    loading: true,
  });

  // ── Fetch Stores + API Keys on mount ──
  useEffect(() => {
    let cancelled = false;

    async function loadHydrationData() {
      const merchantId = useAuthStore.getState().user?.id;
      let storeId = '[SEU_STORE_ID]';
      let secretKey = '[SUA_SECRET_KEY]';

      const promises: Promise<void>[] = [];

      // Fetch stores
      if (merchantId) {
        promises.push(
          xpApi.merchant.getStores(merchantId)
            .then((stores) => {
              if (!cancelled && Array.isArray(stores) && stores.length > 0) {
                storeId = (stores as MerchantStore[])[0].id;
              }
            })
            .catch(() => { /* silent */ })
        );
      }

      // Fetch API keys
      promises.push(
        xpApi.merchant.getApiKeys()
          .then((res) => {
            if (!cancelled) {
              const keyList = Array.isArray(res) ? res : res ? [res] : [];
              const firstWithSecret = (keyList as ApiKeyRecord[]).find((k) => k.secretKey);
              if (firstWithSecret?.secretKey) {
                secretKey = firstWithSecret.secretKey;
              }
            }
          })
          .catch(() => { /* silent */ })
      );

      await Promise.allSettled(promises);

      if (!cancelled) {
        setHydration({ activeStoreId: storeId, activeSecretKey: secretKey, loading: false });
      }
    }

    loadHydrationData();
    return () => { cancelled = true; };
  }, []);

  // ── Derived: dynamic prompts ──
  const checkoutPrompt = useMemo(() => {
    return `Atua como um Senior Fullstack Developer. Quero integrar o gateway XPayments na minha loja web.

SEGURANÇA: Adiciona as chaves ao meu .env (XPAYMENTS_SECRET_KEY=${hydration.activeSecretKey} e XPAYMENTS_STORE_ID=${hydration.activeStoreId}). Não as exponhas no frontend.

PASSO 1: Cria um endpoint Backend para fazer POST a https://api.xpayments.digital/api/v1/checkout/sessions (usa o Header Authorization Bearer). O payload precisa do storeId, amountFiat, currency e orderId.

PASSO 2 (Frontend Seamless): Quando o cliente clicar em 'Pagar', não redireciones. Abre o URL devolvido pela sessão num Modal  sobre o meu site.

PASSO 3 (Auto-Close): Ouve o sucesso do iframe no frontend via window.addEventListener('message', (e) => { if(e.data === 'XPAYMENTS_PAYMENT_SUCCESS') fecharIframe(); });

PASSO 4 (Webhook): Cria a rota POST /api/webhooks/xpayments para receber o JSON 'payment.success', processar a transação e mudar a encomenda para PAGA na minha base de dados local.`;
  }, [hydration.activeStoreId, hydration.activeSecretKey]);

  const catalogPrompt = useMemo(() => {
    return `Atua como um Senior Fullstack Developer. Quero automatizar a sincronização dos produtos da minha loja com a plataforma XPayments via API.

SEGURANÇA: Lê o XPAYMENTS_SECRET_KEY e XPAYMENTS_STORE_ID=${hydration.activeStoreId} do meu ficheiro .env. As chamadas devem ser feitas no servidor.

PASSO 1: Cria um worker/serviço que lê os meus produtos locais.

PASSO 2: Para criar/atualizar produtos, faz POST/PUT para https://api.xpayments.digital/api/v1/merchant/products usando Authorization Bearer. O body deve incluir storeId, name, description, priceFiat, currency (ex: 'BRL' ou 'EUR') e images (que é um array de URLs de imagens externas).

Garante que a integração trata os erros de rede e devolve logs de sucesso.`;
  }, [hydration.activeStoreId]);

  // ── Derived: dynamic code blocks ──
  const envBlock = useMemo(() => {
    return `XPAYMENTS_SECRET_KEY=${hydration.activeSecretKey}
XPAYMENTS_STORE_ID=${hydration.activeStoreId}`;
  }, [hydration.activeSecretKey, hydration.activeStoreId]);

  // ── Loading state ──
  if (hydration.loading) {
    return <DocsSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[28rem] rounded-full bg-emerald-500/[0.07] blur-3xl" />
          <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center space-y-4">
            <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <Terminal className="size-7 text-emerald-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
              Documentação da API
            </h1>
            <p className="mx-auto max-w-2xl text-zinc-400 text-sm sm:text-base leading-relaxed">
              Guia completo para integrar a XPayments.Digital. Chaves e IDs reais são
              injetados automaticamente nos blocos de código.
            </p>
            <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono">REST</Badge>
              <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">JSON</Badge>
              <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">Webhooks</Badge>
              <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">AI-Ready</Badge>
            </div>
          </div>
        </div>

        {/* ── Hydration Indicator ──────────────────────────────── */}
        <div className="flex items-center gap-3 px-1">
          <div className={cn(
            'size-2 rounded-full',
            hydration.activeStoreId !== '[SEU_STORE_ID]'
              ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
              : 'bg-amber-400 shadow-sm shadow-amber-400/50'
          )} />
          <span className="text-xs text-zinc-500">
            {hydration.activeStoreId !== '[SEU_STORE_ID]'
              ? <>Chaves reais carregadas — Store: <code className="text-emerald-400/80 font-mono">{hydration.activeStoreId}</code></>
              : 'A mostrar placeholders. Crie uma Store e uma API Key para ativar a injeção dinâmica.'}
          </span>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="bg-white/[0.03] border border-white/[0.06] h-auto p-1 w-full flex">
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
            >
              <Shield className="size-3.5 shrink-0" />
              <span className="truncate">Segurança & Auth</span>
            </TabsTrigger>
            <TabsTrigger
              value="checkout"
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
            >
              <Zap className="size-3.5 shrink-0" />
              <span className="truncate">Checkout & Webhooks</span>
            </TabsTrigger>
            <TabsTrigger
              value="catalog"
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
            >
              <Package className="size-3.5 shrink-0" />
              <span className="truncate">Catálogo (ERP)</span>
            </TabsTrigger>
          </TabsList>

          {/* ==========================================================
              TAB 1 — Segurança & Autenticação
          ========================================================== */}
          <TabsContent value="security" className="space-y-6 mt-6">
            {/* Security Alert */}
            <SecurityAlert>
              <p className="font-semibold text-amber-300">Nunca exponhas a tua Secret Key no Frontend.</p>
              <p className="text-zinc-400 mt-1">
                Todas as chamadas à API XPayments devem partir sempre do teu Backend
                (Server Actions, Node.js, PHP, Python, etc). A Secret Key só deve existir
                no servidor como variável de ambiente.
              </p>
            </SecurityAlert>

            {/* .env Block */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="size-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-zinc-100">Variáveis de Ambiente (.env)</h3>
                <InfoTip text="Cria um ficheiro .env na raiz do teu projeto backend. Nunca o envies para o Git (adiciona .env ao .gitignore)." />
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Adiciona as tuas chaves reais ao ficheiro <code className="font-mono text-emerald-300/80">.env</code> do teu projeto backend.
                O painel injeta automaticamente os teus valores reais abaixo:
              </p>
              <CodeBlock code={envBlock} language="env" />
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Auth Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-zinc-100">Header de Autenticação</h3>
                <InfoTip text="Todas as rotas privadas da API XPayments exigem este cabeçalho. Sem ele, receberás 401 Unauthorized." />
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Todas as requests autenticadas devem incluir o cabeçalho{' '}
                <code className="font-mono text-zinc-300">Authorization</code> com a tua Secret Key:
              </p>
              <CodeBlock
                language="http"
                code={`Authorization: Bearer ${hydration.activeSecretKey}`}
              />
              <p className="text-zinc-500 text-xs leading-relaxed">
                Exemplo em Node.js:{' '}
                <code className="font-mono text-emerald-300/70">Authorization: Bearer process.env.XPAYMENTS_SECRET_KEY</code>
              </p>
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Key rotation tip */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="flex items-start gap-3 pt-5">
                <div className="flex items-center justify-center size-9 rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0">
                  <Eye className="size-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Rotação de Chaves</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                    Se suspeitares que a tua Secret Key foi comprometida, gera uma nova na página{' '}
                    <span className="text-emerald-400 font-medium">Chaves da API</span> e atualiza o teu ficheiro .env.
                    A chave antiga será desativada automaticamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==========================================================
              TAB 2 — Checkout & Webhooks
          ========================================================== */}
          <TabsContent value="checkout" className="space-y-6 mt-6">
            {/* Checkout Session Endpoint */}
            <EndpointCard
              method="POST"
              path="https://api.xpayments.digital/api/v1/checkout/sessions"
              title="Criar Sessão de Checkout"
              description="Cria uma sessão de pagamento e devolve a URL para abrir o checkout. O parâmetro UI no URL de retorno permite personalizar a experiência: ?theme=dark&locale=pt-BR"
              code={JSON.stringify({
                storeId: hydration.activeStoreId,
                amountFiat: 100.0,
                currency: 'EUR',
                orderId: 'ORD-2024-001',
              }, null, 2)}
              codeLang="json"
            />

            {/* Response Example */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Response — 200 OK</span>
              </div>
              <CodeBlock
                language="json"
                code={JSON.stringify({
                  success: true,
                  data: {
                    id: 'sess_xyz789',
                    url: `https://checkout.xpayments.digital/pay/${hydration.activeStoreId}?session=sess_xyz789`,
                    status: 'pending',
                  },
                }, null, 2)}
              />
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* UI Params Tip */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-emerald-400" />
                  <CardTitle className="text-sm text-zinc-200">Parâmetros de UI no URL</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Podes adicionar query params ao URL de retorno para personalizar o checkout:
                </p>
                <CodeBlock
                  language="text"
                  code={`?theme=dark&locale=pt-BR

Parâmetros disponíveis:
  theme    → dark | light  (padrão: dark)
  locale   → pt-BR | en-US | es-ES
  primaryColor → #hex  (cor primária do checkout)`}
                />
              </CardContent>
            </Card>

            <Separator className="bg-white/[0.06]" />

            {/* Webhook Event */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Webhook className="size-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-zinc-100">Webhook — payment.success</h3>
                <InfoTip text="Configura o Webhook URL na tua Store para receber notificações em tempo real quando pagamentos forem concluídos." />
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Quando um pagamento é concluído com sucesso, a XPayments envia um{' '}
                <MethodBadge method="POST" /> para o <code className="text-xs font-mono text-emerald-300/80">webhookUrl</code> configurado na tua Store.
              </p>
              <CodeBlock
                language="json"
                code={JSON.stringify({
                  event: 'payment.success',
                  timestamp: '2024-01-15T14:30:00Z',
                  data: {
                    transactionId: 'txn_abc123',
                    orderId: 'ORD-2024-001',
                    amount: 100.0,
                    currency: 'EUR',
                    customer: {
                      name: 'João Silva',
                      email: 'joao@exemplo.com',
                    },
                  },
                }, null, 2)}
              />
            </div>

            {/* Signature Verification */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-emerald-400" />
                  <CardTitle className="text-sm text-zinc-200">Validação de Assinatura</CardTitle>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Valida o cabeçalho <code className="font-mono text-emerald-300/80">x-xpayments-signature</code> usando HMAC-SHA256:
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <CodeBlock
                  language="javascript"
                  code={`const crypto = require('crypto');

const signature = crypto
  .createHmac('sha256', process.env.XPAYMENTS_SECRET_KEY)
  .update(rawBody)
  .digest('hex');

const isValid = signature === req.headers['x-xpayments-signature'];`}
                />
              </CardContent>
            </Card>

            <Separator className="bg-white/[0.06]" />

            {/* AI Prompt Block — Checkout */}
            <AIBlock
              icon={Zap}
              title="Gerar Checkout via IA"
              description="Copia o prompt abaixo e cola no ChatGPT, Cursor ou Claude. O assistente criará a integração completa com as tuas chaves reais."
              prompt={checkoutPrompt}
            />

            {/* Webhook AI Tip */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="flex items-start gap-3 pt-5">
                <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0 mt-0.5">
                  <ArrowRight className="size-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Fluxo completo</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                    O prompt inclui: criação de sessão via backend, modal iframe no frontend, auto-close via{' '}
                    <code className="font-mono text-emerald-300/70">postMessage</code>, e webhook para atualizar a tua BD local.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==========================================================
              TAB 3 — Catálogo (ERP Sync)
          ========================================================== */}
          <TabsContent value="catalog" className="space-y-6 mt-6">
            {/* Intro */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-zinc-100">Sincronização de Catálogo</h3>
                <InfoTip text="Utiliza estas rotas para sincronizar o inventário do teu ERP ou base de dados com a XPayments. As imagens são enviadas como URLs externas (CDN, S3, etc.)." />
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Se tens um ERP, WooCommerce, ou qualquer base de dados de produtos,
                utiliza estas rotas para manter o catálogo sincronizado com a XPayments.
                O campo <code className="font-mono text-emerald-300/80">images</code> aceita um array de URLs de imagem externas.
              </p>
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* GET Products */}
            <EndpointCard
              method="GET"
              path="https://api.xpayments.digital/api/v1/merchant/products"
              title="Listar Produtos"
              description="Devolve todos os produtos associados ao teu Merchant. Útil para auditoria e sincronização inicial."
              code={`GET /api/v1/merchant/products
Authorization: Bearer ${hydration.activeSecretKey}

// Response 200:
[
  {
    "id": "prod_abc",
    "name": "Camiseta Premium",
    "priceFiat": 49.90,
    "currency": "BRL",
    "images": ["https://cdn.loja.com/img1.jpg"]
  }
]`}
              codeLang="http"
            />

            {/* POST Product */}
            <EndpointCard
              method="POST"
              path="https://api.xpayments.digital/api/v1/merchant/products"
              title="Criar Produto"
              description="Adiciona um novo produto ao teu catálogo na XPayments. O storeId é obrigatório e vincula o produto à tua loja."
              code={JSON.stringify({
                storeId: hydration.activeStoreId,
                name: 'Camiseta Premium',
                description: 'Camiseta 100% algodão, corte regular',
                priceFiat: 49.9,
                currency: 'BRL',
                images: ['https://cdn.loja.com/camiseta-premium.jpg'],
              }, null, 2)}
              codeLang="json"
            />

            {/* PUT Product */}
            <EndpointCard
              method="PUT"
              path="https://api.xpayments.digital/api/v1/merchant/products/:id"
              title="Atualizar Produto"
              description="Atualiza os campos de um produto existente. Envia apenas os campos que queres alterar."
              code={JSON.stringify({
                name: 'Camiseta Premium V2',
                priceFiat: 59.9,
                images: ['https://cdn.loja.com/camiseta-v2.jpg'],
              }, null, 2)}
              codeLang="json"
            />

            {/* DELETE Product */}
            <EndpointCard
              method="DELETE"
              path="https://api.xpayments.digital/api/v1/merchant/products/:id"
              title="Eliminar Produto"
              description="Remove um produto do catálogo. Esta ação é irreversível — o produto será eliminado permanentemente."
              code={`DELETE /api/v1/merchant/products/prod_abc
Authorization: Bearer ${hydration.activeSecretKey}

// Response 200:
{ "success": true }`}
              codeLang="http"
            />

            <Separator className="bg-white/[0.06]" />

            {/* AI Prompt Block — Catalog */}
            <AIBlock
              icon={Package}
              title="Sincronizar Catálogo via IA"
              description="Copia o prompt e cola no teu assistente de IA para gerar um serviço de sincronização automática com as tuas chaves reais."
              prompt={catalogPrompt}
            />

            {/* Images tip */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="flex items-start gap-3 pt-5">
                <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0 mt-0.5">
                  <Info className="size-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Formato das Imagens</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                    O campo <code className="font-mono text-emerald-300/70">images</code> é um array de URLs.
                    As imagens não são enviadas em base64 — usa um CDN, S3, Cloudinary ou qualquer
                    URL publicamente acessível.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
