import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================
// XPAYMENTS CORE - BaaS Store (Zustand)
//
// Manages the current BaaS scope context for Account Managers.
// The scope determines which store's data is being viewed.
//
// The API client interceptor reads from sessionStorage key
// 'xp-baas-storage' → state.scope → X-Store-Id / X-User-Id headers.
// ============================================================

interface BaaSScope {
  storeId: string | null;
  storeName: string | null;
  userId: string | null;
}

interface BaaSState {
  scope: BaaSScope;
  setScope: (updates: Partial<BaaSScope>) => void;
  clearScope: () => void;
}

const INITIAL_SCOPE: BaaSScope = {
  storeId: null,
  storeName: null,
  userId: null,
};

export const useBaaSStore = create<BaaSState>()(
  persist(
    (set) => ({
      scope: { ...INITIAL_SCOPE },

      setScope: (updates: Partial<BaaSScope>) => {
        set((state) => ({
          scope: { ...state.scope, ...updates },
        }));
      },

      clearScope: () => {
        set({ scope: { ...INITIAL_SCOPE } });
      },
    }),
    {
      name: 'xp-baas-storage',
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
      partialize: (state) => ({ scope: state.scope }),
    }
  )
);
