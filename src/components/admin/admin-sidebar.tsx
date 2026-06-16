"use client";

import Image from "next/image";
import {
  Users,
  Activity,
  CheckCircle,
  Sliders,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  ShieldAlert,
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
import { useNavigationStore, type AdminView } from "@/lib/navigation-store";
import { useAuthStore } from "@/lib/auth-store";

// ─── Nav definitions ─────────────────────────────────────────────────────────

const operationsNav: {
  title: AdminView;
  icon: React.ElementType;
  badge?: string;
}[] = [
  { title: "Overview", icon: Users },
  { title: "Transactions", icon: Activity, badge: "247" },
  { title: "Payout Approvals", icon: CheckCircle, badge: "8" },
  { title: "Payment Routing", icon: Sliders },
];

const supportNav: {
  title: AdminView;
  icon: React.ElementType;
  badge?: string;
}[] = [
  { title: "Support Tickets", icon: MessageSquare, badge: "3" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminSidebar() {
  const { activeAdminView, setActiveAdminView } = useNavigationStore();
  const { user, logout } = useAuthStore();

  const initials = user?.storeName
    ? user.storeName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-auto items-center justify-center overflow-hidden">
            <Image
              src="/logo-xpayments.png"
              alt="XPayments"
              width={32}
              height={28}
              className="h-7 w-auto object-contain brightness-0 invert"
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-foreground">
              XPayments
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Digital
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center group-data-[collapsible=icon]:hidden">
          <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
            <ShieldAlert className="h-3 w-3" />
            Restricted
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 w-auto" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeAdminView === item.title}
                    onClick={() => setActiveAdminView(item.title)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/15 px-1.5 text-[10px] font-semibold text-red-400 group-data-[collapsible=icon]:hidden">
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
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeAdminView === item.title}
                    onClick={() => setActiveAdminView(item.title)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/15 px-1.5 text-[10px] font-semibold text-red-400 group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
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
                <AvatarFallback className="bg-red-500/15 text-xs font-bold text-red-400">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 items-center justify-between group-data-[collapsible=icon]:hidden">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-foreground">
                    {user?.storeName ?? "Admin Operator"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {user?.email ?? "admin@xpayments.digital"}
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
              Admin Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={logout}
              className="text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}