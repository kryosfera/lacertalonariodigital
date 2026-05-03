import { useMemo, useState } from 'react';
import { Inbox, Loader2, Search, LifeBuoy, ArrowLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    if (!selectedId || !tickets?.length) return null;
    return tickets.find((ticket) => ticket.id === selectedId) ?? null;
  }, [selectedId, tickets]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto p-0">
        <div className="px-5 pt-5 pb-3">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3">
              {selectedTicket && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full -ml-1"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg">Mis incidencias</SheetTitle>
                <SheetDescription className="text-xs">
                  {selectedTicket ? 'Conversación con el equipo' : 'Consulta el estado de tus tickets'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {selectedTicket ? (
          <div className="px-3 md:px-5 pb-6">
            <TicketThread ticket={selectedTicket} />
          </div>
        ) : (
          <div className="px-3 md:px-5 pb-6 space-y-3 max-w-2xl mx-auto w-full">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar incidencia"
                className="pl-9 rounded-full h-10"
              />
            </div>

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
              <ul className="space-y-2">
                {tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(ticket.id)}
                      className="w-full text-left bg-card rounded-2xl border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-border transition-all duration-200 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{ticket.title}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {new Date(ticket.updated_at).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge className={`text-[10px] px-2 py-0.5 ${statusClassName[ticket.status]}`}>{statusLabels[ticket.status]}</Badge>
                        <Badge className={`text-[10px] px-2 py-0.5 ${priorityClassName[ticket.priority]}`}>{priorityLabels[ticket.priority]}</Badge>
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">{categoryLabels[ticket.category]}</Badge>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
