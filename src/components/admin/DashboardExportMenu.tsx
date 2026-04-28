import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { exportToXlsx, exportToCsv, exportToPdf, type DashboardExportData } from '@/lib/dashboardExport';

interface Props {
  getData: () => DashboardExportData;
  pdfTargetId: string;
  disabled?: boolean;
}

export function DashboardExportMenu({ getData, pdfTargetId, disabled }: Props) {
  const [busy, setBusy] = useState(false);

  const handle = async (kind: 'xlsx' | 'csv' | 'pdf') => {
    if (busy) return;
    setBusy(true);
    const t = toast.loading('Generando export…');
    try {
      const data = getData();
      if (kind === 'xlsx') exportToXlsx(data);
      else if (kind === 'csv') exportToCsv(data);
      else await exportToPdf(pdfTargetId, data.range);
      toast.success('Export listo', { id: t });
    } catch (e: any) {
      toast.error(`Error: ${e?.message || 'no se pudo generar'}`, { id: t });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled || busy} className="h-8 gap-1.5 text-xs">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => handle('xlsx')} className="gap-2 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" /> Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle('csv')} className="gap-2 text-xs">
          <FileText className="h-3.5 w-3.5 text-blue-600" /> CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle('pdf')} className="gap-2 text-xs">
          <FileImage className="h-3.5 w-3.5 text-primary" /> PDF (snapshot)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
