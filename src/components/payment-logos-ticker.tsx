"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Payment Logos Ticker
// ─────────────────────────────────────────────────────────────────────────────
// Horizontally scrolling marquee of payment method / currency logos.
// Uses CSS-only animation (zero JS overhead after mount).
// Two rows: top scrolls left, bottom scrolls right — creating depth.

const LOGOS_ROW_1 = [
  { label: "MB WAY", color: "#FF6600" },
  { label: "VISA", color: "#1A1F71" },
  { label: "USDT", color: "#26A17B" },
  { label: "MULTIBANCO", color: "#00529B" },
  { label: "MASTERCARD", color: "#EB001B" },
  { label: "BTC", color: "#F7931A" },
  { label: "BIZUM", color: "#00D2B4" },
  { label: "EUR", color: "#003399" },
  { label: "AMEX", color: "#006FCF" },
  { label: "KUCOIN", color: "#23AF91" },
  { label: "BRL", color: "#009C3B" },
  { label: "USD", color: "#85BB65" },
];

const LOGOS_ROW_2 = [
  { label: "PIX", color: "#32BCAD" },
  { label: "MAESTRO", color: "#6B2D8B" },
  { label: "ETHEREUM", color: "#627EEA" },
  { label: "SEPA", color: "#003399" },
  { label: "APPLE PAY", color: "#000000" },
  { label: "GOOGLE PAY", color: "#4285F4" },
  { label: "USD", color: "#85BB65" },
  { label: "VISA", color: "#1A1F71" },
  { label: "MB WAY", color: "#FF6600" },
  { label: "USDT", color: "#26A17B" },
  { label: "BTC", color: "#F7931A" },
  { label: "BRL", color: "#009C3B" },
];

function LogoBadge({ label, color }: { label: string; color: string }) {
  const isCrypto = ["USDT", "BTC", "ETHEREUM"].includes(label);
  const isCard = ["VISA", "MASTERCARD", "AMEX", "MAESTRO"].includes(label);
  const isBank = ["MULTIBANCO", "SEPA", "PIX"].includes(label);
  const isWallet = ["MB WAY", "BIZUM", "APPLE PAY", "GOOGLE PAY"].includes(label);
  const isCurrency = ["EUR", "USD", "BRL"].includes(label);

  let icon: string;
  if (isCrypto) icon = "◆";
  else if (isCard) icon = "▎▎";
  else if (isBank) icon = "◧";
  else if (isWallet) icon = "⚡";
  else icon = "$";

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-2 backdrop-blur-sm transition-all hover:border-white/[0.08] hover:bg-white/[0.04]">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold"
        style={{
          color,
          background: `${color}15`,
          border: `1px solid ${color}25`,
        }}
      >
        {icon}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function TickerRow({
  logos,
  reverse = false,
  slow = false,
}: {
  logos: typeof LOGOS_ROW_1;
  reverse?: boolean;
  slow?: boolean;
}) {
  const animClass = slow
    ? "animate-marquee-slow"
    : reverse
      ? "animate-marquee-reverse"
      : "animate-marquee";

  return (
    <div className="relative flex overflow-hidden">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      <div className={`flex shrink-0 gap-4 ${animClass}`}>
        {/* Double the items for seamless loop */}
        {[...logos, ...logos].map((logo, i) => (
          <LogoBadge key={`${logo.label}-${i}`} label={logo.label} color={logo.color} />
        ))}
      </div>
    </div>
  );
}

export function PaymentLogosTicker() {
  return (
    <div className="relative z-10 flex w-full flex-col gap-3 overflow-hidden py-6">
      <TickerRow logos={LOGOS_ROW_1} />
      <TickerRow logos={LOGOS_ROW_2} reverse slow />
    </div>
  );
}