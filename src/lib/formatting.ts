// ============================================================
// XPAYMENTS.DIGITAL - Formatting & Display Helpers
// Constantes de formatação para a UI (símbolos, labels, cores)
// Extraídas do antigo mock-data.ts
// ============================================================

import {
  Currency,
  TransactionType,
  TransactionStatus,
  TicketType,
  TicketStatus,
} from '@/types/xpayments';

// --- Currency Display ---

export const currencySymbols: Record<Currency, string> = {
  [Currency.EUR]: '€',
  [Currency.BRL]: 'R$',
  [Currency.USDT]: '₮',
  [Currency.USD]: '$',
};

export const currencyColors: Record<Currency, string> = {
  [Currency.EUR]: 'text-sky-400',
  [Currency.BRL]: 'text-emerald-400',
  [Currency.USDT]: 'text-neon-400',
  [Currency.USD]: 'text-amber-400',
};

// --- Transaction Display ---

export const transactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.PROXY_INCOMING]: 'Depósito',
  [TransactionType.SETTLEMENT]: 'Settlement',
  [TransactionType.PAYOUT]: 'Levantamento',
  [TransactionType.SWAP]: 'Swap',
  [TransactionType.TRANSFER]: 'Transferência',
  [TransactionType.FEE]: 'Taxa',
};

export const transactionStatusColors: Record<TransactionStatus, string> = {
  [TransactionStatus.INCOMING]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [TransactionStatus.PENDING]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [TransactionStatus.COMPLETED]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  [TransactionStatus.BLOCKED]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [TransactionStatus.FAILED]: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// --- Ticket Display ---

export const ticketTypeLabels: Record<TicketType, string> = {
  [TicketType.MANUAL_WITHDRAWAL]: 'Levantamento Manual',
  [TicketType.TIER_UPGRADE]: 'Upgrade KYC',
  [TicketType.FEE_ADJUSTMENT]: 'Ajuste de Taxa',
  [TicketType.SUPPORT]: 'Suporte',
};

export const ticketStatusColors: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [TicketStatus.IN_PROGRESS]: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  [TicketStatus.RESOLVED]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  [TicketStatus.REJECTED]: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// --- Utility: Format currency amount ---
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  const locale = currency === Currency.BRL ? 'pt-BR' : 'en-US';
  const decimals = currency === Currency.USDT ? 2 : 2;
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol} ${formatted}`;
}

// --- Utility: Format date ---
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Utility: Format date short ---
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
  });
}