import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Loader2, Upload, GripVertical } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ProductDialog } from './ProductDialog';
import { CsvImportDialog } from './CsvImportDialog';
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

type Product = {
  id: string;
  name: string;
  slug: string;
  reference: string | null;
  ean: string | null;
  is_active: boolean;
  is_visible: boolean;
  category_id: string | null;
  sort_order: number | null;
  categories?: { name: string } | null;
};

// Sortable row component
function SortableProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
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
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{product.reference || '-'}</TableCell>
      <TableCell className="font-mono text-sm">{product.ean || '-'}</TableCell>
      <TableCell>{product.categories?.name || '-'}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Badge variant={product.is_active ? 'default' : 'secondary'}>
            {product.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
          {product.is_visible && <Badge variant="outline">Visible</Badge>}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(product)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProductsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [localOrder, setLocalOrder] = useState<Product[] | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, name, slug, reference, ean, is_active, is_visible, category_id, sort_order, categories(name)')
        .order('sort_order')
        .order('name');

      if (search) {
        query = query.or(`name.ilike.%${search}%,reference.ilike.%${search}%,ean.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setLocalOrder(null); // reset local order on refetch
      return data as Product[];
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reordered: Product[]) => {
      const updates = reordered.map((p, i) =>
        supabase.from('products').update({ sort_order: i }).eq('id', p.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => {
      toast({ title: 'Error al guardar el orden', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Producto eliminado' });
      setDeleteProduct(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const displayProducts = localOrder ?? products ?? [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayProducts.findIndex((p) => p.id === active.id);
    const newIndex = displayProducts.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(displayProducts, oldIndex, newIndex);

    setLocalOrder(reordered);
    reorderMutation.mutate(reordered);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCsvDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, referencia o EAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {!search && (
          <p className="text-xs text-muted-foreground mt-1">
            Arrastra las filas para cambiar el orden de visualización.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>EAN</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={displayProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <TableBody>
                    {displayProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No hay productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayProducts.map((product) => (
                        <SortableProductRow
                          key={product.id}
                          product={product}
                          onEdit={handleEdit}
                          onDelete={setDeleteProduct}
                        />
                      ))
                    )}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          </div>
        )}
      </CardContent>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />

      <CsvImportDialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen} />

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente "{deleteProduct?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
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
