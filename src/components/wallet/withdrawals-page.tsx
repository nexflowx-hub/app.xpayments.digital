'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  mockWallets,
  currencySymbols,
  currencyColors,
} from '@/lib/mock-data';
import { Currency } from '@/types/xpayments';
import {
  ArrowUpRight,
  Building2,
  Wallet,
  AlertCircle,
  Info,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Landmark,
  QrCode,
} from 'lucide-react';

type DestinationType = 'bank' | 'crypto';

const APPROX_RATES: Record<string, number> = {
  EUR: 1,
  BRL: 5.35,
  USDT: 0.93,
  USD: 1.08,
};

const WITHDRAWAL_FEES: Record<string, { percentage: number; fixed: number; minFee: number }> = {
  EUR: { percentage: 0.01, fixed: 1.5, minFee: 2.5 },
  BRL: { percentage: 0.008, fixed: 0, minFee: 1.0 },
  USDT: { percentage: 0.01, fixed: 2.0, minFee: 5.0 },
  USD: { percentage: 0.01, fixed: 1.5, minFee: 2.5 },
};

const MANUAL_APPROVAL_THRESHOLD = 10000;

export default function WithdrawalsPage() {
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationType, setDestinationType] = useState<DestinationType>('bank');
  const [submitted, setSubmitted] = useState(false);

  // Bank fields
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [iban, setIban] = useState('');
  const [swift, setSwift] = useState('');

  // Crypto fields
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('ERC-20');

  const selectedWallet = mockWallets.find((w) => w.id === selectedWalletId);
  const numericAmount = parseFloat(amount) || 0;

  const feeStructure = selectedWallet ? WITHDRAWAL_FEES[selectedWallet.currency] : null;
  const calculatedFee = useMemo(() => {
    if (!feeStructure || numericAmount <= 0) return 0;
    const fee = numericAmount * feeStructure.percentage + feeStructure.fixed;
    return Math.max(fee, feeStructure.minFee);
  }, [feeStructure, numericAmount]);

  const netAmount = numericAmount - calculatedFee;
  const requiresApproval = numericAmount > MANUAL_APPROVAL_THRESHOLD;
  const hasSufficientFunds = selectedWallet ? numericAmount <= selectedWallet.balanceAvailable : false;

  const canSubmit = useMemo(() => {
    if (!selectedWallet || numericAmount <= 0 || !hasSufficientFunds) return false;
    if (destinationType === 'bank') {
      return bankName.trim() !== '' && accountHolder.trim() !== '' && iban.trim() !== '';
    }
    return cryptoAddress.trim() !== '';
  }, [selectedWallet, numericAmount, hasSufficientFunds, destinationType, bankName, accountHolder, iban, cryptoAddress]);

  const estimatedEur = selectedWallet
    ? numericAmount * (APPROX_RATES[selectedWallet.currency] || 1)
    : 0;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedWalletId('');
    setAmount('');
    setDestinationType('bank');
    setSubmitted(false);
    setBankName('');
    setAccountHolder('');
    setIban('');
    setSwift('');
    setCryptoAddress('');
    setCryptoNetwork('ERC-20');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Source Wallet Selection */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Wallet className="size-4 text-neon-400" />
            Carteira de Origem
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Selecione a carteira de onde deseja levantar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="grid gap-2">
            {mockWallets.map((wallet) => {
              const isSelected = selectedWalletId === wallet.id;
              return (
                <button
                  key={wallet.id}
                  onClick={() => {
                    setSelectedWalletId(wallet.id);
                    setAmount('');
                    setSubmitted(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left cursor-pointer ${
                    isSelected
                      ? 'border-neon-500/50 bg-neon-500/5'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className={`size-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-neon-500/20' : 'bg-zinc-800'
                  }`}>
                    <span className={currencyColors[wallet.currency]}>{wallet.currency}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-neon-400' : 'text-zinc-200'}`}>
                      {wallet.walletReference}
                    </p>
                    <p className="text-[10px] text-zinc-500">{wallet.currency}</p>
                  </div>
                  <span className={`text-sm font-semibold ${currencyColors[wallet.currency]}`}>
                    {currencySymbols[wallet.currency]} {wallet.balanceAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Amount & Destination */}
      {selectedWallet && !submitted && (
        <>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6 space-y-5">
              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider">Valor para Sacar</Label>
                  <button
                    className="text-[10px] text-neon-400 hover:text-neon-300 font-medium"
                    onClick={() => setAmount(selectedWallet.balanceAvailable.toString())}
                  >
                    Usar máximo
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                    {currencySymbols[selectedWallet.currency]}
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
                {numericAmount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">≈ € {estimatedEur.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    {numericAmount > selectedWallet.balanceAvailable && (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="size-3" />
                        Saldo insuficiente
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Fee Breakdown */}
              {numericAmount > 0 && (
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Montante</span>
                    <span className="text-zinc-200 font-medium">
                      {currencySymbols[selectedWallet.currency]} {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Taxa ({feeStructure ? `${(feeStructure.percentage * 100).toFixed(2)}%` : '-'})</span>
                    <span className="text-amber-400 font-medium">
                      - {currencySymbols[selectedWallet.currency]} {calculatedFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Separator className="bg-zinc-700/50" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Líquido</span>
                    <span className="text-neon-400 font-bold text-sm">
                      {currencySymbols[selectedWallet.currency]} {netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Manual Approval Warning */}
              {requiresApproval && numericAmount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <ShieldCheck className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-400">Aprovação Manual Requerida</p>
                    <p className="text-[11px] text-amber-400/70 mt-0.5">
                      Levantamentos acima de {currencySymbols[selectedWallet.currency]} {MANUAL_APPROVAL_THRESHOLD.toLocaleString('pt-BR')} requerem aprovação manual via Ticket.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Destination */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <ArrowUpRight className="size-4 text-neon-400" />
                Destino do Levantamento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Destination Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDestinationType('bank')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    destinationType === 'bank'
                      ? 'border-neon-500/50 bg-neon-500/5 text-neon-400'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Building2 className="size-4" />
                  <span className="text-xs font-medium">Conta Bancária</span>
                </button>
                <button
                  onClick={() => setDestinationType('crypto')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    destinationType === 'crypto'
                      ? 'border-neon-500/50 bg-neon-500/5 text-neon-400'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <QrCode className="size-4" />
                  <span className="text-xs font-medium">Endereço Crypto</span>
                </button>
              </div>

              {/* Bank Form */}
              {destinationType === 'bank' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Nome do Banco</Label>
                    <Input
                      placeholder="Ex: Caixa Geral de Depósitos"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-10 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-600 text-sm focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Titular da Conta</Label>
                    <Input
                      placeholder="Nome do titular"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="h-10 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-600 text-sm focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">IBAN *</Label>
                    <Input
                      placeholder="Ex: PT50 1234 5678 9012 3456 7890 1"
                      value={iban}
                      onChange={(e) => setIban(e.target.value.toUpperCase())}
                      className="h-10 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-600 text-sm font-mono focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">
                      SWIFT / BIC <span className="text-zinc-600">(opcional)</span>
                    </Label>
                    <Input
                      placeholder="Ex: CGDIPTPL"
                      value={swift}
                      onChange={(e) => setSwift(e.target.value.toUpperCase())}
                      className="h-10 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-600 text-sm font-mono focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Crypto Form */}
              {destinationType === 'crypto' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Rede</Label>
                    <select
                      value={cryptoNetwork}
                      onChange={(e) => setCryptoNetwork(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-zinc-700 bg-zinc-800/50 text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-neon-500/30 focus:border-neon-500/50 cursor-pointer appearance-none"
                    >
                      <option value="ERC-20">ERC-20 (Ethereum)</option>
                      <option value="TRC-20">TRC-20 (Tron)</option>
                      <option value="BEP-20">BEP-20 (BSC)</option>
                      <option value="SOL">Solana</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-400">Endereço da Carteira *</Label>
                    <Input
                      placeholder="0x..."
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      className="h-10 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-600 text-sm font-mono focus-visible:ring-neon-500/30 focus-visible:border-neon-500/50"
                    />
                  </div>
                </div>
              )}

              <Button
                className="w-full h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                <ArrowUpRight className="size-4 mr-1.5" />
                Sacar {numericAmount > 0 ? `${currencySymbols[selectedWallet.currency]} ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Submitted State */}
      {submitted && (
        <Card className="bg-zinc-900/50 border-neon-500/20 shadow-lg shadow-neon-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-flex size-14 rounded-full bg-neon-500/10 border border-neon-500/20 items-center justify-center">
                <CheckCircle2 className="size-7 text-neon-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">
                {requiresApproval ? 'Pedido de Levantamento Submetido' : 'Levantamento Iniciado'}
              </h3>
            </div>

            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Montante</span>
                <span className={`text-sm font-bold ${currencyColors[selectedWallet!.currency]}`}>
                  {currencySymbols[selectedWallet!.currency]} {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Taxa</span>
                <span className="text-sm font-medium text-amber-400">
                  - {currencySymbols[selectedWallet!.currency]} {calculatedFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Separator className="bg-zinc-700/50" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Líquido</span>
                <span className="text-sm font-bold text-neon-400">
                  {currencySymbols[selectedWallet!.currency]} {netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Destino</span>
                <span className="text-sm font-medium text-zinc-300">
                  {destinationType === 'bank' ? bankName : `${cryptoNetwork} - ${cryptoAddress.slice(0, 8)}...${cryptoAddress.slice(-6)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">ID da Transação</span>
                <span className="text-xs font-mono text-zinc-400">wd_{Date.now().toString(36)}</span>
              </div>
            </div>

            {requiresApproval && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <Clock className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-400">Aguardando Aprovação</p>
                  <p className="text-[11px] text-amber-400/70 mt-0.5">
                    Este levantamento excede o limite automático. Foi criado um Ticket de operação para aprovação manual pela equipa de compliance.
                  </p>
                </div>
              </div>
            )}

            {!requiresApproval && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-neon-500/5 border border-neon-500/20">
                <CheckCircle2 className="size-4 text-neon-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-neon-400">Em Processamento</p>
                  <p className="text-[11px] text-neon-400/70 mt-0.5">
                    O seu levantamento está a ser processado. O prazo estimado é de 1-3 dias úteis para transferências bancárias e instantâneo para endereços crypto.
                  </p>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full h-10 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={handleReset}
            >
              Novo Levantamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
