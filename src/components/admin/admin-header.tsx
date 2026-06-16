"use client";

// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Admin Header
// ─────────────────────────────────────────────────────────────────────────────

import { ShieldAlert, Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-red-500/10 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      <Separator orientation="vertical" className="h-5 bg-border" />

      {/* Search */}
      <div className="relative hidden flex-1 md:flex md:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search merchants, transactions..."
          className="h-8 w-full border-border bg-surface pl-9 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-red-400/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Admin badge */}
        <Badge
          variant="outline"
          className="hidden border-red-500/20 bg-red-500/5 text-[10px] font-semibold uppercase tracking-wider text-red-400 sm:inline-flex items-center gap-1.5"
        >
          <ShieldAlert className="h-3 w-3" />
          Admin
        </Badge>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            5
          </span>
        </Button>
      </div>
    </header>
  );
}