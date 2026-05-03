import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { VideoUrlsField } from './VideoUrlsField';

const productSchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido').max(255),
  slug: z.string().trim().min(1, 'URL requerida').max(255),
  reference: z.string().trim().max(50).optional().or(z.literal('')),
  ean: z.string().trim().max(20).optional().or(z.literal('')),
  seo_title: z.string().trim().max(100).optional().or(z.literal('')),
  seo_description: z.string().trim().max(255).optional().or(z.literal('')),
  description_html: z.string().optional().or(z.literal('')),
  category_id: z.string().uuid().optional().or(z.literal('')),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
  is_visible: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

type Product = {
  id: string;
  name: string;
  slug: string;
  reference: string | null;
  ean: string | null;
  is_active: boolean;
  is_visible: boolean;
  category_id: string | null;
};

interface ProductDialogProps {
  open: boolean;
  onOpenChange: () => void;
  product: Product | null;
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [pendingThumbnailUrl, setPendingThumbnailUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      reference: '',
      ean: '',
      seo_title: '',
      seo_description: '',
      description_html: '',
      category_id: '',
      sort_order: 0,
      is_active: true,
      is_visible: true,
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: fullProduct } = useQuery({
    queryKey: ['admin-product', product?.id],
    queryFn: async () => {
      if (!product?.id) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (fullProduct) {
      form.reset({
        name: fullProduct.name || '',
        slug: fullProduct.slug || '',
        reference: fullProduct.reference || '',
        ean: fullProduct.ean || '',
        seo_title: fullProduct.seo_title || '',
        seo_description: fullProduct.seo_description || '',
        description_html: fullProduct.description_html || '',
        category_id: fullProduct.category_id || '',
        sort_order: fullProduct.sort_order || 0,
        is_active: fullProduct.is_active ?? true,
        is_visible: fullProduct.is_visible ?? true,
      });
      setVideoUrls(fullProduct.video_urls || []);
      setPendingThumbnailUrl(fullProduct.thumbnail_url || null);
    } else if (!product) {
      form.reset({
        name: '',
        slug: '',
        reference: '',
        ean: '',
        seo_title: '',
        seo_description: '',
        description_html: '',
        category_id: '',
        sort_order: 0,
        is_active: true,
        is_visible: true,
      });
      setVideoUrls([]);
      setPendingThumbnailUrl(null);
    }
  }, [fullProduct, product, form]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ean = form.getValues('ean')?.trim();
    const reference = form.getValues('reference')?.trim();
    const baseName = ean || reference;
    if (!baseName) {
      toast({
        title: 'Falta EAN o Referencia',
        description: 'Introduce primero el EAN o la referencia (C.N.) del producto.',
        variant: 'destructive',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${baseName}.${fileExt}`;

    setIsUploadingImage(true);
    try {
      await supabase.storage.from('product-images').remove([filePath]);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      setPendingThumbnailUrl(`${publicUrl}?t=${Date.now()}`);
      toast({ title: 'Imagen subida correctamente' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast({ title: 'Error al subir imagen', description: message, variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPendingThumbnailUrl(null);
  };

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        name: data.name,
        slug: data.slug,
        reference: data.reference || null,
        ean: data.ean || null,
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
        description_html: data.description_html || null,
        category_id: data.category_id || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
        is_visible: data.is_visible,
        video_urls: videoUrls.length > 0 ? videoUrls : null,
        thumbnail_url: pendingThumbnailUrl,
      };

      if (product?.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: product ? 'Producto actualizado' : 'Producto creado' });
      onOpenChange();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!product) {
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
                    <FormLabel>URL *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia (C.N.)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ean"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EAN</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)} value={field.value || "__none__"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Sin categoría</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="seo_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título SEO</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="seo_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción SEO</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_html"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Descripción del producto..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <VideoUrlsField videoUrls={videoUrls} onChange={setVideoUrls} />

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Activo</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_visible"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Visible en web</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onOpenChange}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
