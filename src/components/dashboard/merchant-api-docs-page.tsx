'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ---------------------------------------------------------------------------
// Code Block (inline)
// ---------------------------------------------------------------------------

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
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
    GET: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
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
// Section Header
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <Icon className="size-4.5 text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Prompt (Tab 3)
// ---------------------------------------------------------------------------

const AI_PROMPT = `Atua como um Senior Fullstack Developer. Quero integrar o gateway XPayments no meu e-commerce. 
Passo 1: Cria uma função que faz um POST para \`https://api.xpayments.digital/api/v1/checkout/sessions\` enviando no Header \`Authorization: Bearer [MINHA_CHAVE]\` e no body \`{ storeId: "[MEU_STORE_ID]", amountFiat: 100, currency: "EUR", orderId: "123" }\`. Redireciona o utilizador para o \`url\` devolvido na resposta.
Passo 2: Cria uma rota de Webhook para receber um POST com o JSON \`{ event: "payment.success", data: { transactionId, orderId, amount, customer: { name, email } } }\` e atualiza a minha base de dados local para dar a encomenda como paga.`;

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MerchantApiDocsPage() {
  const { toast } = useToast();
  const [promptCopied, setPromptCopied] = useState(false);

  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(AI_PROMPT).then(() => {
      setPromptCopied(true);
      toast({
        title: 'Prompt copiado!',
        description: 'Cole no ChatGPT, Cursor ou Claude para obter a integração.',
      });
      setTimeout(() => setPromptCopied(false), 2500);
    });
  }, [toast]);

  return (
    <div className="space-y-8">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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
            Guia completo para integrar a XPayments.Digital na sua plataforma.
            Crie checkouts, receba webhooks e integre com IA em minutos.
          </p>

          <div className="flex items-center justify-center gap-3 pt-1">
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono"
            >
              REST
            </Badge>
            <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">
              JSON
            </Badge>
            <Badge variant="outline" className="border-white/[0.08] text-zinc-500 text-xs">
              Webhooks
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="bg-white/[0.03] border border-white/[0.06] h-auto p-1 w-full flex">
          <TabsTrigger
            value="endpoints"
            className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
          >
            <Key className="size-3.5 shrink-0" />
            <span className="truncate">Endpoints & Autenticação</span>
          </TabsTrigger>
          <TabsTrigger
            value="webhooks"
            className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
          >
            <Webhook className="size-3.5 shrink-0" />
            <span className="truncate">Webhooks & Eventos</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-sm data-[state=active]:shadow-emerald-500/5 flex-1 min-w-0"
          >
            <Sparkles className="size-3.5 shrink-0" />
            <span className="truncate">Integração via IA</span>
          </TabsTrigger>
        </TabsList>

        {/* ================================================================
            TAB 1 — Endpoints & Autenticação
        ================================================================= */}
        <TabsContent value="endpoints" className="space-y-6 mt-6">
          {/* Auth section */}
          <div className="space-y-5">
            <SectionHeader title="Autenticação" icon={Key} />
            <p className="text-zinc-400 text-sm leading-relaxed">
              Todos os pedidos à API requerem autenticação via{' '}
              <span className="text-emerald-400 font-medium">Bearer Token</span>.
              Utilize a sua Chave Secreta{' '}
              <code className="text-xs font-mono text-emerald-300/80">sk_live_...</code>{' '}
              obtida no painel de Chaves da API e envie-a no cabeçalho{' '}
              <code className="text-xs font-mono text-zinc-300">Authorization</code>.
            </p>

            <CodeBlock
              language="http"
              code={`Authorization: Bearer sk_live_SUA_CHAVE_SECRETA`}
            />
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Session creation endpoint */}
          <div className="space-y-5">
            <SectionHeader title="Criar Sessão de Checkout" icon={Zap} />

            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <MethodBadge method="POST" />
                  <code className="text-sm font-mono text-emerald-300/80 break-all">
                    https://api.xpayments.digital/api/v1/checkout/sessions
                  </code>
                  <ExternalLink className="size-3.5 text-zinc-500 shrink-0" />
                </div>
                <p className="text-zinc-400 text-sm mt-2">
                  Cria uma nova sessão de checkout e devolve a URL de pagamento única
                  para redirecionar o cliente.
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Request payload */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Request Payload
                  </p>
                  <CodeBlock
                    language="json"
                    code={JSON.stringify(
                      {
                        storeId: 'store_abc123',
                        amountFiat: 100.0,
                        currency: 'EUR',
                        orderId: 'ORD-2024-001',
                      },
                      null,
                      2
                    )}
                  />
                </div>

                <Separator className="bg-white/[0.04]" />

                {/* Response */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Response — 200 OK
                    </p>
                  </div>
                  <CodeBlock
                    language="json"
                    code={JSON.stringify(
                      {
                        success: true,
                        data: {
                          id: 'sess_xyz789',
                          url: 'https://checkout.xpayments.digital/pay/store_abc123?session=sess_xyz789',
                          status: 'pending',
                        },
                      },
                      null,
                      2
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security warning */}
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
                  A{' '}
                  <code className="font-mono text-amber-300/80">sk_live_...</code> deve ser
                  utilizada <span className="text-zinc-200">apenas no backend</span> (servidor).
                  Nunca a inclua em código frontend, repositórios públicos ou clientes móveis.
                  Em caso de comprometimento, gire a chave imediatamente na página de Chaves da API.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 2 — Webhooks & Eventos
        ================================================================= */}
        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <div className="space-y-5">
            <SectionHeader title="Webhooks" icon={Webhook} />
            <p className="text-zinc-400 text-sm leading-relaxed">
              A XPayments envia notificações em tempo real via{' '}
              <MethodBadge method="POST" /> para a{' '}
              <code className="text-xs font-mono text-emerald-300/80">webhookUrl</code>{' '}
              configurada na sua Store. Sempre que um evento de pagamento ocorrer,
              receberá um payload JSON no seu endpoint.
            </p>
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* payment.success event */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-medium text-zinc-200">
                  Evento — payment.success
                </span>
              </div>
              <p className="text-zinc-400 text-sm">
                Payload enviado quando um pagamento é concluído com sucesso.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
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
                  2
                )}
              />
            </CardContent>
          </Card>

          <Separator className="bg-white/[0.06]" />

          {/* Signature verification */}
          <div className="space-y-5">
            <SectionHeader title="Verificação de Segurança" icon={Shield} />

            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Shield className="size-4 text-emerald-400" />
                  <CardTitle className="text-sm text-zinc-200">
                    Assinatura HMAC-SHA256
                  </CardTitle>
                </div>
                <p className="text-zinc-400 text-sm">
                  Cada webhook inclui o cabeçalho{' '}
                  <code className="text-xs font-mono text-emerald-300/80">
                    x-xpayments-signature
                  </code>{' '}
                  com uma assinatura HMAC-SHA256. Utilize o seu Webhook Secret para
                  verificar a integridade do payload.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <CodeBlock
                  language="javascript"
                  code={`const crypto = require('crypto');

const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');

// Compare com o header: x-xpayments-signature
const isValid = signature === receivedSignature;`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Security warning */}
          <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
            <CardContent className="flex items-start gap-3 pt-5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
                <Shield className="size-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-300">
                  Nunca processe eventos sem verificar a assinatura
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Sempre valide o cabeçalho{' '}
                  <code className="font-mono text-emerald-300/80">x-xpayments-signature</code>{' '}
                  antes de processar qualquer evento de webhook. Isto garante que a
                  notificação foi realmente enviada pela XPayments e não foi alterada
                  em trânsito.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 3 — Integração via IA
        ================================================================= */}
        <TabsContent value="ai" className="space-y-6 mt-6">
          {/* AI Header */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <Sparkles className="size-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  Integração via IA
                </h3>
                <p className="text-zinc-400 text-sm">
                  Cole este prompt no ChatGPT, Cursor ou Claude e obtenha integração completa
                </p>
              </div>
            </div>
          </div>

          {/* Prompt Block */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-zinc-400" />
                <CardTitle className="text-sm text-zinc-200">Prompt de Integração</CardTitle>
              </div>
              <p className="text-zinc-400 text-sm">
                Copie o prompt abaixo e cole na sua ferramenta de IA preferida. O assistente
                gerará todo o código necessário para integrar o XPayments no seu e-commerce.
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="relative rounded-lg bg-zinc-900 border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">prompt</span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono"
                  >
                    pronto a copiar
                  </Badge>
                </div>
                <pre className="p-4 sm:p-6 overflow-x-auto max-h-96 overflow-y-auto">
                  <code className="text-xs sm:text-sm font-mono text-emerald-300/90 leading-relaxed whitespace-pre-wrap">
                    {AI_PROMPT}
                  </code>
                </pre>
              </div>

              {/* Copy button */}
              <Button
                onClick={handleCopyPrompt}
                className={cn(
                  'w-full h-12 text-sm font-semibold transition-all duration-300',
                  promptCopied
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                )}
              >
                {promptCopied ? (
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

          {/* Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="flex items-start gap-3 pt-5">
                <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0 mt-0.5">
                  <Zap className="size-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Personalize os dados</p>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    Substitua <code className="font-mono text-emerald-300/80">[MINHA_CHAVE]</code> e{' '}
                    <code className="font-mono text-emerald-300/80">[MEU_STORE_ID]</code> pelos
                    seus valores reais antes de enviar.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="flex items-start gap-3 pt-5">
                <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0 mt-0.5">
                  <ExternalLink className="size-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Ferramentas compatíveis</p>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    Funciona com ChatGPT, Claude, Cursor, GitHub Copilot e qualquer
                    modelo de linguagem avançado.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
