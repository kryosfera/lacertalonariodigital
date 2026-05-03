import { useMemo, useState } from 'react';
import { ChevronRight, Inbox, Loader2, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTickets, useTicketsRealtime, type Ticket } from '@/hooks/useTickets';
import { TicketThread, categoryLabels, priorityClassName, priorityLabels, statusClassName, statusLabels } from '@/components/tickets/TicketThread';

interface MyTicketsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MyTicketsSheet({ open, onOpenChange }: MyTicketsSheetProps) {
  const [search, setSearch] = useState('');
  const { data: tickets, isLoading } = useTickets({ search });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useTicketsRealtime();

  const selectedTicket = useMemo<Ticket | null>(() => {
    if (!tickets?.length) return null;
    return tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0] ?? null;
  }, [selectedId, tickets]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-6xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b px-6 py-4 text-left">
            <SheetTitle>Mis incidencias</SheetTitle>
            <SheetDescription>Consulta el estado de tus tickets y continúa la conversación.</SheetDescription>
          </SheetHeader>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="border-b border-border lg:border-b-0 lg:border-r">
              <div className="space-y-3 p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar incidencia" className="pl-9" />
                </div>
              </div>

              <div className="max-h-[40vh] overflow-y-auto lg:max-h-none lg:h-[calc(100vh-105px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando incidencias…
                  </div>
                ) : !tickets?.length ? (
                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-sm text-muted-foreground">
                    <Inbox className="h-8 w-8 text-muted-foreground/60" />
                    <p>No has creado incidencias todavía.</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-3">
                    {tickets.map((ticket) => {
                      const active = ticket.id === selectedTicket?.id;
                      return (
                        <Button
                          key={ticket.id}
                          variant="ghost"
                          className={`h-auto w-full justify-start rounded-lg border px-3 py-3 text-left ${active ? 'border-primary/30 bg-primary/5' : 'border-border'}`}
                          onClick={() => setSelectedId(ticket.id)}
                        >
                          <div className="w-full space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{new Date(ticket.updated_at).toLocaleString('es-ES')}</p>
                              </div>
                              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge className={statusClassName[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                              <Badge className={priorityClassName[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
                              <Badge variant="outline">{categoryLabels[ticket.category]}</Badge>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            <div className="min-h-0 p-4 lg:p-6">
              <TicketThread ticket={selectedTicket} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
