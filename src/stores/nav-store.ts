'use client';

import { create } from 'zustand';

export type NavPage =
  | 'admin-dashboard'
  | 'dashboard'
  | 'wallets'
  | 'deposits'
  | 'swaps'
  | 'payouts'
  | 'transactions'
  | 'kyc'
  | 'admin-tickets'
  | 'admin-users'
  | 'admin-fees'
  | 'admin-organizations'
  | 'merchant-links'
  | 'merchant-api-keys'
  | 'merchant-checkouts';

interface NavState {
  currentPage: NavPage;
  sidebarOpen: boolean;
  setPage: (page: NavPage) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useNavStore = create<NavState>((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
