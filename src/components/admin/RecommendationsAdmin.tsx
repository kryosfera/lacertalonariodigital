import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, Upload, ExternalLink, FileText, Play, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRecommendations, type Recommendation } from '@/hooks/useRecommendations';

const schema = z.object({
  title: z.string().trim().min(1, 'Título requerido').max(150),
  slug: z.string().trim().min(1, 'Slug requerido').max(150).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  icon: z.string().trim().max(50).optional().or(z.literal('')),
  kind: z.enum(['pdf', 'video', 'link']),
  pdf_url: z.string().trim().url('URL no válida').optional().or(z.literal('')),
  image_url: z.string().trim().url('URL no válida').optional().or(z.literal('')),
  vimeo_url: z.string().trim().optional().or(z.literal('')),
  external_url: z.string().trim().url('URL no válida').optional().or(z.literal('')),
  sort_order: z.coerce.number().int().default(0),
  is_visible: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const ICON_OPTIONS = ['Scissors', 'FileText', 'Syringe', 'Play', 'BookOpen', 'Stethoscope', 'HeartPulse', 'Pill', 'Activity', 'ClipboardList'];

const slugify = (s: string) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150);

// Extract Vimeo id + hash from a URL like https://vimeo.com/943145092/757334f829 or https://vimeo.com/943145092?h=757334f829
function parseVimeo(url: string): { id: string | null; hash: string | null } {
  if (!url) return { id: null, hash: null };
  try {
    const u = new URL(url);
    const segs = u.pathname.split('/').filter(Boolean);
    const id = segs[0] || null;
    const hash = segs[1] || u.searchParams.get('h') || null;
    return { id, hash };
  } catch {
    const m = url.match(/(\d+)(?:[/?](?:h=)?([a-z0-9]+))?/i);
    return { id: m?.[1] ?? null, hash: m?.[2] ?? null };
  }
}

export function RecommendationsAdmin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: items, isLoading } = useRecommendations(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Recommendation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', slug: '', description: '', icon: 'FileText',
      kind: 'pdf', pdf_url: '', image_url: '', vimeo_url: '', external_url: '',
      sort_order: 0, is_visible: true,
    },
  });

  const kind = form.watch('kind');

  useEffect(() => {
    if (editing) {
      form.reset({
        title: editing.title,
        slug: editing.slug,
        description: editing.description ?? '',
        icon: editing.icon ?? 'FileText',
        kind: editing.kind,
        pdf_url: editing.pdf_url ?? '',
        image_url: editing.image_url ?? '',
        vimeo_url: editing.vimeo_url ?? '',
        external_url: editing.external_url ?? '',
        sort_order: editing.sort_order,
        is_visible: editing.is_visible,
      });
    } else {
      form.reset({
        title: '', slug: '', description: '', icon: 'FileText',
        kind: 'pdf', pdf_url: '', image_url: '', vimeo_url: '', external_url: '',
        sort_order: (items?.length ?? 0) * 10 + 10, is_visible: true,
      });
    }
  }, [editing, dialogOpen]);

  const upsertMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const vimeo = values.kind === 'video' ? parseVimeo(values.vimeo_url || '') : { id: null, hash: null };
      const payload = {
        title: values.title,
        slug: values.slug,
        description: values.description || null,
        icon: values.icon || null,
        kind: values.kind,
        pdf_url: values.kind === 'pdf' ? (values.pdf_url || null) : null,
        image_url: values.image_url || null,
        vimeo_url: values.kind === 'video' ? (values.vimeo_url || null) : null,
        vimeo_id: vimeo.id,
        vimeo_hash: vimeo.hash,
        external_url: values.kind === 'link' ? (values.external_url || null) : null,
        sort_order: values.sort_order,
        is_visible: values.is_visible,
      };
      if (editing) {
        const { error } = await supabase.from('recommendations').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('recommendations').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      toast({ title: editing ? 'Recomendación actualizada' : 'Recomendación creada' });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recommendations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      toast({ title: 'Recomendación eliminada' });
      setDeletingId(null);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from('recommendations').update({ is_visible: value }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  });

  const uploadFile = async (file: File, folder: 'docs' | 'images'): Promise<string> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}_${safeName}`;
    const { error } = await supabase.storage
      .from('recomendaciones')
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from('recomendaciones').getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'Archivo demasiado grande', description: 'Máximo 20 MB', variant: 'destructive' });
      return;
    }
    try {
      setUploadingPdf(true);
      const url = await uploadFile(file, 'docs');
      form.setValue('pdf_url', url, { shouldValidate: true });
      toast({ title: 'PDF subido correctamente' });
    } catch (err: any) {
      toast({ title: 'Error al subir PDF', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Imagen demasiado grande', description: 'Máximo 5 MB', variant: 'destructive' });
      return;
    }
    try {
      setUploadingImage(true);
      const url = await uploadFile(file, 'images');
      form.setValue('image_url', url, { shouldValidate: true });
      toast({ title: 'Imagen subida correctamente' });
    } catch (err: any) {
      toast({ title: 'Error al subir imagen', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingImage(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  };

  const onTitleChange = (value: string) => {
    if (!editing && !form.getValues('slug')) {
      form.setValue('slug', slugify(value));
    }
  };

  const onSubmit = (values: FormData) => {
    if (values.kind === 'pdf' && !values.pdf_url) {
      form.setError('pdf_url', { message: 'Sube un PDF o introduce su URL' });
      return;
    }
    if (values.kind === 'video' && !values.vimeo_url) {
      form.setError('vimeo_url', { message: 'Introduce la URL de Vimeo' });
      return;
    }
    if (values.kind === 'link' && !values.external_url) {
      form.setError('external_url', { message: 'Introduce la URL externa' });
      return;
    }
    upsertMutation.mutate(values);
  };

  const kindBadge = (k: string) => {
    const map: Record<string, { label: string; icon: any; cls: string }> = {
      pdf: { label: 'PDF', icon: FileText, cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      video: { label: 'Vídeo', icon: Play, cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      link: { label: 'Enlace', icon: LinkIcon, cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    };
    const c = map[k] || map.link;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${c.cls}`}>
        <Icon className="h-3 w-3" />
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Recomendaciones</h2>
          <p className="text-sm text-muted-foreground">Gestiona PDFs, vídeos y enlaces que se muestran a los pacientes</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva recomendación
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Listado ({items?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !items?.length ? (
            <p className="text-center text-muted-foreground text-sm py-12">No hay recomendaciones. Crea la primera.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14"></TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead className="text-center">Orden</TableHead>
                  <TableHead className="text-center">Visible</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(rec => (
                  <TableRow key={rec.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                        {rec.image_url ? (
                          <img src={rec.image_url} alt={rec.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground/50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{rec.title}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-xs">{rec.description}</div>
                    </TableCell>
                    <TableCell>{kindBadge(rec.kind)}</TableCell>
                    <TableCell>
                      {(() => {
                        const url = rec.kind === 'pdf' ? rec.pdf_url : rec.kind === 'video' ? rec.vimeo_url : rec.external_url;
                        return url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer"
                             className="inline-flex items-center gap-1 text-xs text-primary hover:underline max-w-[200px] truncate">
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate">{url.split('/').pop()}</span>
                          </a>
                        ) : <span className="text-xs text-muted-foreground">—</span>;
                      })()}
                    </TableCell>
                    <TableCell className="text-center text-xs tabular-nums">{rec.sort_order}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={rec.is_visible}
                        onCheckedChange={(v) => toggleVisibility.mutate({ id: rec.id, value: v })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(rec); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeletingId(rec.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar recomendación' : 'Nueva recomendación'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={(e) => { field.onChange(e); onTitleChange(e.target.value); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl><Input {...field} placeholder="cirugia-oral-general" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Textarea {...field} rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="kind" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video">Vídeo (Vimeo)</SelectItem>
                        <SelectItem value="link">Enlace externo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="icon" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icono</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'FileText'}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {ICON_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sort_order" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Image */}
              <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                <FormLabel className="text-xs">Imagen de portada</FormLabel>
                <div className="flex items-start gap-3">
                  {form.watch('image_url') ? (
                    <img src={form.watch('image_url')!} alt="preview" className="w-20 h-20 rounded-md object-cover border" />
                  ) : (
                    <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center border">
                      <FileText className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <FormField control={form.control} name="image_url" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} placeholder="URL de imagen o sube una abajo" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div>
                      <input ref={imgInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      <Button type="button" variant="outline" size="sm" disabled={uploadingImage}
                        onClick={() => imgInputRef.current?.click()} className="gap-2">
                        {uploadingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        Subir imagen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type-specific fields */}
              {kind === 'pdf' && (
                <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                  <FormLabel className="text-xs flex items-center gap-1"><FileText className="h-3 w-3" /> Documento PDF</FormLabel>
                  <FormField control={form.control} name="pdf_url" render={({ field }) => (
                    <FormItem>
                      <FormControl><Input {...field} placeholder="URL del PDF o sube un archivo" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <input ref={pdfInputRef} type="file" accept="application/pdf" hidden onChange={handlePdfUpload} />
                  <Button type="button" variant="outline" size="sm" disabled={uploadingPdf}
                    onClick={() => pdfInputRef.current?.click()} className="gap-2">
                    {uploadingPdf ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    Subir PDF
                  </Button>
                  <FormDescription className="text-[10px]">Máximo 20 MB</FormDescription>
                </div>
              )}

              {kind === 'video' && (
                <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                  <FormLabel className="text-xs flex items-center gap-1"><Play className="h-3 w-3" /> Vídeo Vimeo</FormLabel>
                  <FormField control={form.control} name="vimeo_url" render={({ field }) => (
                    <FormItem>
                      <FormControl><Input {...field} placeholder="https://vimeo.com/943145092/757334f829" /></FormControl>
                      <FormDescription className="text-[10px]">Pega la URL completa de Vimeo. El ID y hash se extraen automáticamente.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {kind === 'link' && (
                <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                  <FormLabel className="text-xs flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Enlace externo</FormLabel>
                  <FormField control={form.control} name="external_url" render={({ field }) => (
                    <FormItem>
                      <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              <FormField control={form.control} name="is_visible" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      {field.value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      Visible para los pacientes
                    </FormLabel>
                    <FormDescription className="text-xs">Si está desactivado, no se muestra en la pantalla de Recomendaciones.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                  {editing ? 'Guardar cambios' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar recomendación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La recomendación dejará de mostrarse a los pacientes.
              Los archivos en almacenamiento no se eliminarán automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
