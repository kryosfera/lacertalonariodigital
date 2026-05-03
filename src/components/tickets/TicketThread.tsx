import { useMemo, useState } from 'react';
import { AlertCircle, Clock3, Loader2, MessageSquare, Shield, Ticket as TicketIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useTicketAttachmentUrl, useTicketMessages, useCreateTicketMessage, useUpdateTicket, type Ticket } from '@/hooks/useTickets';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const categoryLabels = {
  bug: 'Bug',
  feature: 'Sugerencia',
  question: 'Pregunta',
  other: 'Otro',
} as const;

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
} as const;

const statusLabels = {
  open: 'Abierto',
  in_progress: 'En curso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
} as const;

const priorityClassName = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-destructive/10 text-destructive',
} as const;

const statusClassName = {
  open: 'bg-primary/10 text-primary',
  in_progress: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  resolved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  closed: 'bg-muted text-muted-foreground',
} as const;

interface TicketThreadProps {
  ticket: Ticket | null;
  isAdmin?: boolean;
}

export function TicketThread({ ticket, isAdmin = false }: TicketThreadProps) {
  const { user } = useAuth();
  const { data: messages, isLoading } = useTicketMessages(ticket?.id);
  const { data: screenshotUrl } = useTicketAttachmentUrl(ticket?.screenshot_url);
  const createMessage = useCreateTicketMessage();
  const updateTicket = useUpdateTicket();
  const [draft, setDraft] = useState('');

  const firstAdminReplyAt = useMemo(() => {
    return messages?.find((message) => message.is_admin_reply)?.created_at ?? null;
  }, [messages]);

  if (!ticket) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center text-sm text-muted-foreground">
        Selecciona una incidencia para ver la conversación.
      </div>
    );
  }

  const handleSend = async () => {
    const message = draft.trim();
    if (!message) return;
    await createMessage.mutateAsync({ ticketId: ticket.id, message });
    setDraft('');
  };

  const handleCloseTicket = async () => {
    await updateTicket.mutateAsync({ id: ticket.id, values: { status: 'closed' } });
  };

  const handleAdminStatus = async (status: Ticket['status']) => {
    await updateTicket.mutateAsync({ id: ticket.id, values: { status } });
  };

  const handleAdminPriority = async (priority: Ticket['priority']) => {
    await updateTicket.mutateAsync({ id: ticket.id, values: { priority } });
  };

  return (
    <div className="flex h-full min-h-[520px] flex-col rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TicketIcon className="h-3.5 w-3.5" />
            <span>{ticket.id.slice(0, 8).toUpperCase()}</span>
            <span>•</span>
            <span>{new Date(ticket.created_at).toLocaleString('es-ES')}</span>
          </div>
          <h3 className="text-base font-semibold leading-tight text-foreground">{ticket.title}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className={statusClassName[ticket.status]}>{statusLabels[ticket.status]}</Badge>
            <Badge className={priorityClassName[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
            <Badge variant="outline">{categoryLabels[ticket.category]}</Badge>
          </div>
        </div>

        {isAdmin ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Estado</Label>
              <Select value={ticket.status} onValueChange={(value) => handleAdminStatus(value as Ticket['status'])}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Prioridad</Label>
              <Select value={ticket.priority} onValueChange={(value) => handleAdminPriority(value as Ticket['priority'])}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : ticket.status !== 'closed' ? (
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleCloseTicket}>
            Cerrar ticket
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/20 p-4">
            <p className="text-sm leading-6 text-foreground whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" /> Conversación
            </div>
            <ScrollArea className="h-[280px] rounded-lg border border-border bg-background">
              <div className="space-y-3 p-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))
                ) : !messages?.length ? (
                  <p className="text-sm text-muted-foreground">Todavía no hay mensajes en esta incidencia.</p>
                ) : (
                  messages.map((message) => {
                    const mine = message.user_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`rounded-lg border p-3 ${message.is_admin_reply ? 'border-primary/20 bg-primary/5' : mine ? 'border-border bg-muted/30' : 'border-border bg-background'}`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                          {message.is_admin_reply ? (
                            <>
                              <Shield className="h-3.5 w-3.5 text-primary" />
                              <span>Administración</span>
                            </>
                          ) : (
                            <span>{mine ? 'Tú' : 'Usuario'}</span>
                          )}
                          <span>•</span>
                          <span>{new Date(message.created_at).toLocaleString('es-ES')}</span>
                        </div>
                        <p className="text-sm leading-6 text-foreground whitespace-pre-wrap">{message.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ticket-reply-${ticket.id}`}>{isAdmin ? 'Responder' : 'Añadir comentario'}</Label>
            <Textarea
              id={`ticket-reply-${ticket.id}`}
              rows={4}
              placeholder={isAdmin ? 'Escribe una respuesta para el profesional…' : 'Añade más contexto o una actualización…'}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={createMessage.isPending || !draft.trim()}>
                {createMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enviar mensaje
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock3 className="h-4 w-4 text-primary" /> Seguimiento
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Actualizado</span>
                <span className="text-right text-foreground">{new Date(ticket.updated_at).toLocaleString('es-ES')}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Primera respuesta</span>
                <span className="text-right text-foreground">{firstAdminReplyAt ? new Date(firstAdminReplyAt).toLocaleString('es-ES') : 'Pendiente'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Resuelto</span>
                <span className="text-right text-foreground">{ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString('es-ES') : '—'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <AlertCircle className="h-4 w-4 text-primary" /> Adjuntos
            </div>
            {!ticket.screenshot_url ? (
              <p className="text-sm text-muted-foreground">No hay captura adjunta.</p>
            ) : screenshotUrl ? (
              <a href={screenshotUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border">
                <img src={screenshotUrl} alt="Captura adjunta de la incidencia" className="h-auto w-full object-cover" />
              </a>
            ) : (
              <Skeleton className="h-40 w-full rounded-lg" />
            )}
          </div>
        </div>
      </div>

      <Separator />
      <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
        <span>{messages?.length ?? 0} mensajes</span>
        <span>{isAdmin ? 'Vista administración' : 'Vista profesional'}</span>
      </div>
    </div>
  );
}

export { categoryLabels, priorityLabels, statusLabels, priorityClassName, statusClassName };
