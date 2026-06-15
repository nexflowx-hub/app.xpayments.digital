import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BalanceOverviewCards } from "@/components/dashboard/balance-overview-cards";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />

        <main className="flex-1 px-4 py-6 md:px-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time balance across all settlement states. All values in USDT.
            </p>
          </div>

          <Separator className="mb-6 bg-border" />

          {/* Balance Overview — 4 Cards */}
          <BalanceOverviewCards />

          {/* Placeholder for future dashboard content */}
          <div className="mt-8 rounded-xl border border-dashed border-border/50 p-8 text-center">
            <p className="text-sm text-muted-foreground/50">
              Transactions table & charts will be rendered here.
            </p>
          </div>
        </main>

        {/* Sticky Footer */}
        <footer className="mt-auto border-t border-border bg-background/60 px-4 py-3 backdrop-blur-sm md:px-6">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
            <span>© 2025 XPayments.Digital</span>
            <span>Settlement Engine v1.0.0</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}