import { create } from "zustand";

// ─── Navigation Store ─────────────────────────────────────────────────────────
// Lifted sidebar state so the page can reactively switch views.

export type DashboardView =
  | "Overview"
  | "Transactions"
  | "Payouts"
  | "Payment Links"
  | "Compliance"
  | "Developers / API"
  | "Settings / Billing"
  | "Support & Upgrades"
  | "Settings"
  | "Help & Support";

export type AdminView =
  | "Overview"
  | "Transactions"
  | "Payout Approvals"
  | "Gateway Config"
  | "Support Tickets";

interface NavigationState {
  activeView: DashboardView;
  activeAdminView: AdminView;
  setActiveView: (view: DashboardView) => void;
  setActiveAdminView: (view: AdminView) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: "Overview",
  activeAdminView: "Overview",
  setActiveView: (view) => set({ activeView: view }),
  setActiveAdminView: (view) => set({ activeAdminView: view }),
}));