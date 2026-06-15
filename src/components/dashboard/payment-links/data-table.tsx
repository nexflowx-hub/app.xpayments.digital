"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";
import type { PaymentLink } from "./types";

// ─── Props ───────────────────────────────────────────────────────────────────

interface PaymentLinksTableProps {
  data: PaymentLink[];
  isLoading: boolean;
  onCreateNew: () => void;
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-48" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-md" />
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-3 w-20" />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-64">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              No payment links yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first payment link to start accepting payments.
            </p>
          </div>
          <Button
            size="sm"
            className="mt-1 gap-2 bg-usdt text-background hover:bg-usdt/90"
            onClick={onCreateNew}
          >
            <Plus className="h-3.5 w-3.5" />
            Create New Link
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Data Table Component ─────────────────────────────────────────────────────

export function PaymentLinksTable({
  data,
  isLoading,
  onCreateNew,
}: PaymentLinksTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const hasData = data.length > 0;
  const hasActiveFilters =
    globalFilter.length > 0 || columnFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search links by name, description..."
            className="h-8 w-full border-border bg-surface pl-8 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-usdt/30"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Count */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {hasActiveFilters ? (
            <span>
              {table.getFilteredRowModel().rows.length} of {data.length} links
            </span>
          ) : (
            <span>{data.length} payment links</span>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : !hasData ? (
              <EmptyState onCreateNew={onCreateNew} />
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <p className="text-xs text-muted-foreground">
                    No links match your search.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              table.getFilteredRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}