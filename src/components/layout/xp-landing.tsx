'use client';

import React, { useState, useCallback } from 'react';
import { useAuthStore, ROLE_LABELS } from '@/stores/auth-store';
import { useNavStore } from '@/stores/nav-store';
import { xpApi, type MerchantLoginResponse, type AdminLoginResponse } from '@/lib/api/client';
import { XPaymentsApiError } from '@/lib/api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Globe,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  User,
  Loader2,
  ChevronRight,
  TrendingUp,
  Layers,
  Fingerprint,
  AlertCircle,
  Menu,
  X,
  FileText,
  HelpCircle,
  Activity,
} from 'lucide-react';
import CryptoCards from '@/components/shared/crypto-cards';
import { cn } from '@/lib/utils';
import type { AuthUser, UserRole } from '@/types/xpayments';

// --- Dev Mode Mock Users (apenas para dev local, SEM API) ---
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

const FEATURES = [
  { icon: Layers, title: 'Multi-Wallet', desc: 'EUR, BRL, USD, USDT — gestão centralizada em multi-moeda' },
  { icon: Zap, title: 'Motor de Swap', desc: 'Conversão instantânea entre moedas com taxas reais' },
  { icon: Shield, title: 'KYC Progressivo', desc: '4 níveis de verificação com limites adaptados' },
  { icon: Fingerprint, title: 'Infraestrutura Segura', desc: 'Ledger institucional com encriptação de ponta a ponta' },
];

const NAV_LINKS = [
  { label: 'Plataforma', href: '#features' },
  { label: 'Mercado', href: '#market' },
  { label: 'Documentação', href: '#' },
  { label: 'Suporte', href: '#' },
];

export default function XPaymentsLanding() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { setAuth, isLoading, setLoading } = useAuthStore();
  const { setPage } = useNavStore();

  // ── Helper: mapeia role do backend para UserRole do frontend ──
  const mapRole = (backendRole?: string): UserRole => {
    if (!backendRole) return 'merchant';
    const upper = backendRole.toUpperCase();
    if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'admin';
    if (upper === 'OPERATOR') return 'operator';
    if (upper === 'SUPER_MERCHANT') return 'super_merchant';
    if (upper === 'CUSTOMER') return 'customer';
    return 'merchant';
  };

  // ── Login Merchant via API real ──
  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      setLoading(true);

      try {
        if (isAdminLogin) {
          // ── Admin Login: POST /api/v1/admin/login ──
          const response = await xpApi.admin.login({
            email: loginId,
            password: loginPassword,
          });

          // Response: { adminId, name, role, token }
          const adminData = response as AdminLoginResponse;
          if (!adminData.token) {
            setLoginError('Resposta inválida do servidor');
            return;
          }

          const user: AuthUser = {
            id: adminData.adminId,
            fullName: adminData.name,
            email: loginId,
            role: mapRole(adminData.role),
            tier: 'TIER_3_CORPORATE',
          };

          setAuth(adminData.token, user);
          setPage('admin-dashboard');
        } else {
          // ── Merchant Login: POST /api/v1/auth/login ──
          const response = await xpApi.auth.login({
            email: loginId,
            password: loginPassword,
          });

          // Response: { merchantId, name, tier, token }
          const merchantData = response as MerchantLoginResponse;
          if (!merchantData.token) {
            setLoginError('Resposta inválida do servidor');
            return;
          }

          const user: AuthUser = {
            id: merchantData.merchantId,
            fullName: merchantData.name,
            email: loginId,
            role: 'merchant',
            tier: merchantData.tier || 'TIER_1_BASIC',
          };

          setAuth(merchantData.token, user);
        }

        window.dispatchEvent(new CustomEvent('xp:authenticated'));
      } catch (err: unknown) {
        if (err instanceof XPaymentsApiError) {
          setLoginError(err.message);
        } else if (err instanceof Error) {
          setLoginError(err.message);
        } else {
          setLoginError('Erro de conexão com o servidor');
        }
      } finally {
        setLoading(false);
      }
    },
    [loginId, loginPassword, isAdminLogin, setAuth, setLoading, setPage],
  );

  // ── Register via API real ──
  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!regEmail || !regPassword) {
        setLoginError('Preencha todos os campos obrigatórios.');
        return;
      }
      setLoginError('');
      setLoading(true);
      try {
        await xpApi.auth.register({
          email: regEmail,
          password: regPassword,
          storeName: regStoreName || undefined,
        });

        // Registration successful — switch to login
        setLoginError('Conta criada com sucesso! Faça login para continuar.');
        setAuthMode('login');
      } catch (err: unknown) {
        if (err instanceof XPaymentsApiError) {
          setLoginError(err.message);
        } else if (err instanceof Error) {
          setLoginError(err.message);
        } else {
          setLoginError('Erro ao criar conta');
        }
      } finally {
        setLoading(false);
      }
    },
    [regEmail, regPassword, regStoreName, setLoading],
  );

  // ── Dev Mode (sem API) ──
  const handleDevLogin = useCallback(
    (role: string) => {
      const user = devUsers[role];
      if (!user) return;
      setAuth('dev_token_xxx', user);
      window.dispatchEvent(new CustomEvent('xp:authenticated'));
    },
    [setAuth],
  );

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-hidden bg-[#0A0E1A]">
      {/* === NEON GRID BACKGROUND === */}
      <div className="xpayments-grid-bg" />
      <div className="xpayments-sweep" />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-[700px] w-[700px] rounded-full bg-neon-600/[0.06] blur-[150px] animate-pulse-glow" />
        <div className="absolute right-[15%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-neon-500/[0.04] blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute left-[50%] top-[60%] h-[400px] w-[400px] rounded-full bg-neon-400/[0.03] blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* === NAVIGATION BAR === */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 shrink-0 border-b border-zinc-800/30 bg-[#0A0E1A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9">
            <img src="/logo.png" alt="XPayments" className="w-8 h-8 rounded-full" />
          </div>
          <span className="text-base font-bold text-zinc-100 tracking-tight">XPayments.Digital</span>
          <span className="hidden sm:inline-flex text-[9px] font-medium uppercase tracking-widest text-neon-500/60 bg-neon-500/10 px-2 py-0.5 rounded">
            Banking
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-800/40"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-500/10 border border-neon-500/20">
            <Activity className="w-3 h-3 text-neon-400" />
            <span className="text-[10px] font-medium text-neon-300">Online</span>
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-8 w-8 text-zinc-400 hover:text-zinc-200"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="relative z-20 md:hidden border-b border-zinc-800/30 bg-[#0A0E1A]/95 backdrop-blur-md px-4 py-3 animate-slide-in-left">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-800/40"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-zinc-800/30">
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300">Documentação API</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300">Status</a>
            </div>
          </div>
        </nav>
      )}

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

        {/* MOBILE: Auth first (order-1), Crypto second (order-2) */}
        {/* DESKTOP: LEFT = Crypto (no order), RIGHT = Auth (no order) */}

        {/* RIGHT: Auth + Marketing — order-1 on mobile, order-last on desktop */}
        <div className="order-1 lg:order-last lg:w-[440px] xl:w-[480px] shrink-0 flex flex-col justify-center p-4 sm:p-6 lg:p-8 lg:border-l border-t lg:border-t-0 border-zinc-800/30 bg-[#0A0E1A]/50 backdrop-blur-sm">
          <div className="max-w-md mx-auto w-full space-y-5 animate-slide-in-right">
            {/* Branding */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-neon-500/20 bg-neon-500/10 animate-float-up">
                  <img src="/logo.png" alt="XPayments" className="w-7 h-7 rounded-full" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">XPayments.Digital</h1>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neon-400/70">Centro de Comando</p>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                  O Futuro da{' '}
                  <span className="bg-gradient-to-r from-neon-400 via-neon-300 to-neon-400 bg-clip-text text-transparent animate-gradient-x">
                    Logística Financeira
                  </span>
                </h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Plataforma institucional Web3 para gestão de wallets multi-moeda,
                  settlement automatizado e operações cross-border.
                  A ponte entre o sistema financeiro tradicional e a economia digital.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-500/10 border border-neon-500/20">
                  <Shield className="w-3 h-3 text-neon-400" />
                  <span className="text-[10px] font-medium text-neon-300">Seguro</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/40">
                  <Globe className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-300">Global</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/40">
                  <Zap className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-300">Instant</span>
                </div>
              </div>
            </div>

            {/* Auth Tabs */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="flex border-b border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    authMode === 'login' ? 'text-neon-400 bg-neon-500/[0.06] border-b-2 border-neon-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setLoginError(''); setIsAdminLogin(false); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    authMode === 'register' ? 'text-neon-400 bg-neon-500/[0.06] border-b-2 border-neon-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              {/* Admin Login Toggle — only visible in login mode */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between px-5 pt-3">
                  <span className="text-[10px] text-zinc-600">Acesso Admin / Operador</span>
                  <button
                    type="button"
                    onClick={() => { setIsAdminLogin(!isAdminLogin); setLoginError(''); }}
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      isAdminLogin ? 'bg-neon-500/30' : 'bg-zinc-800',
                    )}
                    aria-label={isAdminLogin ? 'Modo Merchant' : 'Modo Admin'}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform',
                      isAdminLogin ? 'translate-x-4 bg-neon-400' : 'bg-zinc-500',
                    )} />
                  </button>
                </div>
              )}

              <div className="p-5 sm:p-6">
                {loginError && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <p className="text-xs text-red-300">{loginError}</p>
                  </div>
                )}

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-id" className="text-xs font-medium text-zinc-400">Email</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                        <Input
                          id="login-id"
                          type="text"
                          placeholder="seu@email.com"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          className="h-11 border-white/[0.06] bg-white/[0.03] pl-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-neon-500/40 focus-visible:ring-neon-500/15"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-pass" className="text-xs font-medium text-zinc-400">Senha</Label>
                        <button type="button" className="text-[10px] text-neon-400/60 hover:text-neon-400 transition-colors">Esqueceu?</button>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                        <Input
                          id="login-pass"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="h-11 border-white/[0.06] bg-white/[0.03] pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-neon-500/40 focus-visible:ring-neon-500/15"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-neon-600 to-neon-500 text-sm font-semibold text-white shadow-lg shadow-neon-900/20 transition-all hover:from-neon-500 hover:to-neon-400 hover:shadow-neon-800/30 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {isAdminLogin ? 'Acessar como Admin' : 'Acessar Plataforma'}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-store" className="text-xs font-medium text-zinc-400">Nome da Loja (opcional)</Label>
                      <Input
                        id="reg-store"
                        type="text"
                        placeholder="Minha Loja"
                        value={regStoreName}
                        onChange={(e) => setRegStoreName(e.target.value)}
                        className="h-11 border-white/[0.06] bg-white/[0.03] pl-4 text-sm text-white placeholder:text-zinc-600 focus-visible:border-neon-500/40 focus-visible:ring-neon-500/15"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-xs font-medium text-zinc-400">Email</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="h-11 border-white/[0.06] bg-white/[0.03] pl-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-neon-500/40 focus-visible:ring-neon-500/15"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-pass" className="text-xs font-medium text-zinc-400">Criar Senha</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                        <Input
                          id="reg-pass"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 8 caracteres"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="h-11 border-white/[0.06] bg-white/[0.03] pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-neon-500/40 focus-visible:ring-neon-500/15"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-neon-600 to-neon-500 text-sm font-semibold text-white shadow-lg shadow-neon-900/20 transition-all hover:from-neon-500 hover:to-neon-400 hover:shadow-neon-800/30 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Criar Conta<ChevronRight className="h-4 w-4" /></>}
                      </Button>
                      <p className="text-[10px] text-center text-zinc-600 leading-relaxed">
                        Ao criar uma conta, concorda com os{' '}
                        <span className="text-zinc-400 underline cursor-pointer">Termos de Uso</span>
                        {' '}e{' '}
                        <span className="text-zinc-400 underline cursor-pointer">Política de Privacidade</span>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Dev Mode */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500/80 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Dev Mode — Acesso Rápido</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {devRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDevLogin(role)}
                    className="group flex items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-1.5 text-[11px] font-medium text-zinc-500 transition-all hover:border-neon-500/25 hover:bg-neon-500/[0.06] hover:text-neon-400"
                  >
                    {ROLE_LABELS[role]}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LEFT: Crypto Exchange Data — order-2 on mobile (comes after auth), first on desktop */}
        <div className="order-2 lg:order-first lg:flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Stats row - horizontal scroll on mobile */}
          <div className="flex items-center gap-4 sm:gap-6 mb-5 overflow-x-auto pb-2 -mx-1 px-1 animate-slide-in-left">
            {[
              { value: '$2.4B+', label: 'Volume Processado' },
              { value: '150K+', label: 'Transações/Mês' },
              { value: '99.9%', label: 'Uptime' },
              { value: '< 2s', label: 'Settlement' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col shrink-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-300 tabular-nums">{stat.value}</span>
                <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>

          <div id="market" className="mb-4 animate-slide-in-left">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-neon-400" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-400/80">Mercado Ao Vivo</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">Crypto Markets</h2>
          </div>

          <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <CryptoCards />
          </div>

          {/* Supported Currencies — Dark themed replacement */}
          <div className="mt-6 rounded-xl border border-zinc-800/40 bg-zinc-900/30 overflow-hidden animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/40">
              <Globe className="w-3.5 h-3.5 text-neon-400/60" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Moedas Suportadas</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-800/40">
              {[
                { symbol: 'EUR', name: 'Euro', desc: 'SEPA Instant', color: 'text-sky-400', bg: 'bg-sky-500/10' },
                { symbol: 'BRL', name: 'Real', desc: 'PIX Instantâneo', color: 'text-neon-400', bg: 'bg-neon-500/10' },
                { symbol: 'USDT', name: 'Tether', desc: 'TRC-20 / ERC-20', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { symbol: 'USD', name: 'Dólar', desc: 'Wire Transfer', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              ].map((c) => (
                <div key={c.symbol} className="flex flex-col items-center gap-2 p-4 sm:p-5 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors">
                  <div className={cn('size-10 rounded-xl border border-zinc-700/30 flex items-center justify-center', c.bg)}>
                    <span className={cn("text-sm font-bold", c.color)}>{c.symbol}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-200">{c.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div id="features" className="mt-6 grid grid-cols-2 gap-3 animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
            {FEATURES.map((feat) => (
              <div key={feat.title} className="group flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-800/30 bg-zinc-900/20 transition-all hover:border-neon-500/20 hover:bg-zinc-900/40">
                <feat.icon className="w-4 h-4 text-zinc-500 group-hover:text-neon-400 transition-colors" />
                <span className="text-xs font-semibold text-zinc-200">{feat.title}</span>
                <span className="text-[10px] leading-relaxed text-zinc-500">{feat.desc}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/30">
            <p className="text-[10px] text-zinc-600 leading-relaxed text-center">
              XPayments.Digital v2.0 · Infraestrutura Web3 Institucional
            </p>
          </div>
        </div>
      </div>

      {/* === FOOTER (sticky) === */}
      <footer className="relative z-10 border-t border-zinc-800/30 bg-[#0A0E1A]/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="XPayments" className="w-4 h-4 rounded-full" />
            <span className="text-[10px] text-zinc-600">&copy; 2026 XPayments.Digital. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="flex items-center gap-1 text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">
              <FileText className="w-3 h-3" />
              Documentação
            </a>
            <a href="#" className="flex items-center gap-1 text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">
              <HelpCircle className="w-3 h-3" />
              Suporte
            </a>
            <a href="#" className="text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
