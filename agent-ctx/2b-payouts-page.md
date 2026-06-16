# Task 2b: Payouts Page — Business Account Payout Flow

## Summary
Created `/home/z/my-project/src/components/wallet/payouts-page.tsx` — a new Payout page for the merchant's Business Account that replaces the old `withdrawals-page.tsx`.

## What was done

### 1. Verified existing infrastructure
- **Types** (`src/types/xpayments.ts`): `PayoutRequest` and `PayoutResponse` already existed with correct shape (`amountUSDT`, `requestedCurrency`, `destinationInfo`)
- **API Client** (`src/lib/api/client.ts`): `xpApi.payouts.create()` already existed and imported `PayoutRequest`
- **UI Components**: All required shadcn/ui components (Card, Select, Alert, Textarea, Skeleton, etc.) were available

### 2. Created `payouts-page.tsx` with all required sections:

#### Hero Section — USDT Available Balance
- Large card showing `₮ 15,200.00` (or fetched balance)
- Subtitle: "Saldo Disponível para Payout"
- Skeleton loading state when wallets are being fetched
- Fallback message "Conecte-se para ver o seu saldo" when no USDT wallet found
- Fetches wallets from `xpApi.wallets.list()` on mount

#### Payout Form (single card)
- **Montante (USDT)** — Number input with large font, "Usar máximo" link
- **Moeda de Recebimento** — Dropdown with 3 options (USDT, EUR, BRL)
- **Detalhes de Destino** — Textarea with dynamic placeholder based on selected currency

#### Disclaimer Alert
- Amber-styled `Alert` with `Info` icon
- Explains fiat (EUR/BRL) payouts are D+1 OTC, USDT is automatic

#### Submit Button
- Neon gradient "Solicitar Payout"
- Loading spinner during submission
- Calls `xpApi.payouts.create()` with `PayoutRequest` shape
- Toast success/error via `sonner`

#### Success State
- Card with green neon border
- Shows: Amount, Destination Currency, Destination Info (truncated), Payout ID, Estimated Arrival
- Fiat warning (D+1 manual processing)
- Crypto message (automatic processing)
- "Novo Payout" reset button

### 3. Design System
- Dark theme: `bg-zinc-900/50 border-zinc-800`
- Neon accents: `text-neon-400`, `text-neon-glow`
- Amber warnings: `text-amber-400`, `bg-amber-500/5`
- Responsive: `max-w-2xl mx-auto`
- No blue/indigo/emerald/teal

### 4. Validation
- Amount > 0
- Amount <= available balance
- Destination info not empty
- Currency selected

## Lint Result
✅ `bun run lint` — No errors
