'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import { mockFeeSchedules } from '@/lib/mock-data';
import { TierLevel, TransactionType, Currency } from '@/types/xpayments';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<TierLevel, string> = {
  [TierLevel.TIER_0_UNVERIFIED]: 'KYC-0',
  [TierLevel.TIER_1_BASIC]: 'KYC-1',
  [TierLevel.TIER_2_VERIFIED]: 'KYC-2',
  [TierLevel.TIER_3_CORPORATE]: 'KYC-3',
};

const TIER_ROW_COLORS: Record<TierLevel, string> = {
  [TierLevel.TIER_0_UNVERIFIED]: 'bg-zinc-500/[0.04] hover:bg-zinc-500/[0.08]',
  [TierLevel.TIER_1_BASIC]: 'bg-yellow-500/[0.04] hover:bg-yellow-500/[0.08]',
  [TierLevel.TIER_2_VERIFIED]: 'bg-neon-500/[0.04] hover:bg-neon-500/[0.08]',
  [TierLevel.TIER_3_CORPORATE]: 'bg-neon-500/[0.04] hover:bg-neon-500/[0.08]',
};

const TIER_BORDER_COLORS: Record<TierLevel, string> = {
  [TierLevel.TIER_0_UNVERIFIED]: 'border-l-zinc-500',
  [TierLevel.TIER_1_BASIC]: 'border-l-yellow-500',
  [TierLevel.TIER_2_VERIFIED]: 'border-l-neon-500',
  [TierLevel.TIER_3_CORPORATE]: 'border-l-neon-500',
};

const TIER_BADGE_COLORS: Record<TierLevel, string> = {
  [TierLevel.TIER_0_UNVERIFIED]: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  [TierLevel.TIER_1_BASIC]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [TierLevel.TIER_2_VERIFIED]: 'bg-neon-500/20 text-neon-400 border-neon-500/30',
  [TierLevel.TIER_3_CORPORATE]: 'bg-neon-500/20 text-neon-400 border-neon-500/30',
};

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.PROXY_INCOMING]: 'Depósito',
  [TransactionType.SETTLEMENT]: 'Settlement',
  [TransactionType.PAYOUT]: 'Levantamento',
  [TransactionType.SWAP]: 'Swap',
  [TransactionType.TRANSFER]: 'Transferência',
  [TransactionType.FEE]: 'Taxa',
};

const TIER_ORDER: TierLevel[] = [
  TierLevel.TIER_1_BASIC,
  TierLevel.TIER_2_VERIFIED,
  TierLevel.TIER_3_CORPORATE,
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminFeesPage() {
  // Group fees by tier
  const groupedFees = useMemo(() => {
    const groups = new Map<TierLevel, typeof mockFeeSchedules>();
    for (const tier of TIER_ORDER) {
      groups.set(
        tier,
        mockFeeSchedules.filter((f) => f.tier === tier),
      );
    }
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIER_ORDER.map((tier) => {
          const fees = groupedFees.get(tier) ?? [];
          const avgPct =
            fees.length > 0
              ? fees.reduce((acc, f) => acc + f.percentageFee, 0) / fees.length
              : 0;
          const overrideCount = fees.filter((f) => f.isManualOverride).length;

          return (
            <Card key={tier} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={cn('text-xs px-2.5 py-0.5 h-6', TIER_BADGE_COLORS[tier])}>
                    {TIER_LABELS[tier]}
                  </Badge>
                  {overrideCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0 h-5">
                      <Pencil className="h-2.5 w-2.5 mr-1" />
                      {overrideCount} override
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Taxas configuradas</span>
                    <span className="text-zinc-200 font-medium">{fees.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Taxa média (%)</span>
                    <span className="text-zinc-200 font-medium">{(avgPct * 100).toFixed(2)}%</span>
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="space-y-1">
                    {fees.slice(0, 2).map((f) => (
                      <div key={f.id} className="flex justify-between text-[10px]">
                        <span className="text-zinc-500">{TRANSACTION_TYPE_LABELS[f.transactionType]}</span>
                        <span className="text-zinc-300 font-mono">{(f.percentageFee * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                    {fees.length > 2 && (
                      <p className="text-[10px] text-zinc-600">+{fees.length - 2} mais...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Full Fee Schedule Table ── */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-neon-400" />
            Tabela de Taxas
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Horários de taxas por nível, tipo de transação e moeda. Overwrites manuais são destacados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs font-medium">Tier</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Tipo de Transação</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Moeda</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-right">% Taxa</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-right">Taxa Fixa</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-center">Manual Override</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TIER_ORDER.map((tier) => {
                  const fees = groupedFees.get(tier) ?? [];
                  return fees.map((fee, idx) => (
                    <TableRow
                      key={fee.id}
                      className={cn(
                        'border-zinc-800 border-l-2 transition-colors',
                        TIER_BORDER_COLORS[tier],
                        TIER_ROW_COLORS[tier],
                      )}
                    >
                      {/* Tier - only show label for first row */}
                      <TableCell className="text-xs font-medium text-zinc-200 align-top">
                        {idx === 0 && (
                          <Badge variant="outline" className={cn('text-[10px] px-2 py-0 h-5', TIER_BADGE_COLORS[tier])}>
                            {TIER_LABELS[tier]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-300 text-xs">
                        {TRANSACTION_TYPE_LABELS[fee.transactionType]}
                      </TableCell>
                      <TableCell>
                        {fee.currency ? (
                          <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300 border-zinc-700 px-2 py-0 h-5">
                            {fee.currency}
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-500">Todas</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-zinc-200">
                        {(fee.percentageFee * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-zinc-300">
                        €{fee.fixedFee.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {fee.isManualOverride ? (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0 h-5 gap-1 mx-auto">
                            <Pencil className="h-2.5 w-2.5" />
                            Manual
                          </Badge>
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-zinc-600 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
