import { FileText, Clock, Users, Settings, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import lacerLogo from "@/assets/lacer-logo.png";

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
  stats?: {
    totalRecipes: number;
    totalPatients: number;
    thisMonth: number;
  };
}

const quickActions = [
  {
    id: "nueva-receta",
    title: "Nueva Receta",
    description: "Crea y envía una receta",
    icon: FileText,
    color: "bg-secondary text-secondary-foreground",
    highlight: true,
  },
  {
    id: "historial",
    title: "Historial",
    description: "Ver recetas enviadas",
    icon: Clock,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "pacientes",
    title: "Pacientes",
    description: "Gestionar pacientes",
    icon: Users,
    color: "bg-success/10 text-success",
  },
  {
    id: "perfil",
    title: "Ajustes",
    description: "Configuración",
    icon: Settings,
    color: "bg-muted text-muted-foreground",
  },
];

export const HomeScreen = ({ onNavigate, stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 } }: HomeScreenProps) => {
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Buenos días" : today.getHours() < 20 ? "Buenas tardes" : "Buenas noches";
  
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Logo Lacer */}
      <div className="flex justify-center pt-2">
        <img 
          src={lacerLogo} 
          alt="Lacer" 
          className="h-16 md:h-20 object-contain"
        />
      </div>
      
      {/* Header de bienvenida */}
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">{greeting}</p>
        <h2 className="text-2xl font-bold text-foreground">¿Qué deseas hacer hoy?</h2>
      </div>

      {/* Stats Cards - Solo en móvil como horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 scrollbar-hide">
        <Card className="flex-shrink-0 w-[140px] md:w-auto border-none shadow-sm bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-shrink-0 w-[140px] md:w-auto border-none shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalRecipes}</p>
                <p className="text-xs text-muted-foreground">Total recetas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-shrink-0 w-[140px] md:w-auto border-none shadow-sm bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPatients}</p>
                <p className="text-xs text-muted-foreground">Pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Acciones rápidas
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  action.highlight 
                    ? "bg-secondary text-secondary-foreground col-span-2 md:col-span-1" 
                    : "bg-card border border-border shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      action.highlight ? "bg-white/20" : action.color
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${action.highlight ? "" : "text-foreground"}`}>
                        {action.title}
                      </h4>
                      <p className={`text-xs mt-0.5 ${action.highlight ? "text-white/80" : "text-muted-foreground"}`}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                    action.highlight ? "text-white/70" : "text-muted-foreground"
                  }`} />
                </div>
                
                {action.highlight && (
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Actividad reciente
          </h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("historial")} className="h-auto py-1 px-2 text-xs">
            Ver todo
          </Button>
        </div>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-center h-20 text-muted-foreground">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay actividad reciente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
