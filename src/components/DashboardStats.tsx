import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Send, TrendingUp } from "lucide-react";

export const DashboardStats = () => {
  const stats = [
    {
      title: "Recetas Este Mes",
      value: "127",
      change: "+12%",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pacientes Activos",
      value: "64",
      change: "+8%",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Recetas Enviadas",
      value: "342",
      change: "+23%",
      icon: Send,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Tasa de Respuesta",
      value: "94%",
      change: "+3%",
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
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
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success font-medium">{stat.change}</span> vs. mes anterior
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
