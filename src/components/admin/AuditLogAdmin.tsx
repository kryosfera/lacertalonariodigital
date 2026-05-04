import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, ShieldCheck, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  occurred_at: string;
  user_id: string | null;
  email: string | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
}

const ACTION_LABEL: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  login: { label: 'Login', variant: 'default' },
  logout: { label: 'Logout', variant: 'secondary' },
  token_refreshed: { label: 'Refresh', variant: 'outline' },
  user_signedup: { label: 'Registro', variant: 'default' },
  user_recovery_requested: { label: 'Recuperar', variant: 'outline' },
  user_modified: { label: 'Modificado', variant: 'outline' },
};

export function AuditLogAdmin() {
  const [days, setDays] = useState(7);
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-login-audit', days],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_login_audit', { days, lim: 500 });
      if (error) throw error;
      return (data ?? []) as AuditEntry[];
    },
    staleTime: 30 * 1000,
  });

  const filtered = (data ?? []).filter((e) => actionFilter === 'all' || e.action === actionFilter);

  const exportCsv = () => {
    const rows = [
      ['Fecha', 'Acción', 'Email', 'User ID', 'IP', 'User Agent'],
      ...filtered.map((e) => [
        format(new Date(e.occurred_at), 'yyyy-MM-dd HH:mm:ss'),
        e.action,
        e.email ?? '',
        e.user_id ?? '',
        e.ip_address ?? '',
        e.user_agent ?? '',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-accesos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Auditoría de accesos
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} eventos · últimos {days} días
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Últimas 24h</SelectItem>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
              <SelectItem value="90">90 días</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="user_signedup">Registro</SelectItem>
              <SelectItem value="token_refreshed">Refresh</SelectItem>
              <SelectItem value="user_recovery_requested">Recuperar contraseña</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">Sin eventos en este rango.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="hidden md:table-cell">User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const meta = ACTION_LABEL[e.action] ?? { label: e.action, variant: 'outline' as const };
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(e.occurred_at), "d MMM yyyy HH:mm:ss", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{e.email || '—'}</TableCell>
                      <TableCell className="text-sm font-mono text-xs">{e.ip_address || '—'}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs truncate">
                        {e.user_agent || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
