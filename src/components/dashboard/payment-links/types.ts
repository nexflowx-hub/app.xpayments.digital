// ─── Payment Link Types ────────────────────────────────────────────────────────

export type PaymentLinkStatus = "active" | "expired" | "disabled";
export type PaymentLinkType = "reusable" | "single_use";
export type CurrencyCode = "BRL" | "EUR" | "USD" | "USDT";

export interface PaymentLink {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  type: PaymentLinkType;
  status: PaymentLinkStatus;
  clicks: number;
  sales: number;
  imageUrl?: string;
  collectShipping: boolean;
  collectTaxId: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  checkoutUrl: string;
}

// ─── Create Link Form Schema (Zod-compatible shape) ───────────────────────────

export interface CreateLinkFormValues {
  name: string;
  amount: string;
  currency: CurrencyCode;
  description: string;
  imageUrl: string;
  isReusable: boolean;
  collectShipping: boolean;
  collectTaxId: boolean;
  expiresAt: string; // ISO date string or empty
}