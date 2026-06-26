'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Key,
  ShoppingCart,
  Globe,
  Webhook,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Zap,
  Terminal,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ---------------------------------------------------------------------------
// Code Block (inline)
// ---------------------------------------------------------------------------

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Código copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code, toast]);

  return (
    <div className="relative rounded-lg bg-zinc-900 border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] font-mono uppercase text-zinc-500">{language}</span>
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
      <pre className="p-4 overflow-x-auto">
        <code className="text-xs font-mono text-emerald-300/90 leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Method Badge
// ---------------------------------------------------------------------------

function MethodBadge({ method }: { method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' }) {
  const colorMap: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    POST: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PUT: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    PATCH: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border',
        colorMap[method]
      )}
    >
      {method}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Endpoint Card
// ---------------------------------------------------------------------------

function EndpointCard({
  method,
  url,
  description,
  children,
}: {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  url: string;
  description: string;
  children?: React.ReactNode;
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
      {children && <CardContent className="pt-0 space-y-4">{children}</CardContent>}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section Wrapper
// ---------------------------------------------------------------------------

function SectionBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Icon className="size-4.5 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MerchantApiDocsPage() {
  return (
    <div className="space-y-8">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        {/* subtle radial glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[28rem] rounded-full bg-emerald-500/[0.07] blur-3xl" />

        <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center space-y-4">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <BookOpen className="size-7 text-emerald-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
            Documentação da API
          </h1>

          <p className="mx-auto max-w-2xl text-zinc-400 text-sm sm:text-base leading-relaxed">
            Guia completo para integrar a XPayments.Digital na sua plataforma.
            Crie checkouts, gerencie produtos e receba notificações em tempo real.
          </p>

          <div className="flex items-center justify-center gap-3 pt-1">
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono"
            >
              v3.0
            </Badge>
            <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">
              REST
            </Badge>
            <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">
              JSON
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="auth" className="space-y-6">
        <TabsList className="bg-white/[0.03] border border-white/[0.06] h-auto p-1 w-full flex flex-wrap">
          <TabsTrigger
            value="auth"
            className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
          >
            <Shield className="size-3.5 shrink-0" />
            <span className="truncate">Autenticação</span>
          </TabsTrigger>
          <TabsTrigger
            value="checkout"
            className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
          >
            <ShoppingCart className="size-3.5 shrink-0" />
            <span className="truncate">Checkout</span>
          </TabsTrigger>
          <TabsTrigger
            value="catalog"
            className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
          >
            <Globe className="size-3.5 shrink-0" />
            <span className="truncate">Catálogo</span>
          </TabsTrigger>
          <TabsTrigger
            value="webhooks"
            className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
          >
            <Webhook className="size-3.5 shrink-0" />
            <span className="truncate">Webhooks</span>
          </TabsTrigger>
        </TabsList>

        {/* ================================================================
            TAB 1 — Autenticação
        ================================================================= */}
        <TabsContent value="auth" className="space-y-6 mt-6">
          <SectionBlock title="Autenticação" icon={Shield}>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Todos os pedidos à API requerem autenticação via{' '}
              <span className="text-emerald-400 font-medium">Bearer Token</span>.
              Utilize a <span className="text-zinc-200">Chave Secreta</span> (
              <code className="text-xs font-mono text-emerald-300/80">sk_live_...</code>)
              obtida na página de Chaves da API como token de autorização no cabeçalho{' '}
              <code className="text-xs font-mono text-zinc-300">Authorization</code>.
            </p>
          </SectionBlock>

          <EndpointCard
            method="GET"
            url="https://api.xpayments.digital/api/v1/merchant/products"
            description="Exemplo de pedido autenticado — lista todos os produtos da loja."
          >
            <div className="space-y-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                cURL
              </p>
              <CodeBlock
                language="bash"
                code={`curl -X GET https://api.xpayments.digital/api/v1/merchant/products \\
  -H "Authorization: Bearer sk_live_SUA_CHAVE_SECRETA" \\
  -H "Content-Type: application/json"`}
              />

              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                JavaScript (Fetch)
              </p>
              <CodeBlock
                language="javascript"
                code={`const response = await fetch(
  "https://api.xpayments.digital/api/v1/merchant/products",
  {
    headers: {
      "Authorization": "Bearer sk_live_SUA_CHAVE_SECRETA",
      "Content-Type": "application/json"
    }
  }
);

const data = await response.json();
console.log(data);`}
              />
            </div>
          </EndpointCard>

          {/* Warning card */}
          <Card className="border-amber-500/20 bg-amber-500/[0.03]">
            <CardContent className="flex items-start gap-3 pt-5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10 shrink-0 mt-0.5">
                <Shield className="size-4 text-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-300">
                  Segurança: Nunca exponha a chave secreta
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  A <code className="font-mono text-amber-300/80">sk_live_...</code> deve ser
                  utilizada <span className="text-zinc-200">apenas no backend</span> (servidor).
                  Nunca a inclua em código frontend, repositórios públicos ou clientes
                  móveis. Em caso de comprometimento, gire a chave imediatamente na
                  página de Chaves da API.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 2 — Checkout Dinâmico
        ================================================================= */}
        <TabsContent value="checkout" className="space-y-6 mt-6">
          <SectionBlock title="Checkout Dinâmico (E-Commerce)" icon={ShoppingCart}>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Crie sessões de checkout programaticamente a partir do seu backend.
              A API devolve uma URL de pagamento única que pode ser enviada ao
              cliente para finalizar a transação. Ideal para integrações com
              carrinhos de compras, plataformas de e-commerce e aplicações móveis.
            </p>
          </SectionBlock>

          <EndpointCard
            method="POST"
            url="https://api.xpayments.digital/api/v1/checkout/sessions"
            description="Cria uma nova sessão de checkout e devolve a URL de pagamento."
          >
            <div className="space-y-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                JavaScript (Backend)
              </p>
              <CodeBlock
                language="javascript"
                code={`// POST https://api.xpayments.digital/api/v1/checkout/sessions
const response = await fetch(
  "https://api.xpayments.digital/api/v1/checkout/sessions",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer sk_live_SUA_CHAVE",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      storeId: "ID_DA_LOJA",
      amountFiat: 150.00,
      currency: "EUR",
      orderId: "ENC-12345",
      customerDetails: {
        email: "cliente@email.com",
        fullName: "João Silva"
      }
    })
  }
);

const session = await response.json();
// Redirecione o cliente para a URL de pagamento:
// window.location.href = session.data.url;`}
              />

              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                cURL
              </p>
              <CodeBlock
                language="bash"
                code={`curl -X POST https://api.xpayments.digital/api/v1/checkout/sessions \\
  -H "Authorization: Bearer sk_live_SUA_CHAVE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "storeId": "ID_DA_LOJA",
    "amountFiat": 150.00,
    "currency": "EUR",
    "orderId": "ENC-12345",
    "customerDetails": {
      "email": "cliente@email.com",
      "fullName": "João Silva"
    }
  }'`}
              />
            </div>
          </EndpointCard>

          {/* Response example */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-medium text-zinc-200">Resposta — 200 OK</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CodeBlock
                language="json"
                code={`{
  "success": true,
  "data": {
    "id": "cs_8f14e45fceea167a5a36dedd4bea2543",
    "url": "https://checkout.xpayments.digital/pay/cs_8f14e45f...",
    "status": "pending",
    "amountFiat": 150.00,
    "currency": "EUR",
    "orderId": "ENC-12345",
    "expiresAt": "2025-01-16T18:30:00.000Z"
  }
}`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 3 — API de Catálogo
        ================================================================= */}
        <TabsContent value="catalog" className="space-y-6 mt-6">
          <SectionBlock title="API de Catálogo (Headless CMS)" icon={Globe}>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Leia os produtos e categorias da sua loja via API para construir
              vitrines personalizadas, storefronts headless ou alimentar aplicações
              móveis com dados em tempo real. A API de catálogo é de leitura pública
              quando autenticada com a chave da loja.
            </p>
          </SectionBlock>

          <EndpointCard
            method="GET"
            url="https://api.xpayments.digital/api/v1/merchant/products"
            description="Retorna a lista completa de produtos ativos da loja."
          >
            <div className="space-y-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                cURL
              </p>
              <CodeBlock
                language="bash"
                code={`curl -X GET https://api.xpayments.digital/api/v1/merchant/products \\
  -H "Authorization: Bearer sk_live_SUA_CHAVE_SECRETA" \\
  -H "Content-Type: application/json"`}
              />
            </div>
          </EndpointCard>

          {/* Response example */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-medium text-zinc-200">Resposta — 200 OK</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CodeBlock
                language="json"
                code={`{
  "success": true,
  "data": [
    {
      "id": "prod_a1b2c3d4",
      "name": "Plano Premium Mensal",
      "description": "Acesso completo a todas as funcionalidades.",
      "price": 29.90,
      "currency": "EUR",
      "category": "Assinaturas",
      "imageUrl": "https://cdn.xpayments.digital/products/premium.png",
      "isActive": true,
      "createdAt": "2025-01-10T09:00:00.000Z"
    },
    {
      "id": "prod_e5f6g7h8",
      "name": "Créditos API — 10.000 req",
      "description": "Pacote de 10 mil requisições à API.",
      "price": 49.90,
      "currency": "EUR",
      "category": "API",
      "imageUrl": null,
      "isActive": true,
      "createdAt": "2025-01-12T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 42,
    "totalPages": 3
  }
}`}
              />
            </CardContent>
          </Card>

          {/* Info note */}
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="flex items-start gap-3 pt-5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0 mt-0.5">
                <Zap className="size-4 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200">Construa sua própria vitrine</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Utilize os dados do catálogo para renderizar produtos em qualquer
                  framework ou plataforma. Combine com a API de Checkout para criar
                  experiências de compra totalmente personalizadas — de lojas
                  headless a aplicações nativas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 4 — Webhooks
        ================================================================= */}
        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <SectionBlock title="Webhooks" icon={Webhook}>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Receba notificações em tempo real sobre eventos de pagamento. Quando
              um pagamento é concluído, expirado ou falha, a XPayments envia um
              payload JSON para a URL configurada. Configure o endpoint de webhook
              na página de{' '}
              <span className="text-zinc-200">Checkouts</span>.
            </p>
          </SectionBlock>

          {/* Setup card */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Terminal className="size-4 text-zinc-400" />
                <CardTitle className="text-sm text-zinc-200">Configuração</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400">
                <li>
                  Aceda à página{' '}
                  <span className="text-emerald-400 font-medium">Checkouts</span> no
                  painel.
                </li>
                <li>
                  Defina a URL do seu endpoint (ex.:{' '}
                  <code className="text-xs font-mono text-emerald-300/80">
                    https://seusite.com/api/webhooks/xpayments
                  </code>
                  ).
                </li>
                <li>
                  A XPayments enviará pedidos <MethodBadge method="POST" /> com o
                  payload do evento.
                </li>
                <li>
                  Responda com <code className="text-xs font-mono text-zinc-300">200 OK</code>{' '}
                  para confirmar a receção.
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Payload example */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-medium text-zinc-200">
                  Payload — payment.success
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CodeBlock
                language="json"
                code={`{
  "event": "payment.success",
  "timestamp": "2025-01-15T12:34:56.789Z",
  "data": {
    "transactionId": "tx_abc123def456ghi789jkl012mno345",
    "amount": 150.00,
    "currency": "EUR",
    "customer": "cliente@email.com",
    "orderId": "ENC-12345",
    "sessionId": "cs_8f14e45fceea167a5a36dedd4bea2543",
    "status": "completed"
  }
}`}
              />
            </CardContent>
          </Card>

          {/* Available events */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-200">Eventos disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {[
                  {
                    event: 'payment.success',
                    desc: 'Pagamento concluído com sucesso.',
                    color: 'bg-emerald-500',
                  },
                  {
                    event: 'payment.failed',
                    desc: 'Falha no processamento do pagamento.',
                    color: 'bg-red-500',
                  },
                  {
                    event: 'payment.expired',
                    desc: 'Sessão de checkout expirada sem pagamento.',
                    color: 'bg-amber-500',
                  },
                  {
                    event: 'payment.pending',
                    desc: 'Pagamento aguardando confirmação na blockchain.',
                    color: 'bg-sky-500',
                  },
                ].map((item) => (
                  <div
                    key={item.event}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/[0.04]"
                  >
                    <div className={cn('size-2 rounded-full mt-1.5 shrink-0', item.color)} />
                    <div>
                      <code className="text-xs font-mono text-zinc-200">{item.event}</code>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security card */}
          <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
            <CardContent className="flex items-start gap-3 pt-5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
                <Shield className="size-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-300">
                  Verificação de assinatura
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cada webhook inclui um cabeçalho{' '}
                  <code className="font-mono text-emerald-300/80">X-Signature-256</code> com
                  uma assinatura HMAC-SHA256. Utilize a sua chave secreta para
                  verificar a integridade do payload e confirmar que a notificação
                  foi realmente enviada pela XPayments. Nunca processe eventos
                  sem verificar a assinatura.
                </p>
                <div className="mt-3">
                  <CodeBlock
                    language="javascript"
                    code={`// Exemplo de verificação (Node.js / Express)
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}