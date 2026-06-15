"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ExternalLink,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PaymentLink, PaymentLinkStatus, PaymentLinkType } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string): string {
  return format(new Date(iso), "dd MMM yyyy");
}

const statusConfig: Record<
  PaymentLinkStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "border-usdt/20 bg-usdt/10 text-usdt hover:bg-usdt/15 hover:text-usdt",
  },
  expired: {
    label: "Expired",
    className:
      "border-pending/20 bg-pending/10 text-pending hover:bg-pending/15 hover:text-pending",
  },
  disabled: {
    label: "Disabled",
    className:
      "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
  },
};

const typeConfig: Record<PaymentLinkType, { label: string; className: string }> = {
  reusable: {
    label: "Permanent",
    className: "bg-white/[0.06] text-foreground",
  },
  single_use: {
    label: "Single Use",
    className: "bg-pending/10 text-pending",
  },
};

// ─── Column Definitions ───────────────────────────────────────────────────────

export const columns: ColumnDef<PaymentLink>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-7 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const link = row.original;
      return (
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          {link.imageUrl ? (
            <img
              src={link.imageUrl}
              alt=""
              className="h-8 w-8 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {link.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
              {link.description}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-7 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const { amount, currency } = row.original;
      return (
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatCurrency(amount, currency)}
        </span>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const cfg = typeConfig[row.original.type];
      return (
        <Badge variant="outline" className={`text-[10px] font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "clicks",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-7 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Performance
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const { clicks, sales } = row.original;
      const conversionRate = clicks > 0 ? ((sales / clicks) * 100).toFixed(1) : "0.0";
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums text-foreground font-medium">
              {sales}
            </span>
            <span className="text-[10px] text-muted-foreground">/ {clicks} clicks</span>
          </div>
          <span className="text-[10px] text-usdt/70">{conversionRate}% conv.</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = statusConfig[row.original.status];
      return (
        <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
    filterFn: (row, _id, value) => {
      return value.includes(row.getValue("status"));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-7 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(row.getValue("createdAt"))}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const link = row.original;
      return (
        <TooltipProvider delayDuration={0}>
          <div className="flex items-center gap-1">
            {/* Copy URL */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-surface"
                  onClick={() => {
                    navigator.clipboard.writeText(link.checkoutUrl);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-popover text-popover-foreground border-border text-xs">
                Copy URL
              </TooltipContent>
            </Tooltip>

            {/* Open Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-usdt hover:bg-usdt/10"
                  asChild
                >
                  <a href={link.checkoutUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-popover text-popover-foreground border-border text-xs">
                Open checkout
              </TooltipContent>
            </Tooltip>

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-surface"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 bg-popover border-border"
              >
                <DropdownMenuItem className="text-xs text-foreground focus:bg-accent focus:text-accent-foreground">
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs text-foreground focus:bg-accent focus:text-accent-foreground"
                  onClick={() => navigator.clipboard.writeText(link.checkoutUrl)}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copy Checkout URL
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="text-xs text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      );
    },
  },
];