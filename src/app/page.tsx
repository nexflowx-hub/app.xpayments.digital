'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import XpAiChat from '@/components/ai/xp-ai-chat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
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

// ── Scroll-to-top / bottom threshold (px from edge) ──
const SCROLL_THRESHOLD = 60;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { currentPage, sidebarOpen, toggleSidebar, setPage } = useNavStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // ── Track scroll position to show/hide arrow buttons + navbar opacity ──
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const y = el.scrollTop;
    setCanScrollUp(y > SCROLL_THRESHOLD);
    setCanScrollDown(y + el.clientHeight < el.scrollHeight - SCROLL_THRESHOLD);
    setScrolled(y > 8);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    // Also listen to resize to recompute
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [currentPage, updateScrollState]);

  // Reset scroll position when page changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = 0;
  }, [currentPage]);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

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
        {/* ── Top Navigation Bar ── */}
        <header
          className={cn(
            'flex items-center justify-between h-14 px-4 sm:px-6 shrink-0 z-30',
            'border-b transition-all duration-500 ease-out',
            scrolled
              ? 'border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,0.3)]'
              : 'border-transparent bg-transparent',
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile: always show menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMobile}
              className="md:hidden h-9 w-9 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </Button>
            {/* Desktop: show menu button only when sidebar is collapsed */}
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:inline-flex h-8 w-8 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] shrink-0" aria-label="Abrir menu">
                <Menu className="size-4" />
              </Button>
            )}
            <h1 className="text-sm font-semibold text-zinc-200 truncate tracking-tight">{title}</h1>
          </div>

          {/* ── Right side: scroll controls + version ── */}
          <div className="flex items-center gap-1.5">
            {/* Scroll to Top */}
            {canScrollUp && (
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollToTop}
                className="h-8 w-8 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] rounded-lg transition-all duration-200"
                aria-label="Voltar ao topo"
              >
                <ArrowUp className="size-3.5" />
              </Button>
            )}
            {/* Scroll to Bottom */}
            {canScrollDown && (
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollToBottom}
                className="h-8 w-8 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] rounded-lg transition-all duration-200"
                aria-label="Ir para o fundo"
              >
                <ArrowDown className="size-3.5" />
              </Button>
            )}
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-2 py-0 h-5 border-zinc-700/60 text-zinc-500 bg-zinc-900/60 font-medium">
              XPayments v3.0
            </Badge>
          </div>
        </header>

        {/* ── Scrollable Content Area ── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div key={currentPage} className="p-4 sm:p-6 lg:p-8 animate-page-enter">
            <PageErrorBoundary>
              <Page />
            </PageErrorBoundary>
          </div>
        </div>
      </main>

      {/* ── AI Chat Widget (authenticated only) ── */}
      <XpAiChat />
    </div>
  );
}