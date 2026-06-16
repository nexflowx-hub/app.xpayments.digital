'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  RotateCcw,
  Ban,
  Filter,
  Loader2,
} from 'lucide-react';
import { ticketTypeLabels, ticketStatusColors } from '@/lib/formatting';
import { TicketStatus, TicketType } from '@/types/xpayments';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Status icon helper
// ---------------------------------------------------------------------------

const STATUS_ICONS: Record<TicketStatus, React.ElementType> = {
  [TicketStatus.OPEN]: AlertCircle,
  [TicketStatus.IN_PROGRESS]: Clock,
  [TicketStatus.RESOLVED]: CheckCircle2,
  [TicketStatus.REJECTED]: XCircle,
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'Aberto',
  [TicketStatus.IN_PROGRESS]: 'Em Curso',
  [TicketStatus.RESOLVED]: 'Resolvido',
  [TicketStatus.REJECTED]: 'Rejeitado',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tickets = [] as any[];

  // Compute stats
  const stats = { open: 0, inProgress: 0, resolved: 0, total: 0 };

  // Filtered tickets
  const filteredTickets = tickets.filter((t: any) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    return true;
  });

  const selectedTicket = tickets.find((t: any) => t.id === selectedTicketId);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleResolve = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSelectedTicketId(null);
      setResolutionNotes('');
    }, 1200);
  };

  const handleReject = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSelectedTicketId(null);
      setResolutionNotes('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Abertos"
          value={stats.open}
          icon={AlertCircle}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
          borderColor="border-yellow-500/20"
        />
        <StatCard
          label="Em Curso"
          value={stats.inProgress}
          icon={Clock}
          color="text-neon-400"
          bgColor="bg-neon-500/10"
          borderColor="border-neon-500/20"
        />
        <StatCard
          label="Resolvidos"
          value={stats.resolved}
          icon={CheckCircle2}
          color="text-neon-400"
          bgColor="bg-neon-500/10"
          borderColor="border-neon-500/20"
        />
        <StatCard
          label="Total"
          value={stats.total}
          icon={Ticket}
          color="text-zinc-300"
          bgColor="bg-zinc-500/10"
          borderColor="border-zinc-600/20"
        />
      </div>

      {/* ── Filters + Table ── */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-neon-400" />
              Lista de Tickets
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-zinc-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-8 text-xs bg-zinc-800/50 border-zinc-700 text-zinc-300">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800">Todos</SelectItem>
                    <SelectItem value={TicketStatus.OPEN} className="text-zinc-200 focus:bg-zinc-800">Aberto</SelectItem>
                    <SelectItem value={TicketStatus.IN_PROGRESS} className="text-zinc-200 focus:bg-zinc-800">Em Curso</SelectItem>
                    <SelectItem value={TicketStatus.RESOLVED} className="text-zinc-200 focus:bg-zinc-800">Resolvido</SelectItem>
                    <SelectItem value={TicketStatus.REJECTED} className="text-zinc-200 focus:bg-zinc-800">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[170px] h-8 text-xs bg-zinc-800/50 border-zinc-700 text-zinc-300">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800">Todos os Tipos</SelectItem>
                  {Object.entries(ticketTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-zinc-200 focus:bg-zinc-800">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs font-medium">ID</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Tipo</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Estado</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium max-w-[240px]">Descrição</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Criado em</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow className="border-zinc-800">
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-sm">
                      Nenhum ticket encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    const StatusIcon = STATUS_ICONS[ticket.status];
                    return (
                      <TableRow key={ticket.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="text-zinc-300 text-xs font-mono">
                          {ticket.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-zinc-300 text-xs">
                          {ticketTypeLabels[ticket.type]}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-2 py-0 h-5 gap-1',
                              ticketStatusColors[ticket.status],
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {STATUS_LABELS[ticket.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-300 text-xs max-w-[240px] truncate">
                          {ticket.description}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs whitespace-nowrap">
                          {formatDate(ticket.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-neon-400 hover:bg-neon-500/10"
                              onClick={() => {
                                setSelectedTicketId(ticket.id);
                                setResolutionNotes('');
                              }}
                              aria-label="Ver detalhes"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.REJECTED && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-zinc-400 hover:text-neon-400 hover:bg-neon-500/10"
                                  onClick={() => {
                                    setSelectedTicketId(ticket.id);
                                    setResolutionNotes('');
                                  }}
                                  aria-label="Resolver"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                  onClick={() => {
                                    setSelectedTicketId(ticket.id);
                                    setResolutionNotes('');
                                  }}
                                  aria-label="Rejeitar"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Ticket Detail Dialog ── */}
      <Dialog open={!!selectedTicketId} onOpenChange={() => setSelectedTicketId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="text-zinc-100 flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-neon-400" />
                  Detalhes do Ticket
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {ticketTypeLabels[selectedTicket.type]} — {selectedTicket.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="ID" value={selectedTicket.id} mono />
                  <InfoField
                    label="Estado"
                    value={
                      <Badge variant="outline" className={cn('text-[10px] px-2 py-0 h-5 gap-1', ticketStatusColors[selectedTicket.status])}>
                        {STATUS_LABELS[selectedTicket.status]}
                      </Badge>
                    }
                  />
                  <InfoField label="Tipo" value={ticketTypeLabels[selectedTicket.type]} />
                  <InfoField label="Email" value={selectedTicket.email} />
                  <InfoField label="Organização" value={selectedTicket.organizationId.slice(0, 16)} mono />
                  <InfoField label="Criado em" value={formatDate(selectedTicket.createdAt)} />
                </div>

                <Separator className="bg-zinc-800" />

                {/* Description */}
                <div>
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Descrição</Label>
                  <p className="text-sm text-zinc-200 mt-1.5 leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Resolution notes (if exists) */}
                {selectedTicket.resolutionNotes && (
                  <>
                    <Separator className="bg-zinc-800" />
                    <div>
                      <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Notas de Resolução</Label>
                      <p className="text-sm text-neon-300 mt-1.5 leading-relaxed bg-neon-500/5 rounded-lg border border-neon-500/10 p-3">
                        {selectedTicket.resolutionNotes}
                      </p>
                    </div>
                  </>
                )}

                {/* Resolution form (if open / in progress) */}
                {selectedTicket.status !== TicketStatus.RESOLVED && selectedTicket.status !== TicketStatus.REJECTED && (
                  <>
                    <Separator className="bg-zinc-800" />
                    <div className="space-y-3">
                      <Label htmlFor="resolution-notes" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                        Resolução
                      </Label>
                      <Textarea
                        id="resolution-notes"
                        placeholder="Adicione notas de resolução..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="min-h-[80px] bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-neon-500/50 focus-visible:ring-neon-500/20 text-sm"
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={handleResolve}
                          disabled={submitting || !resolutionNotes.trim()}
                          className="flex-1 gap-2 bg-gradient-to-r from-neon-600 to-neon-500 hover:from-neon-500 hover:to-neon-400 text-white text-sm font-semibold shadow-lg shadow-neon-900/20"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Resolver
                        </Button>
                        <Button
                          onClick={handleReject}
                          disabled={submitting || !resolutionNotes.trim()}
                          variant="outline"
                          className="flex-1 gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm font-semibold"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </>
                )}
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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <Card className={cn('bg-zinc-900/50 border border', borderColor)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', bgColor)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-100">{value}</p>
          <p className="text-xs text-zinc-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{label}</p>
      <div className={mono ? 'font-mono text-xs text-zinc-300' : 'text-sm text-zinc-200'}>{value}</div>
    </div>
  );
}
