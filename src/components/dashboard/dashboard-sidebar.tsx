"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Settings,
  HelpCircle,
  CreditCard,
  ChevronDown,
  LogOut,
  Zap,
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

const mainNav = [
  { title: "Overview", icon: LayoutDashboard, active: true },
  { title: "Transactions", icon: ArrowDownLeft, badge: "12" },
  { title: "Payouts", icon: ArrowUpRight },
  { title: "Payment Links", icon: CreditCard },
  { title: "Compliance", icon: Shield },
];

const bottomNav = [
  { title: "Settings", icon: Settings },
  { title: "Help & Support", icon: HelpCircle },
];

export function DashboardSidebar() {
  const [activeItem, setActiveItem] = useState("Overview");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-usdt/15">
            <Zap className="h-4 w-4 text-usdt" />
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
      </SidebarHeader>

      <SidebarSeparator className="mx-3 w-auto" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeItem === item.title}
                    onClick={() => setActiveItem(item.title)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeItem === item.title}
                    onClick={() => setActiveItem(item.title)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
                <AvatarFallback className="bg-usdt/15 text-xs font-bold text-usdt">
                  MC
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 items-center justify-between group-data-[collapsible=icon]:hidden">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-foreground">
                    Merchant Co.
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    merchant@example.com
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
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-sm text-destructive focus:bg-destructive/10 focus:text-destructive">
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