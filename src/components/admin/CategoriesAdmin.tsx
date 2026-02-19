import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, GripVertical, Upload, X, ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido').max(100),
  slug: z.string().trim().min(1, 'URL requerida').max(100),
  sort_order: z.coerce.number().int().default(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number | null;
  image_url: string | null;
};

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          aria-label="Reordenar"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </TableCell>
      <TableCell>
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="w-10 h-10 object-contain rounded border border-border bg-muted"
          />
        ) : (
          <div className="w-10 h-10 rounded border border-border bg-muted flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
      <TableCell>{category.sort_order ?? 0}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(category)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoriesAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [localOrder, setLocalOrder] = useState<Category[] | null>(null);

  // Image state
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null); // current image_url (existing or newly uploaded)
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', sort_order: 0 },
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, sort_order, image_url')
        .order('sort_order')
        .order('name');
      if (error) throw error;
      setLocalOrder(null);
      return data as Category[];
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reordered: Category[]) => {
      const updates = reordered.map((c, i) =>
        supabase.from('categories').update({ sort_order: i }).eq('id', c.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => {
      toast({ title: 'Error al guardar el orden', variant: 'destructive' });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const payload = {
        name: data.name,
        slug: data.slug,
        sort_order: data.sort_order,
        image_url: pendingImageUrl,
      };

      if (editingCategory) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: editingCategory ? 'Categoría actualizada' : 'Categoría creada' });
      handleClose();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Categoría eliminada' });
      setDeleteCategory(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const displayCategories = localOrder ?? categories ?? [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayCategories.findIndex((c) => c.id === active.id);
    const newIndex = displayCategories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(displayCategories, oldIndex, newIndex);

    setLocalOrder(reordered);
    reorderMutation.mutate(reordered);
  };

  const handleNew = () => {
    setEditingCategory(null);
    setPendingImageUrl(null);
    form.reset({ name: '', slug: '', sort_order: 0 });
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setPendingImageUrl(category.image_url);
    form.reset({
      name: category.name,
      slug: category.slug,
      sort_order: category.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setPendingImageUrl(null);
    form.reset();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slug = form.getValues('slug');
    if (!slug) {
      toast({ title: 'Introduce primero el slug/URL de la categoría', variant: 'destructive' });
      return;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `${slug}.${fileExt}`;

    setIsUploadingImage(true);
    try {
      // Upsert: remove existing first, then upload
      await supabase.storage.from('category-images').remove([filePath]);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(uploadData.path);

      // Add cache-busting to force reload
      setPendingImageUrl(`${publicUrl}?t=${Date.now()}`);
      toast({ title: 'Imagen subida correctamente' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast({ title: 'Error al subir imagen', description: message, variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPendingImageUrl(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categorías</CardTitle>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Arrastra las filas para cambiar el orden de visualización.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-14">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayCategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {displayCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay categorías
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayCategories.map((category) => (
                      <SortableCategoryRow
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={setDeleteCategory}
                      />
                    ))
                  )}
                </TableBody>
              </SortableContext>
            </DndContext>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!editingCategory) {
                            form.setValue('slug', generateSlug(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image upload section */}
              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">Imagen</p>
                {pendingImageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={pendingImageUrl}
                      alt="Vista previa"
                      className="h-24 w-auto max-w-full object-contain rounded border border-border bg-muted p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-24 w-full rounded border border-dashed border-border bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    Sin imagen
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploadingImage ? 'Subiendo...' : 'Subir imagen'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  La imagen se sube al storage automáticamente al seleccionarla.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending || isUploadingImage}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCategory ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los productos asociados quedarán sin categoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategory && deleteMutation.mutate(deleteCategory.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
