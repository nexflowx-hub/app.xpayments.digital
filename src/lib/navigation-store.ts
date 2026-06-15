import { create } from "zustand";

// ─── Navigation Store ─────────────────────────────────────────────────────────
// Lifted sidebar state so the page can reactively switch views.
// Replaces the local `useState` in DashboardSidebar.

export type DashboardView =
  | "Overview"
  | "Transactions"
  | "Payouts"
  | "Payment Links"
  | "Compliance"
  | "Settings"
  | "Help & Support";

interface NavigationState {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: "Payment Links", // default view for this sprint
  setActiveView: (view) => set({ activeView: view }),
}));