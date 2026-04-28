import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Users, Shield, ShieldOff, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
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
import { UserDetailSheet } from './UserDetailSheet';

export function UsersAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('__all__');
  const [pending, setPending] = useState<{ userId: string; action: 'grant' | 'revoke'; name: string } | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

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

  const { data: adminIds } = useQuery({
    queryKey: ['admin-user-ids'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_top_professionals', { lim: 1 });
      // Fallback: query user_roles via edge — instead use direct select (own row only would fail).
      // We rely on the manage-admin-role function returning state, so here we just try direct read which will be empty for non-self rows.
      if (error) console.warn(error);
      // Direct attempt:
      const { data: rolesData } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      const set = new Set<string>((rolesData ?? []).map((r: any) => r.user_id));
      return set;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'grant' | 'revoke' }) => {
      const { data, error } = await supabase.functions.invoke('manage-admin-role', {
        body: { target_user_id: userId, action },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: (_d, vars) => {
      toast({
        title: vars.action === 'grant' ? 'Admin asignado' : 'Admin revocado',
        description: vars.action === 'grant' ? 'El usuario ahora es administrador.' : 'Se ha quitado el rol de administrador.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-user-ids'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
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
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => {
                    const isAdminUser = adminIds?.has(p.user_id) ?? false;
                    const isSelf = user?.id === p.user_id;
                    return (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedProfile(p)}
                      >
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            {p.clinic_name || '—'}
                            {isAdminUser && <Badge variant="secondary" className="text-[10px]">Admin</Badge>}
                          </div>
                          {p.professional_name && (
                            <div className="text-xs text-muted-foreground">{p.professional_name}</div>
                          )}
                        </TableCell>
                        <TableCell>{p.province || '—'}</TableCell>
                        <TableCell>{p.locality || '—'}</TableCell>
                        <TableCell className="text-sm">{p.registration_number || '—'}</TableCell>
                        <TableCell className="text-right font-semibold">{recipeCounts?.[p.user_id] ?? 0}</TableCell>
                        <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedProfile(p)}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detalle
                            </Button>
                            {isAdminUser ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isSelf || mutation.isPending}
                                onClick={() => setPending({ userId: p.user_id, action: 'revoke', name: p.clinic_name || p.professional_name || 'usuario' })}
                                title={isSelf ? 'No puedes quitarte el rol a ti mismo' : 'Quitar admin'}
                              >
                                <ShieldOff className="h-4 w-4 mr-1" />
                                Quitar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={mutation.isPending}
                                onClick={() => setPending({ userId: p.user_id, action: 'grant', name: p.clinic_name || p.professional_name || 'usuario' })}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Hacer admin
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.action === 'grant' ? '¿Conceder rol de administrador?' : '¿Quitar rol de administrador?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action === 'grant'
                ? `${pending?.name} podrá acceder al panel de administración y gestionar todos los datos.`
                : `${pending?.name} dejará de tener acceso al panel de administración.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) {
                  mutation.mutate({ userId: pending.userId, action: pending.action });
                  setPending(null);
                }
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
