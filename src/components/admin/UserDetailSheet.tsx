import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText, Users as UsersIcon, Activity, LayoutDashboard,
  Calendar, CheckCircle2, Clock, Package, MapPin, Hash, Building2,
  Loader2, Search, Download, ExternalLink, Send, Mail, MessageSquare,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { ActivityHeatmap } from './ActivityHeatmap';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  clinic_name: string | null;
  professional_name: string | null;
  clinic_address: string | null;
  province: string | null;
  locality: string | null;
  registration_number: string | null;
  signature_url: string | null;
  logo_url: string | null;
  created_at: string;
  email?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  isAdminUser: boolean;
}

const SEND_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-600' },
  email: { label: 'Email', icon: Mail, color: 'text-blue-600' },
  sms: { label: 'SMS', icon: Send, color: 'text-purple-600' },
  sin_envio: { label: 'Sin envío', icon: Clock, color: 'text-muted-foreground' },
};

export function UserDetailSheet({ open, onOpenChange, profile, isAdminUser }: Props) {
  const userId = profile?.user_id;
  const enabled = open && !!userId;

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin-user-overview', userId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_user_overview', { target_user: userId! });
      if (error) throw error;
      return (data as any[])?.[0] ?? null;
    },
  });

  const { data: timeseries } = useQuery({
    queryKey: ['admin-user-timeseries', userId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_user_recipes_timeseries', { target_user: userId!, days: 90 });
      if (error) throw error;
      return (data as any[]).map(d => ({ day: d.day, total: Number(d.total) }));
    },
  });

  const { data: topProducts } = useQuery({
    queryKey: ['admin-user-top-products', userId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_user_top_products', { target_user: userId!, lim: 5 });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: heatmap } = useQuery({
    queryKey: ['admin-user-heatmap', userId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_user_activity_heatmap', { target_user: userId! });
      if (error) throw error;
      return (data as any[]).map(d => ({ weekday: d.weekday, hour: d.hour, total: Number(d.total) }));
    },
  });

  const { data: sendMethods } = useQuery({
    queryKey: ['admin-user-send-methods', userId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_user_send_methods', { target_user: userId! });
      if (error) throw error;
      return (data as any[]).map(d => ({ method: d.method, total: Number(d.total) }));
    },
  });

  const { data: recipes, isLoading: loadingRecipes } = useQuery({
    queryKey: ['admin-user-recipes', userId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ['admin-user-patients', userId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_user_patients_with_stats', { target_user: userId! });
      if (error) throw error;
      return (data as any[]).map(p => ({ ...p, total_recipes: Number(p.total_recipes) }));
    },
  });

  const lastUseDays = useMemo(() => {
    if (!overview?.last_recipe_at) return null;
    const diff = Date.now() - new Date(overview.last_recipe_at).getTime();
    return Math.floor(diff / 86400000);
  }, [overview?.last_recipe_at]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[760px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-start gap-4">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.clinic_name ?? ''}
                className="w-14 h-14 rounded-lg object-contain bg-muted shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-xl font-bold flex items-center gap-2 flex-wrap">
                <span className="truncate">{profile?.clinic_name || 'Sin clínica'}</span>
                {isAdminUser && <Badge variant="secondary" className="text-[10px]">Admin</Badge>}
              </SheetTitle>
              {profile?.professional_name && (
                <p className="text-sm text-muted-foreground mt-0.5">{profile.professional_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                {profile?.email && (
                  <span className="flex items-center gap-1 font-mono">
                    <Mail className="w-3 h-3" />
                    {profile.email}
                  </span>
                )}
                {(profile?.locality || profile?.province) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {[profile.locality, profile.province].filter(Boolean).join(', ')}
                  </span>
                )}
                {profile?.registration_number && (
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Col. {profile.registration_number}
                  </span>
                )}
                {profile?.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Alta {new Date(profile.created_at).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-3 grid grid-cols-4 shrink-0">
            <TabsTrigger value="overview" className="gap-1.5"><LayoutDashboard className="w-3.5 h-3.5" />Resumen</TabsTrigger>
            <TabsTrigger value="recipes" className="gap-1.5"><FileText className="w-3.5 h-3.5" />Recetas</TabsTrigger>
            <TabsTrigger value="patients" className="gap-1.5"><UsersIcon className="w-3.5 h-3.5" />Pacientes</TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5"><Activity className="w-3.5 h-3.5" />Actividad</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4">
              <AnimatePresence mode="wait">
                {/* OVERVIEW */}
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {loadingOverview ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
                    ) : !overview ? (
                      <p className="text-center text-muted-foreground py-10">Sin datos</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                          <MiniKpi icon={FileText} label="Total recetas" value={overview.total_recipes} />
                          <MiniKpi icon={Calendar} label="Este mes" value={overview.current_month} />
                          <MiniKpi icon={Clock} label="Hoy" value={overview.today_count} />
                          <MiniKpi icon={CheckCircle2} label="Dispensadas" value={overview.dispensed_count} />
                          <MiniKpi icon={Activity} label="% dispensación" value={`${overview.dispensation_rate}%`} />
                          <MiniKpi icon={Package} label="Productos / receta" value={overview.avg_products_per_recipe} />
                          <MiniKpi icon={UsersIcon} label="Pacientes" value={overview.total_patients} />
                          <MiniKpi
                            icon={Clock}
                            label="Último uso"
                            value={lastUseDays === null ? '—' : lastUseDays === 0 ? 'Hoy' : `Hace ${lastUseDays}d`}
                          />
                        </div>

                        <Card>
                          <CardContent className="p-4">
                            <h4 className="text-sm font-semibold mb-2">Recetas (últimos 90 días)</h4>
                            {timeseries && timeseries.length > 0 ? (
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={timeseries}>
                                    <defs>
                                      <linearGradient id="usrSpark" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(0,72%,51%)" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="hsl(0,72%,51%)" stopOpacity={0} />
                                      </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide />
                                    <Tooltip
                                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                      labelFormatter={(l) => new Date(l).toLocaleDateString('es-ES')}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="hsl(0,72%,51%)" strokeWidth={1.5} fill="url(#usrSpark)" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Sin actividad</p>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <h4 className="text-sm font-semibold mb-3">Top 5 productos prescritos</h4>
                            {topProducts && topProducts.length > 0 ? (
                              <div className="space-y-2">
                                {topProducts.map((p, i) => (
                                  <div key={`${p.reference}-${i}`} className="flex items-center gap-3">
                                    {p.thumbnail_url ? (
                                      <img src={p.thumbnail_url} alt="" className="w-8 h-8 rounded object-contain bg-muted" />
                                    ) : (
                                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center"><Package className="w-3.5 h-3.5 text-muted-foreground" /></div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{p.product_name}</p>
                                      <p className="text-[11px] text-muted-foreground">{p.reference || '—'}</p>
                                    </div>
                                    <Badge variant={i < 3 ? 'default' : 'secondary'}>{p.times_prescribed}</Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Sin productos prescritos</p>
                            )}
                          </CardContent>
                        </Card>

                        {(profile?.clinic_address || profile?.signature_url) && (
                          <Card>
                            <CardContent className="p-4 space-y-2 text-sm">
                              {profile?.clinic_address && (
                                <p><span className="text-muted-foreground">Dirección:</span> {profile.clinic_address}</p>
                              )}
                              {profile?.signature_url && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Firma:</p>
                                  <img src={profile.signature_url} alt="firma" className="h-12 bg-white rounded border p-1" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </motion.div>
                </TabsContent>

                {/* RECIPES */}
                <TabsContent value="recipes" className="mt-0">
                  <RecipesTab recipes={recipes ?? []} loading={loadingRecipes} clinicName={profile?.clinic_name ?? 'usuario'} />
                </TabsContent>

                {/* PATIENTS */}
                <TabsContent value="patients" className="mt-0">
                  <PatientsTab patients={patients ?? []} loading={loadingPatients} />
                </TabsContent>

                {/* ACTIVITY */}
                <TabsContent value="activity" className="mt-0 space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold mb-3">Mapa de actividad (últimos 90 días)</h4>
                      <ActivityHeatmap data={heatmap ?? []} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold mb-3">Canales de envío</h4>
                      {sendMethods && sendMethods.length > 0 ? (
                        <div className="space-y-2">
                          {sendMethods.map(m => {
                            const meta = SEND_LABELS[m.method] ?? { label: m.method, icon: Send, color: 'text-muted-foreground' };
                            const Icon = meta.icon;
                            const total = sendMethods.reduce((s, x) => s + x.total, 0);
                            const pct = total === 0 ? 0 : Math.round((m.total / total) * 100);
                            return (
                              <div key={m.method}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="flex items-center gap-1.5"><Icon className={`w-3.5 h-3.5 ${meta.color}`} />{meta.label}</span>
                                  <span className="font-medium tabular-nums">{m.total} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full bg-primary"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sin datos</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold mb-3">Volumen diario (90d)</h4>
                      {timeseries && timeseries.length > 0 ? (
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timeseries}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} interval={Math.floor(timeseries.length / 8)} />
                              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} labelFormatter={(l) => new Date(l).toLocaleDateString('es-ES')} />
                              <Bar dataKey="total" fill="hsl(0,72%,51%)" radius={[3, 3, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sin actividad</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function MiniKpi({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-2.5">
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-md btn-gradient-red shrink-0">
            <Icon className="h-3 w-3 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-medium leading-tight truncate">{label}</p>
            <p className="text-lg font-bold leading-tight tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecipesTab({ recipes, loading, clinicName }: { recipes: any[]; loading: boolean; clinicName: string }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('__all__');

  const filtered = recipes.filter(r => {
    const matchSearch = !search ||
      r.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.recipe_code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '__all__' ||
      (statusFilter === 'dispensed' && r.dispensed_at) ||
      (statusFilter === 'pending' && !r.dispensed_at);
    return matchSearch && matchStatus;
  });

  const handleExportCsv = () => {
    if (!filtered.length) return;
    const headers = ['Código', 'Paciente', 'Fecha', 'Envío', 'Estado', 'Productos'];
    const rows = filtered.map(r => {
      const products = Array.isArray(r.products) ? r.products.map((p: any) => p.name).join('; ') : '';
      return [
        r.recipe_code || '',
        r.patient_name,
        new Date(r.created_at).toLocaleDateString('es-ES'),
        r.sent_via || '',
        r.dispensed_at ? 'Dispensada' : 'Pendiente',
        products,
      ];
    });
    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recetas_${clinicName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground">{filtered.length} de {recipes.length} recetas</div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!filtered.length}>
          <Download className="w-3.5 h-3.5 mr-1.5" />Exportar CSV
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Paciente o código..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            <SelectItem value="dispensed">Dispensadas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-center">Prod.</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-[11px]">{r.recipe_code || '—'}</TableCell>
                    <TableCell className="text-sm font-medium">{r.patient_name}</TableCell>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="text-center text-sm">{Array.isArray(r.products) ? r.products.length : 0}</TableCell>
                    <TableCell>
                      {r.dispensed_at ? (
                        <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300">Dispensada</Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.recipe_code && (
                        <Link to={`/r/${r.recipe_code}`} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="ghost" className="h-7 w-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6 text-sm">Sin recetas</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PatientsTab({ patients, loading }: { patients: any[]; loading: boolean }) {
  const [search, setSearch] = useState('');
  const filtered = patients.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground">{filtered.length} de {patients.length} pacientes</div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-center">Recetas</TableHead>
                  <TableHead>Última</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">{p.name}</TableCell>
                    <TableCell className="text-xs">
                      {p.phone && <div>{p.phone}</div>}
                      {p.email && <div className="text-muted-foreground">{p.email}</div>}
                      {!p.phone && !p.email && <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center font-semibold">{p.total_recipes}</TableCell>
                    <TableCell className="text-xs">{p.last_recipe_at ? new Date(p.last_recipe_at).toLocaleDateString('es-ES') : '—'}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6 text-sm">Sin pacientes</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
