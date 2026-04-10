import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Send, TrendingUp, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardStats = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      // Parallel queries for efficiency
      const [
        recipesThisMonth,
        recipesLastMonth,
        totalPatients,
        totalRecipes,
        sentRecipes,
        dispensedRecipes,
      ] = await Promise.all([
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth),
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfLastMonth)
          .lte('created_at', endOfLastMonth),
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('sent_via', 'is', null),
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('dispensed_at', 'is', null),
      ]);

      const thisMonth = recipesThisMonth.count || 0;
      const lastMonth = recipesLastMonth.count || 0;
      const changePercent = lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : thisMonth > 0 ? 100 : 0;

      const total = totalRecipes.count || 0;
      const sent = sentRecipes.count || 0;
      const responseRate = total > 0 ? Math.round((sent / total) * 100) : 0;

      return {
        recipesThisMonth: thisMonth,
        recipesChange: changePercent,
        patientsCount: totalPatients.count || 0,
        totalRecipes: total,
        sentRecipes: sent,
        responseRate,
        dispensedCount: dispensedRecipes.count || 0,
      };
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });

  const statCards = [
    {
      title: "Recetas Este Mes",
      value: stats?.recipesThisMonth ?? "—",
      change: stats ? `${stats.recipesChange >= 0 ? '+' : ''}${stats.recipesChange}%` : "",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pacientes",
      value: stats?.patientsCount ?? "—",
      change: "",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Recetas Enviadas",
      value: stats?.sentRecipes ?? "—",
      change: "",
      icon: Send,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Tasa de Envío",
      value: stats ? `${stats.responseRate}%` : "—",
      change: "",
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Dispensadas",
      value: stats?.dispensedCount ?? "—",
      change: "",
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="transition-smooth hover:shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  {stat.change && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-success font-medium">{stat.change}</span> vs. mes anterior
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
