// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — API Client (Typed Fetch Wrapper)
// ─────────────────────────────────────────────────────────────────────────────
// Headless architecture: all calls go to our own REST API.
// Auth is handled via Authorization: Bearer <token> header.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Balance states returned by the merchant dashboard endpoint */
export interface MerchantDashboardBalances {
  INCOMING: number;
  PENDING: number;
  RESERVE: number;
  AVAILABLE: number;
  CLEARED: number;
  AUDIT: number;
  BLOCKED: number;
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export class XPaymentsApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "XPaymentsApiError";
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...buildHeaders(token),
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      // non-JSON error body
    }
    throw new XPaymentsApiError(
      response.status,
      `API ${response.status}: ${response.statusText}`,
      body
    );
  }

  const json: ApiResponse<T> = await response.json();

  if (!json.success) {
    throw new XPaymentsApiError(
      response.status,
      json.message ?? "API returned success: false",
      json
    );
  }

  return json.data;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const xpaymentsApi = {
  /**
   * Fetch the dashboard balance overview for a merchant.
   *
   * GET /api/v1/merchant/:merchantId/dashboard
   *
   * Returns all 7 settlement-state balances in USDT.
   */
  getMerchantDashboard: (merchantId: string, token?: string) =>
    request<MerchantDashboardBalances>(
      `/api/v1/merchant/${merchantId}/dashboard`,
      {
        method: "GET",
        token,
      }
    ),
} as const;