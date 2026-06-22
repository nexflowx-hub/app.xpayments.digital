// ============================================================
// XPAYMENTS.DIGITAL - API Client (Native Fetch + JWT)
//
// REGRA DE OURO:
//   - NEXT_PUBLIC_API_URL = "https://api.xpayments.digital" (sem /api/v1)
//   - O cliente adiciona automaticamente /api/v1 ao base URL
//   - O Zustand (useAuthStore) fornece o JWT para todas as requests
//   - NUNCA usar 'localhost' hardcoded
//   - Formato de resposta do backend: { success: boolean, data: T }
// ============================================================

import type { PayoutRequest, DepositProofRequest } from '@/types/xpayments';

// ── Base URL ──
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.xpayments.digital').replace(/\/+$/, '');
const API_V1 = `${API_BASE}/api/v1`;

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    '[XPayments] NEXT_PUBLIC_API_URL não está definida. ' +
    'A usar fallback: https://api.xpayments.digital'
  );
}

// ── Custom Error ──
export class XPaymentsApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'XPaymentsApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ── Helpers de Armazenamento Seguro ──

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('xp_token');
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('xp_token', token);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('xp_token');
}

export function getStoredUser<T>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('xp_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser<T>(user: T): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('xp_user', JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('xp_user');
}

// ── Core Fetch Wrapper ──
// Lê o JWT diretamente do Zustand store (useAuthStore.getState().token)
// e injeta no cabeçalho Authorization: Bearer <token>

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Lazy import to avoid circular dependency at module load time
  // auth-store imports storage helpers from this file (loaded first)
  // we import useAuthStore only when request() is actually called
  const { useAuthStore } = await import('@/stores/auth-store');

  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_V1}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // ── 401 Unauthorized: limpar sessão e disparar evento global ──
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      clearStoredToken();
      clearStoredUser();
      useAuthStore.getState().logout();
      window.dispatchEvent(new CustomEvent('xp:unauthorized'));
    }
    throw new XPaymentsApiError('Sessão expirada ou não autorizada', 401, 'UNAUTHORIZED');
  }

  // ── Outros erros HTTP ──
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}`;
    let errorCode: string | undefined;
    let errorDetails: Record<string, unknown> | undefined;

    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      errorCode = errorBody.code;
      errorDetails = errorBody.details;
    } catch {
      // response body is not JSON
    }

    throw new XPaymentsApiError(errorMessage, response.status, errorCode, errorDetails);
  }

  // ── Parse response: unwrap { success, data } envelope ──
  const json = await response.json();

  if (json?.success && json?.data !== undefined) {
    return json.data as T;
  }

  // Fallback: some endpoints might return raw data
  return json as T;
}

// ── Convenience methods ──

function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  let url = path;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  return request<T>(url, { method: 'GET' });
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// ============================================================
// API Modules
// Todas as rotas são relativas a /api/v1
// O backend devolve respostas no formato { success: boolean, data: T }
// ============================================================

// ── Auth Response Types ──

export interface MerchantLoginResponse {
  merchantId: string;
  name: string;
  tier: string;
  token: string;
}

export interface AdminLoginResponse {
  adminId: string;
  name: string;
  role: string;
  token: string;
}

export interface RegisterResponse {
  userId?: string;
  merchantId?: string;
  token?: string;
  message?: string;
}

// ── Merchant Dashboard Types ──

export interface MerchantDashboardBalances {
  available?: number;
  pending?: number;
  incoming?: number;
  reserve?: number;
 blocked?: number;
 totalUSDT?: number;
 [key: string]: number | undefined;
}

export interface MerchantDashboardResponse {
  balances?: MerchantDashboardBalances;
 totalStores?: number;
 activeStores?: number;
  pendingSettlements?: number;
  todayVolume?: number;
  [key: string]: unknown;
}

export interface MerchantDashboardTransaction {
  id: string;
 walletId?: string | null;
 storeId?: string | null;
 store?: { id?: string; name?: string } | null;
 type?: string | null;
  status?: string | null;
  amount?: number;
  feeApplied?: number;
 currency?: string | null;
  fiatAmount?: number | null;
 fiatCurrency?: string | null;
 description?: string | null;
  createdAt?: string | null;
 updatedAt?: string | null;
 [key: string]: unknown;
}

// ── Admin Dashboard Types ──

export interface AdminStatsResponse {
  totalMerchants: number;
  activeMerchants: number;
  totalVolumeUSDT: number;
  totalTransactions: number;
  pendingTickets?: number;
}

export interface AdminMerchant {
  id: string;
  name: string;
  email?: string | null;
  tier: string;
  status: string;
  activeStores?: number;
  totalVolume?: number;
  createdAt?: string;
}

export interface MerchantStore {
  id: string;
  name: string;
  primaryColor?: string | null;
  successUrl?: string | null;
  webhookUrl?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const xpApi = {
  // ── AUTH ──
  auth: {
    /** POST /auth/login — Login de Merchant/Lojista */
    login: (data: { email: string; password: string }) =>
      post<MerchantLoginResponse>('/auth/login', data),

    /** POST /auth/register — Registo de novo Merchant */
    register: (data: { email: string; password: string; storeName?: string }) =>
      post<RegisterResponse>('/auth/register', data),

    /** GET /auth/me — Dados do utilizador autenticado */
    me: () =>
      get<unknown>('/auth/me'),
  },

  // ── ADMIN AUTH ──
  admin: {
    /** POST /admin/login — Login de Admin/Operador */
    login: (data: { email: string; password: string }) =>
      post<AdminLoginResponse>('/admin/login', data),

    /** GET /admin/stats — Super Admin dashboard stats */
    getStats: () =>
      get<AdminStatsResponse>('/admin/stats'),

    /** GET /admin/merchants — List all merchants */
    getMerchants: () =>
      get<AdminMerchant[]>('/admin/merchants'),
  },

  // ── PUBLIC (sem autenticação) ──
  public: {
    /** GET /public/rates — Taxas de câmbio reais */
    getRates: () =>
      get<unknown>('/public/rates'),
  },

  // ── WALLETS ──
  wallets: {
    list: () => get<unknown>('/wallets'),
    getById: (id: string) => get<unknown>(`/wallets/${id}`),
  },

  // ── TRANSACTIONS ──
  transactions: {
    list: (params?: { walletId?: string; type?: string; status?: string; page?: number; pageSize?: number }) =>
      get<unknown>('/transactions', params as Record<string, string | number | undefined>),
  },

  // ── DEPOSITS (IN) ──
  deposits: {
    create: (data: { walletId: string; currency: string; amount: number }) =>
      post<unknown>('/deposits', data),

    submitProof: (data: DepositProofRequest) =>
      post<unknown>(`/deposits/${data.depositId}/proof`, {
        proofType: data.proofType,
        proofValue: data.proofValue,
      }),
  },

  // ── SWAPS ──
  swaps: {
    execute: (data: { fromWalletId: string; toWalletId: string; amount: number }) =>
      post<unknown>('/swaps', data),
  },

  // ── PAYOUTS (OUT) ──
  payouts: {
    create: (data: PayoutRequest) =>
      post<unknown>('/payouts', data),
  },

  // ── KYC ──
  kyc: {
    getProfile: () => get<unknown>('/kyc/profile'),

    upgrade: (data: { tier: string; data: Record<string, unknown> }) =>
      post<unknown>('/kyc/upgrade', data),
  },

  // ── MERCHANT: API Keys (S2S) + Dashboard ──
  merchant: {
    /** GET /merchant/:merchantId/dashboard — Saldos Ledger Engine do Merchant */
    getDashboard: (merchantId: string) =>
      get<MerchantDashboardResponse>(`/merchant/${merchantId}/dashboard`),

    /** GET /merchant/:merchantId/transactions — Transações recentes do Merchant */
    getTransactions: (merchantId: string, params?: { limit?: number; page?: number }) =>
      get<MerchantDashboardTransaction[] | { data: MerchantDashboardTransaction[]; total?: number; page?: number; totalPages?: number }>(
        `/merchant/${merchantId}/transactions`,
        params as Record<string, string | number | undefined>,
      ),

    getApiKeys: () => get<unknown>('/merchant/api-keys'),

    generateApiKey: (data?: { storeName?: string }) =>
      post<unknown>('/merchant/api-keys/generate', data),

    /** DELETE /merchant/api-keys/:id — Eliminar uma chave API */
    deleteApiKey: (id: string) =>
      del<unknown>(`/merchant/api-keys/${id}`),

    getPaymentLinks: () => get<unknown>('/merchant/links'),

    createPaymentLink: (data: { amount: number; currency: string; description?: string }) =>
      post<unknown>('/merchant/links', data),

    /** GET /merchant/:merchantId/stores — Listar lojas/checkouts */
    getStores: (merchantId: string) =>
      get<MerchantStore[]>(`/merchant/${merchantId}/stores`),

    /** POST /merchant/:merchantId/stores — Criar nova loja/checkout */
    createStore: (merchantId: string, data: { name: string; primaryColor?: string; successUrl?: string; webhookUrl?: string }) =>
      post<MerchantStore>(`/merchant/${merchantId}/stores`, data),
  },

  // ── TICKETS (Admin/Operator) ──
  tickets: {
    list: (params?: { status?: string; type?: string; page?: number }) =>
      get<unknown>('/tickets', params as Record<string, string | number | undefined>),

    update: (id: string, data: { status: string; resolutionNotes?: string }) =>
      patch<unknown>(`/tickets/${id}`, data),
  },

  // ── ORGANIZATIONS (Admin) ──
  organizations: {
    list: () => get<unknown>('/organizations'),
  },

  // ── USERS (Admin) ──
  users: {
    list: (params?: { page?: number }) =>
      get<unknown>('/users', params as Record<string, string | number | undefined>),
  },

  // ── DASHBOARD (dados agregados) ──
  dashboard: {
    getWallets: () => get<unknown>('/dashboard/wallets'),

    getTransactions: (params?: { limit?: number }) =>
      get<unknown>('/dashboard/transactions', params as Record<string, string | number | undefined>),
  },
};

export default xpApi;