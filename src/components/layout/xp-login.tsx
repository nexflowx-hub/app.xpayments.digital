'use client';

import { useState, useCallback } from 'react';
import { useAuthStore, ROLE_LABELS } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Hexagon,
  Shield,
  Globe,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  Loader2,
} from 'lucide-react';
import type { AuthUser } from '@/types/xpayments';

// --- Dev Mode Mock Users ---
const devUsers: Record<string, AuthUser> = {
  customer: {
    id: 'usr_cust_001',
    email: 'customer@email.com',
    nickname: 'Buyer2024',
    fullName: 'Customer Demo',
    role: 'customer',
    tier: 'TIER_1_BASIC',
  },
  merchant: {
    id: 'usr_merch_001',
    email: 'merchant@shop.com',
    nickname: 'CryptoSeller',
    fullName: 'Merchant Demo',
    role: 'merchant',
    tier: 'TIER_2_VERIFIED',
    organizationId: 'org_001',
    organizationName: 'XPayments Demo Store',
  },
  super_merchant: {
    id: 'usr_super_001',
    email: 'super@xpayments.corp',
    nickname: 'XPaymentsAdmin',
    fullName: 'Super Merchant',
    role: 'super_merchant',
    tier: 'TIER_3_CORPORATE',
    organizationId: 'org_xpcorp',
    organizationName: 'XPayments Corp',
  },
  admin: {
    id: 'usr_admin_001',
    email: 'admin@xpayments.digital',
    nickname: 'XPaymentsAdmin',
    fullName: 'Admin XPayments',
    role: 'admin',
    tier: 'TIER_3_CORPORATE',
  },
  operator: {
    id: 'usr_ops_001',
    email: 'ops@xpayments.digital',
    nickname: 'OpsAgent',
    fullName: 'Operator',
    role: 'operator',
  },
};

const devRoles = ['customer', 'merchant', 'super_merchant', 'admin', 'operator'] as const;

// --- Feature items for branding panel ---
const features = [
  { icon: Shield, text: 'Segurança Institucional' },
  { icon: Globe, text: 'Pagamentos Globais' },
  { icon: Hexagon, text: 'Infraestrutura Web3' },
];

export default function XPaymentsLogin() {
  const [xpId, setXpId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth, isLoading, setLoading } = useAuthStore();

  // Handle normal login
  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setLoading(false);
      // In production, this would call the API and use setAuth with real credentials
    },
    [setLoading]
  );

  // Handle dev mode login
  const handleDevLogin = useCallback(
    (role: string) => {
      const user = devUsers[role];
      if (!user) return;
      setAuth('dev_token_xxx', user);
      window.dispatchEvent(new CustomEvent('xp:authenticated'));
    },
    [setAuth]
  );

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0f0d]">
      {/* Background: Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Background: Radial gradient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-neon-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-neon-500/[0.05] blur-[100px]" />
      </div>

      {/* Main Card Container */}
      <Card className="relative z-10 mx-4 flex w-full max-w-4xl flex-col overflow-hidden border border-white/[0.08] bg-white/[0.03] p-0 shadow-2xl backdrop-blur-xl lg:flex-row">
        {/* ── Left Panel: Branding ── */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-neon-950/80 via-[#0c1a14] to-neon-950/60 p-8 lg:flex-1 lg:p-12">
          {/* Subtle pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(52, 211, 153, 0.8) 1px, transparent 1px),
                linear-gradient(90deg, rgba(52, 211, 153, 0.8) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 flex flex-1 flex-col justify-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon-500/30 bg-neon-500/10">
                <img src="/logo.png" alt="XPayments" className="h-7 w-7 rounded-full" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  XPayments.Digital
                </h1>
                <p className="text-xs font-medium tracking-widest text-neon-400/80 uppercase">
                  Centro de Comando
                </p>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold leading-tight text-white lg:text-3xl">
                Plataforma Institucional{' '}
                <span className="bg-gradient-to-r from-neon-400 to-neon-300 bg-clip-text text-transparent">
                  Web3
                </span>
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-white/50">
                Gestão completa de wallets, transações e operações financeiras.
                Infraestrutura segura para o ecossistema de pagamentos digitais.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3 pt-2">
              {features.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-500/10">
                    <feature.icon className="h-4 w-4 text-neon-400" />
                  </div>
                  <span className="text-sm text-white/60">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="relative z-10 mt-8 h-px bg-gradient-to-r from-neon-500/40 via-neon-400/20 to-transparent" />
          <p className="relative z-10 mt-4 text-xs text-white/20">
            XPayments.Digital &middot; v2.0
          </p>
        </div>

        {/* ── Right Panel: Login Form ── */}
        <div className="flex flex-1 flex-col justify-center bg-[#0a0f0d]/80 p-8 lg:p-12">
          <CardHeader className="gap-1.5 p-0 pb-6">
            <CardTitle className="text-xl font-semibold text-white">
              Acessar Plataforma
            </CardTitle>
            <CardDescription className="text-sm text-white/40">
              Insira suas credenciais para entrar no painel
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* XPayments ID / Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="xp-id"
                  className="text-sm font-medium text-white/70"
                >
                  XPayments ID ou Email
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <Input
                    id="xp-id"
                    type="text"
                    placeholder="seu@email.com"
                    value={xpId}
                    onChange={(e) => setXpId(e.target.value)}
                    className="h-11 border-white/[0.08] bg-white/[0.04] pl-10 text-white placeholder:text-white/25 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-white/70"
                >
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-white/[0.08] bg-white/[0.04] pl-10 pr-10 text-white placeholder:text-white/25 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/50"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password (optional link) */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-neon-400/70 transition-colors hover:text-neon-400"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full gap-2 rounded-lg bg-gradient-to-r from-neon-600 to-neon-500 text-sm font-semibold text-white shadow-lg shadow-neon-900/25 transition-all hover:from-neon-500 hover:to-neon-400 hover:shadow-neon-800/30 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* ── Dev Mode Section ── */}
            <div className="mt-8 border-t border-white/[0.06] pt-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500/80 animate-pulse" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/25">
                  Dev Mode — Acesso Rápido
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {devRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDevLogin(role)}
                    className="group flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/40 transition-all hover:border-neon-500/30 hover:bg-neon-500/10 hover:text-neon-400"
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
