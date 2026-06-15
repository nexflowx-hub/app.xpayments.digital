"use client";

import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      <Separator orientation="vertical" className="h-5 bg-border" />

      {/* Search */}
      <div className="relative hidden flex-1 md:flex md:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search transactions, payouts..."
          className="h-8 w-full border-border bg-surface pl-9 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-usdt/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Environment badge */}
        <Badge
          variant="outline"
          className="hidden border-usdt/20 bg-usdt/5 text-[10px] font-semibold uppercase tracking-wider text-usdt sm:inline-flex"
        >
          Live
        </Badge>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-usdt text-[9px] font-bold text-background">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}