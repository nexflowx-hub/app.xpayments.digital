import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError, PayoutRequest, DepositProofRequest } from '@/types/xpayments';

// ============================================================
// XPAYMENTS.DIGITAL - API Client (Axios com JWT Interceptors)
// 
// REGRA DE OURO: A variável NEXT_PUBLIC_API_URL já inclui /api/v1
// Ex: https://api.xpayments.digital/api/v1
// As rotas são concatenadas diretamente a partir daqui.
// NUNCA usar 'localhost' hardcoded.
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

if (!API_BASE_URL) {
  console.warn(
    '[XPayments] NEXT_PUBLIC_API_URL não está definida. ' +
    'As chamadas à API irão falhar. Defina no .env ou na Vercel.'
  );
}

const xpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// --- Request Interceptor: Injeta JWT automaticamente ---
xpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = getStoredToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Trata erros de auth globalmente ---
xpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        clearStoredToken();
        clearStoredUser();
        window.dispatchEvent(new CustomEvent('xp:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// --- Helpers de Armazenamento Seguro ---

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

// ============================================================
// API Modules
// Todas as rotas são relativas a NEXT_PUBLIC_API_URL (/api/v1)
// O backend devolve respostas no formato { success: boolean, data: T }
// ============================================================

export const xpApi = {
  // ── AUTH ──
  auth: {
    login: async (data: { email?: string; password: string }) => {
      const res = await xpClient.post('/auth/login', data);
      // Our API wraps responses: { success, data: { merchantId, token, user } }
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data; // { merchantId, token, user }
      }
      return payload;
    },
    register: async (data: { email: string; password: string; storeName?: string }) => {
      const res = await xpClient.post('/auth/register', data);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    me: async () => {
      const res = await xpClient.get('/auth/me');
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── PUBLIC (sem autenticação) ──
  public: {
    // Taxas de câmbio reais para o motor de swap
    getRates: async () => {
      const res = await xpClient.get('/public/rates');
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── WALLETS ──
  wallets: {
    list: async () => {
      const res = await xpClient.get('/wallets');
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    getById: async (id: string) => {
      const res = await xpClient.get(`/wallets/${id}`);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── TRANSACTIONS ──
  transactions: {
    list: async (params?: { walletId?: string; type?: string; status?: string; page?: number; pageSize?: number }) => {
      const res = await xpClient.get('/transactions', { params });
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── DEPOSITS (IN) ──
  deposits: {
    create: async (data: { walletId: string; currency: string; amount: number }) => {
      const res = await xpClient.post('/deposits', data);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    submitProof: async (data: DepositProofRequest) => {
      const res = await xpClient.post(`/deposits/${data.depositId}/proof`, {
        proofType: data.proofType,
        proofValue: data.proofValue,
      });
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── SWAPS ──
  swaps: {
    execute: async (data: { fromWalletId: string; toWalletId: string; amount: number }) => {
      const res = await xpClient.post('/swaps', data);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── PAYOUTS (OUT) ──
  payouts: {
    create: async (data: PayoutRequest) => {
      const res = await xpClient.post('/payouts', data);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── KYC ──
  kyc: {
    getProfile: async () => {
      const res = await xpClient.get('/kyc/profile');
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    upgrade: async (data: { tier: string; data: Record<string, unknown> }) => {
      const res = await xpClient.post('/kyc/upgrade', data);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── MERCHANT: API Keys (S2S) ──
  merchant: {
    getApiKeys: async () => {
      const res = await xpClient.get('/merchant/api-keys');
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    generateApiKey: async (data?: { storeName?: string }) => {
      const res = await xpClient.post('/merchant/api-keys/generate', data);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    getPaymentLinks: async () => {
      const res = await xpClient.get('/merchant/links');
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    createPaymentLink: async (data: { amount: number; currency: string; description?: string }) => {
      const res = await xpClient.post('/merchant/links', data);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── TICKETS (Admin/Operator) ──
  tickets: {
    list: async (params?: { status?: string; type?: string; page?: number }) => {
      const res = await xpClient.get('/tickets', { params });
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    update: async (id: string, data: { status: string; resolutionNotes?: string }) => {
      const res = await xpClient.patch(`/tickets/${id}`, data);
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── ORGANIZATIONS (Admin) ──
  organizations: {
    list: async () => {
      const res = await xpClient.get('/organizations');
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── USERS (Admin) ──
  users: {
    list: async (params?: { page?: number }) => {
      const res = await xpClient.get('/users', { params });
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },

  // ── DASHBOARD (dados agregados) ──
  // O backend devolve { success: boolean, data: [...] }
  dashboard: {
    getWallets: async () => {
      const res = await xpClient.get('/dashboard/wallets');
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
    getTransactions: async (params?: { limit?: number }) => {
      const res = await xpClient.get('/dashboard/transactions', { params });
      const payload = res.data;
      if (payload?.success && payload?.data) {
        return payload.data;
      }
      return payload;
    },
  },
};

export default xpClient;
