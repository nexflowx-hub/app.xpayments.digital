'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Users,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Mail,
  Calendar,
  UserCircle,
} from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { TierLevel, AccountStatus } from '@/types/xpayments';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<TierLevel, string> = {
  [TierLevel.TIER_0_UNVERIFIED]: 'KYC-0',
  [TierLevel.TIER_1_BASIC]: 'KYC-1',
  [TierLevel.TIER_2_VERIFIED]: 'KYC-2',
  [TierLevel.TIER_3_CORPORATE]: 'KYC-3',
};

const TIER_COLORS: Record<TierLevel, string> = {
  [TierLevel.TIER_0_UNVERIFIED]: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  [TierLevel.TIER_1_BASIC]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [TierLevel.TIER_2_VERIFIED]: 'bg-neon-500/20 text-neon-400 border-neon-500/30',
  [TierLevel.TIER_3_CORPORATE]: 'bg-neon-500/20 text-neon-400 border-neon-500/30',
};

const STATUS_LABELS: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'Ativo',
  [AccountStatus.SUSPENDED]: 'Suspenso',
  [AccountStatus.BLOCKED]: 'Bloqueado',
};

const STATUS_COLORS: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'bg-neon-500/20 text-neon-400 border-neon-500/30',
  [AccountStatus.SUSPENDED]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [AccountStatus.BLOCKED]: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((u) => {
      if (tierFilter !== 'all' && u.tier !== tierFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch =
          u.nickname?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.fullName?.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [search, tierFilter, statusFilter]);

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* ── Filters Row ── */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Pesquisar por nome, email, nickname ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[120px] h-9 text-xs bg-zinc-800/50 border-zinc-700 text-zinc-300">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800">Todos</SelectItem>
                  {Object.entries(TIER_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-zinc-200 focus:bg-zinc-800">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs bg-zinc-800/50 border-zinc-700 text-zinc-300">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800">Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-zinc-200 focus:bg-zinc-800">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Users Table ── */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-neon-400" />
            Utilizadores
            <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 border-zinc-700 px-2 py-0 h-5 ml-1">
              {filteredUsers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs font-medium">ID</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Nickname</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Email</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Tier</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Estado</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Criado em</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow className="border-zinc-800">
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500 text-sm">
                      Nenhum utilizador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-zinc-800 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <TableCell className="text-zinc-300 text-xs font-mono">
                        {user.id.slice(0, 12)}
                      </TableCell>
                      <TableCell className="text-zinc-200 text-xs font-medium">
                        {user.nickname || '—'}
                      </TableCell>
                      <TableCell className="text-zinc-300 text-xs">
                        {user.email || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] px-2 py-0 h-5', TIER_COLORS[user.tier])}
                        >
                          {TIER_LABELS[user.tier]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] px-2 py-0 h-5', STATUS_COLORS[user.status])}
                        >
                          {STATUS_LABELS[user.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-400 hover:text-neon-400 hover:bg-neon-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(user.id);
                          }}
                          aria-label="Ver detalhes"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── User Detail Dialog ── */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-lg">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-zinc-100 flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-neon-400" />
                  Detalhes do Utilizador
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {selectedUser.fullName || selectedUser.nickname || selectedUser.email}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Header badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn('text-xs px-2.5 py-0.5 h-6', TIER_COLORS[selectedUser.tier])}>
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {TIER_LABELS[selectedUser.tier]}
                  </Badge>
                  <Badge variant="outline" className={cn('text-xs px-2.5 py-0.5 h-6', STATUS_COLORS[selectedUser.status])}>
                    {STATUS_LABELS[selectedUser.status]}
                  </Badge>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  <DetailField
                    icon={UserCircle}
                    label="Nome Completo"
                    value={selectedUser.fullName || '—'}
                  />
                  <DetailField
                    icon={UserCircle}
                    label="Nickname"
                    value={selectedUser.nickname || '—'}
                  />
                  <DetailField
                    icon={Mail}
                    label="Email"
                    value={selectedUser.email || '—'}
                  />
                  <DetailField
                    label="ID"
                    value={selectedUser.id}
                    mono
                  />
                  <DetailField
                    icon={Calendar}
                    label="Criado em"
                    value={formatDate(selectedUser.createdAt)}
                  />
                  <DetailField
                    icon={Calendar}
                    label="Atualizado em"
                    value={formatDate(selectedUser.updatedAt)}
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
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className={mono ? 'text-xs text-zinc-300 font-mono break-all' : 'text-sm text-zinc-200'}>{value}</p>
    </div>
  );
}
