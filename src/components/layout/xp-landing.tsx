'use client';

import React, { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useNavStore } from '@/stores/nav-store';
import { xpApi, type MerchantLoginResponse, type AdminLoginResponse } from '@/lib/api/client';
import { XPaymentsApiError } from '@/lib/api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Globe,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  User,
  Loader2,
  ChevronRight,
  Landmark,
  Layers3,
  ShoppingBag,
  Shuffle,
  HelpCircle,
  Tag,
  CreditCard,
  FileText,
  Headphones,
  X,
  ChevronDown,
  Calendar,
  Copy,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthUser, UserRole } from '@/types/xpayments';

/* ════════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { label: 'Soluções', hasCaret: true },
  { label: 'Preços', hasCaret: false },
  { label: 'Documentação', hasCaret: false },
  { label: 'Empresa', hasCaret: true },
  { label: 'Recursos', hasCaret: true },
];

const TRUST_POINTS = [
  'Conformidade global',
  'Segurança de nível bancário',
  '99.9% de uptime',
];

const CAPABILITIES = [
  { icon: Globe, color: '#3b82f6', title: 'Pagamentos Globais', desc: 'Aceite métodos de pagamento locais em todo o mundo.' },
  { icon: Shuffle, color: '#3b82f6', title: 'Roteamento Inteligente', desc: 'Maximize as taxas de aprovação automaticamente.' },
  { icon: Landmark, color: '#3b82f6', title: 'Tesouraria', desc: 'Gerencie saldos e liquidações de forma eficiente.' },
  { icon: Layers3, color: '#3b82f6', title: 'Ativos Digitais', desc: 'Transite entre fiat e cripto de forma simples e segura.' },
  { icon: ShoppingBag, color: '#8b5cf6', title: 'Infraestrutura de Comércio', desc: 'Crie produtos, checkouts e marketplaces.' },
];

const KPI_DATA = [
  { value: '€128.4M', label: 'Volume Processado', delta: '+24.6% vs mês anterior', points: [8, 10, 9, 13, 12, 16, 15, 19, 22, 24], color: '#3b82f6' },
  { value: '98.7%', label: 'Taxa de Aprovação', delta: '+2.6% vs mês anterior', points: [6, 9, 8, 11, 10, 12, 14, 13, 17, 20], color: '#22c55e' },
  { value: '152', label: 'Mercados Ativos', delta: '+12 novos este mês', points: [7, 8, 10, 9, 12, 11, 14, 16, 15, 18], color: '#3b82f6' },
  { value: 'T+0', label: 'Liquidação', delta: 'Instantânea', points: undefined, color: undefined },
];

const CODE_TABS = ['Node.js', 'PHP', 'Python', 'Go', 'cURL'];

const CONTACTS = [
  { label: 'WhatsApp', src: '/logos/whatsapp.svg', color: '#25D366' },
  { label: 'Telegram', src: '/logos/telegram.svg', color: '#229ED9' },
  { label: 'Discord', src: '/logos/discord.svg', color: '#5865F2' },
];

const TRUST_LOGOS_ROW1 = [
  { src: '/logos/stripe.svg', alt: 'Stripe', h: 'h-7' },
  { src: '/logos/shopify.svg', alt: 'Shopify', h: 'h-8' },
  { src: '/logos/openai.svg', alt: 'OpenAI', h: 'h-7' },
  { src: '/logos/nextdotjs.svg', alt: 'Next.js', h: 'h-6' },
];

const TRUST_LOGOS_ROW2 = [
  { src: '/logos/adobe.svg', alt: 'Adobe', h: 'h-7' },
  { src: '/logos/reddit.svg', alt: 'Reddit', h: 'h-7' },
  { src: '/logos/notion.svg', alt: 'Notion', h: 'h-7' },
  { src: '/logos/miro.svg', alt: 'Miro', h: 'h-7' },
];

/* ════════════════════════════════════════════════════════════════
   X LOGO
   ════════════════════════════════════════════════════════════════ */

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="xp-grad-landing" x1="4" y1="6" x2="44" y2="42">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <polygon points="4,6 13,6 44,42 35,42" fill="#60a5fa" />
      <polygon points="44,6 35,6 4,42 13,42" fill="url(#xp-grad-landing)" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   SPARKLINE (mini chart)
   ════════════════════════════════════════════════════════════════ */

function Sparkline({ points, color, className }: { points: number[]; color: string; className?: string }) {
  const width = 160;
  const height = 48;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={coords.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   CURRENCY CARD (floating on world map)
   ════════════════════════════════════════════════════════════════ */

function CurrencyCard({ code, name, symbol, color, flag, className }: {
  code: string;
  name: string;
  symbol?: string;
  color?: string;
  flag?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'absolute flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#071120]/90 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md',
      className,
    )}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {flag || (symbol && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold text-white" style={{ backgroundColor: color }}>
            {symbol}
          </div>
        ))}
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-white">{code}</div>
        <div className="text-xs text-zinc-400">{name}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AUTH MODAL
   ════════════════════════════════════════════════════════════════ */

function AuthModal({ open, onClose, initialMode }: { open: boolean; onClose: () => void; initialMode: 'login' | 'register' }) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { setAuth, isLoading, setLoading } = useAuthStore();
  const { setPage } = useNavStore();

  const mapRole = (backendRole?: string): UserRole => {
    if (!backendRole) return 'merchant';
    const upper = backendRole.toUpperCase();
    if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'admin';
    if (upper === 'OPERATOR') return 'operator';
    if (upper === 'SUPER_MERCHANT') return 'super_merchant';
    if (upper === 'CUSTOMER') return 'customer';
    return 'merchant';
  };

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      if (isAdminLogin) {
        const response = await xpApi.admin.login({ email: loginId, password: loginPassword });
        const adminData = response as AdminLoginResponse;
        if (!adminData.token) { setLoginError('Resposta inválida do servidor'); return; }
        const user: AuthUser = { id: adminData.adminId, fullName: adminData.name, email: loginId, role: mapRole(adminData.role), tier: 'TIER_3_CORPORATE' };
        setAuth(adminData.token, user);
        setPage('admin-dashboard');
      } else {
        const response = await xpApi.auth.login({ email: loginId, password: loginPassword });
        const merchantData = response as MerchantLoginResponse;
        if (!merchantData.token) { setLoginError('Resposta inválida do servidor'); return; }
        const user: AuthUser = { id: merchantData.merchantId, fullName: merchantData.name, email: loginId, role: 'merchant', tier: merchantData.tier || 'TIER_1_BASIC' };
        setAuth(merchantData.token, user);
      }
      window.dispatchEvent(new CustomEvent('xp:authenticated'));
    } catch (err: unknown) {
      if (err instanceof XPaymentsApiError) setLoginError(err.message);
      else if (err instanceof Error) setLoginError(err.message);
      else setLoginError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, [loginId, loginPassword, isAdminLogin, setAuth, setLoading, setPage]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword) { setLoginError('Preencha todos os campos obrigatórios.'); return; }
    setLoginError('');
    setLoading(true);
    try {
      await xpApi.auth.register({ email: regEmail, password: regPassword, storeName: regStoreName || undefined });
      setLoginError('Conta criada com sucesso! Faça login para continuar.');
      setAuthMode('login');
    } catch (err: unknown) {
      if (err instanceof XPaymentsApiError) setLoginError(err.message);
      else if (err instanceof Error) setLoginError(err.message);
      else setLoginError('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }, [regEmail, regPassword, regStoreName, setLoading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#071120] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <XLogo className="h-7 w-7" />
            <span className="text-lg font-bold text-white">XPayments</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-2">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setLoginError(''); }}
            className={cn(
              'pb-3 text-sm font-semibold transition-all border-b-2',
              authMode === 'login' ? 'border-[#2563eb] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300',
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setLoginError(''); setIsAdminLogin(false); }}
            className={cn(
              'pb-3 ml-6 text-sm font-semibold transition-all border-b-2',
              authMode === 'register' ? 'border-[#2563eb] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300',
            )}
          >
            Criar Conta
          </button>
        </div>

        {/* Admin Toggle */}
        {authMode === 'login' && (
          <div className="flex items-center justify-between px-6 pt-3">
            <span className="text-xs text-zinc-500">Acesso Admin / Operador</span>
            <button
              type="button"
              onClick={() => { setIsAdminLogin(!isAdminLogin); setLoginError(''); }}
              className={cn('relative h-5 w-9 rounded-full transition-colors', isAdminLogin ? 'bg-[#2563eb]/40' : 'bg-zinc-700')}
              aria-label={isAdminLogin ? 'Modo Merchant' : 'Modo Admin'}
            >
              <span className={cn('absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform', isAdminLogin ? 'translate-x-4 bg-[#2563eb]' : 'bg-zinc-500')} />
            </button>
          </div>
        )}

        <div className="p-6">
          {loginError && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <X className="h-4 w-4 text-red-400 rotate-45" />
              <p className="text-xs text-red-300">{loginError}</p>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-login-id" className="text-xs font-medium text-zinc-400">Email</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <Input id="modal-login-id" type="email" autoComplete="email" placeholder="seu@email.com" value={loginId} onChange={(e) => setLoginId(e.target.value)}
                    className="h-11 border-white/[0.08] bg-white/[0.03] pl-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-[#2563eb]/40 focus-visible:ring-[#2563eb]/15" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="modal-login-pass" className="text-xs font-medium text-zinc-400">Senha</Label>
                  <button type="button" className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">Esqueceu?</button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <Input id="modal-login-pass" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-11 border-white/[0.08] bg-white/[0.03] pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-[#2563eb]/40 focus-visible:ring-[#2563eb]/15" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading}
                className="h-11 w-full gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-[0_12px_32px_-10px_rgba(37,99,235,0.6)] transition-all hover:bg-blue-500 disabled:opacity-50">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isAdminLogin ? 'Acessar como Admin' : 'Acessar Plataforma'}<ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-reg-store" className="text-xs font-medium text-zinc-400">Nome da Loja (opcional)</Label>
                <Input id="modal-reg-store" type="text" placeholder="Minha Loja" value={regStoreName} onChange={(e) => setRegStoreName(e.target.value)}
                  className="h-11 border-white/[0.08] bg-white/[0.03] pl-4 text-sm text-white placeholder:text-zinc-600 focus-visible:border-[#2563eb]/40 focus-visible:ring-[#2563eb]/15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-email" className="text-xs font-medium text-zinc-400">Email</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <Input id="modal-reg-email" type="email" autoComplete="email" placeholder="seu@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    className="h-11 border-white/[0.08] bg-white/[0.03] pl-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-[#2563eb]/40 focus-visible:ring-[#2563eb]/15" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-pass" className="text-xs font-medium text-zinc-400">Criar Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <Input id="modal-reg-pass" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className="h-11 border-white/[0.08] bg-white/[0.03] pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-[#2563eb]/40 focus-visible:ring-[#2563eb]/15" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading}
                className="h-11 w-full gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-[0_12px_32px_-10px_rgba(37,99,235,0.6)] transition-all hover:bg-blue-500 disabled:opacity-50">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Criar Conta<ChevronRight className="h-4 w-4" /></>}
              </Button>
              <p className="text-[10px] text-center text-zinc-500 leading-relaxed">
                Ao criar uma conta, concorda com os{' '}
                <span className="text-zinc-400 underline cursor-pointer">Termos de Uso</span>
                {' '}e{' '}
                <span className="text-zinc-400 underline cursor-pointer">Política de Privacidade</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ════════════════════════════════════════════════════════════════ */

export default function XPaymentsLanding() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeTab, setCodeTab] = useState('Node.js');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020817] text-white">
      {/* ══════════════════ HEADER ══════════════════ */}
      <header className="relative z-30 h-14 sm:h-16 lg:h-20 border-b border-white/[0.06]">
        <div className="mx-auto flex h-14 sm:h-16 lg:h-20 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <XLogo className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-white">XPayments</span>
          </a>

          {/* Center nav (desktop) */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href="#" className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-white">
                {item.label}
                {item.hasCaret && <ChevronDown className="h-3.5 w-3.5" />}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.04]">
              <Globe className="h-4 w-4" />
              PT
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>
            <button onClick={() => openAuth('login')} className="hidden sm:inline-flex rounded-lg border border-white/[0.08] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.04]">
              Entrar
            </button>
            <button onClick={() => openAuth('register')} className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)] transition-colors hover:bg-blue-500">
              <span className="hidden sm:inline">Começar Agora</span>
              <span className="sm:hidden">Entrar</span>
            </button>
            {/* Mobile menu */}
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden h-9 w-9 text-zinc-400 hover:text-white" aria-label="Menu">
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-white/[0.06] bg-[#020817]/95 backdrop-blur-md px-6 py-4">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <a key={item.label} href="#" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04]">
                  {item.label}
                </a>
              ))}
              <div className="flex gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                <button onClick={() => { openAuth('login'); setMobileMenuOpen(false); }} className="flex-1 rounded-lg border border-white/[0.08] py-2.5 text-sm font-medium text-zinc-300">Entrar</button>
                <button onClick={() => { openAuth('register'); setMobileMenuOpen(false); }} className="flex-1 rounded-lg bg-[#2563eb] py-2.5 text-sm font-semibold text-white">Começar Agora</button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <main className="flex-1">

        {/* ── HERO SECTION ── */}
        <section className="relative">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
            <div className="grid grid-cols-1 items-center gap-8 py-8 lg:grid-cols-[45fr_55fr] lg:py-10">
              {/* Left column */}
              <div className="relative z-10">
                <p className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-[#2563eb]">
                  Infraestrutura Financeira
                </p>
                <h1 className="text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-[64px]">
                  Infraestrutura Financeira
                  <br />
                  para o Comércio Global
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
                  Aceite pagamentos, gerencie fundos, automatize liquidações e
                  escala globalmente através de uma única plataforma.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button onClick={() => openAuth('register')} className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_32px_-10px_rgba(37,99,235,0.7)] transition-colors hover:bg-blue-500">
                    Começar Agora
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-base font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06]">
                    Agendar Demo
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {TRUST_POINTS.map((point) => (
                    <div key={point} className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#2563eb]" />
                      <span className="text-sm text-zinc-400">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column — World Map */}
              <div className="relative h-[280px] w-full sm:h-[420px] lg:h-[520px]">
                <div className="absolute inset-0 flex items-center justify-center -right-[6%] overflow-hidden">
                  <img
                    src="/images/world-map-glow.png"
                    alt="Mapa mundial iluminado mostrando a rede global de pagamentos da XPayments"
                    className="h-full max-h-full w-auto mix-blend-screen [mask-image:radial-gradient(ellipse_90%_85%_at_center,black_30%,transparent_100%)]"
                  />
                </div>
                <CurrencyCard code="USD" name="Dólar Americano" symbol="$" color="#16a34a" className="hidden sm:block left-[8%] top-[6%]" />
                <CurrencyCard code="EUR" name="Euro" symbol="€" color="#2563eb" className="hidden sm:block left-[2%] top-[34%]" />
                <CurrencyCard
                  code="BRL" name="Real Brasileiro"
                  flag={<svg viewBox="0 0 32 32" className="h-full w-full"><rect width="32" height="32" fill="#009B3A" /><path d="M16 5 L29 16 L16 27 L3 16 Z" fill="#FEDF00" /><circle cx="16" cy="16" r="6" fill="#002776" /></svg>}
                  className="hidden md:block left-[10%] top-[62%]"
                />
                <CurrencyCard code="JPY" name="Yen Japonês" symbol="¥" color="#c026d3" className="hidden sm:block right-[2%] top-[26%]" />
                <CurrencyCard
                  code="NGN" name="Naira Nigeriano"
                  flag={<svg viewBox="0 0 32 32" className="h-full w-full"><rect width="32" height="32" fill="#ffffff" /><rect width="10.66" height="32" fill="#008751" /><rect width="10.66" height="32" x="21.33" fill="#008751" /></svg>}
                  className="hidden lg:block right-[16%] top-[74%]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CAPABILITIES ── */}
        <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <div className="rounded-3xl border border-white/[0.08] bg-[#071120]/60 py-10">
            <div className="grid grid-cols-1 divide-y divide-white/[0.06] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
              {CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.title} className="flex flex-col items-center px-6 py-6 text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08]" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <Icon className="h-6 w-6" style={{ color: cap.color }} />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-white">{cap.title}</h3>
                    <p className="max-w-[220px] text-sm leading-relaxed text-zinc-400">{cap.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PAYMENT METHODS ── */}
        <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/[0.08] bg-[#071120]/60 px-8 py-7 lg:flex-row lg:items-center lg:gap-10">
            <span className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
              Mais de 150 métodos de pagamento
            </span>
            <div className="flex flex-1 flex-wrap items-center justify-between gap-x-9 gap-y-6">
              <img src="/logos/visa.svg" alt="Visa" className="h-7 w-auto brightness-0 invert" />
              <img src="/logos/mastercard.svg" alt="Mastercard" className="h-10 w-auto" />
              <img src="/logos/apple-pay.svg" alt="Apple Pay" className="h-8 w-auto brightness-0 invert" />
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-6 w-6" role="img" aria-label="Google">
                  <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.26-2.09 3.58-5.17 3.58-8.87z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A11.997 11.997 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
                </svg>
                <span className="text-lg font-medium tracking-tight text-white">Pay</span>
              </span>
              <span className="flex items-center gap-2">
                <img src="/logos/pix.svg" alt="" className="h-6 w-6" />
                <span className="text-lg font-semibold lowercase tracking-tight text-[#32BCAD]">pix</span>
              </span>
              <span className="flex items-center gap-1.5">
                <img src="/logos/mbway.svg" alt="MB WAY" className="h-5 w-auto" />
                <span className="text-sm font-semibold text-white">MBWay</span>
              </span>
              <img src="/logos/bizum.svg" alt="Bizum" className="h-5 w-auto" />
              <span className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <Landmark className="h-5 w-5" />
                Transferência Bancária
              </span>
              <span className="text-sm font-medium text-zinc-400">+ Muitos mais</span>
            </div>
          </div>
        </section>

        {/* ── STATS + API ── */}
        <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* KPIs */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#071120]/60 p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4">
                {KPI_DATA.map((kpi, i) => (
                  <div key={kpi.label} className={cn('flex flex-col', i > 0 ? 'sm:border-l sm:border-white/[0.06] sm:pl-6' : '', i % 2 === 1 ? 'border-l border-white/[0.06] pl-6 sm:border-l' : '', i > 1 ? 'mt-10 sm:mt-0' : '')}>
                    <div className="text-3xl font-bold tracking-tight text-white">{kpi.value}</div>
                    <div className="mt-1 text-sm text-zinc-400">{kpi.label}</div>
                    {kpi.delta && <div className="mt-2 text-xs font-medium text-[#22c55e]">{kpi.delta}</div>}
                    <div className="mt-6 h-12">
                      {kpi.points && kpi.color && <Sparkline points={kpi.points} color={kpi.color} className="h-full w-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Card */}
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#071120]/60">
              <div className="flex items-center justify-between px-6 pt-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-[#2563eb]/15 px-2 py-1 text-xs font-semibold text-[#2563eb]">API</span>
                  <span className="text-sm text-zinc-400">Integração simples. Poder ilimitado.</span>
                </div>
                <a href="#" className="flex items-center gap-1 text-sm font-medium text-[#2563eb] hover:text-blue-400">
                  Ver Documentação
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex items-center gap-1 border-b border-white/[0.06] px-6">
                {CODE_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCodeTab(tab)}
                    className={cn(
                      '-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                      codeTab === tab ? 'border-[#2563eb] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300',
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Code Block */}
              <div className="relative">
                <button className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white" aria-label="Copiar código">
                  <Copy className="h-4 w-4" />
                </button>
                <pre className="overflow-x-auto px-6 py-5 font-mono text-[13px] leading-6">
                  <code>
                    <span className="text-[#ff7b72]">const</span>
                    <span className="text-white"> xpayments = </span>
                    <span className="text-[#79c0ff]">require</span>
                    <span className="text-white">(</span>
                    <span className="text-[#7ee787]">&apos;xpayments&apos;</span>
                    <span className="text-white">);</span>
                    {'\n\n'}
                    <span className="text-[#ff7b72]">const</span>
                    <span className="text-white"> payment = </span>
                    <span className="text-[#ff7b72]">await</span>
                    <span className="text-white"> xpayments.checkout.</span>
                    <span className="text-[#d2a8ff]">create</span>
                    <span className="text-white">({'{'}</span>
                    {'\n  '}
                    <span className="text-[#79c0ff]">amount</span>
                    <span className="text-white">: </span>
                    <span className="text-[#79c0ff]">10000</span>
                    <span className="text-white">,</span>
                    {'\n  '}
                    <span className="text-[#79c0ff]">currency</span>
                    <span className="text-white">: </span>
                    <span className="text-[#7ee787]">&apos;EUR&apos;</span>
                    <span className="text-white">,</span>
                    {'\n  '}
                    <span className="text-[#79c0ff]">method</span>
                    <span className="text-white">: </span>
                    <span className="text-[#7ee787]">&apos;card&apos;</span>
                    <span className="text-white">,</span>
                    {'\n  '}
                    <span className="text-[#79c0ff]">description</span>
                    <span className="text-white">: </span>
                    <span className="text-[#7ee787]">&apos;Order #1234&apos;</span>
                    {'\n'}
                    <span className="text-white">{'}'});</span>
                    {'\n\n'}
                    <span className="text-white">console.</span>
                    <span className="text-[#d2a8ff]">log</span>
                    <span className="text-white">(payment.id);</span>
                    {'\n'}
                    <span className="text-zinc-500">{'// pay_0jK2fiM03qKEEYC6J'}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST LOGOS ── */}
        <section className="mx-auto max-w-[1600px] px-6 py-4 lg:px-12">
          <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">
            Confiado por empresas inovadoras em todo o mundo
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {TRUST_LOGOS_ROW1.map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} className={cn(logo.h, 'w-auto opacity-55 brightness-0 invert transition-opacity hover:opacity-90')} />
            ))}
            <span className="text-2xl font-bold tracking-tight text-white/55">saaS</span>
            {TRUST_LOGOS_ROW2.map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} className={cn(logo.h, 'w-auto opacity-55 brightness-0 invert transition-opacity hover:opacity-90')} />
            ))}
          </div>
        </section>
      </main>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="border-t border-white/[0.06] mt-auto">
        <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <XLogo className="h-6 w-6" />
              <span className="text-sm font-bold text-white">XPayments</span>
              <span className="text-xs text-zinc-500">&copy; 2026. Todos os direitos reservados.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Documentação</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Suporte</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Status</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════ FLOATING CONTACT SIDEBAR ══════════════════ */}
      <div className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
        {CONTACTS.map((c) => (
          <a
            key={c.label}
            href="#"
            className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-[#071120]/90 py-2 pl-2 pr-5 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.9)] backdrop-blur-md transition-transform hover:scale-[1.03]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: c.color }}>
              <img src={c.src} alt="" className="h-4 w-4 brightness-0 invert" />
            </span>
            <span className="text-sm font-medium text-white">{c.label}</span>
          </a>
        ))}
      </div>

      {/* ══════════════════ AUTH MODAL ══════════════════ */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authInitialMode} />
    </div>
  );
}