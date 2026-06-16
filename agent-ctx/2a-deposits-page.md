# Task 2a — Rewrite deposits-page.tsx

## Summary
Completely rewrote `/home/z/my-project/src/components/wallet/deposits-page.tsx` to implement a 3-step business account deposit flow with PIX, SEPA, and Crypto methods.

## What Changed
- **Removed all mock-data imports** — zero dependency on `@/lib/mock-data`
- **3 deposit methods** (no currency selection step): PIX Instantâneo (BRL), SEPA Instant (EUR), Crypto Wallet (USDT/USDC)
- **3-step flow**: Method selection → Amount + Payment instructions + Proof form → Success confirmation
- **Payment instructions per method**:
  - PIX: QR Code placeholder, PIX key `xp@xpayments.digital` (mono + copy button), amount in BRL
  - SEPA: Beneficiary, IBAN, BIC/SWIFT, generated reference `XP-DEP-{timestamp}`, all with copy buttons
  - Crypto: TRC-20 network badge, wallet address (mono + copy), amount in USDT
- **Proof form**: Type selector (TxHash/Comprovativo), input field, submit button
- **API wired**: Calls `xpApi.deposits.create()` then `xpApi.deposits.submitProof()` on submit
- **Loading states**: Loader spinner during submission, disabled buttons
- **Toast notifications**: Success/error via `sonner`
- **Design system**: Dark theme (`bg-zinc-900/50 border-zinc-800`), neon accents, sky for EUR, amber for crypto
- **Responsive**: `max-w-2xl mx-auto`, proper spacing, mobile-first
- **All text in PT-BR**
- **Lint passes cleanly** (0 errors, 0 warnings)

## Files Modified
- `/home/z/my-project/src/components/wallet/deposits-page.tsx` — complete rewrite (470+ lines)

## Notes
- The `submitProof` API method already existed in `client.ts` with the `DepositProofRequest` type — no API client changes were needed
- Wallets are fetched on mount to find the target wallet for the selected currency; a warning is shown if no wallet exists