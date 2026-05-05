import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, RefreshCw, AlertTriangle, CheckCircle2, Clock, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function EmailQueueAdmin() {
  const qc = useQueryClient();
  const [resendEmail, setResendEmail] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-email-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_email_queue_stats');
      if (error) throw error;
      return (data as any[])?.[0] ?? null;
    },
    refetchInterval: 10000,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_email_recent_logs', { lim: 100 });
      if (error) throw error;
      return data as any[];
    },
    refetchInterval: 15000,
  });

  const { data: signups } = useQuery({
    queryKey: ['admin-signup-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_recent_signup_attempts', { lim: 50 });
      if (error) throw error;
      return data as any[];
    },
    refetchInterval: 15000,
  });

  const resend = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'resend_confirmation', email },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Email reenviado', description: 'Se ha vuelto a generar el correo de confirmación.' });
      setResendEmail('');
      qc.invalidateQueries({ queryKey: ['admin-email-logs'] });
      qc.invalidateQueries({ queryKey: ['admin-email-stats'] });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const rateLimited = stats?.retry_after_until && new Date(stats.retry_after_until) > new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="h-6 w-6" /> Cola de emails
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            qc.invalidateQueries({ queryKey: ['admin-email-stats'] });
            qc.invalidateQueries({ queryKey: ['admin-email-logs'] });
            qc.invalidateQueries({ queryKey: ['admin-signup-attempts'] });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
        </Button>
      </div>

      {rateLimited && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">Envío en pausa por rate limit</p>
              <p className="text-muted-foreground">
                El proveedor pidió esperar hasta {new Date(stats!.retry_after_until).toLocaleString('es-ES')}.
                Los emails permanecen en cola y se reintentarán automáticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Clock className="h-4 w-4" />} label="En cola (auth)" value={stats?.queued_auth} loading={statsLoading} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="En cola (transac.)" value={stats?.queued_transactional} loading={statsLoading} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} label="Enviados 24h" value={stats?.sent_24h} loading={statsLoading} />
        <StatCard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="Fallidos 24h" value={stats?.failed_24h} loading={statsLoading} tone="destructive" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="DLQ auth" value={stats?.dlq_auth} loading={statsLoading} />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="DLQ transac." value={stats?.dlq_transactional} loading={statsLoading} />
        <StatCard icon={<Mail className="h-4 w-4" />} label="Suprimidos" value={stats?.suppressed_total} loading={statsLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" /> Reenviar email de confirmación
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Input
            type="email"
            placeholder="usuario@dominio.com"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="max-w-sm"
          />
          <Button
            onClick={() => resend.mutate(resendEmail.trim())}
            disabled={!resendEmail.trim() || resend.isPending}
          >
            {resend.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
            Reenviar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos envíos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : !logs?.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">Sin registros recientes.</p>
          ) : (
            <div className="overflow-auto max-h-[420px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Plantilla</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString('es-ES')}</TableCell>
                      <TableCell className="text-xs font-mono">{l.template_name}</TableCell>
                      <TableCell className="text-xs font-mono">{l.recipient_email}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={l.error_message ?? ''}>
                        {l.error_message ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {(l.status === 'dlq' || l.status === 'failed' || l.status === 'bounced') && (
                          <Button size="sm" variant="ghost" onClick={() => resend.mutate(l.recipient_email)} disabled={resend.isPending}>
                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reintentar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Intentos de registro recientes (7 días)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!signups?.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">Sin intentos recientes.</p>
          ) : (
            <div className="overflow-auto max-h-[360px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="text-right">Reenviar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signups.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(s.occurred_at).toLocaleString('es-ES')}</TableCell>
                      <TableCell className="text-xs font-mono">{s.email ?? '—'}</TableCell>
                      <TableCell className="text-xs">{s.action}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{s.ip_address ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        {s.email && (
                          <Button size="sm" variant="ghost" onClick={() => resend.mutate(s.email)} disabled={resend.isPending}>
                            <Send className="h-3.5 w-3.5 mr-1" /> Reenviar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, loading, tone }: { icon: React.ReactNode; label: string; value: any; loading?: boolean; tone?: 'destructive' }) {
  const n = Number(value ?? 0);
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
        <p className={`text-2xl font-bold mt-1 ${tone === 'destructive' && n > 0 ? 'text-destructive' : 'text-foreground'}`}>
          {loading ? '…' : n}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    sent: { label: 'Enviado', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
    pending: { label: 'En cola', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
    dlq: { label: 'Fallido', cls: 'bg-destructive/15 text-destructive' },
    failed: { label: 'Fallido', cls: 'bg-destructive/15 text-destructive' },
    bounced: { label: 'Rebotado', cls: 'bg-destructive/15 text-destructive' },
    suppressed: { label: 'Suprimido', cls: 'bg-muted text-muted-foreground' },
    complained: { label: 'Spam', cls: 'bg-destructive/15 text-destructive' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' };
  return <Badge variant="secondary" className={`${s.cls} border-0 text-[10px]`}>{s.label}</Badge>;
}
