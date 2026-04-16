import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Users, Package, TrendingUp, CheckCircle, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const COLORS = ['hsl(0, 72%, 51%)', 'hsl(0, 72%, 38%)', 'hsl(0, 60%, 60%)', 'hsl(0, 50%, 70%)', 'hsl(0, 40%, 45%)', 'hsl(20, 60%, 50%)', 'hsl(10, 55%, 55%)', 'hsl(350, 65%, 50%)'];
const SEND_COLORS: Record<string, string> = {
  'WhatsApp': 'hsl(142, 70%, 45%)',
  'Email': 'hsl(210, 70%, 50%)',
  'PDF': 'hsl(0, 72%, 51%)',
  'Impresión': 'hsl(35, 80%, 50%)',
  'Email + WhatsApp': 'hsl(270, 60%, 55%)',
  'Sin envío': 'hsl(0, 0%, 60%)',
};

export function AdminDashboard() {
  const { data: totalRecipes, isLoading: loadingRecipes } = useQuery({
    queryKey: ['admin-total-recipes'],
    queryFn: async () => {
      const { count } = await supabase.from('recipes').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const { data: totalUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-total-users'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const { data: totalProducts } = useQuery({
    queryKey: ['admin-total-products'],
    queryFn: async () => {
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const { data: recipesThisMonth } = useQuery({
    queryKey: ['admin-recipes-month'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase.from('recipes').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());
      return count ?? 0;
    },
  });

  const { data: dispensedCount } = useQuery({
    queryKey: ['admin-dispensed'],
    queryFn: async () => {
      const { count } = await supabase.from('recipes').select('*', { count: 'exact', head: true })
        .not('dispensed_at', 'is', null);
      return count ?? 0;
    },
  });

  const { data: topProducts, isLoading: loadingTop } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_top_products', { lim: 10 });
      if (error) throw error;
      return data as { product_name: string; reference: string | null; times_prescribed: number }[];
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
        whatsapp: 'WhatsApp',
        email: 'Email',
        pdf: 'PDF',
        print: 'Impresión',
        both: 'Email + WhatsApp',
        sin_envio: 'Sin envío',
      };
      return Object.entries(counts)
        .map(([key, value]) => ({ name: labels[key] || key, value }))
        .sort((a, b) => b.value - a.value);
    },
  });

  const dispensingRate = totalRecipes && dispensedCount != null
    ? Math.round((dispensedCount / totalRecipes) * 100)
    : 0;

  const isLoading = loadingRecipes || loadingUsers;

  if (isLoading) {
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={FileText} label="Total Recetas" value={totalRecipes ?? 0} />
        <KpiCard icon={Users} label="Profesionales" value={totalUsers ?? 0} />
        <KpiCard icon={Package} label="Productos" value={totalProducts ?? 0} />
        <KpiCard icon={TrendingUp} label="Recetas este mes" value={recipesThisMonth ?? 0} />
        <KpiCard icon={CheckCircle} label="Tasa dispensación" value={`${dispensingRate}%`} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Recipes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recetas por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="recetas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Province Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por provincias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {provinceStats && provinceStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={provinceStats.slice(0, 8).map(p => ({ name: p.province, value: Number(p.professionals) }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {provinceStats.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-10">Sin datos de provincias</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Method Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            Método de envío de recetas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sendMethodStats && sendMethodStats.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sendMethodStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sendMethodStats.map((entry) => (
                        <Cell key={entry.name} fill={SEND_COLORS[entry.name] || 'hsl(0,0%,70%)'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, 'Recetas']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {sendMethodStats.map((entry) => {
                  const total = sendMethodStats.reduce((s, e) => s + e.value, 0);
                  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div key={entry.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: SEND_COLORS[entry.name] || 'hsl(0,0%,70%)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-foreground">{entry.name}</span>
                          <span className="text-sm tabular-nums text-muted-foreground">{entry.value} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: SEND_COLORS[entry.name] || 'hsl(0,0%,70%)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-10">Sin datos de envío</p>
          )}
        </CardContent>
      </Card>

      {/* Top Products + Province Table */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 10 productos recetados</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTop ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : topProducts && topProducts.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts.map(p => ({ name: p.product_name?.substring(0, 20) + (p.product_name && p.product_name.length > 20 ? '…' : ''), total: Number(p.times_prescribed) }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" width={150} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(0, 72%, 38%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">Sin datos</p>
            )}
          </CardContent>
        </Card>

        {/* Province Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recetas por provincia</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProvinces ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : provinceStats && provinceStats.length > 0 ? (
              <div className="max-h-72 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provincia</TableHead>
                      <TableHead className="text-right">Profesionales</TableHead>
                      <TableHead className="text-right">Recetas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {provinceStats.map((row) => (
                      <TableRow key={row.province}>
                        <TableCell className="font-medium">{row.province}</TableCell>
                        <TableCell className="text-right">{row.professionals}</TableCell>
                        <TableCell className="text-right">{row.total_recipes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Professional Ranking + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Professionals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ranking de profesionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Clínica / Profesional</TableHead>
                    <TableHead>Provincia</TableHead>
                    <TableHead className="text-right">Recetas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProfessionals?.map((pro, i) => (
                    <TableRow key={pro.user_id}>
                      <TableCell className="font-bold text-primary">{i + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{pro.clinic_name || pro.professional_name || '—'}</div>
                        {pro.clinic_name && pro.professional_name && (
                          <div className="text-xs text-muted-foreground">{pro.professional_name}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{pro.province || '—'}{pro.locality ? `, ${pro.locality}` : ''}</TableCell>
                      <TableCell className="text-right font-semibold">{pro.total_recipes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Envío</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecipes?.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.patient_name}</TableCell>
                      <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="text-sm capitalize">{r.sent_via || '—'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.dispensed_at ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
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
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg btn-gradient-red">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
