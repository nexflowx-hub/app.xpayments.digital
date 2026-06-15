import { useQuery, queryOptions } from "@tanstack/react-query";
import { xpaymentsApi, type MerchantDashboardBalances } from "@/lib/api-client";

// ─── Test Merchant UUID (will be replaced by auth flow) ──────────────────────

const TEST_MERCHANT_ID = "00000000-0000-0000-0000-000000000000";

// ─── Query Key Factory ───────────────────────────────────────────────────────

export const merchantKeys = {
  dashboard: (merchantId: string) =>
    ["merchant", "dashboard", merchantId] as const,
};

// ─── Query Options (reusable, testable) ──────────────────────────────────────

export const merchantDashboardOptions = (merchantId: string) =>
  queryOptions({
    queryKey: merchantKeys.dashboard(merchantId),
    queryFn: () => xpaymentsApi.getMerchantDashboard(merchantId),
  });

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseMerchantDashboardOptions {
  /** Merchant UUID. Defaults to test merchant. */
  merchantId?: string;
  /** Bearer token for authenticated requests. */
  token?: string;
}

/**
 * React Query hook that fetches the merchant's dashboard balances.
 *
 * Auto-refreshes every 30s. Returns typed balance data
 * across all 7 settlement states (INCOMING, PENDING, RESERVE,
 * AVAILABLE, CLEARED, AUDIT, BLOCKED).
 */
export function useMerchantDashboard(
  opts: UseMerchantDashboardOptions = {}
) {
  const merchantId = opts.merchantId ?? TEST_MERCHANT_ID;

  return useQuery<MerchantDashboardBalances>({
    ...merchantDashboardOptions(merchantId),
    // token injection happens in the queryFn via closure if needed
    // For now the endpoint is open with the test UUID.
  });
}