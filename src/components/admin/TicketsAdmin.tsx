import { useMemo, useState } from 'react';
import { LifeBuoy, Loader2, Search, TimerReset } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminTickets, useTicketsRealtime, type Ticket } from '@/hooks/useTickets';
import { TicketThread, categoryLabels, priorityClassName, priorityLabels, statusClassName, statusLabels } from '@/components/tickets/TicketThread';

const allStatuses = ['all', 'open', 'in_progress', 'resolved', 'closed'] as const;
const allCategories = ['all', 'bug', 'feature', 'question', 'other'] as const;
const allPriorities = ['all', 'low', 'medium', 'high'] as const;

export function TicketsAdmin() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof allStatuses)[number]>('all');
  const [category, setCategory] = useState<(typeof allCategories)[number]>('all');
  const [priority, setPriority] = useState<(typeof allPriorities)[number]>('all');
  const { data: tickets, isLoading } = useAdminTickets({ search, status, category, priority });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useTicketsRealtime();

  const selectedTicket = useMemo<Ticket | null>(() => {
    if (!tickets?.length) return null;
    return tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0] ?? null;
  }, [selectedId, tickets]);

  const metrics = useMemo(() => {
    const source = tickets ?? [];
    const openCount = source.filter((ticket) => ticket.status === 'open' || ticket.status === 'in_progress').length;
    const resolvedCount = source.filter((ticket) => ticket.status === 'resolved' || ticket.status === 'closed').length;
    const bugsCount = source.filter((ticket) => ticket.category === 'bug').length;

    const avgHours = source.length
      ? Math.round(
          source.reduce((sum, ticket) => {
            const start = new Date(ticket.created_at).getTime();
            const end = new Date(ticket.resolved_at ?? ticket.updated_at).getTime();
            return sum + (end - start);
          }, 0) / source.length / (1000 * 60 * 60),
        )
      : 0;

    return { openCount, resolvedCount, bugsCount, avgHours };
  }, [tickets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Incidencias</h2>
          <p className="text-sm text-muted-foreground">Gestiona tickets reportados por profesionales.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Abiertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resueltas / cerradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.resolvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bugs reportados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.bugsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tiempo medio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <TimerReset className="h-5 w-5 text-primary" />
              {metrics.avgHours}h
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Bandeja</CardTitle>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative md:col-span-2 xl:col-span-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar ticket" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <Select value={status} onValueChange={(value) => setStatus(value as (typeof allStatuses)[number])}>
                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {allStatuses.filter((value) => value !== 'all').map((value) => (
                    <SelectItem key={value} value={value}>{statusLabels[value]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={(value) => setCategory(value as (typeof allCategories)[number])}>
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {allCategories.filter((value) => value !== 'all').map((value) => (
                    <SelectItem key={value} value={value}>{categoryLabels[value]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={(value) => setPriority(value as (typeof allPriorities)[number])}>
                <SelectTrigger><SelectValue placeholder="Prioridad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  {allPriorities.filter((value) => value !== 'all').map((value) => (
                    <SelectItem key={value} value={value}>{priorityLabels[value]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando incidencias…
              </div>
            ) : !tickets?.length ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No hay incidencias con estos filtros.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className={`cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-muted/60' : ''}`}
                      onClick={() => setSelectedId(ticket.id)}
                    >
                      <TableCell>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">{ticket.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{ticket.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabels[ticket.category]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusClassName[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityClassName[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(ticket.updated_at).toLocaleDateString('es-ES')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TicketThread ticket={selectedTicket} isAdmin />
      </div>
    </div>
  );
}
