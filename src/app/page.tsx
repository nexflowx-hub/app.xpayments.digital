"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Main Page (Auth-Aware Router)
// ─────────────────────────────────────────────────────────────────────────────
// This is the single user-visible route (/). It acts as a client-side router:
//   - Not authenticated → Auth screens (Login / Register / Admin Login)
//   - Merchant role → Merchant Dashboard with sidebar navigation
//   - Admin role → Admin Dashboard with admin sidebar navigation

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BalanceOverviewCards } from "@/components/dashboard/balance-overview-cards";
import { PaymentLinksView } from "@/components/dashboard/payment-links/payment-links-view";
import { DevelopersApiView } from "@/components/dashboard/views/developers-api-view";
import { SettingsBillingView } from "@/components/dashboard/views/settings-billing-view";
import { SupportUpgradesView } from "@/components/dashboard/views/support-upgrades-view";
import { CheckoutPreview } from "@/components/dashboard/views/checkout-preview";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminHeader } from "@/components/admin/admin-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Settings,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { useMerchantDashboard } from "@/hooks/use-merchant-dashboard";
import { useNavigationStore } from "@/lib/navigation-store";
import { useAuthStore } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";
import { AnimatedBackground } from "@/components/animated-background";
import type { DashboardView } from "@/lib/navigation-store";

// ─── Test Merchant UUID ──────────────────────────────────────────────────────

const MERCHANT_ID = "00000000-0000-0000-0000-000000000000";

// ─── View-to-i18n-key mapping ────────────────────────────────────────────────

const viewDisplayKeyMap: Record<string, string> = {
  Transactions: "nav.transactions",
  Payouts: "nav.payouts",
  Compliance: "nav.compliance",
  Settings: "nav.settings",
  "Help & Support": "nav.help_support",
};

// ─── Placeholder view for unimplemented pages ────────────────────────────────

function PlaceholderView({ view }: { view: string }) {
  const { t } = useT();

  const iconMap: Record<string, React.ElementType> = {
    Transactions: ArrowDownLeft,
    Payouts: ArrowUpRight,
    Compliance: Shield,
    Settings: Settings,
    "Help & Support": HelpCircle,
  };
  const Icon = iconMap[view] ?? LayoutDashboard;

  const displayText = viewDisplayKeyMap[view] ? t(viewDisplayKeyMap[view]) : view;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {displayText}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
          {t("placeholder.under_construction")}
        </p>
      </div>
      <Badge
        variant="outline"
        className="border-xblue/20 bg-xblue/5 text-[10px] font-semibold uppercase tracking-widest text-xblue"
      >
        {t("placeholder.coming_soon")}
      </Badge>
    </div>
  );
}

// ─── Admin Placeholder View ──────────────────────────────────────────────────

function AdminPlaceholderView({ view }: { view: string }) {
  const { t } = useT();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/5">
        <Shield className="h-6 w-6 text-red-400/50" />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {view}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
          {t("placeholder.under_construction")}
        </p>
      </div>
      <Badge
        variant="outline"
        className="border-red-500/20 bg-red-500/5 text-[10px] font-semibold uppercase tracking-widest text-red-400"
      >
        {t("placeholder.coming_soon")}
      </Badge>
    </div>
  );
}

// ─── Overview View (balances) ────────────────────────────────────────────────

function OverviewView() {
  const { t } = useT();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useMerchantDashboard({ merchantId: MERCHANT_ID });

  const lastSync = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {t("overview.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("overview.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
            <CreditCard className="h-3 w-3" />
            <span>{t("overview.synced")} {lastSync}</span>
            {isFetching && (
              <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-usdt/30 border-t-usdt" />
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* API Connected badge */}
      <div className="flex items-center gap-2 rounded-lg border border-xblue/10 bg-xblue/[0.03] px-4 py-2.5">
        <Badge
          variant="outline"
          className="border-xblue/20 bg-xblue/5 text-[9px] font-semibold uppercase tracking-widest text-xblue"
        >
          {t("overview.api_connected")}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          {t("overview.fetching_from")}{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-foreground/70">
            api.xpayments.digital
          </code>
        </span>
      </div>

      <BalanceOverviewCards
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
      />
    </div>
  );
}

// ─── Merchant Dashboard Router ───────────────────────────────────────────────

function MerchantDashboard() {
  const { activeView } = useNavigationStore();
  const { t } = useT();

  let viewContent: React.ReactNode;

  switch (activeView) {
    case "Overview":
      viewContent = <OverviewView />;
      break;
    case "Payment Links":
      viewContent = <PaymentLinksView />;
      break;
    case "Developers / API":
      viewContent = <DevelopersApiView />;
      break;
    case "Settings / Billing":
      viewContent = <SettingsBillingView />;
      break;
    case "Support & Upgrades":
      viewContent = <SupportUpgradesView />;
      break;
    case "Checkout Preview":
      viewContent = <CheckoutPreview />;
      break;
    default:
      viewContent = <PlaceholderView view={activeView} />;
      break;
  }

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="relative z-10 flex-1 px-4 py-6 md:px-6">{viewContent}</main>
        <footer className="mt-auto border-t border-border bg-background/60 px-4 py-3 backdrop-blur-sm md:px-6">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
            <span>© 2026 <span className="text-gradient-xpayments font-medium">XPayments</span>.Digital</span>
            <span>{t("footer.settlement_engine")}</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Admin Dashboard Router ──────────────────────────────────────────────────

function AdminDashboard() {
  const { activeAdminView } = useNavigationStore();
  const { t } = useT();

  let viewContent: React.ReactNode;

  switch (activeAdminView) {
    case "Overview":
      viewContent = <AdminOverview />;
      break;
    default:
      viewContent = <AdminPlaceholderView view={activeAdminView} />;
      break;
  }

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="relative z-10 flex-1 px-4 py-6 md:px-6">{viewContent}</main>
        <footer className="mt-auto border-t border-border bg-background/60 px-4 py-3 backdrop-blur-sm md:px-6">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
            <span>© 2026 <span className="text-gradient-xpayments font-medium">XPayments</span>.Digital — Admin Console</span>
            <span>{t("admin.all_actions_logged")}</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Auth Router ─────────────────────────────────────────────────────────────

function AuthRouter() {
  const { authView } = useAuthStore();
  const { t } = useT();

  switch (authView) {
    case "register":
      return (
        <AuthLayout variant="merchant" subtitle={t("auth.start_accepting")}>
          <RegisterForm />
        </AuthLayout>
      );
    case "admin-login":
      return (
        <AuthLayout
          variant="admin"
          subtitle={t("auth.admin_console_mfa")}
        >
          <AdminLoginForm />
        </AuthLayout>
      );
    case "login":
    default:
      return (
        <AuthLayout variant="merchant" subtitle={t("auth.high_risk_gateway")}>
          <LoginForm />
        </AuthLayout>
      );
  }
}

// ─── Main Page (Root Router) ─────────────────────────────────────────────────

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  // Not authenticated → show auth screens
  if (!isAuthenticated) {
    return <AuthRouter />;
  }

  // Admin → admin dashboard
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  // Merchant → merchant dashboard (default)
  return <MerchantDashboard />;
}