'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Key,
  Users,
  Ticket,
  Calendar,
  Eye,
  Copy,
  Check,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskApiKey(key: string | null): string {
  if (!key) return '—';
  if (key.length <= 10) return '••••••••';
  return key.slice(0, 10) + '••••••••••••';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminOrganizationsPage() {
  const [selectedOrgIndex, setSelectedOrgIndex] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const organizations = [] as any[];
  const selectedOrg = selectedOrgIndex !== null ? organizations[selectedOrgIndex] : null;

  const handleCopyKey = (orgId: string, apiKey: string | null) => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(orgId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-500/10 border border-neon-500/20">
              <Building2 className="h-5 w-5 text-neon-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{organizations.length}</p>
              <p className="text-xs text-zinc-500">Organizações</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-500/10 border border-neon-500/20">
              <Key className="h-5 w-5 text-neon-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">
                {organizations.filter((o: any) => o.apiKey).length}
              </p>
              <p className="text-xs text-zinc-500">API Keys Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Users className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">—</p>
              <p className="text-xs text-zinc-500">Utilizadores Totais</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Organizations Table ── */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-neon-400" />
              Organizações
            </CardTitle>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white text-xs font-semibold shadow-lg shadow-neon-900/20 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Organização
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs font-medium">Organização</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">API Key</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-center">Utilizadores</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-center">Tickets</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Criado em</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org: any, idx: number) => (
                  <TableRow
                    key={org.id}
                    className="border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-500/10 border border-neon-500/20 shrink-0">
                          <Building2 className="h-4 w-4 text-neon-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-100">{org.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{org.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-zinc-400 font-mono bg-zinc-800/50 rounded px-2 py-1">
                          {maskApiKey(org.apiKey)}
                        </code>
                        {org.apiKey && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-zinc-500 hover:text-neon-400 hover:bg-neon-500/10 shrink-0"
                            onClick={() => handleCopyKey(org.id, org.apiKey)}
                            aria-label="Copiar API Key"
                          >
                            {copiedKey === org.id ? (
                              <Check className="h-3 w-3 text-neon-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-zinc-400">{org.users?.length ?? 0}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-zinc-400">{org.tickets?.length ?? 0}</span>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                      {formatDate(org.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-neon-400 hover:bg-neon-500/10"
                        onClick={() => setSelectedOrgIndex(idx)}
                        aria-label="Ver detalhes"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Organization Detail Dialog ── */}
      <Dialog open={selectedOrgIndex !== null} onOpenChange={() => setSelectedOrgIndex(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-lg">
          {selectedOrg && (
            <>
              <DialogHeader>
                <DialogTitle className="text-zinc-100 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-neon-400" />
                  {selectedOrg.name}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 font-mono text-xs">
                  {selectedOrg.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* API Key */}
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Key className="h-3 w-3" />
                    API Key
                  </p>
                  {selectedOrg.apiKey ? (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-neon-300 font-mono bg-neon-500/5 border border-neon-500/15 rounded-lg px-3 py-2 break-all">
                        {selectedOrg.apiKey}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 border-neon-500/30 text-neon-400 hover:bg-neon-500/10 hover:text-neon-300"
                        onClick={() => handleCopyKey(selectedOrg.id, selectedOrg.apiKey)}
                        aria-label="Copiar"
                      >
                        {copiedKey === selectedOrg.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2">
                      <span className="text-xs text-zinc-500">Sem API Key configurada</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-zinc-800" />

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <DetailField
                    icon={Users}
                    label="Utilizadores"
                    value={`${selectedOrg.users?.length ?? 0} registados`}
                  />
                  <DetailField
                    icon={Ticket}
                    label="Tickets"
                    value={`${selectedOrg.tickets?.length ?? 0} criados`}
                  />
                  <DetailField
                    icon={Calendar}
                    label="Criado em"
                    value={formatDate(selectedOrg.createdAt)}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DetailField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="text-sm text-zinc-200">{value}</p>
    </div>
  );
}
