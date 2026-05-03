import { useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Bug, Loader2, MessageSquarePlus, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateTicket, useUploadTicketAttachment } from '@/hooks/useTickets';
import { useAuth } from '@/hooks/useAuth';

const ticketSchema = z.object({
  title: z.string().trim().min(4, 'Añade un título más claro').max(200, 'Máximo 200 caracteres'),
  description: z.string().trim().min(10, 'Describe mejor la incidencia').max(5000, 'Máximo 5000 caracteres'),
  category: z.enum(['bug', 'feature', 'question', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
  screenshot_url: z.string().nullable().optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

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

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDialog({ open, onOpenChange }: TicketDialogProps) {
  const { user } = useAuth();
  const createTicket = useCreateTicket();
  const uploadAttachment = useUploadTicketAttachment();
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'bug',
      priority: 'medium',
      screenshot_url: null,
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      form.setError('screenshot_url', { message: 'La captura debe ser una imagen' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      form.setError('screenshot_url', { message: 'La captura no puede superar 5 MB' });
      return;
    }

    const path = await uploadAttachment.mutateAsync(file);
    setAttachmentName(file.name);
    form.setValue('screenshot_url', path, { shouldDirty: true, shouldValidate: true });
  };

  const handleSubmit = async (values: TicketFormValues) => {
    await createTicket.mutateAsync({
      title: values.title,
      description: values.description,
      category: values.category,
      priority: values.priority,
      screenshot_url: values.screenshot_url ?? null,
      status: 'open',
    });
    form.reset();
    setAttachmentName(null);
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      setAttachmentName(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bug className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg">Reportar incidencia</DialogTitle>
              <DialogDescription className="text-xs">
                Comparte el problema, una duda o una mejora. Lo veremos desde administración.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!user ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Necesitas iniciar sesión para crear incidencias.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej. No me deja enviar la receta por WhatsApp" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="min-w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="min-w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(priorityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Qué estabas haciendo, qué esperabas que ocurriera y qué pasó realmente."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="screenshot_url"
                render={() => (
                  <FormItem>
                    <FormLabel>Captura (opcional)</FormLabel>
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-3">
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploadAttachment.isPending}
                      >
                        {uploadAttachment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Subir captura
                      </Button>
                      {attachmentName && <Badge variant="secondary">{attachmentName}</Badge>}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-full" disabled={createTicket.isPending || uploadAttachment.isPending}>
                  {createTicket.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <MessageSquarePlus className="h-4 w-4 mr-1.5" />}
                  Enviar incidencia
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
