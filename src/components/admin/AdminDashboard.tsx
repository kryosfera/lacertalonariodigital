import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Users, Package, TrendingUp, CheckCircle, Send, Calendar, ShoppingBag, MapPin, Activity, LifeBuoy, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Line, ComposedChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KpiCard } from './KpiCard';
import { SpainProvinceMap } from './SpainProvinceMap';
import { ActivityHeatmap } from './ActivityHeatmap';
import { DashboardRangeFilter } from './DashboardRangeFilter';
import { DashboardExportMenu } from './DashboardExportMenu';
import { getRangeBounds, formatBucketLabel, type RangePreset } from '@/lib/dateRanges';
import type { DashboardExportData } from '@/lib/dashboardExport';

const SEND_COLORS: Record<string, string> = {
  'WhatsApp': 'hsl(142, 70%, 45%)',
  'Email': 'hsl(210, 70%, 50%)',
  'PDF': 'hsl(0, 72%, 51%)',
  'Impresión': 'hsl(35, 80%, 50%)',
  'Email + WhatsApp': 'hsl(270, 60%, 55%)',
  'Sin envío': 'hsl(0, 0%, 60%)',
};
const SEND_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', email: 'Email', pdf: 'PDF', print: 'Impresión',
  both: 'Email + WhatsApp', sin_envio: 'Sin envío',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

const RANGE_KEY = 'admin_dashboard_range';

export function AdminDashboard() {
  // Persisted range state
  const [preset, setPreset] = useState<RangePreset>(() => {
    try {
      const v = localStorage.getItem(RANGE_KEY);
      if (v && ['today','7d','30d','mtd','90d','ytd','all','custom'].includes(v)) return v as RangePreset;
    } catch {}
    return '30d';
  });
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>(() => {
    try {
      const v = localStorage.getItem(RANGE_KEY + '_custom');
      if (v) { const p = JSON.parse(v); return { start: new Date(p.start), end: new Date(p.end) }; }
    } catch {}
    return undefined;
  });

  const range = useMemo(() => getRangeBounds(preset, customRange?.start, customRange?.end), [preset, customRange]);
  const startISO = range.start.toISOString();
  const endISO = range.end.toISOString();

  useEffect(() => {
    try {
      localStorage.setItem(RANGE_KEY, preset);
      if (preset === 'custom' && customRange) {
        localStorage.setItem(RANGE_KEY + '_custom', JSON.stringify({ start: customRange.start.toISOString(), end: customRange.end.toISOString() }));
      }
    } catch {}
  }, [preset, customRange]);

  const handleRangeChange = (p: RangePreset, custom?: { start: Date; end: Date }) => {
    setPreset(p);
    if (custom) setCustomRange(custom);
  };

  // Global (non-range) counts — Pro + Quick
  const { data: totalRecipes, isLoading: loadingRecipes } = useQuery({
    queryKey: ['admin-total-recipes'],
    queryFn: async () => {
      const [pro, quick] = await Promise.all([
        supabase.from('recipes').select('*', { count: 'exact', head: true }),
        supabase.from('quick_recipes').select('*', { count: 'exact', head: true }),
      ]);
      return (pro.count ?? 0) + (quick.count ?? 0);
    },
  });
  const { data: totalUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-total-users'],
    queryFn: async () => (await supabase.from('profiles').select('*', { count: 'exact', head: true })).count ?? 0,
  });
  const { data: totalProducts } = useQuery({
    queryKey: ['admin-total-products'],
    queryFn: async () => (await supabase.from('products').select('*', { count: 'exact', head: true })).count ?? 0,
  });

  // Range-scoped queries
  const { data: kpis } = useQuery({
    queryKey: ['admin-kpis-range', startISO, endISO],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_kpis_range', { start_ts: startISO, end_ts: endISO });
      if (error) throw error;
      return (data?.[0] ?? null) as {
        total_recipes: number; today_count: number; period_count: number;
        previous_period_count: number; avg_products_per_recipe: number; dispensed_count: number;
      } | null;
    },
  });

  const { data: quickKpis } = useQuery({
    queryKey: ['admin-quick-kpis-range', startISO, endISO],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_quick_kpis_range', { start_ts: startISO, end_ts: endISO });
      if (error) throw error;
      return (data?.[0] ?? null) as {
        total_quick: number; period_quick: number; today_quick: number;
        previous_period_quick: number; avg_products_quick: number;
      } | null;
    },
  });

  const { data: timeseries } = useQuery({
    queryKey: ['admin-timeseries', startISO, endISO, range.bucket],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_recipes_timeseries', { start_ts: startISO, end_ts: endISO, bucket: range.bucket });
      if (error) throw error;
      return (data ?? []) as { period: string; total: number }[];
    },
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['admin-heatmap-range', startISO, endISO],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_activity_heatmap_range', { start_ts: startISO, end_ts: endISO });
      if (error) throw error;
      return data as { weekday: number; hour: number; total: number }[];
    },
  });

  const { data: topProducts, isLoading: loadingTop } = useQuery({
    queryKey: ['admin-top-products-range', startISO, endISO],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_top_products_range', { start_ts: startISO, end_ts: endISO, lim: 10 });
      if (error) throw error;
      return data as { product_name: string; reference: string | null; times_prescribed: number; thumbnail_url: string | null }[];
    },
  });

  const { data: provinceStats, isLoading: loadingProvinces } = useQuery({
    queryKey: ['admin-province-stats-range', startISO, endISO],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_province_stats_range', { start_ts: startISO, end_ts: endISO });
      if (error) throw error;
      return data as { province: string; professionals: number; total_recipes: number }[];
    },
  });

  const { data: topProfessionals } = useQuery({
    queryKey: ['admin-top-professionals-range', startISO, endISO],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_top_professionals_range', { start_ts: startISO, end_ts: endISO, lim: 10 });
      if (error) throw error;
      return data as { user_id: string; clinic_name: string | null; professional_name: string | null; province: string | null; locality: string | null; total_recipes: number }[];
    },
  });

  const { data: sendMethodStats } = useQuery({
    queryKey: ['admin-send-method-stats-range', startISO, endISO],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_send_methods_range', { start_ts: startISO, end_ts: endISO });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ name: SEND_LABELS[r.method] || r.method, value: Number(r.total) }));
    },
  });

  const { data: recentRecipes } = useQuery({
    queryKey: ['admin-recent-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('recipes')
        .select('id, patient_name, created_at, sent_via, dispensed_at, recipe_code')
        .order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: ticketsStats } = useQuery({
    queryKey: ['admin-tickets-stats'],
    queryFn: async () => {
      const [openRes, inProgRes, resolvedRes, totalRes, recentRes] = await Promise.all([
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['resolved', 'closed']),
        supabase.from('tickets').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('id, title, status, priority, category, created_at, updated_at').order('updated_at', { ascending: false }).limit(5),
      ]);
      return {
        open: openRes.count ?? 0,
        in_progress: inProgRes.count ?? 0,
        resolved: resolvedRes.count ?? 0,
        total: totalRes.count ?? 0,
        recent: (recentRes.data ?? []) as Array<{ id: string; title: string; status: string; priority: string; category: string; created_at: string; updated_at: string }>,
      };
    },
    staleTime: 30_000,
  });

  const periodCount = kpis?.period_count ?? 0;
  const dispensingRate = periodCount > 0 && kpis ? Math.round((kpis.dispensed_count / periodCount) * 100) : 0;
  const variation = kpis && kpis.previous_period_count > 0
    ? Math.round(((kpis.period_count - kpis.previous_period_count) / kpis.previous_period_count) * 100)
    : null;

  const sparkline = useMemo(() => (timeseries ?? []).slice(-12).map((p) => ({ value: Number(p.total) })), [timeseries]);

  const chartData = useMemo(() => (timeseries ?? []).map((r) => ({
    name: formatBucketLabel(new Date(r.period), range.bucket),
    recetas: Number(r.total),
  })), [timeseries, range.bucket]);

  if (loadingRecipes || loadingUsers) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const buildExportData = (): DashboardExportData => ({
    range,
    kpis: {
      total_recipes: totalRecipes ?? 0,
      today_count: kpis?.today_count ?? 0,
      period_count: kpis?.period_count ?? 0,
      previous_period_count: kpis?.previous_period_count ?? 0,
      avg_products_per_recipe: Number(kpis?.avg_products_per_recipe ?? 0),
      dispensed_count: kpis?.dispensed_count ?? 0,
      dispensing_rate: dispensingRate,
      variation_pct: variation,
      total_users: totalUsers ?? 0,
      total_products: totalProducts ?? 0,
    },
    timeseries: timeseries ?? [],
    sendMethods: sendMethodStats ?? [],
    topProducts: (topProducts ?? []).map((p) => ({ product_name: p.product_name, reference: p.reference, times_prescribed: Number(p.times_prescribed) })),
    provinces: (provinceStats ?? []).map((p) => ({ province: p.province, professionals: Number(p.professionals), total_recipes: Number(p.total_recipes) })),
    topProfessionals: (topProfessionals ?? []).map((p) => ({ clinic_name: p.clinic_name, professional_name: p.professional_name, province: p.province, locality: p.locality, total_recipes: Number(p.total_recipes) })),
    heatmap: (heatmapData ?? []).map((h) => ({ weekday: h.weekday, hour: h.hour, total: Number(h.total) })),
    recent: (recentRecipes ?? []).map((r: any) => ({ patient_name: r.patient_name, created_at: r.created_at, sent_via: r.sent_via, recipe_code: r.recipe_code, dispensed_at: r.dispensed_at })),
  });

  return (
    <div className="space-y-4">
      {/* Header with filter + export */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <motion.h2 {...fadeUp(0)} className="text-xl font-bold text-foreground">Dashboard</motion.h2>
          <motion.p {...fadeUp(0.05)} className="text-xs text-muted-foreground mt-0.5">
            Mostrando: <span className="font-medium text-foreground">{range.label}</span>
            <span className="mx-1.5">·</span>
            {range.start.toLocaleDateString('es-ES')} – {new Date(range.end.getTime() - 1).toLocaleDateString('es-ES')}
          </motion.p>
        </div>
        <motion.div {...fadeUp(0.05)} className="flex items-center gap-2 flex-wrap">
          <DashboardRangeFilter preset={preset} customRange={customRange} onChange={handleRangeChange} />
          <DashboardExportMenu getData={buildExportData} pdfTargetId="admin-dashboard-export-root" />
        </motion.div>
      </div>

      <div id="admin-dashboard-export-root" className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <KpiCard icon={FileText} label={`Recetas (${range.label})`} value={periodCount} numericValue={periodCount} sparkline={sparkline} delay={0.00} />
          <KpiCard icon={Calendar} label="Hoy" value={kpis?.today_count ?? 0} numericValue={kpis?.today_count ?? 0} delay={0.05} />
          <KpiCard icon={TrendingUp} label="vs periodo ant." value={periodCount} numericValue={periodCount} variation={variation} delay={0.10} />
          <KpiCard icon={ShoppingBag} label="Prod. / receta" value={Number(kpis?.avg_products_per_recipe ?? 0)} delay={0.15} />
          <KpiCard icon={Users} label="Profesionales" value={totalUsers ?? 0} numericValue={totalUsers ?? 0} delay={0.20} />
          <KpiCard icon={Package} label="Productos" value={totalProducts ?? 0} numericValue={totalProducts ?? 0} delay={0.25} />
          <KpiCard icon={CheckCircle} label="Dispensación" value={`${dispensingRate}%`} delay={0.30} />
        </div>

        {/* Pro vs Quick breakdown */}
        <motion.div {...fadeUp(0.08)}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Desglose Pro vs Rápidas
                <span className="text-[10px] text-muted-foreground font-normal ml-1">({range.label})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {(() => {
                const proCount = Math.max(0, (kpis?.period_count ?? 0) - (quickKpis?.period_quick ?? 0));
                const quickCount = quickKpis?.period_quick ?? 0;
                const total = proCount + quickCount;
                const proPct = total > 0 ? Math.round((proCount / total) * 100) : 0;
                const quickPct = total > 0 ? 100 - proPct : 0;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pro (con perfil)</p>
                      <p className="text-2xl font-bold text-foreground tabular-nums">{proCount}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{proPct}% del total · hoy: {(kpis?.today_count ?? 0) - (quickKpis?.today_quick ?? 0)}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rápidas (sin login)</p>
                      <p className="text-2xl font-bold text-primary tabular-nums">{quickCount}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{quickPct}% del total · hoy: {quickKpis?.today_quick ?? 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Prod. / receta rápida</p>
                      <p className="text-2xl font-bold text-foreground tabular-nums">{Number(quickKpis?.avg_products_quick ?? 0)}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">total histórico: {quickKpis?.total_quick ?? 0}</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-3 gap-4">
          <motion.div {...fadeUp(0.1)} className="lg:col-span-1">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Recetas por {range.bucket === 'hour' ? 'hora' : range.bucket === 'day' ? 'día' : range.bucket === 'week' ? 'semana' : 'mes'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                      <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="recetas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
                      <Line type="monotone" dataKey="recetas" stroke="hsl(0, 72%, 30%)" strokeWidth={2} dot={false} isAnimationActive animationDuration={1000} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.15)}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Send className="h-3.5 w-3.5 text-primary" />
                  Método de envío
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {sendMethodStats && sendMethodStats.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="h-52 w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={sendMethodStats} cx="50%" cy="50%" innerRadius={38} outerRadius={70} paddingAngle={3} dataKey="value" isAnimationActive animationDuration={800}>
                            {sendMethodStats.map((entry) => (
                              <Cell key={entry.name} fill={SEND_COLORS[entry.name] || 'hsl(0,0%,70%)'} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [v, 'Recetas']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1.5 text-xs">
                      {sendMethodStats.map((entry) => {
                        const total = sendMethodStats.reduce((s, e) => s + e.value, 0);
                        const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                        return (
                          <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SEND_COLORS[entry.name] || 'hsl(0,0%,70%)' }} />
                            <span className="text-foreground truncate flex-1">{entry.name}</span>
                            <span className="tabular-nums text-muted-foreground">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-10">Sin datos en el rango</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.2)}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  Top 10 productos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loadingTop ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : topProducts && topProducts.length > 0 ? (
                  <div className="max-h-52 overflow-auto space-y-1 pr-1">
                    {(() => {
                      const maxVal = Math.max(...topProducts.map(p => Number(p.times_prescribed)));
                      return topProducts.map((p, i) => {
                        const pct = maxVal > 0 ? (Number(p.times_prescribed) / maxVal) * 100 : 0;
                        return (
                          <motion.div
                            key={`${p.product_name}-${i}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: 0.2 + i * 0.04 }}
                            className="flex items-center gap-2 p-1 rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-xs font-bold text-primary w-4 text-right shrink-0">{i + 1}</span>
                            <div className="w-7 h-7 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {p.thumbnail_url ? (
                                <img src={p.thumbnail_url} alt={p.product_name} className="w-7 h-7 object-contain" />
                              ) : (
                                <Package className="w-3.5 h-3.5 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate leading-tight">{p.product_name}</p>
                              <div className="h-1 mt-0.5 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-foreground shrink-0">{p.times_prescribed}</span>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-10">Sin datos en el rango</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Map + Heatmap */}
        <div className="grid lg:grid-cols-3 gap-4">
          <motion.div {...fadeUp(0.25)} className="lg:col-span-2">
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Mapa de España — recetas por provincia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loadingProvinces ? (
                  <div className="h-80 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <SpainProvinceMap stats={provinceStats ?? []} />
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.3)}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  Actividad por día / hora
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ActivityHeatmap data={heatmapData ?? []} />
                <p className="text-[10px] text-muted-foreground mt-2 text-center">{range.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Province Table + Top Professionals */}
        <div className="grid lg:grid-cols-2 gap-4">
          <motion.div {...fadeUp(0.35)}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Recetas por provincia</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loadingProvinces ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : provinceStats && provinceStats.length > 0 ? (
                  <div className="max-h-64 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs h-8">Provincia</TableHead>
                          <TableHead className="text-right text-xs h-8">Prof.</TableHead>
                          <TableHead className="text-right text-xs h-8">Recetas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {provinceStats.map((row) => (
                          <TableRow key={row.province}>
                            <TableCell className="font-medium text-xs py-1.5">{row.province}</TableCell>
                            <TableCell className="text-right text-xs py-1.5">{row.professionals}</TableCell>
                            <TableCell className="text-right text-xs py-1.5 font-semibold">{row.total_recipes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-10">Sin datos</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.4)}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Ranking de profesionales</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="max-h-64 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs h-8 w-8">#</TableHead>
                        <TableHead className="text-xs h-8">Clínica / Profesional</TableHead>
                        <TableHead className="text-xs h-8">Provincia</TableHead>
                        <TableHead className="text-right text-xs h-8">Rec.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProfessionals?.map((pro, i) => (
                        <TableRow key={pro.user_id}>
                          <TableCell className="font-bold text-primary text-xs py-1.5">{i + 1}</TableCell>
                          <TableCell className="py-1.5">
                            <div className="font-medium text-xs leading-tight">{pro.clinic_name || pro.professional_name || '—'}</div>
                            {pro.clinic_name && pro.professional_name && (
                              <div className="text-[10px] text-muted-foreground">{pro.professional_name}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground py-1.5">{pro.province || '—'}</TableCell>
                          <TableCell className="text-right text-xs font-semibold py-1.5">{pro.total_recipes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tickets / Incidencias */}
        <motion.div {...fadeUp(0.42)}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <LifeBuoy className="h-3.5 w-3.5 text-primary" />
                Incidencias
                <span className="text-[10px] text-muted-foreground font-normal ml-1">(global)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-lg border bg-card p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Abiertas</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">{ticketsStats?.open ?? 0}</p>
                </div>
                <div className="rounded-lg border bg-card p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">En curso</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">{ticketsStats?.in_progress ?? 0}</p>
                </div>
                <div className="rounded-lg border bg-card p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resueltas</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">{ticketsStats?.resolved ?? 0}</p>
                </div>
                <div className="rounded-lg border bg-card p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">{ticketsStats?.total ?? 0}</p>
                </div>
              </div>
              {ticketsStats?.recent && ticketsStats.recent.length > 0 ? (
                <div className="max-h-64 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs h-8">Título</TableHead>
                        <TableHead className="text-xs h-8">Categoría</TableHead>
                        <TableHead className="text-xs h-8">Prioridad</TableHead>
                        <TableHead className="text-xs h-8">Estado</TableHead>
                        <TableHead className="text-xs h-8">Actualizada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticketsStats.recent.map((t) => {
                        const statusStyle =
                          t.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : t.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
                        const priorityStyle =
                          t.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : t.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-muted text-muted-foreground';
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium text-xs py-1.5 max-w-[280px] truncate">{t.title}</TableCell>
                            <TableCell className="text-[11px] capitalize text-muted-foreground py-1.5">{t.category}</TableCell>
                            <TableCell className="py-1.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${priorityStyle}`}>{t.priority}</span>
                            </TableCell>
                            <TableCell className="py-1.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusStyle}`}>{t.status.replace('_', ' ')}</span>
                            </TableCell>
                            <TableCell className="text-[11px] text-muted-foreground py-1.5">{new Date(t.updated_at).toLocaleDateString('es-ES')}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-6 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  Sin incidencias registradas
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity (global feed) */}
        <motion.div {...fadeUp(0.45)}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Actividad reciente <span className="text-[10px] text-muted-foreground font-normal ml-1">(últimas 10, global)</span></CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="max-h-72 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs h-8">Paciente</TableHead>
                      <TableHead className="text-xs h-8">Fecha</TableHead>
                      <TableHead className="text-xs h-8">Envío</TableHead>
                      <TableHead className="text-xs h-8">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRecipes?.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-xs py-1.5">{r.patient_name}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-1.5">{new Date(r.created_at).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="text-xs capitalize py-1.5">{r.sent_via || '—'}</TableCell>
                        <TableCell className="py-1.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${r.dispensed_at ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {r.dispensed_at ? 'Dispensada' : 'Pendiente'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
