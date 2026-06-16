'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { xpApi } from '@/lib/api/client';
import { Currency, type Wallet, type DepositProofRequest } from '@/types/xpayments';
import {
  QrCode,
  Landmark,
  Wallet as WalletIcon,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  CircleCheckBig,
  AlertCircle,
} from 'lucide-react';

// ── Types ──

type DepositMethod = 'pix' | 'sepa' | 'crypto';
type ProofType = DepositProofRequest['proofType'];
type Step = 1 | 2 | 3;

interface MethodOption {
  id: DepositMethod;
  label: string;
  description: string;
  currency: Currency;
  currencyLabel: string;
  icon: React.ReactNode;
  accentColor: string;
}

// ── Constants ──

const DEPOSIT_METHODS: MethodOption[] = [
  {
    id: 'pix',
    label: 'PIX Instantâneo',
    description: 'Transferência PIX em tempo real',
    currency: Currency.BRL,
    currencyLabel: 'BRL',
    icon: <QrCode className="size-6" />,
    accentColor: 'text-neon-400',
  },
  {
    id: 'sepa',
    label: 'SEPA Instant',
    description: 'Transferência bancária europeia',
    currency: Currency.EUR,
    currencyLabel: 'EUR',
    icon: <Landmark className="size-6" />,
    accentColor: 'text-sky-400',
  },
  {
    id: 'crypto',
    label: 'Crypto Wallet',
    description: 'USDT / USDC via rede Tron',
    currency: Currency.USDT,
    currencyLabel: 'USDT',
    icon: <WalletIcon className="size-6" />,
    accentColor: 'text-amber-400',
  },
];

const PIX_KEY = 'xp@xpayments.digital';
const SEPA_BENEFICIARY = 'XPayments Digital Ltd.';
const SEPA_IBAN = 'PT50 1234 5678 9012 3456 7890 12';
const SEPA_BIC = 'XPAYPTPL';
const CRYPTO_NETWORK = 'TRC-20 (Tron)';
const CRYPTO_ADDRESS = 'TJxR4f8mQbFNfPcisZrhfB8LpXvF3E8hZk';

const STEP_LABELS = ['Método', 'Detalhes', 'Confirmação'];

// ── Helpers ──

function generateSepaRef(): string {
  return `XP-DEP-${Date.now()}`;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ── Copy Button ──

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copiado para a área de transferência');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center size-8 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700/50"
      aria-label="Copiar"
    >
      {copied ? <Check className="size-3.5 text-neon-400" /> : <Copy className="size-3.5" />}
    </button>
  );
}

// ── Info Row ──

function InfoRow({ label, value, mono = false, copyable = false, children }: {
  label: string;
  value?: string;
  mono?: boolean;
  copyable?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-zinc-500 uppercase tracking-wider shrink-0">{label}</span>
      {children ?? (
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-sm font-medium text-zinc-200 truncate ${mono ? 'font-mono text-xs' : ''}`}>
            {value}
          </span>
          {copyable && value && <CopyButton value={value} />}
        </div>
      )}
    </div>
  );
}

// ── Component ──

export default function DepositsPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [proofType, setProofType] = useState<ProofType>('tx_hash');
  const [proofValue, setProofValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [depositRef, setDepositRef] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const selectedMethodData = DEPOSIT_METHODS.find((m) => m.id === selectedMethod);

  // Fetch wallets on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setWalletsLoading(true);
      try {
        const data = await xpApi.wallets.list();
        if (!cancelled && Array.isArray(data)) {
          setWallets(data);
        }
      } catch {
        // wallets will remain empty — proof submission will handle the error
      } finally {
        if (!cancelled) setWalletsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Generate SEPA ref when entering step 2 with SEPA
  const handleSelectMethod = useCallback((method: DepositMethod) => {
    setSelectedMethod(method);
    if (method === 'sepa') {
      setDepositRef(generateSepaRef());
    }
    setStep(2);
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    setStep(1);
    setSelectedMethod(null);
    setAmount('');
    setProofType('tx_hash');
    setProofValue('');
    setLoading(false);
    setDepositRef('');
  }, []);

  // Get wallet for selected currency
  const targetWallet = useMemo(() => {
    if (!selectedMethodData) return null;
    return wallets.find((w) => w.currency === selectedMethodData.currency) ?? null;
  }, [wallets, selectedMethodData]);

  // Submit proof
  const handleSubmitProof = useCallback(async () => {
    if (!selectedMethodData || numericAmount <= 0 || !proofValue.trim() || !targetWallet) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    setLoading(true);
    try {
      // 1. Create deposit
      const deposit = await xpApi.deposits.create({
        walletId: targetWallet.id,
        currency: selectedMethodData.currency,
        amount: numericAmount,
      });

      const depositId = deposit?.transactionId ?? deposit?.id;
      if (!depositId) {
        toast.error('Erro ao criar depósito: ID não retornado');
        setLoading(false);
        return;
      }

      // 2. Submit proof
      await xpApi.deposits.submitProof({
        depositId,
        proofType,
        proofValue: proofValue.trim(),
      });

      toast.success('Comprovante enviado com sucesso!');
      setStep(3);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao enviar comprovante';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [selectedMethodData, numericAmount, proofValue, proofType, targetWallet]);

  // ── Step Indicator ──

  const renderStepIndicator = () => (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s, i) => {
            const isActive = s === step;
            const isCompleted = s < step;

            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-neon-500 text-white shadow-lg shadow-neon-500/25'
                        : isCompleted
                          ? 'bg-neon-500/20 text-neon-400 border border-neon-500/30'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="size-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isActive ? 'text-zinc-100' : isCompleted ? 'text-neon-400' : 'text-zinc-500'
                    }`}
                  >
                    {STEP_LABELS[i]}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full transition-colors duration-200 ${
                      isCompleted ? 'bg-neon-500/40' : 'bg-zinc-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  // ── Step 1: Method Selection ──

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Escolher Método de Depósito</h2>
        <p className="text-sm text-zinc-400 mt-1">Selecione o método para adicionar fundos à sua conta</p>
      </div>

      <div className="grid gap-3">
        {DEPOSIT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => handleSelectMethod(method.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer group ${
              selectedMethod === method.id
                ? 'border-neon-500/50 bg-neon-500/5 shadow-lg shadow-neon-500/10'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
            }`}
          >
            <div
              className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
                selectedMethod === method.id
                  ? 'bg-neon-500/15 text-neon-400'
                  : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
              } transition-colors`}
            >
              {method.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${selectedMethod === method.id ? 'text-neon-400' : 'text-zinc-200'}`}>
                  {method.label}
                </p>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 bg-zinc-800 text-zinc-400 border-zinc-700"
                >
                  {method.currencyLabel}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{method.description}</p>
            </div>
            <ChevronRight className="size-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );

  // ── Step 2: Amount + Instructions + Proof ──

  const renderStep2 = () => {
    if (!selectedMethodData) return null;

    const currencySymbol = selectedMethodData.id === 'pix' ? 'R$' : selectedMethodData.id === 'sepa' ? '€' : '$';

    return (
      <div className="space-y-4">
        {/* Header + Back */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              {selectedMethodData.label}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Informe o valor e envie o comprovante</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            onClick={() => setStep(1)}
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Voltar</span>
          </Button>
        </div>

        {/* Amount Input */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                Valor do Depósito ({selectedMethodData.currencyLabel})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-zinc-500">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 pl-10 pr-4 text-2xl font-bold border-zinc-700 bg-zinc-800/50 text-zinc-100 text-right focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        {numericAmount > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                {selectedMethodData.icon}
                Instruções de Pagamento
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                {selectedMethodData.id === 'pix' && 'Escaneie o QR Code ou copie a chave PIX'}
                {selectedMethodData.id === 'sepa' && 'Utilize os dados abaixo para a transferência SEPA'}
                {selectedMethodData.id === 'crypto' && 'Envie o valor exato para o endereço abaixo'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {selectedMethodData.id === 'pix' && (
                <>
                  {/* QR Code Placeholder */}
                  <div className="flex justify-center py-4">
                    <div className="size-44 rounded-xl bg-zinc-800/80 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2">
                      <QrCode className="size-14 text-zinc-600" />
                      <span className="text-[10px] text-zinc-500">QR Code PIX</span>
                    </div>
                  </div>
                  <Separator className="bg-zinc-800 my-3" />
                  <InfoRow label="Chave PIX" value={PIX_KEY} mono copyable />
                  <InfoRow label="Valor" value={formatCurrency(numericAmount, 'BRL')} />
                </>
              )}

              {selectedMethodData.id === 'sepa' && (
                <>
                  <InfoRow label="Beneficiário" value={SEPA_BENEFICIARY} />
                  <InfoRow label="IBAN" value={SEPA_IBAN} mono copyable />
                  <InfoRow label="BIC / SWIFT" value={SEPA_BIC} mono copyable />
                  <InfoRow label="Referência" value={depositRef} mono copyable />
                  <Separator className="bg-zinc-800 my-1" />
                  <InfoRow label="Valor" value={formatCurrency(numericAmount, 'EUR')} />
                </>
              )}

              {selectedMethodData.id === 'crypto' && (
                <>
                  <div className="p-3 rounded-lg bg-neon-500/5 border border-neon-500/20 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Rede:</span>
                      <Badge className="text-[10px] px-2 py-0 h-5 bg-neon-500/15 text-neon-400 border-neon-500/30 border font-semibold">
                        {CRYPTO_NETWORK}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      Envie apenas USDT ou USDC pela rede TRC-20. Outras redes ou tokens podem resultar em perda de fundos.
                    </p>
                  </div>
                  <InfoRow label="Carteira" value={CRYPTO_ADDRESS} mono copyable />
                  <Separator className="bg-zinc-800 my-1" />
                  <InfoRow label="Valor" value={`${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} USDT`} />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Proof of Payment Form */}
        {numericAmount > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-400" />
                Comprovante de Pagamento
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Após realizar a transferência, envie o comprovante abaixo
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Proof Type Selector */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider">Tipo de Comprovante</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProofType('tx_hash')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      proofType === 'tx_hash'
                        ? 'border-neon-500/50 bg-neon-500/10 text-neon-400'
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <WalletIcon className="size-3.5" />
                    TxHash (Crypto)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProofType('receipt')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      proofType === 'receipt'
                        ? 'border-neon-500/50 bg-neon-500/10 text-neon-400'
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <Landmark className="size-3.5" />
                    Comprovativo (Fiat)
                  </button>
                </div>
              </div>

              {/* Proof Value Input */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                  {proofType === 'tx_hash' ? 'TxHash da Transação' : 'Referência / ID da Transação'}
                </Label>
                <Input
                  type="text"
                  placeholder={
                    proofType === 'tx_hash'
                      ? '0x... ou hash da transação'
                      : 'Número de referência do comprovativo'
                  }
                  value={proofValue}
                  onChange={(e) => setProofValue(e.target.value)}
                  className="h-11 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50 font-mono text-sm"
                />
              </div>

              {!targetWallet && !walletsLoading && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="size-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">
                    Nenhuma carteira {selectedMethodData.currencyLabel} encontrada. Crie uma carteira antes de depositar.
                  </p>
                </div>
              )}

              {/* Submit */}
              <Button
                className="w-full h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || numericAmount <= 0 || !proofValue.trim() || (!targetWallet && !walletsLoading)}
                onClick={handleSubmitProof}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Enviar Comprovante
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ── Step 3: Success ──

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex size-16 rounded-full bg-neon-500/10 border border-neon-500/20 items-center justify-center">
          <CircleCheckBig className="size-8 text-neon-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">Comprovante Enviado!</h2>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          O seu depósito foi registrado e o comprovante está em análise. O saldo será creditado após a verificação.
        </p>
      </div>

      {selectedMethodData && numericAmount > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 space-y-3">
            <InfoRow label="Método" value={selectedMethodData.label} />
            <Separator className="bg-zinc-800" />
            <InfoRow
              label="Valor"
              value={formatCurrency(
                numericAmount,
                selectedMethodData.id === 'pix' ? 'BRL' : selectedMethodData.id === 'sepa' ? 'EUR' : 'USD',
              )}
            />
            <Separator className="bg-zinc-800" />
            <InfoRow label="Status">
              <Badge className="text-[10px] px-2 py-0 h-5 bg-amber-500/15 text-amber-400 border-amber-500/30 border font-semibold">
                Em verificação
              </Badge>
            </InfoRow>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          onClick={() => setStep(2)}
        >
          <ArrowLeft className="size-4 mr-1.5" />
          Voltar
        </Button>
        <Button
          className="flex-1 h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium"
          onClick={handleReset}
        >
          Novo Depósito
          <ChevronRight className="size-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );

  // ── Render ──

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {renderStepIndicator()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}