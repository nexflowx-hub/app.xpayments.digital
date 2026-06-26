'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  ShieldCheck,
  Shield,
  ShieldAlert,
  Lock,
  CheckCircle2,
  ChevronRight,
  User,
  MapPin,
  Globe,
  ExternalLink,
  Loader2,
  Info,
  TrendingDown,
  ArrowRight,
  CircleDollarSign,
  Clock,
  Zap,
  Building2,
  FileText,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  Banknote,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { TierLevel } from '@/types/xpayments';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Tier config helpers
// ═══════════════════════════════════════════════════════════════════════════

const TIER_ORDER: TierLevel[] = [
  TierLevel.TIER_0_UNVERIFIED,
  TierLevel.TIER_1_BASIC,
  TierLevel.TIER_2_VERIFIED,
  TierLevel.TIER_3_CORPORATE,
];

const TIER_META: Record<TierLevel, {
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  requiredDocs: string[];
  features: string[];
  maxTx: number;
  dailyLimit: number;
  monthlyLimit: number;
  currencies: string[];
}> = {
  [TierLevel.TIER_0_UNVERIFIED]: {
    label: 'Não Verificado',
    shortLabel: 'Tier 0',
    description: 'Acesso inicial com limites restritos',
    badgeClass: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    iconBg: 'bg-zinc-800',
    iconBorder: 'border-zinc-700',
    iconColor: 'text-zinc-400',
    requiredDocs: ['Email', 'Senha'],
    features: ['Recebimentos PIX', 'Recebimentos SEPA', 'Saldo em EUR/USDT/BRL'],
    maxTx: 250,
    dailyLimit: 1_000,
    monthlyLimit: 5_000,
    currencies: ['EUR', 'BRL', 'USDT'],
  },
  [TierLevel.TIER_1_BASIC]: {
    label: 'Básico',
    shortLabel: 'Tier 1',
    description: 'Verificação básica com limites expandidos',
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    iconBg: 'bg-yellow-500/10',
    iconBorder: 'border-yellow-500/25',
    iconColor: 'text-yellow-400',
    requiredDocs: ['Nome Completo', 'XPayments ID', 'Região', 'Contacto'],
    features: ['Recebimentos PIX', 'Recebimentos SEPA', 'Recebimentos USDT', 'Payouts (manual)', 'Swaps básicos', 'Payment Links'],
    maxTx: 2_500,
    dailyLimit: 10_000,
    monthlyLimit: 50_000,
    currencies: ['EUR', 'BRL', 'USDT'],
  },
  [TierLevel.TIER_2_VERIFIED]: {
    label: 'Verificado',
    shortLabel: 'Tier 2',
    description: 'Conta verificada com limites elevados',
    badgeClass: 'bg-neon-500/20 text-neon-400 border-neon-500/30',
    iconBg: 'bg-neon-500/10',
    iconBorder: 'border-neon-500/25',
    iconColor: 'text-neon-400',
    requiredDocs: ['NIF/CPF/TIN', 'Data de Nascimento', 'Morada Completa', 'Código Postal'],
    features: ['Todos os métodos de pagamento', 'Payouts automáticos', 'Swaps ilimitados', 'API Keys', 'Checkouts personalizados', 'Sub-clientes'],
    maxTx: 25_000,
    dailyLimit: 100_000,
    monthlyLimit: 500_000,
    currencies: ['EUR', 'BRL', 'USDT', 'USD'],
  },
  [TierLevel.TIER_3_CORPORATE]: {
    label: 'Corporativo',
    shortLabel: 'Tier 3',
    description: 'Conta corporativa com limites premium',
    badgeClass: 'bg-neon-400/20 text-neon-300 border-neon-400/30',
    iconBg: 'bg-neon-400/10',
    iconBorder: 'border-neon-400/30',
    iconColor: 'text-neon-300',
    requiredDocs: ['Verificação Externa', 'Documento de Identidade', 'Proof of Address'],
    features: ['Tudo do Tier 2', 'Taxas negociáveis', 'Settlement T+0', 'Suporte prioritário 24/7', 'Multi-moeda avançado', 'Webhooks avançados'],
    maxTx: 250_000,
    dailyLimit: 1_000_000,
    monthlyLimit: 10_000_000,
    currencies: ['EUR', 'BRL', 'USDT', 'USD'],
  },
};

function getTierIndex(tier: TierLevel): number {
  return TIER_ORDER.indexOf(tier);
}

type TierStepStatus = 'completed' | 'current' | 'locked';

function getTierStatus(tierLevel: TierLevel, currentTier: TierLevel): TierStepStatus {
  const ci = getTierIndex(currentTier);
  const ti = getTierIndex(tierLevel);
  if (ti < ci) return 'completed';
  if (ti === ci) return 'current';
  return 'locked';
}

// ═══════════════════════════════════════════════════════════════════════════
// Fee Schedule (Static)
// ═══════════════════════════════════════════════════════════════════════════

interface FeeRow {
  id: string;
  label: string;
  icon: React.ReactNode;
  tiers: {
    percentage: string;
    fixed: string;
  }[];
}

const FEE_ROWS: FeeRow[] = [
  {
    id: 'pix',
    label: 'Recebimentos PIX',
    icon: <CreditCard className="h-4 w-4 text-emerald-400" />,
    tiers: [
      { percentage: '3.50%', fixed: '€0.50' },
      { percentage: '2.80%', fixed: '€0.30' },
      { percentage: '2.00%', fixed: '€0.20' },
      { percentage: '1.20%', fixed: '€0.10' },
    ],
  },
  {
    id: 'sepa',
    label: 'Recebimentos SEPA',
    icon: <Banknote className="h-4 w-4 text-emerald-400" />,
    tiers: [
      { percentage: '2.80%', fixed: '€1.00' },
      { percentage: '2.20%', fixed: '€0.70' },
      { percentage: '1.50%', fixed: '€0.50' },
      { percentage: '0.90%', fixed: '€0.30' },
    ],
  },
  {
    id: 'usdt',
    label: 'Recebimentos USDT',
    icon: <Wallet className="h-4 w-4 text-emerald-400" />,
    tiers: [
      { percentage: '1.50%', fixed: '€0.25' },
      { percentage: '1.20%', fixed: '€0.15' },
      { percentage: '0.80%', fixed: '€0.10' },
      { percentage: '0.50%', fixed: '€0.05' },
    ],
  },
  {
    id: 'payouts',
    label: 'Payouts',
    icon: <ArrowRight className="h-4 w-4 text-amber-400" />,
    tiers: [
      { percentage: '—', fixed: '€3.00' },
      { percentage: '—', fixed: '€2.00' },
      { percentage: '—', fixed: '€1.20' },
      { percentage: '—', fixed: '€0.60' },
    ],
  },
  {
    id: 'swaps',
    label: 'Swaps (Spread)',
    icon: <ArrowLeftRight className="h-4 w-4 text-amber-400" />,
    tiers: [
      { percentage: '1.50%', fixed: '—' },
      { percentage: '1.00%', fixed: '—' },
      { percentage: '0.60%', fixed: '—' },
      { percentage: '0.30%', fixed: '—' },
    ],
  },
  {
    id: 'settlement',
    label: 'Settlement',
    icon: <Clock className="h-4 w-4 text-zinc-400" />,
    tiers: [
      { percentage: 'T+3', fixed: '—' },
      { percentage: 'T+2', fixed: '—' },
      { percentage: 'T+1', fixed: '—' },
      { percentage: 'T+0', fixed: '—' },
    ],
  },
];

interface SettlementRow {
  tier: TierLevel;
  timeline: string;
  description: string;
}

const SETTLEMENT_INFO: SettlementRow[] = [
  { tier: TierLevel.TIER_0_UNVERIFIED, timeline: 'T+3', description: 'Liquidação em 3 dias úteis' },
  { tier: TierLevel.TIER_1_BASIC, timeline: 'T+2', description: 'Liquidação em 2 dias úteis' },
  { tier: TierLevel.TIER_2_VERIFIED, timeline: 'T+1', description: 'Liquidação no dia seguinte' },
  { tier: TierLevel.TIER_3_CORPORATE, timeline: 'T+0', description: 'Liquidação imediata (mesmo dia)' },
];

// Color coding for fees
function getFeeColorClass(tierIndex: number, isSettlement?: boolean): string {
  if (isSettlement) {
    switch (tierIndex) {
      case 0: return 'text-red-400/80';
      case 1: return 'text-amber-400';
      case 2: return 'text-emerald-400';
      case 3: return 'text-neon-400';
    }
  }
  switch (tierIndex) {
    case 0: return 'text-red-400/80';
    case 1: return 'text-amber-400';
    case 2: return 'text-emerald-400';
    case 3: return 'text-neon-400 font-semibold';
    default: return 'text-zinc-400';
  }
}

function getFeeBgClass(tierIndex: number): string {
  switch (tierIndex) {
    case 0: return 'bg-red-500/5';
    case 1: return 'bg-amber-500/5';
    case 2: return 'bg-emerald-500/5';
    case 3: return 'bg-neon-500/5';
    default: return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function KycPage() {
  const profile = null as any;
  const tierLimits = [] as any[];
  const defaultTier = TierLevel.TIER_0_UNVERIFIED;
  const currentTier = profile?.tier ?? defaultTier;
  const currentTierIndex = getTierIndex(currentTier);
  const progressPct = ((currentTierIndex + 1) / TIER_ORDER.length) * 100;

  const [activeTab, setActiveTab] = useState('kyc');
  const [upgradeTarget, setUpgradeTarget] = useState<TierLevel | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Tier 0 → 1 form state ---
  const [t1Form, setT1Form] = useState({
    fullName: '',
    nickname: '',
    region: '',
    contactMethod: '',
    contactValue: '',
  });

  // --- Tier 1 → 2 form state ---
  const [t2Form, setT2Form] = useState({
    taxId: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });

  const handleTier1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setUpgradeTarget(null);
    }, 1500);
  };

  const handleTier2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setUpgradeTarget(null);
    }, 1500);
  };

  const handleTier3Verify = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setVerificationModalOpen(false);
      setUpgradeTarget(null);
    }, 2000);
  };

  const canUpgrade = (tier: TierLevel): boolean => {
    const idx = getTierIndex(tier);
    return idx === currentTierIndex && idx < TIER_ORDER.length - 1;
  };

  // Dynamic tier label: prefer API data, fall back to static meta
  const currentTierLabel = tierLimits.find((t: any) => t.tier === currentTier)?.label ?? TIER_META[currentTier].label;
  const currentTierMeta = TIER_META[currentTier];

  return (
    <div className="space-y-6">
      {/* ── Page Header with Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Verificação & Taxas</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Gerencie o nível de verificação da sua conta e consulte as taxas aplicáveis.
            </p>
          </div>
          <TabsList className="bg-zinc-800/60 border border-zinc-700/50 h-10 p-1">
            <TabsTrigger
              value="kyc"
              className="data-[state=active]:bg-zinc-700/80 data-[state=active]:text-zinc-100 gap-2 text-zinc-400 px-4"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Verificação KYC</span>
              <span className="sm:hidden">KYC</span>
            </TabsTrigger>
            <TabsTrigger
              value="fees"
              className="data-[state=active]:bg-zinc-700/80 data-[state=active]:text-zinc-100 gap-2 text-zinc-400 px-4"
            >
              <CircleDollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Taxas & Comissões</span>
              <span className="sm:hidden">Taxas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: KYC Verification                                          */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <TabsContent value="kyc" className="space-y-6 mt-6">
          {/* ── Current Tier Banner ── */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-neon-600 via-neon-500 to-neon-400" />
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl border',
                    currentTierMeta.iconBg,
                    currentTierMeta.iconBorder,
                  )}>
                    {currentTierIndex === 0 ? (
                      <Shield className={cn('h-7 w-7', currentTierMeta.iconColor)} />
                    ) : (
                      <ShieldCheck className={cn('h-7 w-7', currentTierMeta.iconColor)} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Nível de Verificação Atual</p>
                    <div className="flex items-center gap-2.5 mt-1">
                      <h2 className="text-xl font-bold text-zinc-100">{currentTierLabel}</h2>
                      <Badge
                        variant="outline"
                        className={cn('text-xs font-medium', currentTierMeta.badgeClass)}
                      >
                        {currentTierMeta.shortLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 mt-0.5">{currentTierMeta.description}</p>
                  </div>
                </div>
                <div className="lg:text-right flex-shrink-0">
                  <p className="text-xs text-zinc-500 mb-1.5">Progresso de Verificação</p>
                  <p className="text-3xl font-bold text-neon-400 tabular-nums">{Math.round(progressPct)}%</p>
                  <p className="text-xs text-zinc-500 mt-1">{currentTierIndex + 1} de {TIER_ORDER.length} níveis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Stripe-Style Stepper ── */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <CardContent className="p-6">
              <div className="relative">
                {/* Connection line */}
                <div className="absolute top-5 left-0 right-0 h-px bg-zinc-800 hidden md:block" />
                <div
                  className="absolute top-5 left-0 h-px bg-gradient-to-r from-neon-500 to-neon-400 hidden md:block transition-all duration-500"
                  style={{ width: `${(currentTierIndex / (TIER_ORDER.length - 1)) * 100}%` }}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 relative">
                  {TIER_ORDER.map((tier, i) => {
                    const meta = TIER_META[tier];
                    const status = getTierStatus(tier, currentTier);
                    const isCurrent = status === 'current';
                    const isCompleted = status === 'completed';
                    const isLocked = status === 'locked';
                    const upgradeable = canUpgrade(tier);

                    return (
                      <div
                        key={tier}
                        className={cn(
                          'flex flex-col items-center text-center relative',
                          isLocked && 'opacity-50',
                        )}
                      >
                        {/* Step circle */}
                        <div
                          className={cn(
                            'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                            isCompleted && 'bg-neon-500/20 border-neon-500 text-neon-400',
                            isCurrent && 'bg-neon-500/20 border-neon-400 text-neon-400 ring-4 ring-neon-500/10',
                            isLocked && 'bg-zinc-800 border-zinc-700 text-zinc-500',
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : isLocked ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Shield className="h-5 w-5" />
                          )}
                        </div>
                        {/* Labels */}
                        <p className={cn(
                          'mt-2.5 text-sm font-semibold',
                          isCompleted || isCurrent ? 'text-zinc-100' : 'text-zinc-500',
                        )}>
                          {meta.shortLabel}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5 max-w-[120px]">
                          {meta.label}
                        </p>
                        {/* Upgrade CTA on current */}
                        {upgradeable && (
                          <button
                            onClick={() => setUpgradeTarget(tier)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-neon-400 hover:text-neon-300 transition-colors"
                          >
                            Avançar
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                        {isCompleted && (
                          <Badge variant="outline" className="mt-2 text-[10px] bg-neon-500/10 text-neon-400 border-neon-500/20">
                            Concluído
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Tier Cards ── */}
          <div className="grid gap-4 md:grid-cols-2">
            {TIER_ORDER.map((tier) => {
              const meta = TIER_META[tier];
              // Prefer API data if available, otherwise use static meta
              const tierInfo = tierLimits.find((t: any) => t.tier === tier);
              const status = getTierStatus(tier, currentTier);
              const tierIndex = getTierIndex(tier);
              const upgradeable = canUpgrade(tier);

              return (
                <Card
                  key={tier}
                  className={cn(
                    'bg-zinc-900/50 border-zinc-800 transition-all duration-200 group',
                    status === 'current' && 'border-neon-500/30 ring-1 ring-neon-500/10',
                    status === 'locked' && 'opacity-60',
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                            meta.iconBg,
                            meta.iconBorder,
                          )}
                        >
                          {status === 'completed' ? (
                            <CheckCircle2 className={cn('h-5 w-5', meta.iconColor)} />
                          ) : status === 'current' ? (
                            <Shield className={cn('h-5 w-5', meta.iconColor)} />
                          ) : (
                            <Lock className="h-5 w-5 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-zinc-100">
                            {tierInfo?.label ?? meta.label}
                          </CardTitle>
                          <CardDescription className="text-xs text-zinc-400 mt-0.5">
                            {tierInfo?.description ?? meta.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] shrink-0 font-medium',
                          status === 'completed' && 'bg-neon-500/15 text-neon-400 border-neon-500/25',
                          status === 'current' && 'bg-neon-500/15 text-neon-400 border-neon-500/25',
                          status === 'locked' && 'bg-zinc-800 text-zinc-500 border-zinc-700',
                        )}
                      >
                        {status === 'completed'
                          ? 'Concluído'
                          : status === 'current'
                            ? 'Atual'
                            : 'Bloqueado'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    {/* Required Documents */}
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-2">
                        Dados Necessários
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {meta.requiredDocs.map((doc) => (
                          <MiniTag key={doc} label={doc} />
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    {/* Features Unlocked */}
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-2">
                        Funcionalidades
                      </p>
                      <ul className="space-y-1.5">
                        {meta.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2 text-xs text-zinc-300">
                            <ChevronRight className="h-3 w-3 text-neon-500 shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limits */}
                    {tierIndex > 0 && (
                      <>
                        <Separator className="bg-zinc-800" />
                        <div className="grid grid-cols-3 gap-3">
                          <LimitPill label="Por Transação" value={`€${(tierInfo?.maxTransactionLimit ?? meta.maxTx).toLocaleString()}`} />
                          <LimitPill label="Diário" value={`€${(tierInfo?.dailyLimit ?? meta.dailyLimit).toLocaleString()}`} />
                          <LimitPill label="Mensal" value={`€${(tierInfo?.monthlyLimit ?? meta.monthlyLimit).toLocaleString()}`} />
                        </div>
                      </>
                    )}

                    {/* Currencies */}
                    <div className="flex flex-wrap gap-1">
                      {(tierInfo?.currencies ?? meta.currencies).map((c: string) => (
                        <Badge key={c} variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300 border-zinc-700 px-2 py-0 h-5">
                          {c}
                        </Badge>
                      ))}
                    </div>

                    {/* Upgrade button */}
                    {upgradeable && (
                      <Button
                        onClick={() => setUpgradeTarget(tier)}
                        className="w-full mt-2 gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white text-sm font-semibold shadow-lg shadow-neon-900/20"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Avançar para {TIER_META[TIER_ORDER[tierIndex + 1]].label}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: Fees & Commissions                                       */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <TabsContent value="fees" className="space-y-6 mt-6">
          {/* ── Your Current Tier Banner ── */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-neon-600 via-neon-500 to-neon-400" />
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl border',
                    currentTierMeta.iconBg,
                    currentTierMeta.iconBorder,
                  )}>
                    <CircleDollarSign className={cn('h-6 w-6', currentTierMeta.iconColor)} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">As Suas Taxas Atuais</p>
                    <div className="flex items-center gap-2.5 mt-1">
                      <h2 className="text-lg font-bold text-zinc-100">{currentTierMeta.label}</h2>
                      <Badge variant="outline" className={cn('text-xs font-medium', currentTierMeta.badgeClass)}>
                        {currentTierMeta.shortLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      As taxas abaixo marcadas com destaque aplicam-se à sua conta.
                    </p>
                  </div>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-400/60" />
                      <span>Elevado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                      <span>Médio</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                      <span>Bom</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-neon-400" />
                      <span>Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Fee Schedule Table ── */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-neon-400" />
                    Tabela de Taxas por Nível
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 mt-1">
                    Taxas percentuais e fixas aplicáveis por método de pagamento e nível de verificação.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium pl-6 pr-4 w-[200px]">
                        Método
                      </TableHead>
                      <TableHead className="text-center text-[11px] uppercase tracking-wider font-medium px-3 py-3 w-[40px]" />
                      {TIER_ORDER.map((tier, i) => (
                        <TableHead
                          key={tier}
                          className={cn(
                            'text-center text-[11px] uppercase tracking-wider font-medium px-3 py-3',
                            i === currentTierIndex ? 'text-neon-400' : 'text-zinc-500',
                          )}
                          colSpan={2}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{TIER_META[tier].shortLabel}</span>
                            <span className="text-[9px] normal-case tracking-normal font-normal text-zinc-600">
                              {TIER_META[tier].label}
                            </span>
                            {i === currentTierIndex && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-neon-500/15 text-neon-400 border border-neon-500/25">
                                Atual
                              </span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                    {/* Sub-header: % and Fixed */}
                    <TableRow className="border-zinc-800/50 hover:bg-transparent">
                      <TableHead className="pl-6 pr-4" />
                      <TableHead className="text-center px-3 py-2 text-[10px] text-zinc-600 font-medium">Tipo</TableHead>
                      {TIER_ORDER.map((tier, i) => (
                        <React.Fragment key={tier}>
                          <TableHead className={cn(
                            'text-center px-3 py-2 text-[10px] font-medium border-l border-zinc-800/50',
                            i === currentTierIndex ? 'text-neon-400/60' : 'text-zinc-600',
                          )}>
                            % Taxa
                          </TableHead>
                          <TableHead className={cn(
                            'text-center px-3 py-2 text-[10px] font-medium',
                            i === currentTierIndex ? 'text-neon-400/60' : 'text-zinc-600',
                          )}>
                            Fixo
                          </TableHead>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FEE_ROWS.map((row, rowIdx) => {
                      const isSettlement = row.id === 'settlement';
                      return (
                        <React.Fragment key={row.id}>
                          <TableRow
                            className={cn(
                              'border-zinc-800/50 transition-colors',
                              currentTierIndex === 0 && 'bg-red-500/[0.02]',
                              currentTierIndex === 1 && 'bg-amber-500/[0.02]',
                              currentTierIndex === 2 && 'bg-emerald-500/[0.02]',
                              currentTierIndex === 3 && 'bg-neon-500/[0.02]',
                            )}
                          >
                            <TableCell className="pl-6 pr-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {row.icon}
                                <span className="text-sm font-medium text-zinc-200">{row.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center px-3 py-3">
                              {isSettlement ? (
                                <Clock className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                              ) : (
                                <CircleDollarSign className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                              )}
                            </TableCell>
                            {row.tiers.map((fee, i) => (
                              <React.Fragment key={`${row.id}-${i}`}>
                                <TableCell
                                  className={cn(
                                    'text-center px-3 py-3 text-sm tabular-nums border-l border-zinc-800/50',
                                    i === currentTierIndex && 'bg-neon-500/[0.06]',
                                    getFeeColorClass(i, isSettlement),
                                  )}
                                >
                                  {fee.percentage}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    'text-center px-3 py-3 text-sm tabular-nums',
                                    i === currentTierIndex && 'bg-neon-500/[0.06]',
                                    getFeeColorClass(i, isSettlement),
                                  )}
                                >
                                  {fee.fixed}
                                </TableCell>
                              </React.Fragment>
                            ))}
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* ── Settlement Timeline ── */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-neon-400" />
                Prazos de Liquidação (Settlement)
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-1">
                O prazo de liquidação depende do seu nível de verificação. Níveis superiores beneficiam de liquidação mais rápida.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SETTLEMENT_INFO.map((item, i) => {
                  const meta = TIER_META[item.tier];
                  const isCurrent = i === currentTierIndex;
                  const isCompleted = i < currentTierIndex;
                  const isLocked = i > currentTierIndex;

                  return (
                    <div
                      key={item.tier}
                      className={cn(
                        'rounded-xl border p-4 transition-all',
                        isCurrent
                          ? 'border-neon-500/30 bg-neon-500/[0.04] ring-1 ring-neon-500/10'
                          : isCompleted
                            ? 'border-zinc-800 bg-zinc-800/20'
                            : isLocked
                              ? 'border-zinc-800 bg-zinc-900/30 opacity-50'
                              : 'border-zinc-800 bg-zinc-900/30',
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] font-medium', meta.badgeClass)}
                        >
                          {meta.shortLabel}
                        </Badge>
                        {isCurrent && (
                          <span className="text-[10px] text-neon-400 font-medium">Atual</span>
                        )}
                      </div>
                      <p className={cn(
                        'text-2xl font-bold tabular-nums',
                        getFeeColorClass(i, true),
                      )}>
                        {item.timeline}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                      {isCompleted && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400/70">
                          <CheckCircle2 className="h-3 w-3" />
                          Desbloqueado
                        </div>
                      )}
                      {isLocked && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-500">
                          <Lock className="h-3 w-3" />
                          Requer verificação
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Savings Potential ── */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 rounded-xl border border-neon-500/20 bg-neon-500/[0.03] p-5">
                <Sparkles className="h-5 w-5 text-neon-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-100">
                    Poupe nas taxas — avance o seu nível de verificação
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ao avançar para níveis superiores, beneficia de taxas significativamente mais reduzidas
                    e prazos de liquidação mais rápidos. Por exemplo, ao passar de {TIER_META[TierLevel.TIER_0_UNVERIFIED].shortLabel} para{' '}
                    {TIER_META[TierLevel.TIER_2_VERIFIED].shortLabel}, a taxa PIX desce de{' '}
                    <span className="text-red-400 font-semibold">3.50% + €0.50</span> para{' '}
                    <span className="text-emerald-400 font-semibold">2.00% + €0.20</span> — uma redução de{' '}
                    <span className="text-neon-400 font-semibold">~60%</span> nos custos por transação.
                  </p>
                  {canUpgrade(currentTier) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('kyc')}
                      className="mt-2 gap-2 border-neon-500/30 text-neon-400 hover:bg-neon-500/10 hover:text-neon-300"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Iniciar Verificação
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Fee Notes ── */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Info className="h-4 w-4 text-zinc-500" />
                Notas sobre Taxas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {[
                  'As taxas são aplicadas por transação e cobradas automaticamente no momento do recebimento.',
                  'Taxas fixas são adicionadas à taxa percentual (ex: 2.00% + €0.20 por transação PIX no Tier 2).',
                  'Contas corporativas (Tier 3) podem negociar taxas personalizadas mediante volume.',
                  'O prazo de liquidação T+0 está sujeito a aprovação e disponibilidade de fundos.',
                  'Taxas de swap representam o spread aplicado sobre a taxa de câmbio de mercado.',
                ].map((note) => (
                  <li key={note} className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-600 shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* DIALOGS                                                        */}
      {/* ════════════════════════════════════════════════════════════════ */}

      {/* ── Tier 0 → 1 Upgrade Dialog ── */}
      <Dialog open={upgradeTarget === TierLevel.TIER_0_UNVERIFIED} onOpenChange={() => setUpgradeTarget(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Registo — KYC-0 para KYC-1</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Preencha os dados abaixo para avançar para o nível básico de verificação.
            </DialogDescription>
          </DialogHeader>

          {/* Tier comparison */}
          <div className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-zinc-700/50 text-zinc-400 border-zinc-600">
                {TIER_META[TierLevel.TIER_0_UNVERIFIED].shortLabel}
              </Badge>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
              <Badge variant="outline" className="text-[10px] bg-yellow-500/15 text-yellow-400 border-yellow-500/25">
                {TIER_META[TierLevel.TIER_1_BASIC].shortLabel}
              </Badge>
            </div>
            <span className="text-[11px] text-zinc-500 ml-auto">Taxas: 3.5% → 2.8% PIX</span>
          </div>

          <form onSubmit={handleTier1Submit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="t1-fullname" className="text-zinc-300">Nome Completo</Label>
              <Input
                id="t1-fullname"
                placeholder="João da Silva"
                value={t1Form.fullName}
                onChange={(e) => setT1Form({ ...t1Form, fullName: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t1-nickname" className="text-zinc-300">XPayments ID (Nickname)</Label>
              <Input
                id="t1-nickname"
                placeholder="joaosilva"
                value={t1Form.nickname}
                onChange={(e) => setT1Form({ ...t1Form, nickname: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t1-region" className="text-zinc-300">Região</Label>
              <Select value={t1Form.region} onValueChange={(v) => setT1Form({ ...t1Form, region: v })}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-neon-500/20">
                  <SelectValue placeholder="Selecionar região" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="EU" className="text-zinc-200 focus:bg-zinc-800">Europa</SelectItem>
                  <SelectItem value="BR" className="text-zinc-200 focus:bg-zinc-800">Brasil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="t1-contact-method" className="text-zinc-300">Método de Contacto</Label>
                <Select value={t1Form.contactMethod} onValueChange={(v) => setT1Form({ ...t1Form, contactMethod: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-neon-500/20">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="email" className="text-zinc-200 focus:bg-zinc-800">Email</SelectItem>
                    <SelectItem value="whatsapp" className="text-zinc-200 focus:bg-zinc-800">WhatsApp</SelectItem>
                    <SelectItem value="telegram" className="text-zinc-200 focus:bg-zinc-800">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t1-contact-value" className="text-zinc-300">Valor do Contacto</Label>
                <Input
                  id="t1-contact-value"
                  placeholder="email@exemplo.com"
                  value={t1Form.contactValue}
                  onChange={(e) => setT1Form({ ...t1Form, contactValue: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white font-semibold shadow-lg shadow-neon-900/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A enviar...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Submeter Registo
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Tier 1 → 2 Upgrade Dialog ── */}
      <Dialog open={upgradeTarget === TierLevel.TIER_1_BASIC} onOpenChange={() => setUpgradeTarget(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Verificação Declarativa — KYC-1 para KYC-2</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Forneça os dados fiscais e de morada para aumentar os seus limites.
            </DialogDescription>
          </DialogHeader>

          {/* Tier comparison */}
          <div className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-yellow-500/15 text-yellow-400 border-yellow-500/25">
                {TIER_META[TierLevel.TIER_1_BASIC].shortLabel}
              </Badge>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
              <Badge variant="outline" className="text-[10px] bg-neon-500/15 text-neon-400 border-neon-500/25">
                {TIER_META[TierLevel.TIER_2_VERIFIED].shortLabel}
              </Badge>
            </div>
            <span className="text-[11px] text-zinc-500 ml-auto">Taxas: 2.8% → 2.0% PIX</span>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Os dados não são armazenados localmente, são transmitidos ao{' '}
              <span className="font-semibold text-amber-300">provedor autorizado</span> para processamento seguro.
            </p>
          </div>

          <form onSubmit={handleTier2Submit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="t2-taxid" className="text-zinc-300">NIF / CPF / TIN</Label>
              <Input
                id="t2-taxid"
                placeholder="123456789"
                value={t2Form.taxId}
                onChange={(e) => setT2Form({ ...t2Form, taxId: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t2-dob" className="text-zinc-300">Data de Nascimento</Label>
              <Input
                id="t2-dob"
                type="date"
                value={t2Form.dateOfBirth}
                onChange={(e) => setT2Form({ ...t2Form, dateOfBirth: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t2-address" className="text-zinc-300">Morada</Label>
              <Input
                id="t2-address"
                placeholder="Rua Principal, 123"
                value={t2Form.address}
                onChange={(e) => setT2Form({ ...t2Form, address: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="t2-city" className="text-zinc-300">Cidade</Label>
                <Input
                  id="t2-city"
                  placeholder="Lisboa"
                  value={t2Form.city}
                  onChange={(e) => setT2Form({ ...t2Form, city: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t2-country" className="text-zinc-300">País</Label>
                <Input
                  id="t2-country"
                  placeholder="Portugal"
                  value={t2Form.country}
                  onChange={(e) => setT2Form({ ...t2Form, country: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t2-postal" className="text-zinc-300">Código Postal</Label>
                <Input
                  id="t2-postal"
                  placeholder="1000-001"
                  value={t2Form.postalCode}
                  onChange={(e) => setT2Form({ ...t2Form, postalCode: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white font-semibold shadow-lg shadow-neon-900/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A verificar...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Submeter Verificação
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Tier 2 → 3 Verification Dialog ── */}
      <Dialog open={upgradeTarget === TierLevel.TIER_2_VERIFIED} onOpenChange={() => setUpgradeTarget(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Verificação Externa — KYC-2 para KYC-3</DialogTitle>
            <DialogDescription className="text-zinc-400">
              A verificação de conta corporativa é realizada por um provedor externo autorizado.
            </DialogDescription>
          </DialogHeader>

          {/* Tier comparison */}
          <div className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-neon-500/15 text-neon-400 border-neon-500/25">
                {TIER_META[TierLevel.TIER_2_VERIFIED].shortLabel}
              </Badge>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
              <Badge variant="outline" className="text-[10px] bg-neon-400/15 text-neon-300 border-neon-400/25">
                {TIER_META[TierLevel.TIER_3_CORPORATE].shortLabel}
              </Badge>
            </div>
            <span className="text-[11px] text-zinc-500 ml-auto">Taxas: 2.0% → 1.2% PIX</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 rounded-lg border border-neon-500/20 bg-neon-500/5 p-4">
              <Shield className="h-5 w-5 text-neon-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-200">Verificação Segura</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Será redirecionado para o nosso <span className="font-semibold text-neon-400">parceiro de verificação certificado</span> onde
                  deverá submeter documentação de identidade e proof of address. Após a verificação, a sua conta será
                  automaticamente atualizada para o nível corporativo.
                </p>
              </div>
            </div>

            {/* Benefits preview */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4 space-y-3">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Benefícios Corporativos</p>
              <div className="grid grid-cols-2 gap-3">
                <BenefitItem label="Taxa PIX" from="2.00%" to="1.20%" />
                <BenefitItem label="Taxa SEPA" from="1.50%" to="0.90%" />
                <BenefitItem label="Taxa USDT" from="0.80%" to="0.50%" />
                <BenefitItem label="Settlement" from="T+1" to="T+0" />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Documentos Necessários</p>
              <ul className="space-y-1.5">
                {[
                  'Documento de identidade (Passaporte / BI / CC)',
                  'Comprovativo de morada (últimos 3 meses)',
                  'Documentos da empresa (se aplicável)',
                ].map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-3 w-3 text-zinc-500" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => setVerificationModalOpen(true)}
              disabled={submitting}
              className="w-full gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white font-semibold shadow-lg shadow-neon-900/20"
            >
              <ExternalLink className="h-4 w-4" />
              Iniciar Verificação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Verification Simulation Modal ── */}
      <Dialog open={verificationModalOpen} onOpenChange={setVerificationModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Redirecionamento Externo</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Será redirecionado para a página de verificação do provedor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 space-y-2">
              <p className="text-xs text-zinc-500">URL do Provedor</p>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-neon-400 shrink-0" />
                <code className="text-xs text-neon-300 font-mono truncate">
                  https://verify.xpayments.digital/kyc/{profile?.data?.tier3?.provider?.toLowerCase() ?? 'xyz'}
                </code>
              </div>
            </div>

            <p className="text-xs text-zinc-400 text-center leading-relaxed">
              Este é um ambiente de demonstração. Nenhum redirecionamento real será efectuado.
            </p>

            <Button
              onClick={handleTier3Verify}
              disabled={submitting}
              className="w-full gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white font-semibold shadow-lg shadow-neon-900/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Simulando Verificação...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Simular Verificação Concluída
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════

function MiniTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
      {label}
    </span>
  );
}

function LimitPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 px-3 py-2 text-center">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-zinc-200 mt-0.5">{value}</p>
    </div>
  );
}

function BenefitItem({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <div className="rounded-lg bg-zinc-900/50 border border-zinc-700/30 px-3 py-2">
      <p className="text-[10px] text-zinc-500 mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 line-through">{from}</span>
        <ArrowRight className="h-3 w-3 text-neon-500" />
        <span className="text-xs text-neon-400 font-semibold">{to}</span>
      </div>
    </div>
  );
}