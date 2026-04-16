import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ImageIcon, FolderTree, Trash2, Wrench } from 'lucide-react';

export function MaintenanceAdmin() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingCategories, setIsSyncingCategories] = useState(false);
  const [isCleaningUrls, setIsCleaningUrls] = useState(false);

  const handleSyncImages = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-product-images');
      if (error) throw error;
      if (data.success) {
        toast.success(`Sincronización completada: ${data.summary.matched} imágenes asignadas, ${data.summary.unmatched} sin coincidencia`, { duration: 5000 });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(`Error al sincronizar: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncCategoryImages = async () => {
    setIsSyncingCategories(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-category-images');
      if (error) throw error;
      if (data.success) {
        toast.success(`Categorías sincronizadas: ${data.summary.matched} imágenes asignadas, ${data.summary.unmatched} sin coincidencia`, { duration: 5000 });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(`Error al sincronizar categorías: ${error.message}`);
    } finally {
      setIsSyncingCategories(false);
    }
  };

  const handleCleanExpiredUrls = async () => {
    setIsCleaningUrls(true);
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_short_urls');
      if (error) throw error;
      const count = data as number;
      toast.success(count === 0 ? 'No había URLs expiradas' : `${count} URL${count !== 1 ? 's' : ''} expirada${count !== 1 ? 's' : ''} eliminada${count !== 1 ? 's' : ''}`, { duration: 5000 });
    } catch (error: any) {
      toast.error(`Error al limpiar: ${error.message}`);
    } finally {
      setIsCleaningUrls(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Wrench className="h-6 w-6" /> Mantenimiento
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Sync Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sincroniza imágenes del bucket de productos con la base de datos.
            </p>
            <Button onClick={handleSyncImages} disabled={isSyncing} className="w-full btn-gradient-red">
              {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
              Sincronizar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderTree className="h-4 w-4" /> Sync Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sincroniza imágenes del bucket de categorías con la base de datos.
            </p>
            <Button onClick={handleSyncCategoryImages} disabled={isSyncingCategories} className="w-full btn-gradient-red">
              {isSyncingCategories ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FolderTree className="w-4 h-4 mr-2" />}
              Sincronizar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Limpiar URLs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Elimina URLs cortas expiradas de la base de datos.
            </p>
            <Button onClick={handleCleanExpiredUrls} disabled={isCleaningUrls} className="w-full btn-gradient-red">
              {isCleaningUrls ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Limpiar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
