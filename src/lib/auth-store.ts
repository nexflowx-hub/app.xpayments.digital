// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Auth Store (Zustand)
// ─────────────────────────────────────────────────────────────────────────────
// Manages authentication state, token persistence, and view routing.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, RegisterResponse, LoginResponse, AdminLoginResponse } from "./auth-schemas";
import { xpaymentsApi } from "./api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthView =
  | "login"
  | "register"
  | "admin-login"
  | "dashboard"
  | "admin-dashboard";

export interface AuthState {
  // State
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  secretKey: string | null; // Only available once after registration
  authView: AuthView;

  // Actions
  setAuthView: (view: AuthView) => void;
  setMerchant: (token: string, user: AuthUser) => void;
  setAdmin: (token: string, user: AuthUser) => void;
  setRegistrationData: (token: string, user: AuthUser, secretKey: string) => void;
  clearSecretKey: () => void;
  logout: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      secretKey: null,
      authView: "login",

      // Navigate between auth views
      setAuthView: (view) => set({ authView: view }),

      // After merchant login
      setMerchant: (token, user) =>
        set({
          isAuthenticated: true,
          token,
          user: { ...user, role: "merchant" },
          authView: "dashboard",
        }),

      // After admin login
      setAdmin: (token, user) =>
        set({
          isAuthenticated: true,
          token,
          user: { ...user, role: "admin" },
          authView: "admin-dashboard",
        }),

      // After registration — includes secretKey (shown once)
      setRegistrationData: (token, user, secretKey) =>
        set({
          isAuthenticated: true,
          token,
          user: { ...user, role: "merchant" },
          secretKey,
          authView: "dashboard",
        }),

      // Clear secret key after user has seen/copied it
      clearSecretKey: () => set({ secretKey: null }),

      // Logout — clear everything
      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          secretKey: null,
          authView: "login",
        }),
    }),
    {
      name: "xpayments-auth",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        // SSR fallback (no-op)
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        authView: state.authView,
        // secretKey is NOT persisted — shown once only
      }),
    }
  )
);