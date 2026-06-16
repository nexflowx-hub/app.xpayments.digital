// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Provider Abstraction Layer (WHITE-LABEL ENFORCEMENT)
// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE RULE: The Merchant and End Customer must NEVER see or know
// which backend payment processors/acquirers we use.
//
// This module is the SINGLE SOURCE OF TRUTH for mapping internal provider
// identifiers to white-label display data. Every frontend component that
// renders payment method information MUST use this layer.
//
// ⚠️  NEVER render providerUsed, gatewayId, or any backend identifier in UI.
// ⚠️  ALWAYS call toDisplayMethod() or getNetworkBadges() before rendering.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

/** Internal-only provider codes returned by the API */
export type InternalProvider =
  | "stripe_card_brl"
  | "stripe_card_eur"
  | "stripe_card_usd"
  | "misticpay_pix"
  | "sumup_pix"
  | "mollie_sepa"
  | "sumup_sepa"
  | "misticpay_crypto"
  | "manual_bank";

/** White-label display data — safe to render in any UI */
export interface DisplayMethod {
  /** Generic, professional name shown to merchants */
  label: string;
  /** Short description */
  description: string;
  /** Currency code */
  currency: "BRL" | "EUR" | "USD" | "USDT";
  /** Network/badge identifiers — show as icons, NEVER as provider names */
  networks: NetworkBadge[];
  /** Category for grouping */
  category: "instant" | "bank_transfer" | "card" | "crypto";
  /** Whether this method is a digital wallet / instant payment */
  isInstant: boolean;
}

export interface NetworkBadge {
  /** Network identifier for icon lookup (e.g., "visa", "mastercard", "pix") */
  id: string;
  /** Display label (only for accessibility / aria-label) */
  label: string;
}

// ─── Mapping Table ───────────────────────────────────────────────────────────

const PROVIDER_MAP: Record<InternalProvider, DisplayMethod> = {
  // ── Credit Card Processing (abstracted as "Global Processing") ──
  stripe_card_brl: {
    label: "Cartão de Crédito",
    description: "Processamento Global — Visa, Mastercard, Amex",
    currency: "BRL",
    networks: [
      { id: "visa", label: "Visa" },
      { id: "mastercard", label: "Mastercard" },
      { id: "amex", label: "American Express" },
    ],
    category: "card",
    isInstant: false,
  },
  stripe_card_eur: {
    label: "Cartão de Crédito",
    description: "Processamento Global — Visa, Mastercard",
    currency: "EUR",
    networks: [
      { id: "visa", label: "Visa" },
      { id: "mastercard", label: "Mastercard" },
    ],
    category: "card",
    isInstant: false,
  },
  stripe_card_usd: {
    label: "Credit Card",
    description: "Global Card Processing — Visa, Mastercard, Amex",
    currency: "USD",
    networks: [
      { id: "visa", label: "Visa" },
      { id: "mastercard", label: "Mastercard" },
      { id: "amex", label: "American Express" },
    ],
    category: "card",
    isInstant: false,
  },

  // ── PIX Instant (abstracted) ──
  misticpay_pix: {
    label: "PIX Instantâneo",
    description: "Pagamento instantâneo via PIX",
    currency: "BRL",
    networks: [{ id: "pix", label: "PIX" }],
    category: "instant",
    isInstant: true,
  },
  sumup_pix: {
    label: "PIX Instantâneo",
    description: "Pagamento instantâneo via PIX",
    currency: "BRL",
    networks: [{ id: "pix", label: "PIX" }],
    category: "instant",
    isInstant: true,
  },

  // ── SEPA Bank Transfer (abstracted) ──
  mollie_sepa: {
    label: "Transferência Bancária",
    description: "SEPA / IBAN — Débito Direto Europeu",
    currency: "EUR",
    networks: [{ id: "sepa", label: "SEPA" }],
    category: "bank_transfer",
    isInstant: false,
  },
  sumup_sepa: {
    label: "Transferência Bancária",
    description: "SEPA / IBAN — Débito Direto Europeu",
    currency: "EUR",
    networks: [{ id: "sepa", label: "SEPA" }],
    category: "bank_transfer",
    isInstant: false,
  },

  // ── Crypto Payments (abstracted) ──
  misticpay_crypto: {
    label: "Criptomoedas (Web3)",
    description: "Pagamento via Wallet Crypto — USDT, USDC",
    currency: "USDT",
    networks: [
      { id: "usdt", label: "USDT" },
      { id: "usdc", label: "USDC" },
    ],
    category: "crypto",
    isInstant: false,
  },

  // ── Manual Bank Transfer ──
  manual_bank: {
    label: "Transferência Bancária",
    description: "TED / DOC — Transferência manual",
    currency: "BRL",
    networks: [{ id: "bank", label: "Bank Transfer" }],
    category: "bank_transfer",
    isInstant: false,
  },
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Convert an internal provider code to white-label display data.
 *
 * This is the ONLY way frontend code should transform a provider identifier
 * into renderable information. NEVER access PROVIDER_MAP directly from components.
 */
export function toDisplayMethod(provider: InternalProvider): DisplayMethod {
  return PROVIDER_MAP[provider] ?? {
    label: "Payment Method",
    description: "Processing available",
    currency: "USD",
    networks: [],
    category: "card",
    isInstant: false,
  };
}

/**
 * Convert an array of internal provider codes to display methods.
 * Deduplicates by label so the merchant never sees duplicate entries
 * that would hint at multiple backend providers.
 */
export function toDisplayMethods(
  providers: InternalProvider[]
): DisplayMethod[] {
  const seen = new Set<string>();
  const results: DisplayMethod[] = [];

  for (const p of providers) {
    const display = toDisplayMethod(p);
    const key = `${display.label}-${display.currency}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(display);
    }
  }

  return results;
}

/**
 * Get the network badge data for a provider.
 * Use this to render payment network icons (Visa, Mastercard, PIX logo, etc.)
 * WITHOUT revealing which gateway processes each network.
 */
export function getNetworkBadges(
  provider: InternalProvider
): NetworkBadge[] {
  return toDisplayMethod(provider).networks;
}

/**
 * Generate a category label for grouping payment methods in the UI.
 * These labels are intentionally generic — no provider names.
 */
export function getCategoryLabel(category: DisplayMethod["category"]): string {
  switch (category) {
    case "instant":
      return "Pagamentos Instantâneos";
    case "card":
      return "Cartões de Crédito";
    case "bank_transfer":
      return "Transferências Bancárias";
    case "crypto":
      return "Criptomoedas";
    default:
      return "Outros Métodos";
  }
}