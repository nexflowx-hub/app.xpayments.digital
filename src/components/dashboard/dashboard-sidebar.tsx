"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Merchant Dashboard Sidebar
// ─────────────────────────────────────────────────────────────────────────────
// Uses the official XPayments circular logo with dual neon accents.

import Image from "next/image";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Settings,
  HelpCircle,
  ChevronDown,
  LogOut,
  Link2,
  Code2,
  Wallet,
  Headphones,
  Eye,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigationStore, type DashboardView } from "@/lib/navigation-store";
import { useAuthStore } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";

// ─── Nav definitions ─────────────────────────────────────────────────────────

const mainNav: {
  title: DashboardView;
  displayKey: string;
  icon: React.ElementType;
  badge?: string;
}[] = [
  { title: "Overview", displayKey: "nav.overview", icon: LayoutDashboard },
  { title: "Transactions", displayKey: "nav.transactions", icon: ArrowDownLeft, badge: "12" },
  { title: "Payouts", displayKey: "nav.payouts", icon: ArrowUpRight },
  { title: "Payment Links", displayKey: "nav.payment_links", icon: Link2 },
  { title: "Compliance", displayKey: "nav.compliance", icon: Shield },
];

const toolsNav: { title: DashboardView; displayKey: string; icon: React.ElementType }[] = [
  { title: "Developers / API", displayKey: "nav.developers_api", icon: Code2 },
  { title: "Settings / Billing", displayKey: "nav.settings_billing", icon: Wallet },
  { title: "Support & Upgrades", displayKey: "nav.support_upgrades", icon: Headphones },
  { title: "Checkout Preview", displayKey: "nav.checkout_preview", icon: Eye },
];

const bottomNav: { title: DashboardView; displayKey: string; icon: React.ElementType }[] = [
  { title: "Settings", displayKey: "nav.settings", icon: Settings },
  { title: "Help & Support", displayKey: "nav.help_support", icon: HelpCircle },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const { activeView, setActiveView } = useNavigationStore();
  const { user, logout } = useAuthStore();
  const { t } = useT();

  const initials = user?.storeName
    ? user.storeName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "MC";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          {/* Official XPayments Circular Logo */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden glow-dual">
            <Image
              src="/logo-xpayments.png"
              alt="XPayments"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-gradient-xpayments">
              XPayments
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Digital
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 w-auto" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeView === item.title}
                    onClick={() => setActiveView(item.title)}
                    tooltip={t(item.displayKey)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.displayKey)}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-usdt/15 px-1.5 text-[10px] font-semibold text-usdt group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 w-auto" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            Ferramentas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeView === item.title}
                    onClick={() => setActiveView(item.title)}
                    tooltip={t(item.displayKey)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.displayKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 w-auto" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeView === item.title}
                    onClick={() => setActiveView(item.title)}
                    tooltip={t(item.displayKey)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.displayKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-3" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback className="bg-xblue/15 text-xs font-bold text-xblue">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 items-center justify-between group-data-[collapsible=icon]:hidden">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-foreground">
                    {user?.storeName ?? "Merchant Co."}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {user?.email ?? "merchant@example.com"}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56 bg-popover border-border"
          >
            <DropdownMenuItem className="text-sm text-foreground focus:bg-accent focus:text-accent-foreground">
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.account_settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={logout}
              className="text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}