import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, FileText, Download } from 'lucide-react';

export function RecipesAdmin() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('__all__');

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['admin-all-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const filtered = recipes?.filter(r => {
    const matchSearch = !search ||
      r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      r.recipe_code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '__all__' ||
      (statusFilter === 'dispensed' && r.dispensed_at) ||
      (statusFilter === 'pending' && !r.dispensed_at);
    return matchSearch && matchStatus;
  }) ?? [];

  const handleExportCsv = () => {
    if (!filtered.length) return;
    const headers = ['Código', 'Paciente', 'Fecha', 'Envío', 'Estado', 'Productos'];
    const rows = filtered.map(r => {
      const products = Array.isArray(r.products) ? (r.products as any[]).map((p: any) => p.name).join('; ') : '';
      return [
        r.recipe_code || '',
        r.patient_name,
        new Date(r.created_at).toLocaleDateString('es-ES'),
        r.sent_via || '',
        r.dispensed_at ? 'Dispensada' : 'Pendiente',
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
                    <TableHead>Código</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Envío</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => {
                    const products = Array.isArray(r.products) ? (r.products as any[]) : [];
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.recipe_code || '—'}</TableCell>
                        <TableCell className="font-medium">{r.patient_name}</TableCell>
                        <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="text-sm capitalize">{r.sent_via || '—'}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {products.map((p: any) => p.name).join(', ') || '—'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.dispensed_at ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {r.dispensed_at ? 'Dispensada' : 'Pendiente'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

      <p className="text-xs text-muted-foreground">Mostrando las últimas 500 recetas</p>
    </div>
  );
}
