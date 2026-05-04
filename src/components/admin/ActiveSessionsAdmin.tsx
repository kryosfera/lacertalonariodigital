import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  RefreshCw,
  Activity,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
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

const DEVICE_OPTIONS = ['iOS', 'Android', 'macOS', 'Windows', 'Linux', 'Otro'] as const;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

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

  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState<number>(1);

  const onlineThreshold = 5 * 60 * 1000;
  const now = Date.now();

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((s) => {
      if (q) {
        const hay = [s.email, s.clinic_name, s.professional_name, s.ip]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (deviceFilter !== 'all' && parseUserAgent(s.user_agent) !== deviceFilter) return false;
      if (statusFilter !== 'all') {
        const last = s.updated_at ? new Date(s.updated_at).getTime() : 0;
        const isOnline = !!last && now - last < onlineThreshold;
        if (statusFilter === 'online' && !isOnline) return false;
        if (statusFilter === 'inactive' && isOnline) return false;
      }
      return true;
    });
  }, [data, search, deviceFilter, statusFilter, now, onlineThreshold]);

  const onlineCount = useMemo(
    () =>
      filtered.filter(
        (s) => s.updated_at && now - new Date(s.updated_at).getTime() < onlineThreshold,
      ).length,
    [filtered, now, onlineThreshold],
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageRows = filtered.slice(startIndex, endIndex);

  const hasFilters = search.trim() !== '' || deviceFilter !== 'all' || statusFilter !== 'all';
  const clearFilters = () => {
    setSearch('');
    setDeviceFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  // Reset to page 1 whenever filters or page size change
  const resetPage = () => setPage(1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Sesiones activas
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {hasFilters
              ? `${total} de ${data?.length ?? 0} sesiones · ${onlineCount} en línea`
              : `${data?.length ?? 0} sesiones abiertas · ${onlineCount} en línea ahora`}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Buscar por email, profesional, clínica o IP…"
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  resetPage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Select
            value={deviceFilter}
            onValueChange={(v) => {
              setDeviceFilter(v);
              resetPage();
            }}
          >
            <SelectTrigger className="md:w-44">
              <SelectValue placeholder="Dispositivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los dispositivos</SelectItem>
              {DEVICE_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
          >
            <SelectTrigger className="md:w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="online">En línea</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">No hay sesiones activas.</p>
        ) : total === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground text-sm">
              No hay sesiones que coincidan con los filtros aplicados.
            </p>
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
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
                  {pageRows.map((s) => {
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
                          <div className="font-medium">
                            {s.clinic_name || s.professional_name || '—'}
                          </div>
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mostrar</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>
                  · {total === 0 ? 0 : startIndex + 1}–{endIndex} de {total}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(1)}
                  disabled={safePage <= 1}
                  aria-label="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2 tabular-nums">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(totalPages)}
                  disabled={safePage >= totalPages}
                  aria-label="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
