'use client';

import React from 'react';
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
  {
    page: 'transactions',
    label: 'Transações',
    icon: Receipt,
    roles: ['customer', 'merchant', 'super_merchant', 'operator'],
    permission: 'canViewTransactions',
  },

  // KYC – Customer/Merchant
  {
    page: 'kyc',
    label: 'Verificação KYC',
    icon: ShieldCheck,
    roles: ['customer', 'merchant', 'super_merchant'],
  },

  // Merchant section – apenas Merchant/Super Merchant
  {
    page: 'merchant-links',
    label: 'Links de Pagamento',
    icon: Link,
    roles: ['merchant', 'super_merchant'],
    permission: 'canGeneratePaymentLinks',
  },
  {
    page: 'merchant-api-keys',
    label: 'API Keys',
    icon: Key,
    roles: ['merchant', 'super_merchant'],
    permission: 'canManageApiKeys',
  },
  {
    page: 'merchant-checkouts',
    label: 'Checkouts',
    icon: ShoppingCart,
    roles: ['merchant', 'super_merchant'],
    permission: 'canConfigureCheckouts',
  },

  // Admin section – APENAS Operator (OrgOperator)
  // Merchants (User) NÃO vêem "Aprovações" nem "Liquidez"
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

type SectionKey = 'dashboard' | 'wallet' | 'kyc' | 'merchant' | 'admin';

const SECTION_ORDER: SectionKey[] = ['dashboard', 'wallet', 'kyc', 'merchant', 'admin'];

const SECTION_MAP: Record<SectionKey, NavPage[]> = {
  dashboard: ['dashboard'],
  wallet: ['wallets', 'deposits', 'swaps', 'payouts', 'transactions'],
  kyc: ['kyc'],
  merchant: ['merchant-links', 'merchant-api-keys', 'merchant-checkouts'],
  admin: ['admin-tickets', 'admin-fees', 'admin-users', 'admin-organizations'],
};

const SECTION_LABELS: Record<SectionKey, string> = {
  dashboard: '',
  wallet: 'WALLET',
  kyc: 'VERIFICAÇÃO',
  merchant: 'MERCHANT',
  admin: 'ADMIN',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function XPaymentsSidebar() {
  const { currentPage, sidebarOpen, setPage, toggleSidebar } = useNavStore();
  const { user, logout } = useAuthStore();
  const role = user?.role ?? 'customer';

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
        'relative flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ease-in-out select-none',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="flex items-center justify-center size-8 shrink-0">
          <img src="/logo.png" alt="XPayments" className="size-8 rounded-full" />
        </div>
        {sidebarOpen && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm font-semibold text-zinc-100 whitespace-nowrap tracking-tight">
              XPayments.Digital
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 bg-zinc-800 text-zinc-400 border-zinc-700"
            >
              v2.0
            </Badge>
          </div>
        )}
      </div>

      <Separator className="bg-zinc-800" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2" role="navigation" aria-label="Main navigation">
          {visibleSections.map((section) => {
            const pages = SECTION_MAP[section];
            const sectionItems = pages
              .map((p) => itemLookup.get(p))
              .filter(Boolean) as NavItemDef[];

            if (sectionItems.length === 0) return null;

            return (
              <div key={section} className="flex flex-col gap-1">
                {sidebarOpen && SECTION_LABELS[section] && (
                  <div className="pt-3 pb-1 px-3">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                      {SECTION_LABELS[section]}
                    </span>
                  </div>
                )}

                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;

                  const button = (
                    <button
                      key={item.page}
                      onClick={() => setPage(item.page)}
                      className={cn(
                        'group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-neon-500/20 text-neon-400 border-l-2 border-neon-400 pl-[10px]'
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border-l-2 border-transparent pl-[10px]',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        className={cn(
                          'size-5 shrink-0 transition-colors',
                          isActive
                            ? 'text-neon-400'
                            : 'text-zinc-500 group-hover:text-zinc-300',
                        )}
                      />
                      {sidebarOpen && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  );

                  if (!sidebarOpen) {
                    return (
                      <Tooltip key={item.page} delayDuration={0}>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={8}
                          className="bg-zinc-800 text-zinc-100 border-zinc-700 text-xs"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return button;
                })}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <Separator className="bg-zinc-800" />
      <div className="flex justify-center py-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
      </div>

      {/* Footer: user info + logout */}
      <div className="shrink-0 border-t border-zinc-800 px-3 py-3">
        {sidebarOpen ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-neon-500/20 text-neon-400 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-sm font-medium text-zinc-200 truncate">
                  {user?.fullName || user?.nickname || 'Utilizador'}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 w-fit border-zinc-700 text-zinc-400 bg-zinc-900"
                >
                  {ROLE_LABELS[role] || role}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 h-8 text-xs"
            >
              <LogOut className="size-4" />
              Encerrar Sessão
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-neon-500/20 text-neon-400 text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                  aria-label="Encerrar Sessão"
                >
                  <LogOut className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={8}
                className="bg-zinc-800 text-zinc-100 border-zinc-700 text-xs"
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
