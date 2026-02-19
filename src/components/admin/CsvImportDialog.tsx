import { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ImportResult {
  success: boolean;
  summary: { total: number; processed: number; errors: number };
  errors: string[];
}

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEMPLATE_CSV = `name,slug,reference,ean,category,sort_order,is_active,is_visible,seo_title,seo_description,description
Nombre del Producto,nombre-del-producto,123456,8413261000000,Higiene Bucal,0,true,true,Título SEO,Descripción SEO,Descripción del producto`;

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvContent(ev.target?.result as string);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (!csvContent) return;
    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('import-products-csv', {
        body: { csv: csvContent },
      });
      if (error) throw error;
      setResult(data as ImportResult);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        toast({
          title: 'Importación completada',
          description: `${data.summary.processed} productos procesados`,
        });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setFileName('');
    setCsvContent('');
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar productos desde CSV</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con los productos a importar. Se realizará un upsert por slug.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Descarga la plantilla CSV de ejemplo</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-1" />
              Plantilla
            </Button>
          </div>

          {/* Columnas aceptadas */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Columnas aceptadas:</p>
            <p><span className="font-mono bg-muted px-1 rounded">name</span> (requerido), <span className="font-mono bg-muted px-1 rounded">slug</span>, <span className="font-mono bg-muted px-1 rounded">reference</span>, <span className="font-mono bg-muted px-1 rounded">ean</span></p>
            <p><span className="font-mono bg-muted px-1 rounded">category</span> (nombre o slug), <span className="font-mono bg-muted px-1 rounded">sort_order</span>, <span className="font-mono bg-muted px-1 rounded">is_active</span>, <span className="font-mono bg-muted px-1 rounded">is_visible</span></p>
            <p><span className="font-mono bg-muted px-1 rounded">seo_title</span>, <span className="font-mono bg-muted px-1 rounded">seo_description</span>, <span className="font-mono bg-muted px-1 rounded">description</span></p>
            <p className="text-xs mt-1">Separador: coma (<code>,</code>) o punto y coma (<code>;</code>). Encoding: UTF-8.</p>
          </div>

          {/* File picker */}
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            {fileName ? (
              <p className="text-sm font-medium text-foreground">{fileName}</p>
            ) : (
              <>
                <p className="text-sm font-medium">Haz clic para seleccionar un archivo</p>
                <p className="text-xs text-muted-foreground mt-1">CSV, máx. 5 MB</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Result */}
          {result && (
            <Alert variant={result.summary.errors > 0 ? 'destructive' : 'default'}>
              {result.summary.errors > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription className="space-y-1">
                <p>
                  <strong>{result.summary.processed}</strong> de <strong>{result.summary.total}</strong> productos importados.
                  {result.summary.errors > 0 && ` ${result.summary.errors} errores.`}
                </p>
                {result.errors.length > 0 && (
                  <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>... y {result.errors.length - 5} más</li>
                    )}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
            <Button onClick={handleImport} disabled={!csvContent || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Importar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
