"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MoreHorizontal,
  ChevronDown,
  ShieldAlert,
  Ban,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Merchant {
  id: string;
  storeName: string;
  email: string;
  tierLevel: "A" | "B" | "C";
  status: "active" | "blocked" | "pending";
  balance: number;
  createdAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockMerchants: Merchant[] = [
  { id: "1", storeName: "CryptoVault Store", email: "admin@cryptovault.io", tierLevel: "A", status: "active", balance: 48250.75, createdAt: "2025-01-15T10:30:00Z" },
  { id: "2", storeName: "NovaPay Gaming", email: "ops@novapay.gg", tierLevel: "B", status: "active", balance: 12340.50, createdAt: "2025-02-20T14:00:00Z" },
  { id: "3", storeName: "ForexSignals Pro", email: "support@forexsignals.com", tierLevel: "C", status: "active", balance: 892.30, createdAt: "2025-03-10T09:15:00Z" },
  { id: "4", storeName: "VPN Tunnel Master", email: "hello@vpntunnel.io", tierLevel: "B", status: "blocked", balance: 0, createdAt: "2025-04-01T16:45:00Z" },
  { id: "5", storeName: "Digital Gold Trading", email: "info@dgt.com", tierLevel: "A", status: "active", balance: 156780.00, createdAt: "2024-12-05T08:00:00Z" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const usdtFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function tierBadge(tier: Merchant["tierLevel"]) {
  switch (tier) {
    case "A":
      return (
        <Badge variant="secondary" className="bg-usdt/15 text-usdt border-0 text-xs font-semibold">
          Tier A
        </Badge>
      );
    case "B":
      return (
        <Badge variant="secondary" className="bg-pending/15 text-pending border-0 text-xs font-semibold">
          Tier B
        </Badge>
      );
    case "C":
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-xs font-semibold">
          Tier C
        </Badge>
      );
  }
}

function statusBadge(status: Merchant["status"]) {
  switch (status) {
    case "active":
      return (
        <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 border-0 text-xs font-semibold">
          Active
        </Badge>
      );
    case "blocked":
      return (
        <Badge variant="secondary" className="bg-red-500/15 text-red-400 border-0 text-xs font-semibold">
          Blocked
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 border-0 text-xs font-semibold">
          Pending
        </Badge>
      );
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminOverview() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return mockMerchants;
    const q = search.toLowerCase();
    return mockMerchants.filter(
      (m) =>
        m.storeName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Merchants Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and monitor all registered merchants
            </p>
          </div>
          <Badge variant="secondary" className="bg-surface-raised text-foreground border border-border px-2.5 py-0.5 text-xs font-semibold tabular-nums">
            Total Merchants: {mockMerchants.length}
          </Badge>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-surface border-border pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Store Name
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Email
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Tier Level
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold text-right">
                  Balance
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Created At
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    No merchants found matching &quot;{search}&quot;
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((merchant) => (
                  <TableRow
                    key={merchant.id}
                    className="border-border transition-colors hover:bg-surface-raised"
                  >
                    {/* Store Name */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border border-border">
                          <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                            {getInitials(merchant.storeName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">
                          {merchant.storeName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {merchant.email}
                      </span>
                    </TableCell>

                    {/* Tier */}
                    <TableCell>{tierBadge(merchant.tierLevel)}</TableCell>

                    {/* Status */}
                    <TableCell>{statusBadge(merchant.status)}</TableCell>

                    {/* Balance */}
                    <TableCell className="text-right">
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        {usdtFormatter.format(merchant.balance)}
                      </span>
                    </TableCell>

                    {/* Created At */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(merchant.createdAt)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-popover border-border"
                        >
                          {/* Change Tier */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="text-sm text-foreground focus:bg-accent focus:text-accent-foreground">
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Change Tier
                              <ChevronDown className="ml-auto h-3 w-3" />
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="bg-popover border-border">
                              <DropdownMenuItem className="text-sm text-usdt focus:bg-usdt/10 focus:text-usdt">
                                Tier A
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-sm text-pending focus:bg-pending/10 focus:text-pending">
                                Tier B
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-sm text-muted-foreground focus:bg-accent focus:text-accent-foreground">
                                Tier C
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator className="bg-border" />

                          {/* Block Account */}
                          <DropdownMenuItem className="text-sm text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Ban className="mr-2 h-4 w-4" />
                            Block Account
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-border" />

                          {/* View Details (disabled) */}
                          <DropdownMenuItem
                            disabled
                            className="text-sm text-muted-foreground"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}