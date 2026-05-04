import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActiveSession {
  session_id: string;
  user_id: string;
  email: string | null;
  clinic_name: string | null;
  professional_name: string | null;
  created_at: string;
  updated_at: string | null;
  not_after: string | null;
  user_agent: string | null;
  ip: string | null;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return '—';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac OS X/i.test(ua)) return 'macOS';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Otro';
}

export function ActiveSessionsAdmin() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-active-sessions'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_active_sessions');
      if (error) throw error;
      return (data ?? []) as ActiveSession[];
    },
    refetchInterval: 30 * 1000,
    staleTime: 0,
  });

  const onlineThreshold = 5 * 60 * 1000;
  const now = Date.now();
  const onlineCount = (data ?? []).filter(
    (s) => s.updated_at && now - new Date(s.updated_at).getTime() < onlineThreshold,
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Sesiones activas
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.length ?? 0} sesiones abiertas · {onlineCount} en línea ahora
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">No hay sesiones activas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Inicio sesión</TableHead>
                  <TableHead>Última actividad</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((s) => {
                  const lastActivity = s.updated_at ? new Date(s.updated_at).getTime() : 0;
                  const isOnline = lastActivity && now - lastActivity < onlineThreshold;
                  return (
                    <TableRow key={s.session_id}>
                      <TableCell>
                        {isOnline ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1.5" />
                            En línea
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactiva</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{s.clinic_name || s.professional_name || '—'}</div>
                        {s.clinic_name && s.professional_name && (
                          <div className="text-xs text-muted-foreground">{s.professional_name}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{s.email || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: es })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.updated_at
                          ? formatDistanceToNow(new Date(s.updated_at), { addSuffix: true, locale: es })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm">{parseUserAgent(s.user_agent)}</TableCell>
                      <TableCell className="text-sm font-mono text-xs">{s.ip || '—'}</TableCell>
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
