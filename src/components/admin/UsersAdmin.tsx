import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Users, Shield, ShieldOff, Eye, Trash2, Download, History, UserPlus, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { CreateUserDialog } from './CreateUserDialog';

function exportUsersCsv(
  rows: any[],
  emails: Record<string, string>,
  recipeCounts: Record<string, number>,
  adminIds?: Set<string>,
) {
  const header = ['Clinica', 'Profesional', 'Email', 'Provincia', 'Localidad', 'Nº Colegiado', 'Recetas', 'Admin', 'Registro'];
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [header.join(',')];
  rows.forEach(p => {
    lines.push([
      p.clinic_name ?? '',
      p.professional_name ?? '',
      emails[p.user_id] ?? '',
      p.province ?? '',
      p.locality ?? '',
      p.registration_number ?? '',
      recipeCounts[p.user_id] ?? 0,
      adminIds?.has(p.user_id) ? 'sí' : 'no',
      new Date(p.created_at).toISOString(),
    ].map(escape).join(','));
  });
  const csv = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function UsersAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('__all__');
  const [pending, setPending] = useState<{ userId: string; action: 'grant' | 'revoke'; name: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ userId: string; label: string } | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [auditOpen, setAuditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
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

  const { data: emails } = useQuery({
    queryKey: ['admin-user-emails'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'list_emails' },
      });
      if (error) throw error;
      const map: Record<string, string> = {};
      ((data as any)?.users ?? []).forEach((u: any) => { if (u.email) map[u.user_id] = u.email; });
      return map;
    },
  });

  const { data: adminIds } = useQuery({
    queryKey: ['admin-user-ids'],
    queryFn: async () => {
      const { data: rolesData } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      return new Set<string>((rolesData ?? []).map((r: any) => r.user_id));
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

  const deleteMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'delete_user', target_user_id: userId, reason: reason || null },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Usuario eliminado', description: 'La cuenta y todos sus datos han sido eliminados.' });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recipe-counts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-emails'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-ids'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deletion-audit'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'resend_confirmation', email },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => toast({ title: 'Email reenviado', description: 'Se ha vuelto a generar el correo de confirmación.' }),
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const { data: auditEntries, isLoading: auditLoading } = useQuery({
    queryKey: ['admin-deletion-audit'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'list_deletion_audit' },
      });
      if (error) throw error;
      return ((data as any)?.entries ?? []) as Array<{
        id: string; deleted_user_id: string; deleted_user_email: string | null;
        deleted_user_label: string | null; deleted_by: string; deleted_by_email: string | null;
        reason: string | null; deleted_at: string;
      }>;
    },
    enabled: auditOpen,
  });

  const provinces = [...new Set(profiles?.map(p => p.province).filter(Boolean) as string[])].sort();

  const filtered = profiles?.filter(p => {
    const email = emails?.[p.user_id] ?? '';
    const matchSearch = !search ||
      p.clinic_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.professional_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.locality?.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    const matchProvince = provinceFilter === '__all__' || p.province === provinceFilter;
    return matchSearch && matchProvince;
  }) ?? [];

  const expectedConfirm = pendingDelete?.label ?? '';
  const canDelete = !!pendingDelete && confirmText.trim() === expectedConfirm;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" /> Usuarios
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">{filtered.length} registrados</span>
          <Button size="sm" variant="outline" onClick={() => setAuditOpen(true)}>
            <History className="h-4 w-4 mr-1" /> Historial
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportUsersCsv(filtered, emails ?? {}, recipeCounts ?? {}, adminIds)}
            disabled={!profiles?.length}
          >
            <Download className="h-4 w-4 mr-1" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clínica, profesional, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
                    <TableHead>Email</TableHead>
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
                    const email = emails?.[p.user_id];
                    return (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedProfile({ ...p, email })}
                      >
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            {p.clinic_name || <span className="text-muted-foreground">—</span>}
                            {isAdminUser && <Badge variant="secondary" className="text-[10px]">Admin</Badge>}
                          </div>
                          {p.professional_name && (
                            <div className="text-xs text-muted-foreground">{p.professional_name}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {email ? (
                            <span className="font-mono text-xs">{email}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
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
                              onClick={() => setSelectedProfile({ ...p, email })}
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
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isSelf || isAdminUser || deleteMutation.isPending}
                              onClick={() => {
                                setConfirmText('');
                                setPendingDelete({
                                  userId: p.user_id,
                                  label: p.clinic_name || p.professional_name || email || 'usuario',
                                });
                              }}
                              title={
                                isSelf ? 'No puedes eliminarte a ti mismo'
                                : isAdminUser ? 'Quita primero el rol de admin'
                                : 'Eliminar usuario'
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => { if (!o) { setPendingDelete(null); setConfirmText(''); setDeleteReason(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Eliminar usuario definitivamente</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Vas a eliminar la cuenta de <strong>{pendingDelete?.label}</strong> y <strong>todos sus datos</strong>:
                  perfil, pacientes, recetas, plantillas y tickets. Esta acción es <strong>irreversible</strong>.
                </p>
                <p className="text-sm">
                  Para confirmar, escribe exactamente: <code className="bg-muted px-1.5 py-0.5 rounded">{expectedConfirm}</code>
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={expectedConfirm}
                  autoFocus
                />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Motivo (opcional, queda en el historial)</label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value.slice(0, 500))}
                    placeholder="Ej: solicitud RGPD del usuario, cuenta duplicada, prueba interna..."
                    rows={2}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canDelete || deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                if (!canDelete || !pendingDelete) {
                  e.preventDefault();
                  return;
                }
                deleteMutation.mutate({ userId: pendingDelete.userId, reason: deleteReason.trim() });
                setPendingDelete(null);
                setConfirmText('');
                setDeleteReason('');
              }}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar definitivamente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Historial de eliminaciones
            </DialogTitle>
            <DialogDescription>
              Registro de las eliminaciones de usuarios realizadas por administradores.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto -mx-6 px-6">
            {auditLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : !auditEntries?.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">Sin eliminaciones registradas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario eliminado</TableHead>
                    <TableHead>Eliminado por</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditEntries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(e.deleted_at).toLocaleString('es-ES')}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">{e.deleted_user_label || '—'}</div>
                        {e.deleted_user_email && (
                          <div className="text-xs text-muted-foreground font-mono">{e.deleted_user_email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="font-mono text-xs">{e.deleted_by_email || e.deleted_by}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {e.reason || <span className="italic">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UserDetailSheet
        open={!!selectedProfile}
        onOpenChange={(o) => !o && setSelectedProfile(null)}
        profile={selectedProfile}
        isAdminUser={selectedProfile ? (adminIds?.has(selectedProfile.user_id) ?? false) : false}
      />
    </div>
  );
}
