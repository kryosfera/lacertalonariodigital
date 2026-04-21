import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Users, Package, TrendingUp, CheckCircle, Send, Calendar, ShoppingBag, MapPin, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Line, ComposedChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KpiCard } from './KpiCard';
import { SpainProvinceMap } from './SpainProvinceMap';
import { ActivityHeatmap } from './ActivityHeatmap';

const COLORS = ['hsl(0, 72%, 51%)', 'hsl(0, 72%, 38%)', 'hsl(0, 60%, 60%)', 'hsl(0, 50%, 70%)', 'hsl(0, 40%, 45%)', 'hsl(20, 60%, 50%)', 'hsl(10, 55%, 55%)', 'hsl(350, 65%, 50%)'];
const SEND_COLORS: Record<string, string> = {
  'WhatsApp': 'hsl(142, 70%, 45%)',
  'Email': 'hsl(210, 70%, 50%)',
  'PDF': 'hsl(0, 72%, 51%)',
  'Impresión': 'hsl(35, 80%, 50%)',
  'Email + WhatsApp': 'hsl(270, 60%, 55%)',
  'Sin envío': 'hsl(0, 0%, 60%)',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export function AdminDashboard() {
  const { data: totalRecipes, isLoading: loadingRecipes } = useQuery({
    queryKey: ['admin-total-recipes'],
    queryFn: async () => (await supabase.from('recipes').select('*', { count: 'exact', head: true })).count ?? 0,
  });

  const { data: totalUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-total-users'],
    queryFn: async () => (await supabase.from('profiles').select('*', { count: 'exact', head: true })).count ?? 0,
  });

  const { data: totalProducts } = useQuery({
    queryKey: ['admin-total-products'],
    queryFn: async () => (await supabase.from('products').select('*', { count: 'exact', head: true })).count ?? 0,
  });

  const { data: dispensedCount } = useQuery({
    queryKey: ['admin-dispensed'],
    queryFn: async () => (await supabase.from('recipes').select('*', { count: 'exact', head: true }).not('dispensed_at', 'is', null)).count ?? 0,
  });

  const { data: comparison } = useQuery({
    queryKey: ['admin-comparison'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_recipes_comparison');
      if (error) throw error;
      return (data?.[0] ?? null) as { current_month: number; previous_month: number; today_count: number; avg_products_per_recipe: number } | null;
    },
  });

  const { data: dailySeries } = useQuery({
    queryKey: ['admin-daily-series'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_recipes_per_day', { days: 7 });
      if (error) throw error;
      return (data ?? []).map((d: any) => ({ value: Number(d.total) }));
    },
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['admin-heatmap'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_activity_heatmap');
      if (error) throw error;
      return data as { weekday: number; hour: number; total: number }[];
    },
  });

  const { data: topProducts, isLoading: loadingTop } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_top_products', { lim: 10 });
      if (error) throw error;
      return data as { product_name: string; reference: string | null; times_prescribed: number; thumbnail_url: string | null }[];
    },
  });

  const { data: provinceStats, isLoading: loadingProvinces } = useQuery({
    queryKey: ['admin-province-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_province_stats');
      if (error) throw error;
      return data as { province: string; professionals: number; total_recipes: number }[];
    },
  });

  const { data: topProfessionals } = useQuery({
    queryKey: ['admin-top-professionals'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_top_professionals', { lim: 10 });
      if (error) throw error;
      return data as { user_id: string; clinic_name: string | null; professional_name: string | null; province: string | null; locality: string | null; total_recipes: number }[];
    },
  });

  const { data: monthlyRecipes } = useQuery({
    queryKey: ['admin-monthly-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_recipes_per_month');
      if (error) throw error;
      return data as { month: string; total: number }[];
    },
  });

  const { data: recentRecipes } = useQuery({
    queryKey: ['admin-recent-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('recipes')
        .select('id, patient_name, created_at, sent_via, dispensed_at, recipe_code')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: sendMethodStats } = useQuery({
    queryKey: ['admin-send-method-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('recipes').select('sent_via');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach(r => {
        const method = r.sent_via || 'sin_envio';
        counts[method] = (counts[method] || 0) + 1;
      });
      const labels: Record<string, string> = {
        whatsapp: 'WhatsApp', email: 'Email', pdf: 'PDF', print: 'Impresión',
        both: 'Email + WhatsApp', sin_envio: 'Sin envío',
      };
      return Object.entries(counts)
        .map(([k, v]) => ({ name: labels[k] || k, value: v }))
        .sort((a, b) => b.value - a.value);
    },
  });

  const dispensingRate = totalRecipes && dispensedCount != null
    ? Math.round((dispensedCount / totalRecipes) * 100) : 0;

  const monthVariation = comparison && comparison.previous_month > 0
    ? Math.round(((comparison.current_month - comparison.previous_month) / comparison.previous_month) * 100)
    : null;

  if (loadingRecipes || loadingUsers) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const monthNames: Record<string, string> = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
  };

  const monthlyData = monthlyRecipes?.map(m => ({
    name: monthNames[m.month.split('-')[1]] || m.month,
    recetas: Number(m.total),
  })) ?? [];

  return (
    <div className="space-y-4">
      <motion.h2 {...fadeUp(0)} className="text-xl font-bold text-foreground">Dashboard</motion.h2>

      {/* KPI Cards — 7 compact cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard icon={FileText} label="Total Recetas" value={totalRecipes ?? 0} numericValue={totalRecipes ?? 0} sparkline={dailySeries} delay={0.00} />
        <KpiCard icon={Calendar} label="Hoy" value={comparison?.today_count ?? 0} numericValue={comparison?.today_count ?? 0} delay={0.05} />
        <KpiCard icon={TrendingUp} label="Este mes" value={comparison?.current_month ?? 0} numericValue={comparison?.current_month ?? 0} variation={monthVariation} delay={0.10} />
        <KpiCard icon={ShoppingBag} label="Prod. / receta" value={comparison?.avg_products_per_recipe ?? 0} delay={0.15} />
        <KpiCard icon={Users} label="Profesionales" value={totalUsers ?? 0} numericValue={totalUsers ?? 0} delay={0.20} />
        <KpiCard icon={Package} label="Productos" value={totalProducts ?? 0} numericValue={totalProducts ?? 0} delay={0.25} />
        <KpiCard icon={CheckCircle} label="Dispensación" value={`${dispensingRate}%`} delay={0.30} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Monthly Recipes */}
        <motion.div {...fadeUp(0.1)} className="lg:col-span-1">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Recetas por mes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
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

        {/* Send Method */}
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
                <p className="text-muted-foreground text-xs text-center py-10">Sin datos de envío</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
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
                <p className="text-muted-foreground text-xs text-center py-10">Sin datos</p>
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
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Últimos 90 días</p>
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

      {/* Recent Activity */}
      <motion.div {...fadeUp(0.45)}>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Actividad reciente</CardTitle>
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
  );
}
