'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useNavStore } from '@/stores/nav-store';
import { PageErrorBoundary } from '@/components/ui/page-error-boundary';
import XPaymentsLanding from '@/components/layout/xp-landing';
import XPaymentsSidebar from '@/components/layout/xp-sidebar';
import AdminDashboardPage from '@/components/dashboard/admin-dashboard-page';
import DashboardPage from '@/components/dashboard/dashboard-page';
import WalletsPage from '@/components/wallet/wallets-page';
import DepositsPage from '@/components/wallet/deposits-page';
import SwapsPage from '@/components/wallet/swaps-page';
import PayoutsPage from '@/components/wallet/payouts-page';
import TransactionsPage from '@/components/wallet/transactions-page';
import KycPage from '@/components/kyc/kyc-page';
import AdminTicketsPage from '@/components/dashboard/admin-tickets-page';
import AdminUsersPage from '@/components/dashboard/admin-users-page';
import AdminFeesPage from '@/components/dashboard/admin-fees-page';
import AdminOrganizationsPage from '@/components/dashboard/admin-organizations-page';
import MerchantLinksPage from '@/components/dashboard/merchant-links-page';
import MerchantApiKeysPage from '@/components/dashboard/merchant-api-keys-page';
import MerchantCheckoutsPage from '@/components/dashboard/merchant-checkouts-page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGES: Record<string, React.ComponentType> = {
  'admin-dashboard': AdminDashboardPage,
  dashboard: DashboardPage,
  wallets: WalletsPage,
  deposits: DepositsPage,
  swaps: SwapsPage,
  payouts: PayoutsPage,
  transactions: TransactionsPage,
  kyc: KycPage,
  'admin-tickets': AdminTicketsPage,
  'admin-users': AdminUsersPage,
  'admin-fees': AdminFeesPage,
  'admin-organizations': AdminOrganizationsPage,
  'merchant-links': MerchantLinksPage,
  'merchant-api-keys': MerchantApiKeysPage,
  'merchant-checkouts': MerchantCheckoutsPage,
};

const TITLES: Record<string, string> = {
  'admin-dashboard': 'Super Admin Overview',
  dashboard: 'Painel de Controle',
  wallets: 'Carteiras',
  deposits: 'Depositar',
  swaps: 'Swap',
  payouts: 'Payouts',
  transactions: 'Transações',
  kyc: 'Verificação KYC',
  'admin-tickets': 'Tickets / Operações',
  'admin-users': 'Utilizadores',
  'admin-fees': 'Taxas & Comissões',
  'admin-organizations': 'Organizações',
  'merchant-links': 'Links de Pagamento',
  'merchant-api-keys': 'API Keys',
  'merchant-checkouts': 'Checkouts',
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { currentPage, sidebarOpen, toggleSidebar, setPage } = useNavStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: client hydration guard
    setMounted(true);
  }, []);

  useEffect(() => {
    const onAuth = () => setPage('dashboard');
    const onLogout = () => setPage('dashboard');
    window.addEventListener('xp:authenticated', onAuth);
    window.addEventListener('xp:logout', onLogout);
    return () => {
      window.removeEventListener('xp:authenticated', onAuth);
      window.removeEventListener('xp:logout', onLogout);
    };
  }, [setPage]);

  // Close mobile menu when currentPage changes
  // eslint-disable-next-line react-hooks/set-state-in-effect -- sync UI overlay to navigation
  useEffect(() => { setMobileMenuOpen(false); }, [currentPage]);

  const handleToggleMobile = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0E1A]">
        <Loader2 className="h-8 w-8 animate-spin text-neon-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <XPaymentsLanding />;
  }

  const Page = PAGES[currentPage] || DashboardPage;
  const title = TITLES[currentPage] || 'Painel';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Mobile backdrop ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──
          - On mobile: absolute overlay, controlled by mobileMenuOpen
          - On md+: static flex child, controlled by sidebarOpen (collapsed/expanded)
      */}
      <div
        className={cn(
          'shrink-0 z-50 md:z-auto',
          'md:relative md:translate-x-0',
          mobileMenuOpen
            ? 'fixed inset-y-0 left-0 translate-x-0'
            : 'fixed inset-y-0 left-0 -translate-x-full',
        )}
      >
        <XPaymentsSidebar />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile: always show menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMobile}
              className="md:hidden h-9 w-9 text-zinc-400 hover:text-zinc-200"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </Button>
            {/* Desktop: show menu button only when sidebar is collapsed */}
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:inline-flex h-8 w-8 text-zinc-400 hover:text-zinc-200 shrink-0" aria-label="Abrir menu">
                <Menu className="size-4" />
              </Button>
            )}
            <h1 className="text-base font-semibold text-zinc-100 truncate">{title}</h1>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-2 py-0 h-5 border-zinc-700 text-zinc-500 bg-zinc-900">
            XPayments v2.0
          </Badge>
        </header>
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <PageErrorBoundary>
              <Page />
            </PageErrorBoundary>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}