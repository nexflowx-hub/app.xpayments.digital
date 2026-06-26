'use client';

import React, { useState } from 'react';
import { useNavStore, type NavPage } from '@/stores/nav-store';
import { useAuthStore, ROLE_LABELS, ROLE_PERMISSIONS } from '@/stores/auth-store';
import type { UserRole } from '@/types/xpayments';
import type { RolePermissions } from '@/types/xpayments';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Shield,
  Wallet,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Receipt,
  ShieldCheck,
  Link,
  Key,
  ShoppingCart,
  Ticket,
  Users,
  Calculator,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Nav item definition
// ---------------------------------------------------------------------------

interface NavItemDef {
  page: NavPage;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  permission?: keyof RolePermissions;
}

const NAV_ITEMS: NavItemDef[] = [
  // Super Admin Dashboard – APENAS admin
  {
    page: 'admin-dashboard',
    label: 'Admin Overview',
    icon: Shield,
    roles: ['admin'],
  },

  // Dashboard – todos
  {
    page: 'dashboard',
    label: 'Painel',
    icon: LayoutDashboard,
    roles: ['customer', 'merchant', 'super_merchant', 'operator'],
  },

  // Wallet section – Customer/Merchant
  {
    page: 'wallets',
    label: 'Carteiras',
    icon: Wallet,
    roles: ['customer', 'merchant', 'super_merchant'],
    permission: 'canViewWallets',
  },
  {
    page: 'deposits',
    label: 'Depositar',
    icon: ArrowDownLeft,
    roles: ['customer', 'merchant', 'super_merchant'],
    permission: 'canDeposit',
  },
  {
    page: 'swaps',
    label: 'Swap',
    icon: ArrowLeftRight,
    roles: ['customer', 'merchant', 'super_merchant'],
    permission: 'canSwap',
  },
  {
    page: 'payouts',
    label: 'Payouts',
    icon: ArrowUpRight,
    roles: ['customer', 'merchant', 'super_merchant'],
    permission: 'canWithdraw',
  },

  // KYC
  {
    page: 'kyc',
    label: 'Verificação KYC',
    icon: ShieldCheck,
    roles: ['customer', 'merchant', 'super_merchant'],
  },

  // ── E-Commerce & Vendas (Mini-CRM) ──
  {
    page: 'transactions',
    label: 'Transações',
    icon: Receipt,
    roles: ['customer', 'merchant', 'super_merchant', 'operator'],
    permission: 'canViewTransactions',
  },
  {
    page: 'merchant-checkouts',
    label: 'Checkouts',
    icon: ShoppingCart,
    roles: ['merchant', 'super_merchant'],
    permission: 'canConfigureCheckouts',
  },
  {
    page: 'merchant-links',
    label: 'Links de Pagamento',
    icon: Link,
    roles: ['merchant', 'super_merchant'],
    permission: 'canGeneratePaymentLinks',
  },
  {
    page: 'merchant-catalog',
    label: 'Catálogo',
    icon: Package,
    roles: ['merchant', 'super_merchant'],
    permission: 'canConfigureCheckouts',
  },

  // ── Developers ──
  {
    page: 'merchant-api-keys',
    label: 'API Keys',
    icon: Key,
    roles: ['merchant', 'super_merchant'],
    permission: 'canManageApiKeys',
  },
  {
    page: 'merchant-api-docs',
    label: 'API Docs',
    icon: BookOpen,
    roles: ['merchant', 'super_merchant'],
  },

  // Admin section – APENAS Operator (OrgOperator)
  {
    page: 'admin-tickets',
    label: 'Aprovações',
    icon: Ticket,
    roles: ['operator'],
    permission: 'canManageTickets',
  },
  {
    page: 'admin-fees',
    label: 'Liquidez',
    icon: Calculator,
    roles: ['operator'],
    permission: 'canConfigureFees',
  },
  {
    page: 'admin-users',
    label: 'Utilizadores',
    icon: Users,
    roles: ['operator'],
    permission: 'canManageUsers',
  },
  {
    page: 'admin-organizations',
    label: 'Organizações',
    icon: Building2,
    roles: ['operator'],
    permission: 'canManageOrganizations',
  },
];

// ---------------------------------------------------------------------------
// Section grouping
// ---------------------------------------------------------------------------

type SectionKey = 'dashboard' | 'wallet' | 'kyc' | 'ecommerce' | 'developers' | 'admin';

const SECTION_ORDER: SectionKey[] = ['dashboard', 'wallet', 'kyc', 'ecommerce', 'developers', 'admin'];

const SECTION_MAP: Record<SectionKey, NavPage[]> = {
  dashboard: ['dashboard'],
  wallet: ['wallets', 'deposits', 'swaps', 'payouts'],
  kyc: ['kyc'],
  ecommerce: ['transactions', 'merchant-checkouts', 'merchant-links', 'merchant-catalog'],
  developers: ['merchant-api-keys', 'merchant-api-docs'],
  admin: ['admin-dashboard', 'admin-tickets', 'admin-fees', 'admin-users', 'admin-organizations'],
};

const SECTION_LABELS: Record<SectionKey, string> = {
  dashboard: '',
  wallet: 'WALLET',
  kyc: 'VERIFICAÇÃO',
  ecommerce: 'E-COMMERCE & VENDAS',
  developers: 'DEVELOPERS',
  admin: 'ADMIN',
};

const SECTION_ICONS: Partial<Record<SectionKey, React.ElementType>> = {
  wallet: Wallet,
  kyc: ShieldCheck,
  ecommerce: ShoppingCart,
  developers: Key,
  admin: Shield,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function XPaymentsSidebar() {
  const { currentPage, sidebarOpen, setPage, toggleSidebar } = useNavStore();
  const { user, logout } = useAuthStore();
  const role = user?.role ?? 'customer';

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<SectionKey>>(new Set());

  const toggleSection = (section: SectionKey) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // RBAC: filtra itens baseado na role E permissão
  const visibleItems = React.useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (!item.roles.includes(role)) return false;
        if (item.permission && !ROLE_PERMISSIONS[role]?.[item.permission]) return false;
        return true;
      }),
    [role],
  );

  const visibleSections = React.useMemo(() => {
    const visiblePages = new Set(visibleItems.map((i) => i.page));
    return SECTION_ORDER.filter((section) =>
      SECTION_MAP[section].some((p) => visiblePages.has(p)),
    );
  }, [visibleItems]);

  const itemLookup = React.useMemo(() => {
    const map = new Map<NavPage, NavItemDef>();
    for (const item of visibleItems) map.set(item.page, item);
    return map;
  }, [visibleItems]);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new CustomEvent('xp:logout'));
  };

  const initials = React.useMemo(() => {
    const name = user?.fullName || user?.nickname || '?';
    return name.slice(0, 2).toUpperCase();
  }, [user]);

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] select-none',
        sidebarOpen ? 'w-[260px]' : 'w-[68px]',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 shrink-0">
        <div className="flex items-center justify-center size-9 shrink-0 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <img src="/logo.png" alt="XPayments" className="size-6 rounded" />
        </div>
        {sidebarOpen && (
          <div className="flex items-center gap-2 overflow-hidden animate-fade-in">
            <span className="text-sm font-semibold text-zinc-100 whitespace-nowrap tracking-tight">
              XPayments
            </span>
            <Badge
              variant="secondary"
              className="text-[9px] px-1.5 py-0 h-4 bg-neon-500/10 text-neon-400 border-neon-500/20 font-medium"
            >
              v3.0
            </Badge>
          </div>
        )}
      </div>

      <Separator className="bg-white/[0.04]" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-1">
        <nav className="flex flex-col gap-0.5 px-2.5" role="navigation" aria-label="Main navigation">
          {visibleSections.map((section) => {
            const pages = SECTION_MAP[section];
            const sectionItems = pages
              .map((p) => itemLookup.get(p))
              .filter(Boolean) as NavItemDef[];

            if (sectionItems.length === 0) return null;

            const isCollapsed = collapsedSections.has(section);
            const hasLabel = !!SECTION_LABELS[section];
            const SectionIcon = SECTION_ICONS[section];
            const isSingleItem = sectionItems.length === 1 && !hasLabel;

            // For single-item sections without labels, render just the button directly
            if (isSingleItem && !sidebarOpen) {
              const item = sectionItems[0];
              const Icon = item.icon;
              const isActive = currentPage === item.page;

              const button = (
                <button
                  key={item.page}
                  onClick={() => setPage(item.page)}
                  className={cn(
                    'group relative flex items-center justify-center w-full rounded-lg py-2.5 transition-all duration-200',
                    isActive
                      ? 'text-neon-400 bg-neon-500/10 shadow-[0_0_12px_rgba(16,185,129,0.08)]'
                      : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn('size-[18px] shrink-0 transition-all duration-200')} />
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-neon-400" />
                  )}
                </button>
              );

              return (
                <Tooltip key={section} delayDuration={0}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="bg-zinc-800 text-zinc-100 border-zinc-700/80 text-xs rounded-lg px-3 py-1.5 shadow-xl"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={section} className="flex flex-col">
                {/* Section Header (clickable to collapse/expand on desktop) */}
                {sidebarOpen && hasLabel ? (
                  <button
                    onClick={() => toggleSection(section)}
                    className="flex items-center justify-between pt-4 pb-1.5 px-2.5 group cursor-pointer"
                    aria-expanded={!isCollapsed}
                  >
                    <div className="flex items-center gap-1.5">
                      {SectionIcon && (
                        <SectionIcon className="size-3 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                      )}
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600 group-hover:text-zinc-500 transition-colors">
                        {SECTION_LABELS[section]}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'size-3 text-zinc-600 transition-transform duration-200',
                        isCollapsed && '-rotate-90',
                      )}
                    />
                  </button>
                ) : (
                  !sidebarOpen && !isSingleItem && (
                    <div className="pt-3 pb-1">
                      <div className="w-6 h-px bg-zinc-800/60 mx-auto" />
                    </div>
                  )
                )}

                {/* Section Items */}
                <div
                  className={cn(
                    'flex flex-col gap-0.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    isCollapsed && sidebarOpen ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[500px] opacity-100',
                  )}
                >
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;

                    const button = (
                      <button
                        key={item.page}
                        onClick={() => setPage(item.page)}
                        className={cn(
                          'group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
                          isActive
                            ? 'text-neon-400 bg-neon-500/10 shadow-[0_0_12px_rgba(16,185,129,0.08)]'
                            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-neon-400" />
                        )}
                        <Icon
                          className={cn(
                            'size-[18px] shrink-0 transition-all duration-200',
                            isActive
                              ? 'text-neon-400'
                              : 'text-zinc-500 group-hover:text-zinc-300',
                          )}
                        />
                        {sidebarOpen && (
                          <span className="truncate transition-colors duration-150">{item.label}</span>
                        )}
                      </button>
                    );

                    if (!sidebarOpen) {
                      return (
                        <Tooltip key={item.page} delayDuration={0}>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            sideOffset={12}
                            className="bg-zinc-800 text-zinc-100 border-zinc-700/80 text-xs rounded-lg px-3 py-1.5 shadow-xl"
                          >
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return button;
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse toggle — desktop only (mobile uses overlay + bottom nav) */}
      <Separator className="bg-white/[0.04] hidden md:block" />
      <div className="hidden md:flex justify-center py-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] rounded-lg transition-colors duration-200"
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </Button>
      </div>

      {/* Footer: user info + logout */}
      <div className="shrink-0 border-t border-white/[0.04] px-3 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
        {sidebarOpen ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <Avatar className="size-9 shrink-0 ring-2 ring-white/[0.06]">
                  <AvatarFallback className="bg-neon-500/10 text-neon-400 text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
              </div>
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-[13px] font-medium text-zinc-200 truncate">
                  {user?.fullName || user?.nickname || 'Utilizador'}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 w-fit border-zinc-700/60 text-zinc-500 bg-zinc-900/80 font-medium"
                >
                  {ROLE_LABELS[role] || role}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 text-xs rounded-lg transition-colors duration-200"
            >
              <LogOut className="size-3.5" />
              Encerrar Sessão
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar className="size-8 ring-2 ring-white/[0.06]">
                <AvatarFallback className="bg-neon-500/10 text-neon-400 text-[10px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
            </div>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                  aria-label="Encerrar Sessão"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={12}
                className="bg-zinc-800 text-zinc-100 border-zinc-700/80 text-xs rounded-lg px-3 py-1.5 shadow-xl"
              >
                Encerrar Sessão
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}

export default XPaymentsSidebar;