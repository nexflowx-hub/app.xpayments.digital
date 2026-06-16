"use client";

import { useState, useCallback } from "react";
import { Code2, Copy, Check, Eye, EyeOff, Zap, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n";

// ─── Constants ────────────────────────────────────────────────────────────────

const PUBLIC_KEY = "pk_live_xpd_2f8a9b3c4d5e6f7a8b9c0d1e2f3a4b5c";
const SECRET_KEY = "sk_live_xpd_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0";

const CURL_CODE = `curl -X POST https://api.xpayments.digital/api/v1/payments \\
  -H "Authorization: Bearer YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 99.90,
    "currency": "BRL",
    "description": "Premium VPN Subscription"
  }'`;

const NODE_CODE = `const response = await fetch(
  "https://api.xpayments.digital/api/v1/payments",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_SECRET_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: 99.90,
      currency: "BRL",
      description: "Premium VPN Subscription"
    })
  }
);
const payment = await response.json();`;

const PHP_CODE = `$ch = curl_init('https://api.xpayments.digital/api/v1/payments');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer YOUR_SECRET_KEY',
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'amount' => 99.90,
  'currency' => 'BRL',
  'description' => 'Premium VPN Subscription'
]));
$response = curl_exec($ch);`;

const WEBHOOK_EVENTS = [
  {
    event: "payment.completed",
    description: "Payment was successfully processed and confirmed",
  },
  {
    event: "payment.failed",
    description: "Payment attempt failed or was declined",
  },
  {
    event: "payout.sent",
    description: "USDT payout was sent to the configured wallet",
  },
  {
    event: "payout.completed",
    description: "Payout was confirmed on the blockchain",
  },
];

// ─── Copy Button Sub-component ────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-usdt" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

// ─── Code Block Sub-component ─────────────────────────────────────────────────

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <CopyButton text={code} />
      </div>
      <div className="bg-surface border border-border rounded-lg p-4 overflow-x-auto">
        <pre className="font-mono text-xs text-foreground/80 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DevelopersApiView() {
  const { t } = useT();
  const [secretRevealed, setSecretRevealed] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("developers.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("developers.subtitle")}
        </p>
      </div>

      <Separator className="bg-border" />

      {/* ── Section 1: API Keys ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-usdt" />
          <h2 className="text-lg font-medium text-foreground">{t("developers.api_keys")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Public Key */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("developers.public_key")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-background px-3 py-2 text-xs font-mono text-foreground/90">
                  {PUBLIC_KEY}
                </code>
                <CopyButton text={PUBLIC_KEY} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("developers.public_key_desc")}
              </p>
            </CardContent>
          </Card>

          {/* Secret Key */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("developers.secret_key")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-background px-3 py-2 text-xs font-mono text-foreground/90">
                  {secretRevealed ? SECRET_KEY : "•••••••••••••••••••••••••••••••••••••••••"}
                </code>
                <CopyButton text={SECRET_KEY} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setSecretRevealed((prev) => !prev)}
                >
                  {secretRevealed ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("developers.secret_key_desc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* ── Section 2: Quick Start ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-usdt" />
          <h2 className="text-lg font-medium text-foreground">{t("developers.quick_start")}</h2>
        </div>

        <Tabs defaultValue="curl" className="w-full">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="curl" className="data-[state=active]:bg-usdt/15 data-[state=active]:text-usdt">
              cURL
            </TabsTrigger>
            <TabsTrigger value="nodejs" className="data-[state=active]:bg-usdt/15 data-[state=active]:text-usdt">
              Node.js
            </TabsTrigger>
            <TabsTrigger value="php" className="data-[state=active]:bg-usdt/15 data-[state=active]:text-usdt">
              PHP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curl" className="mt-4">
            <CodeBlock code={CURL_CODE} language="bash" />
          </TabsContent>

          <TabsContent value="nodejs" className="mt-4">
            <CodeBlock code={NODE_CODE} language="javascript" />
          </TabsContent>

          <TabsContent value="php" className="mt-4">
            <CodeBlock code={PHP_CODE} language="php" />
          </TabsContent>
        </Tabs>
      </section>

      <Separator className="bg-border" />

      {/* ── Section 3: Webhook Events ───────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-usdt" />
          <h2 className="text-lg font-medium text-foreground">{t("developers.webhook_events")}</h2>
        </div>

        <Card className="bg-surface border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {WEBHOOK_EVENTS.map((wh) => (
                <div
                  key={wh.event}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3 border-l-2 border-l-usdt"
                >
                  <code className="text-xs font-mono text-usdt shrink-0 sm:w-48">
                    {wh.event}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    {wh.description}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}