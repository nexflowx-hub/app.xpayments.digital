import type { PaymentLink } from "./types";

// ─── Mock Payment Links ───────────────────────────────────────────────────────

export const mockPaymentLinks: PaymentLink[] = [
  {
    id: "pl_01JXK2M3N4P5Q6R7S8T9U0V1W",
    name: "Premium VPN Subscription",
    description: "12-month premium VPN access — instant delivery",
    amount: 49.9,
    currency: "BRL",
    type: "reusable",
    status: "active",
    clicks: 1247,
    sales: 318,
    imageUrl: "https://picsum.photos/seed/vpn-box/400/400",
    collectShipping: false,
    collectTaxId: true,
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-06-10T14:22:00Z",
    checkoutUrl: "https://pay.xpayments.digital/l/vpn-premium",
  },
  {
    id: "pl_02KYL3N4P5Q6R7S8T9U0V1W2X",
    name: "Consulting Session (1h)",
    description: "1-on-1 consulting session via video call",
    amount: 150.0,
    currency: "USD",
    type: "single_use",
    status: "active",
    clicks: 89,
    sales: 1,
    collectShipping: false,
    collectTaxId: false,
    expiresAt: "2025-07-15T23:59:59Z",
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2025-06-12T16:45:00Z",
    checkoutUrl: "https://pay.xpayments.digital/l/consulting-1h",
  },
  {
    id: "pl_03LZM4N5P6Q7R8S9T0U1V2W3X",
    name: "Digital Course — Full Stack Dev",
    description: "Complete web development bootcamp with certification",
    amount: 297.0,
    currency: "USD",
    type: "reusable",
    status: "active",
    clicks: 4521,
    sales: 874,
    imageUrl: "https://picsum.photos/seed/course-dev/400/400",
    collectShipping: false,
    collectTaxId: true,
    createdAt: "2024-11-20T08:00:00Z",
    updatedAt: "2025-06-14T11:30:00Z",
    checkoutUrl: "https://pay.xpayments.digital/l/fullstack-course",
  },
  {
    id: "pl_04MAN5P6Q7R8S9T0U1V2W3X4Y",
    name: "Custom T-Shirt Order",
    description: "Limited edition merch — ships worldwide",
    amount: 39.9,
    currency: "EUR",
    type: "reusable",
    status: "active",
    clicks: 632,
    sales: 156,
    imageUrl: "https://picsum.photos/seed/tshirt-merch/400/400",
    collectShipping: true,
    collectTaxId: false,
    createdAt: "2025-03-10T15:00:00Z",
    updatedAt: "2025-06-08T09:12:00Z",
    checkoutUrl: "https://pay.xpayments.digital/l/custom-tshirt",
  },
  {
    id: "pl_05NBO6Q7R8S9T0U1V2W3X4Y5Z",
    name: "Lifetime Software License",
    description: "One-time purchase, lifetime access to all features",
    amount: 499.0,
    currency: "USD",
    type: "reusable",
    status: "disabled",
    clicks: 2103,
    sales: 445,
    createdAt: "2024-08-05T12:00:00Z",
    updatedAt: "2025-05-20T18:00:00Z",
    checkoutUrl: "https://pay.xpayments.digital/l/lifetime-license",
  },
  {
    id: "pl_06OCP7R8S9T0U1V2W3X4Y5Z6A",
    name: "Event Ticket — Crypto Conference",
    description: "VIP access to the annual crypto conference",
    amount: 1200.0,
    currency: "USD",
    type: "single_use",
    status: "expired",
    clicks: 302,
    sales: 0,
    expiresAt: "2025-03-31T23:59:59Z",
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
    checkoutUrl: "https://pay.xpayments.digital/l/crypto-conf-vip",
  },
];

// ─── Mock API (simulates network delay) ──────────────────────────────────────

export async function fetchPaymentLinks(): Promise<PaymentLink[]> {
  await new Promise((r) => setTimeout(r, 800));
  return mockPaymentLinks;
}

export async function createPaymentLink(
  _data: unknown
): Promise<PaymentLink> {
  await new Promise((r) => setTimeout(r, 1200));
  return {
    id: `pl_${crypto.randomUUID().replace(/-/g, "")}`,
    name: "New Link",
    description: "",
    amount: 0,
    currency: "USD",
    type: "reusable",
    status: "active",
    clicks: 0,
    sales: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checkoutUrl: "https://pay.xpayments.digital/l/new-link",
  };
}