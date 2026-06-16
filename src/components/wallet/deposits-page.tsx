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
  mockDepositRoutes,
  currencySymbols,
  currencyColors,
} from '@/lib/mock-data';
import { Currency } from '@/types/xpayments';
import {
  ArrowDownLeft,
  CreditCard,
  QrCode,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  CircleDollarSign,
} from 'lucide-react';

type DepositStep = 'currency' | 'amount' | 'routes' | 'result';

const CURRENCY_OPTIONS: { currency: Currency; label: string; description: string; icon: string }[] = [
  { currency: Currency.BRL, label: 'BRL - Real Brasileiro', description: 'Depósito via PIX (XPayments)', icon: '🇧🇷' },
  { currency: Currency.EUR, label: 'EUR - Euro', description: 'Depósito via Cartão / Transferência', icon: '🇪🇺' },
  { currency: Currency.USD, label: 'USD - Dólar Americano', description: 'Depósito via Cartão / Transferência', icon: '🇺🇸' },
];

export default function DepositsPage() {
  const [step, setStep] = useState<DepositStep>('currency');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [depositCreated, setDepositCreated] = useState(false);

  const routes = selectedCurrency ? (mockDepositRoutes[selectedCurrency as keyof typeof mockDepositRoutes] || []) : [];
  const selectedWallet = mockWallets.find((w) => w.currency === selectedCurrency);
  const symbol = selectedCurrency ? currencySymbols[selectedCurrency] : '';

  const selectedRouteData = selectedRoute !== null ? routes[selectedRoute] : null;
  const numericAmount = parseFloat(amount) || 0;

  const canProceed = useMemo(() => {
    if (step === 'currency') return selectedCurrency !== null;
    if (step === 'amount') return numericAmount > 0;
    if (step === 'routes') return selectedRoute !== null;
    return false;
  }, [step, selectedCurrency, numericAmount, selectedRoute]);

  const handleReset = () => {
    setStep('currency');
    setSelectedCurrency(null);
    setAmount('');
    setSelectedRoute(null);
    setDepositCreated(false);
  };

  const handleCreateDeposit = () => {
    setDepositCreated(true);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Step Indicator */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {(['currency', 'amount', 'routes', 'result'] as DepositStep[]).map((s, i) => {
              const stepIndex = ['currency', 'amount', 'routes', 'result'].indexOf(step);
              const isActive = s === step;
              const isCompleted = i < stepIndex;
              const stepLabels = ['Moeda', 'Montante', 'Rota', 'Resultado'];

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
                      {isCompleted ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:inline ${
                        isActive ? 'text-zinc-100' : isCompleted ? 'text-neon-400' : 'text-zinc-500'
                      }`}
                    >
                      {stepLabels[i]}
                    </span>
                  </div>
                  {i < 3 && (
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

      {/* Step: Currency Selection */}
      {step === 'currency' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Selecionar Moeda</h2>
            <p className="text-sm text-zinc-400 mt-1">Escolha a moeda para o seu depósito</p>
          </div>
          <div className="grid gap-3">
            {CURRENCY_OPTIONS.map((opt) => (
              <button
                key={opt.currency}
                onClick={() => setSelectedCurrency(opt.currency)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                  selectedCurrency === opt.currency
                    ? 'border-neon-500/50 bg-neon-500/5 shadow-lg shadow-neon-500/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${selectedCurrency === opt.currency ? 'text-neon-400' : 'text-zinc-200'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{opt.description}</p>
                </div>
                {selectedCurrency === opt.currency && (
                  <div className="size-5 rounded-full bg-neon-500 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <Button
            className="w-full h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium"
            disabled={!canProceed}
            onClick={() => setStep('amount')}
          >
            Continuar
            <ChevronRight className="size-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Step: Amount */}
      {step === 'amount' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Montante do Depósito</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Carteira destino:{' '}
              <span className={currencyColors[selectedCurrency!]}>
                {selectedWallet?.walletReference}
              </span>
            </p>
          </div>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider">Montante ({selectedCurrency})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-zinc-500">
                    {symbol}
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
              {numericAmount > 0 && (
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    ≈ € {(numericAmount * (selectedCurrency === Currency.BRL ? 0.187 : selectedCurrency === Currency.USD ? 0.926 : 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {selectedWallet && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <span className="text-xs text-zinc-500">Saldo atual da carteira</span>
                  <span className={`text-sm font-semibold ${currencyColors[selectedCurrency!]}`}>
                    {symbol} {selectedWallet.balanceAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setStep('currency')}
            >
              <ArrowLeft className="size-4 mr-1.5" />
              Voltar
            </Button>
            <Button
              className="flex-1 h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium"
              disabled={!canProceed}
              onClick={() => setStep('routes')}
            >
              Ver Rotas
              <ChevronRight className="size-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Routes */}
      {step === 'routes' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Rotas Disponíveis</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Depósito de {symbol} {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {selectedCurrency}
            </p>
          </div>
          <div className="grid gap-3">
            {routes.map((route, index) => {
              const isSelected = selectedRoute === index;
              const isInRange = numericAmount >= route.minAmount && numericAmount <= route.maxAmount;

              return (
                <button
                  key={index}
                  onClick={() => isInRange && setSelectedRoute(index)}
                  disabled={!isInRange}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-neon-500/50 bg-neon-500/5 shadow-lg shadow-neon-500/10'
                      : isInRange
                      ? 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 cursor-pointer'
                      : 'border-zinc-800/50 bg-zinc-900/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`size-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                      isSelected ? 'bg-neon-500/20' : 'bg-zinc-800'
                    }`}
                  >
                    {route.icon}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-neon-400' : 'text-zinc-200'}`}>
                          {route.provider}
                        </p>
                        {isSelected && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-neon-500/20 text-neon-400 border-neon-500/30 border">
                            Selecionado
                          </Badge>
                        )}
                      </div>
                      {isSelected && (
                        <div className="size-5 rounded-full bg-neon-500 flex items-center justify-center">
                          <CheckCircle2 className="size-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Clock className="size-3" />
                      <span>{route.estimatedTime}</span>
                    </div>
                    <div className="flex gap-3 text-[11px]">
                      <span className="text-zinc-500">
                        Min: <span className="text-zinc-300">{currencySymbols[selectedCurrency!]}{route.minAmount.toLocaleString('pt-BR')}</span>
                      </span>
                      <span className="text-zinc-500">
                        Max: <span className="text-zinc-300">{currencySymbols[selectedCurrency!]}{route.maxAmount.toLocaleString('pt-BR')}</span>
                      </span>
                    </div>
                    {!isInRange && numericAmount > 0 && (
                      <p className="text-xs text-red-400 mt-1">
                        Montante fora do intervalo permitido
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setStep('amount')}
            >
              <ArrowLeft className="size-4 mr-1.5" />
              Voltar
            </Button>
            <Button
              className="flex-1 h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium"
              disabled={!canProceed}
              onClick={() => setStep('result')}
            >
              Criar Depósito
              <Zap className="size-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && !depositCreated && selectedRouteData && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Confirmar Depósito</h2>
            <p className="text-sm text-zinc-400 mt-1">Reveja os detalhes antes de criar</p>
          </div>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Montante</span>
                <span className={`text-xl font-bold ${currencyColors[selectedCurrency!]}`}>
                  {symbol} {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Provedor</span>
                <span className="text-sm font-medium text-zinc-200">{selectedRouteData.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Tempo Estimado</span>
                <span className="text-sm font-medium text-zinc-200">{selectedRouteData.estimatedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Carteira</span>
                <span className="text-sm font-medium text-zinc-200">{selectedWallet?.walletReference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Taxa</span>
                <Badge variant="outline" className="text-[10px] border-neon-500/30 text-neon-400 bg-neon-500/10">
                  Gratuita
                </Badge>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setStep('routes')}
            >
              <ArrowLeft className="size-4 mr-1.5" />
              Voltar
            </Button>
            <Button
              className="flex-1 h-11 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 font-medium"
              onClick={handleCreateDeposit}
            >
              <ShieldCheck className="size-4 mr-1.5" />
              Confirmar Depósito
            </Button>
          </div>
        </div>
      )}

      {/* Deposit Created - Payment Instructions */}
      {step === 'result' && depositCreated && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex size-14 rounded-full bg-neon-500/10 border border-neon-500/20 items-center justify-center">
              <Sparkles className="size-7 text-neon-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Depósito Criado com Sucesso</h2>
            <p className="text-sm text-zinc-400">
              ID: <span className="font-mono text-zinc-300">dep_{Date.now().toString(36)}</span>
            </p>
          </div>

          {/* BRL - PIX QR Code */}
          {selectedCurrency === Currency.BRL && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                  <QrCode className="size-4 text-neon-400" />
                  QR Code PIX
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Escaneie o código QR com a sua app bancária
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex justify-center">
                  <div className="size-48 rounded-xl bg-zinc-800/80 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2">
                    <QrCode className="size-16 text-zinc-600" />
                    <span className="text-[10px] text-zinc-500">QR Code PIX</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Montante</p>
                  <p className="text-lg font-bold text-neon-400">
                    R$ {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Provedor</p>
                  <p className="text-sm font-medium text-zinc-300">XPayments</p>
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  O saldo será creditado instantaneamente após confirmação do PIX.
                </p>
              </CardContent>
            </Card>
          )}

          {/* EUR/USD - Pagamento Cartão */}
          {(selectedCurrency === Currency.EUR || selectedCurrency === Currency.USD) && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                  <CreditCard className="size-4 text-neon-400" />
                  Pagamento Cartão
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Complete o pagamento com cartão
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Montante</p>
                  <p className={`text-lg font-bold ${currencyColors[selectedCurrency!]}`}>
                    {symbol} {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wider">Token de Sessão</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                    <code className="text-xs text-zinc-400 font-mono truncate flex-1">
                      xp_{Math.random().toString(36).substring(2, 15)}_sess_{Math.random().toString(36).substring(2, 10)}
                    </code>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wider">ID da Transação</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                    <code className="text-xs text-zinc-400 font-mono truncate flex-1">
                      txn_{Math.random().toString(36).substring(2, 15)}
                    </code>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  O pagamento será processado em 1-2 dias úteis.
                </p>
                <Button
                  className="w-full h-10 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white shadow-lg shadow-neon-900/25 text-sm"
                >
                  <CircleDollarSign className="size-4 mr-1.5" />
                  Abrir Checkout de Pagamento
                </Button>
              </CardContent>
            </Card>
          )}

          <Button
            variant="outline"
            className="w-full h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={handleReset}
          >
            <Sparkles className="size-4 mr-1.5" />
            Novo Depósito
          </Button>
        </div>
      )}
    </div>
  );
}
