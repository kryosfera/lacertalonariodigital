import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, FileText, Download } from 'lucide-react';

type UnifiedRecipe = {
  id: string;
  source: 'pro' | 'quick';
  recipe_code: string | null;
  patient_name: string;
  created_at: string;
  sent_via: string | null;
  dispensed_at: string | null;
  products: any;
  contact?: string | null;
};

export function RecipesAdmin() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('__all__');
  const [sourceFilter, setSourceFilter] = useState('__all__');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => { setPage(1); }, [search, statusFilter, sourceFilter, pageSize]);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['admin-all-recipes-unified'],
    queryFn: async () => {
      const [proRes, quickRes] = await Promise.all([
        supabase.from('recipes')
          .select('id, recipe_code, patient_id, patient_name, created_at, sent_via, dispensed_at, products')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase.from('quick_recipes')
          .select('id, created_at, sent_via, products')
          .order('created_at', { ascending: false })
          .limit(500),
      ]);
      if (proRes.error) throw proRes.error;
      if (quickRes.error) throw quickRes.error;

      const proRows = proRes.data ?? [];
      const patientIds = [...new Set((proRows as any[]).map((r: any) => r.patient_id).filter(Boolean))];
      let patientsMap: Record<string, { email?: string; phone?: string }> = {};
      if (patientIds.length > 0) {
        const { data: patientsData, error: patientsErr } = await supabase
          .from('patients')
          .select('id, email, phone')
          .in('id', patientIds);
        if (!patientsErr && patientsData) {
          patientsMap = Object.fromEntries(
            patientsData.map((p: any) => [p.id, { email: p.email, phone: p.phone }])
          );
        }
      }

      const pro: UnifiedRecipe[] = proRows.map((r: any) => {
        const p = patientsMap[r.patient_id];
        return {
          ...r,
          source: 'pro' as const,
          contact: p?.email || p?.phone || null,
        };
      });
      const quick: UnifiedRecipe[] = (quickRes.data ?? []).map((r: any) => ({
        id: r.id, source: 'quick' as const, recipe_code: null,
        patient_name: 'Receta rápida', created_at: r.created_at,
        sent_via: r.sent_via, dispensed_at: null, products: r.products,
        contact: null,
      }));
      return [...pro, ...quick].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    },
  });

  const filtered = recipes?.filter(r => {
    const matchSearch = !search ||
      r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      r.recipe_code?.toLowerCase().includes(search.toLowerCase()) ||
      r.contact?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '__all__' ||
      (statusFilter === 'dispensed' && r.dispensed_at) ||
      (statusFilter === 'pending' && !r.dispensed_at && r.source === 'pro');
    const matchSource = sourceFilter === '__all__' || sourceFilter === r.source;
    return matchSearch && matchStatus && matchSource;
  }) ?? [];

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  const handleExportCsv = () => {
    if (!filtered.length) return;
    const headers = ['Tipo', 'Paciente', 'Contacto', 'Fecha', 'Hora', 'Envío', 'Estado', 'Productos'];
    const rows = filtered.map(r => {
      const products = Array.isArray(r.products) ? (r.products as any[]).map((p: any) => p.name).join('; ') : '';
      const d = new Date(r.created_at);
      return [
        r.source === 'pro' ? 'Pro' : 'Rápida',
        r.patient_name,
        r.contact || '',
        d.toLocaleDateString('es-ES'),
        d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        r.sent_via || '',
        r.source === 'quick' ? '—' : (r.dispensed_at ? 'Dispensada' : 'Pendiente'),
        products,
      ];
    });
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recetas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6" /> Recetas
        </h2>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!filtered.length}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar paciente o código..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="quick">Rápidas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="dispensed">Dispensadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Envío</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map(r => {
                    const products = Array.isArray(r.products) ? (r.products as any[]) : [];
                    return (
                      <TableRow key={`${r.source}-${r.id}`}>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.source === 'pro' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {r.source === 'pro' ? 'Pro' : 'Rápida'}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{r.patient_name}</TableCell>
                        <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="text-sm tabular-nums">{new Date(r.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell className="text-sm capitalize">{r.sent_via || '—'}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {products.map((p: any) => p.name).join(', ') || '—'}
                        </TableCell>
                        <TableCell>
                          {r.source === 'quick' ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.dispensed_at ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                              {r.dispensed_at ? 'Dispensada' : 'Pendiente'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron recetas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {filtered.length === 0
              ? '0 resultados'
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} de ${filtered.length}`}
          </span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => (
                <SelectItem key={n} value={String(n)}>{n} / pág.</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(1)}>«</Button>
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</Button>
          <span className="text-xs text-muted-foreground tabular-nums px-2">
            Página {currentPage} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)}>»</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Mostrando hasta las últimas 500 de cada tipo (Pro + Rápidas)</p>
    </div>
  );
}
