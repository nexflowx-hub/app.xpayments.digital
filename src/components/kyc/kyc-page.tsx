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
  Eye,
} from 'lucide-react';
import { mockKycProfile, mockTierLimits } from '@/lib/mock-data';
import { TierLevel } from '@/types/xpayments';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Tier config helpers
// ---------------------------------------------------------------------------

const TIER_ORDER: TierLevel[] = [
  TierLevel.TIER_0_UNVERIFIED,
  TierLevel.TIER_1_BASIC,
  TierLevel.TIER_2_VERIFIED,
  TierLevel.TIER_3_CORPORATE,
];

const TIER_BADGE_COLORS: Record<TierLevel, string> = {
  [TierLevel.TIER_0_UNVERIFIED]: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  [TierLevel.TIER_1_BASIC]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [TierLevel.TIER_2_VERIFIED]: 'bg-neon-500/20 text-neon-400 border-neon-500/30',
  [TierLevel.TIER_3_CORPORATE]: 'bg-neon-500/20 text-neon-400 border-neon-500/30',
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KycPage() {
  const profile = mockKycProfile;
  const currentTierIndex = getTierIndex(profile.tier);
  const progressPct = ((currentTierIndex + 1) / TIER_ORDER.length) * 100;

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

  const currentTierLabel = mockTierLimits.find((t) => t.tier === profile.tier)?.label ?? 'Unknown';

  return (
    <div className="space-y-6">
      {/* ── Current Tier Header ── */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-neon-600 via-neon-500 to-neon-400" />
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neon-500/15 border border-neon-500/25">
                <ShieldCheck className="h-7 w-7 text-neon-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Nível de Verificação Atual</p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-bold text-zinc-100">{currentTierLabel}</h2>
                  <Badge variant="outline" className={cn('text-xs', TIER_BADGE_COLORS[profile.tier])}>
                    Tier {currentTierIndex}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 mb-1">Progresso de Verificação</p>
              <p className="text-2xl font-bold text-neon-400">{Math.round(progressPct)}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={progressPct} className="h-2.5 bg-zinc-800 [&>div]:bg-gradient-to-r [&>div]:from-neon-600 [&>div]:to-neon-400" />
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
              {TIER_ORDER.map((t, i) => (
                <span
                  key={t}
                  className={cn(
                    i <= currentTierIndex ? 'text-neon-400' : 'text-zinc-600',
                  )}
                >
                  Tier {i}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tier Cards ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {TIER_ORDER.map((tier) => {
          const tierInfo = mockTierLimits.find((t) => t.tier === tier);
          if (!tierInfo) return null;
          const status = getTierStatus(tier, profile.tier);
          const tierIndex = getTierIndex(tier);
          const upgradeable = canUpgrade(tier);

          return (
            <Card
              key={tier}
              className={cn(
                'bg-zinc-900/50 border-zinc-800 transition-all duration-200',
                status === 'current' && 'border-neon-500/30 ring-1 ring-neon-500/10',
                status === 'locked' && 'opacity-60',
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        status === 'completed' && 'bg-neon-500/15 border border-neon-500/25',
                        status === 'current' && 'bg-neon-500/15 border border-neon-500/25',
                        status === 'locked' && 'bg-zinc-800 border border-zinc-700',
                      )}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-neon-400" />
                      ) : status === 'current' ? (
                        <Shield className="h-5 w-5 text-neon-400" />
                      ) : (
                        <Lock className="h-5 w-5 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-zinc-100">
                        {tierInfo.label}
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-400 mt-0.5">
                        {tierInfo.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] shrink-0',
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
                {/* Data points */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-2">
                    Dados Necessários
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tierIndex === 0 && (
                      <>
                        <MiniTag label="Email" />
                        <MiniTag label="Senha" />
                      </>
                    )}
                    {tierIndex === 1 && (
                      <>
                        <MiniTag label="Nome Completo" />
                        <MiniTag label="XPayments ID" />
                        <MiniTag label="Região" />
                        <MiniTag label="Contacto" />
                      </>
                    )}
                    {tierIndex === 2 && (
                      <>
                        <MiniTag label="NIF/CPF/TIN" />
                        <MiniTag label="Data de Nascimento" />
                        <MiniTag label="Morada Completa" />
                        <MiniTag label="Código Postal" />
                      </>
                    )}
                    {tierIndex === 3 && (
                      <>
                        <MiniTag label="Verificação Externa" />
                        <MiniTag label="Documento de Identidade" />
                        <MiniTag label="Proof of Address" />
                      </>
                    )}
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Features unlocked */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-2">
                    Funcionalidades
                  </p>
                  <ul className="space-y-1">
                    {tierInfo.features.map((feat) => (
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
                      <LimitPill label="Por Transação" value={`€${tierInfo.maxTransactionLimit.toLocaleString()}`} />
                      <LimitPill label="Diário" value={`€${tierInfo.dailyLimit.toLocaleString()}`} />
                      <LimitPill label="Mensal" value={`€${tierInfo.monthlyLimit.toLocaleString()}`} />
                    </div>
                  </>
                )}

                {/* Currencies */}
                <div className="flex flex-wrap gap-1">
                  {tierInfo.currencies.map((c) => (
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
                    Avançar para {mockTierLimits.find((t) => t.tier === TIER_ORDER[tierIndex + 1])?.label}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Tier 0 → 1 Upgrade Dialog ── */}
      <Dialog open={upgradeTarget === TierLevel.TIER_0_UNVERIFIED} onOpenChange={() => setUpgradeTarget(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Registo — KYC-0 para KYC-1</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Preencha os dados abaixo para avançar para o nível básico de verificação.
            </DialogDescription>
          </DialogHeader>
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

          {/* Info Banner */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Os dados não são armazenados localmente, são transmitidos ao{' '}
              <span className="font-semibold text-amber-300">Ghost Middleware</span> para os provedores de liquidez.
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

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 rounded-lg border border-neon-500/20 bg-neon-500/5 p-4">
              <Shield className="h-5 w-5 text-neon-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-200">Verificação Segura</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Será redirecionado para o provedor <span className="font-semibold text-neon-400">Onramp.Money</span> onde
                  deverá submeter documentação de identidade e proof of address. Após a verificação, a sua conta será
                  automaticamente atualizada para o nível corporativo.
                </p>
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
                  https://verify.onramp.money/xpayments/{mockKycProfile.data.tier3?.provider?.toLowerCase() ?? 'xyz'}
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
