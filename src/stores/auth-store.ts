import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UserRole,
  RolePermissions,
  AuthUser as AuthUserType,
} from '@/types/xpayments';
import {
  setStoredToken,
  setStoredUser,
  clearStoredToken,
  clearStoredUser,
} from '@/lib/api/client';

// ============================================================
// XPAYMENTS CORE - Auth Store (Zustand)
// 
// RBAC: A role é lida do payload de autenticação (JWT).
// O backend distingue:
//   - OrgOperator (role = "operator") → Admins/Equipa interna
//   - User (role = "merchant") → Merchants/Lojistas
//   - User sem org (role = "customer") → Customer/Seller
//
// NÃO há role 'admin' hardcoded. Tudo vem do backend.
// ============================================================

// AuthUser re-exported from types — single source of truth
type AuthUser = AuthUserType;

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: AuthUser) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  getUserRole: () => string;
  isOperator: () => boolean;
  isMerchant: () => boolean;
}

// ── Role Labels ──
export const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  merchant: 'Merchant',
  super_merchant: 'Super Merchant',
  admin: 'Admin',
  operator: 'Operator',
};

// ── Role Permissions Matrix ──
// Operadores (OrgOperator) veem: Dashboard, Transações, Tickets
// Merchants (User + org) veem: Dashboard, Wallets, Depósitos, Swap, Levantamentos, KYC, Merchant tools
// Customers (User sem org) veem: Dashboard, Wallets, Depósitos, Swap, Levantamentos, KYC
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  customer: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: true,
    canSwap: true,
    canWithdraw: true,
    canViewTransactions: true,
    canGeneratePaymentLinks: false,
    canManageApiKeys: false,
    canConfigureCheckouts: false,
    canViewSubClients: false,
    canManageTickets: false,
    canApproveKyc: false,
    canConfigureFees: false,
    canManageOrganizations: false,
    canManageUsers: false,
  },
  merchant: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: true,
    canSwap: true,
    canWithdraw: true,
    canViewTransactions: true,
    canGeneratePaymentLinks: true,
    canManageApiKeys: true,
    canConfigureCheckouts: true,
    canViewSubClients: false,
    canManageTickets: false,
    canApproveKyc: false,
    canConfigureFees: false,
    canManageOrganizations: false,
    canManageUsers: false,
  },
  super_merchant: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: true,
    canSwap: true,
    canWithdraw: true,
    canViewTransactions: true,
    canGeneratePaymentLinks: true,
    canManageApiKeys: true,
    canConfigureCheckouts: true,
    canViewSubClients: true,
    canManageTickets: false,
    canApproveKyc: false,
    canConfigureFees: false,
    canManageOrganizations: false,
    canManageUsers: false,
  },
  admin: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: true,
    canSwap: true,
    canWithdraw: true,
    canViewTransactions: true,
    canGeneratePaymentLinks: true,
    canManageApiKeys: true,
    canConfigureCheckouts: true,
    canViewSubClients: true,
    canManageTickets: true,
    canApproveKyc: true,
    canConfigureFees: true,
    canManageOrganizations: true,
    canManageUsers: true,
  },
  operator: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: false,
    canSwap: false,
    canWithdraw: false,
    canViewTransactions: true,
    canGeneratePaymentLinks: false,
    canManageApiKeys: false,
    canConfigureCheckouts: false,
    canViewSubClients: true,
    canManageTickets: true,
    canApproveKyc: true,
    canConfigureFees: true,
    canManageOrganizations: true,
    canManageUsers: true,
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (token: string, user: AuthUser) => {
        setStoredToken(token);
        setStoredUser(user);
        set({ token, user, isAuthenticated: true });
      },

      updateUser: (updates: Partial<AuthUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, ...updates };
          setStoredUser(updated);
          set({ user: updated });
        }
      },

      logout: () => {
        clearStoredToken();
        clearStoredUser();
        set({ token: null, user: null, isAuthenticated: false });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      getUserRole: (): string => {
        return get().user?.role || 'customer';
      },

      isOperator: (): boolean => {
        const user = get().user;
        return user?.role === 'operator';
      },

      isMerchant: (): boolean => {
        const user = get().user;
        return user?.role === 'merchant' || user?.role === 'super_merchant' || user?.role === 'customer';
      },
    }),
    {
      name: 'xp-auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return sessionStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
