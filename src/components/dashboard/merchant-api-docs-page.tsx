'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  Key,
  Shield,
  Webhook,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Zap,
  ShoppingCart,
  Package,
  Loader2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
  createdAt?: string;
}

// ============================================================
// CodeBlock — reusable with copy button
// ============================================================

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success('Copiado!', { description: 'Código copiado para a área de transferência.' });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="relative rounded-lg bg-zinc-900 border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy()}
          className="h-6 gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto max-h-80 overflow-y-auto">
        <code className="text-xs font-mono text-emerald-300/90 leading-relaxed whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

// ============================================================
// MethodBadge — colored HTTP method
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
    <Badge variant="outline" className={cn('font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border', colorMap[method])}>
      {method}
    </Badge>
  );
}

// ============================================================
// SectionHeader
// ============================================================

function SectionHeader({ title, icon: Icon, tooltip }: { title: string; icon: React.ElementType; tooltip?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <Icon className="size-4.5 text-emerald-400" />
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 text-zinc-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs max-w-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// ============================================================
// AIPromptBlock — the "Golden Block" for AI integration
// ============================================================

function AIPromptBlock({
  title,
  description,
  promptText,
}: {
  title: string;
  description: string;
  promptText: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true);
      toast.success('Prompt copiado!', { description: 'Cole no ChatGPT, Cursor ou Claude.' });
      setTimeout(() => setCopied(false), 2500);
    });
  }, [promptText]);

  return (
    <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent">
      {/* Glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/[0.08] blur-3xl" />

      <CardHeader className="pb-3 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
            <Sparkles className="size-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-base text-zinc-100">{title}</CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4 relative">
        <div className="relative rounded-lg bg-zinc-900/80 border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Terminal className="size-3 text-zinc-500" />
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">prompt</span>
            </div>
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
              pronto a copiar
            </Badge>
          </div>
          <pre className="p-4 sm:p-5 overflow-x-auto max-h-72 overflow-y-auto">
            <code className="text-xs sm:text-[13px] font-mono text-emerald-300/85 leading-relaxed whitespace-pre-wrap">{promptText}</code>
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
            <><Check className="size-4 mr-2" />Prompt Copiado!</>
          ) : (
            <><Copy className="size-4 mr-2" />Copiar Prompt para IA</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================
// EndpointCard — documents a single endpoint
// ============================================================

function EndpointCard({
  method,
  url,
  description,
  requestPayload,
  responsePayload,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  description: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
}) {
  return (
    <Card className="bg-white/[0.02] border-white/[0.06]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <MethodBadge method={method} />
          <code className="text-sm font-mono text-emerald-300/80 break-all">{url}</code>
        </div>
        <p className="text-zinc-400 text-sm mt-2">{description}</p>
      </CardHeader>
      {(requestPayload || responsePayload) && (
        <CardContent className="pt-0 space-y-4">
          {requestPayload && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Request Body</p>
              <CodeBlock language="json" code={JSON.stringify(requestPayload, null, 2)} />
            </div>
          )}
          {requestPayload && responsePayload && <Separator className="bg-white/[0.04]" />}
          {responsePayload && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Response — 200 OK</p>
              </div>
              <CodeBlock language="json" code={JSON.stringify(responsePayload, null, 2)} />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================
// Loading Skeleton
// ============================================================

function DocsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-52 rounded-2xl w-full" />
      <Skeleton className="h-10 rounded-lg w-full" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 rounded-lg w-full" />
        <Skeleton className="h-32 rounded-lg w-full" />
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function MerchantApiDocsPage() {
  // ── Dynamic Hydration State ──
  const [activeStoreId, setActiveStoreId] = useState<string>('[SEU_STORE_ID]');
  const [activeSecretKey, setActiveSecretKey] = useState<string>('[SUA_SECRET_KEY]');
  const [hydrating, setHydrating] = useState(true);

  // ── Fetch stores + API keys on mount ──
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setHydrating(true);
      try {
        const merchantId = useAuthStore.getState().user?.id;

        // Fetch stores
        if (merchantId) {
          try {
            const stores = await xpApi.merchant.getStores(merchantId);
            if (!cancelled && Array.isArray(stores) && stores.length > 0) {
              setActiveStoreId(stores[0].id);
            }
          } catch {
            // stores fetch failed, keep fallback
          }
        }

        // Fetch API keys
        try {
          const keysResponse = await xpApi.merchant.getApiKeys();
          if (!cancelled) {
            const keyList = Array.isArray(keysResponse) ? keysResponse : keysResponse ? [keysResponse] : [];
            const typed = keyList as ApiKeyRecord[];
            const firstKeyWithSecret = typed.find((k) => k.secretKey && k.isActive !== false);
            if (firstKeyWithSecret?.secretKey) {
              setActiveSecretKey(firstKeyWithSecret.secretKey);
            }
          }
        } catch {
          // api keys fetch failed, keep fallback
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, []);

  // ── Derived: dynamic prompts ──
  const checkoutPrompt = useMemo(
    () =>
      `Atua como um Senior Fullstack Developer. Quero integrar o gateway XPayments na minha loja web.

SEGURANÇA: Adiciona as chaves ao meu ficheiro .env:\nXPAYMENTS_SECRET_KEY=${activeSecretKey}\nXPAYMENTS_STORE_ID=${activeStoreId}\nNão as exponhas no frontend. As chamadas à API XPayments devem ser via Backend.

PASSO 1: Cria um endpoint Backend para fazer POST a https://api.xpayments.digital/api/v1/checkout/session (usa o Header Authorization Bearer). O payload precisa do storeId, amountFiat, currency e metadata com orderId.

PASSO 2 (Frontend Seamless): Quando o cliente clicar em 'Pagar', não redireciones. Abre o URL devolvido pela sessão num Modal (iframe) sobre o meu site.

PASSO 3 (Auto-Close): Ouve o sucesso do iframe no frontend via window.addEventListener('message', (e) => { if(e.data === 'XPAYMENTS_PAYMENT_SUCCESS') { fecharIframe(); mostrarSucesso(); } });.

PASSO 4 (Webhook): Cria a rota POST /api/webhooks/xpayments para receber o JSON 'payment.success', processar a transação e mudar a encomenda para PAGA na minha base de dados local.`,
    [activeSecretKey, activeStoreId],
  );

  const catalogPrompt = useMemo(
    () =>
      `Atua como um Senior Fullstack Developer. Quero automatizar a sincronização dos produtos da minha loja com a plataforma XPayments via API.

SEGURANÇA: Lê o XPAYMENTS_SECRET_KEY e XPAYMENTS_STORE_ID=${activeStoreId} do meu ficheiro .env. As chamadas devem ser feitas no servidor.

PASSO 1: Cria um worker/serviço que lê os meus produtos locais.

PASSO 2: Para criar/atualizar produtos, faz POST/PUT para https://api.xpayments.digital/api/v1/merchant/products usando Authorization Bearer. O body deve incluir storeId, name, description, priceFiat, currency (ex: 'BRL' ou 'EUR') e images (que é um array de URLs de imagens externas).

Garante que a integração trata os erros de rede e devolve logs de sucesso.`,
    [activeStoreId],
  );

  // ── Derived: dynamic code blocks ──
  const envBlock = useMemo(
    () => `# XPayments — Chaves de Integração
# ⚠️  NUNCA exponha estas variáveis no Frontend

XPAYMENTS_SECRET_KEY=${activeSecretKey}
XPAYMENTS_STORE_ID=${activeStoreId}`,
    [activeSecretKey, activeStoreId],
  );

  const authHeaderBlock = useMemo(
    () => `// Todas as chamadas à API requerem este header:
Authorization: Bearer ${activeSecretKey}`,
    [activeSecretKey],
  );

  // ── Loading State ──
  if (hydrating) {
    return <DocsLoadingSkeleton />;
  }

  // ── Render ──
  return (
    <div className="space-y-8">
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
            Guia completo para integrar a XPayments na sua plataforma.
            As chaves e IDs abaixo são <span className="text-emerald-400 font-medium">injetadas automaticamente</span> com os seus dados reais.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              REST
            </Badge>
            <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">
              JSON
            </Badge>
            <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">
              Webhooks
            </Badge>
            <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">
              IA Ready
            </Badge>
          </div>
        </div>
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
            <ShoppingCart className="size-3.5 shrink-0" />
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

        {/* ================================================================
            TAB 1 — Segurança & Autenticação
        ================================================================= */}
        <TabsContent value="security" className="space-y-6 mt-6">
          {/* Security Alert */}
          <Alert className="border-amber-500/20 bg-amber-500/[0.04] [&>svg]:text-amber-400">
            <AlertTriangle className="size-4" />
            <AlertTitle className="text-amber-300">Nunca exponha a tua Secret Key no Frontend</AlertTitle>
            <AlertDescription className="text-zinc-400 text-sm leading-relaxed">
              As chamadas à API devem partir <span className="text-zinc-200 font-medium">sempre do teu Backend</span> (Server Actions, Node.js, PHP, Python, etc.).
              A Secret Key é o teu acesso privilegiado ao gateway de pagamentos — tratá-la como uma password.
            </AlertDescription>
          </Alert>

          {/* .env Section */}
          <div className="space-y-4">
            <SectionHeader
              title="Variáveis de Ambiente (.env)"
              icon={Key}
              tooltip="Adicione estas variáveis ao ficheiro .env do seu backend. Nunca as coloque em código frontend ou repositórios públicos."
            />
            <p className="text-zinc-400 text-sm leading-relaxed">
              Copie este bloco diretamente para o ficheiro{' '}
              <code className="text-xs font-mono text-emerald-300/80">.env</code> do seu backend.
              As chaves estão pré-preenchidas com os seus dados reais.
            </p>
            <CodeBlock language="env" code={envBlock} />
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Authorization Header */}
          <div className="space-y-4">
            <SectionHeader
              title="Header de Autenticação"
              icon={Shield}
              tooltip="Todas as rotas da API XPayments requerem este cabeçalho. Sem ele, receberá um erro 401 Unauthorized."
            />
            <p className="text-zinc-400 text-sm leading-relaxed">
              Todas as rotas protegidas exigem o cabeçalho{' '}
              <code className="text-xs font-mono text-emerald-300/80">Authorization</code>.
              O token é lido do ficheiro <code className="text-xs font-mono text-zinc-300">.env</code> no seu backend.
            </p>
            <CodeBlock language="http" code={authHeaderBlock} />
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Node.js Example */}
          <div className="space-y-4">
            <SectionHeader
              title="Exemplo de Chamada (Node.js)"
              icon={Zap}
              tooltip="Exemplo básico usando fetch nativo do Node.js 18+. Adapte ao seu framework (Express, Next.js, Fastify, etc.)."
            />
            <CodeBlock
              language="javascript"
              code={`const response = await fetch('https://api.xpayments.digital/api/v1/checkout/session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${activeSecretKey}',
  },
  body: JSON.stringify({
    storeId: '${activeStoreId}',
    amountFiat: 99.90,
    currency: 'EUR',
    metadata: {
      orderId: 'ORD-001',
    },
  }),
});

const session = await response.json();
// session.data.url → URL de checkout para abrir no browser/iframe`}
            />
          </div>

          {/* Info tip */}
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="flex items-start gap-3 pt-5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0 mt-0.5">
                <Info className="size-4 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200">Rotação de Chaves</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Se precisar de invalidar uma chave, vá a{' '}
                  <span className="text-emerald-400">Chaves da API</span> no menu lateral, elimine a chave comprometida
                  e gere uma nova. O prompt nesta página atualiza-se automaticamente com os novos dados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 2 — Checkout & Webhooks
        ================================================================= */}
        <TabsContent value="checkout" className="space-y-6 mt-6">
          {/* Create Session Endpoint */}
          <div className="space-y-5">
            <SectionHeader
              title="Criar Sessão de Checkout"
              icon={ShoppingCart}
              tooltip="Gera uma sessão de pagamento única. O URL devolvido pode ser aberto num browser, redirecionamento ou iframe."
            />
            <EndpointCard
              method="POST"
              url="https://api.xpayments.digital/api/v1/checkout/session"
              description="Cria uma nova sessão de checkout e devolve a URL de pagamento única. Suporta Split Payments automático (Marketplace). Envie o objeto splitRules para dividir a receita atómicamente com parceiros."
              requestPayload={{
                storeId: activeStoreId,
                amountFiat: 99.9,
                currency: 'EUR',
                metadata: {
                  orderId: 'ORD-2024-001',
                },
                splitRules: {
                  targetMerchantId: 'uuid-do-parceiro-xpayments',
                  percentage: 20,
                },
              }}
              responsePayload={{
                success: true,
                data: {
                  id: 'sess_xyz789',
                  url: `https://checkout.xpayments.digital/pay/${activeStoreId}?session=sess_xyz789`,
                  status: 'pending',
                },
              }}
            />
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Webhook Section */}
          <div className="space-y-5">
            <SectionHeader
              title="Webhook — payment.success"
              icon={Webhook}
              tooltip="Configure a webhookUrl na sua Store (aba Stores / API). A XPayments envia um POST JSON para este endpoint sempre que um pagamento for concluído."
            />
            <p className="text-zinc-400 text-sm leading-relaxed">
              Configure a{' '}
              <code className="text-xs font-mono text-emerald-300/80">webhookUrl</code>{' '}
              na sua Store. A XPayments envia um <MethodBadge method="POST" /> com o payload abaixo
              quando um pagamento é concluído com sucesso.
            </p>
            <CodeBlock
              language="json"
              code={JSON.stringify(
                {
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
                      taxId: '123.456.789-00',
                    },
                  },
                },
                null,
                2,
              )}
            />
          </div>

          {/* Signature Verification */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Shield className="size-4 text-emerald-400" />
                <CardTitle className="text-sm text-zinc-200">Verificação de Assinatura (HMAC-SHA256)</CardTitle>
              </div>
              <p className="text-zinc-400 text-sm">
                Cada webhook inclui o cabeçalho{' '}
                <code className="text-xs font-mono text-emerald-300/80">x-xpayments-signature</code>.
                Valide-o para garantir que o payload não foi alterado em trânsito.
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

          {/* Security reminder */}
          <Alert className="border-emerald-500/20 bg-emerald-500/[0.04] [&>svg]:text-emerald-400">
            <Shield className="size-4" />
            <AlertTitle className="text-emerald-300">Nunca processe eventos sem verificar a assinatura</AlertTitle>
            <AlertDescription className="text-zinc-400 text-sm">
              Valide sempre o cabeçalho <code className="font-mono text-emerald-300/80">x-xpayments-signature</code> antes de
              processar qualquer evento de webhook.
            </AlertDescription>
          </Alert>

          <Separator className="bg-white/[0.06]" />

          {/* AI Golden Block — Checkout */}
          <AIPromptBlock
            title="Gerar Checkout via IA"
          description="Cole este prompt no ChatGPT, Cursor ou Claude para obter a integração completa de checkout + webhook em segundos."
          promptText={checkoutPrompt}
        />
        </TabsContent>

        {/* ================================================================
            TAB 3 — Sincronização de Catálogo
        ================================================================= */}
        <TabsContent value="catalog" className="space-y-6 mt-6">
          {/* Intro */}
          <div className="space-y-4">
            <SectionHeader
              title="Sincronização de Catálogo (ERP)"
              icon={Package}
              tooltip="Utilize esta API para sincronizar automaticamente o inventário do seu ERP ou base de dados com a XPayments. Os produtos sincronizados ficam disponíveis para checkout."
            />
            <p className="text-zinc-400 text-sm leading-relaxed">
              Esta API permite sincronizar o inventário do seu ERP ou base de dados local com a XPayments.
              As imagens são recebidas via <span className="text-emerald-400 font-medium">URL externa</span> (CDN, S3, etc.).
            </p>
          </div>

          {/* GET - List Products */}
          <EndpointCard
            method="GET"
            url="https://api.xpayments.digital/api/v1/merchant/products"
            description="Lista todos os produtos do merchant autenticado."
            responsePayload={{
              success: true,
              data: [
                {
                  id: 'prod_abc123',
                  name: 'T-Shirt Premium',
                  priceFiat: 49.9,
                  currency: 'EUR',
                  images: ['https://cdn.exemplo.com/tshirt.jpg'],
                  isActive: true,
                },
              ],
            }}
          />

          {/* POST - Create Product */}
          <EndpointCard
            method="POST"
            url="https://api.xpayments.digital/api/v1/merchant/products"
            description="Cria um novo produto na XPayments. Ideal para sincronização de catálogo a partir do seu ERP."
            requestPayload={{
              storeId: activeStoreId,
              name: 'T-Shirt Premium',
              description: 'T-Shirt de algodão orgânico, tamanho único.',
              priceFiat: 49.9,
              currency: 'EUR',
              images: ['https://cdn.exemplo.com/tshirt.jpg'],
            }}
            responsePayload={{
              success: true,
              data: {
                id: 'prod_abc123',
                name: 'T-Shirt Premium',
                priceFiat: 49.9,
                currency: 'EUR',
                images: ['https://cdn.exemplo.com/tshirt.jpg'],
                isActive: true,
              },
            }}
          />

          {/* PUT - Update Product */}
          <EndpointCard
            method="PUT"
            url="https://api.xpayments.digital/api/v1/merchant/products/:id"
            description="Atualiza os dados de um produto existente. Envie apenas os campos que pretende alterar."
            requestPayload={{
              name: 'T-Shirt Premium V2',
              priceFiat: 54.9,
              description: 'Nova coleção — algodão orgânico certificado.',
            }}
            responsePayload={{
              success: true,
              data: {
                id: 'prod_abc123',
                name: 'T-Shirt Premium V2',
                priceFiat: 54.9,
                currency: 'EUR',
              },
            }}
          />

          {/* DELETE - Delete Product */}
          <EndpointCard
            method="DELETE"
            url="https://api.xpayments.digital/api/v1/merchant/products/:id"
            description="Elimina permanentemente um produto da XPayments. Esta ação é irreversível."
            responsePayload={{
              success: true,
              message: 'Produto eliminado com sucesso',
            }}
          />

          <Separator className="bg-white/[0.06]" />

          {/* Info about images */}
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="flex items-start gap-3 pt-5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0 mt-0.5">
                <Info className="size-4 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200">Sobre as Imagens</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  O campo <code className="font-mono text-emerald-300/80">images</code> aceita um array de URLs de imagem externas
                  (CDN, S3, Cloudinary, etc.). A XPayments não faz upload de ficheiros — use sempre URLs públicas e acessíveis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Golden Block — Catalog */}
          <AIPromptBlock
            title="Sincronizar Catálogo via IA"
            description="Cole este prompt no ChatGPT, Cursor ou Claude para obter o código de sincronização ERP → XPayments automaticamente."
            promptText={catalogPrompt}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
