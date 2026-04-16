import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, Users } from 'lucide-react';

export function UsersAdmin() {
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('__all__');

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: recipeCounts } = useQuery({
    queryKey: ['admin-recipe-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_top_professionals', { lim: 1000 });
      if (error) throw error;
      const map: Record<string, number> = {};
      (data as any[]).forEach(d => { map[d.user_id] = Number(d.total_recipes); });
      return map;
    },
  });

  const provinces = [...new Set(profiles?.map(p => p.province).filter(Boolean) as string[])].sort();

  const filtered = profiles?.filter(p => {
    const matchSearch = !search ||
      p.clinic_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.professional_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.locality?.toLowerCase().includes(search.toLowerCase());
    const matchProvince = provinceFilter === '__all__' || p.province === provinceFilter;
    return matchSearch && matchProvince;
  }) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" /> Usuarios
        </h2>
        <span className="text-sm text-muted-foreground">{filtered.length} registrados</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clínica, profesional..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={provinceFilter} onValueChange={setProvinceFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Provincia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las provincias</SelectItem>
            {provinces.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
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
                    <TableHead>Clínica / Profesional</TableHead>
                    <TableHead>Provincia</TableHead>
                    <TableHead>Localidad</TableHead>
                    <TableHead>Nº Colegiado</TableHead>
                    <TableHead className="text-right">Recetas</TableHead>
                    <TableHead>Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.clinic_name || '—'}</div>
                        {p.professional_name && (
                          <div className="text-xs text-muted-foreground">{p.professional_name}</div>
                        )}
                      </TableCell>
                      <TableCell>{p.province || '—'}</TableCell>
                      <TableCell>{p.locality || '—'}</TableCell>
                      <TableCell className="text-sm">{p.registration_number || '—'}</TableCell>
                      <TableCell className="text-right font-semibold">{recipeCounts?.[p.user_id] ?? 0}</TableCell>
                      <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString('es-ES')}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
