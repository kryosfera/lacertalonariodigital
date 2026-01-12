import { FileText, Clock, Users, Settings } from "lucide-react";

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
    subtitle: "Crear y enviar",
    icon: FileText,
    gradient: "from-secondary to-secondary/80",
  },
  {
    id: "historial",
    title: "Historial",
    subtitle: "Ver recetas",
    icon: Clock,
    gradient: "from-primary to-primary/80",
  },
  {
    id: "pacientes",
    title: "Pacientes",
    subtitle: "Gestionar",
    icon: Users,
    gradient: "from-success to-success/80",
  },
  {
    id: "perfil",
    title: "Ajustes",
    subtitle: "Configurar",
    icon: Settings,
    gradient: "from-muted-foreground/60 to-muted-foreground/40",
  },
];

export const HomeScreen = ({ onNavigate, stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 } }: HomeScreenProps) => {
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Buenos días" : today.getHours() < 20 ? "Buenas tardes" : "Buenas noches";
  
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-auto md:min-h-0">
      {/* Header - iOS style greeting */}
      <div className="text-center py-4 md:py-6">
        <p className="text-muted-foreground text-sm font-medium">{greeting}</p>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-1">
          ¿Qué deseas hacer?
        </h2>
      </div>

      {/* Stats Row - iOS compact style */}
      <div className="flex justify-center gap-6 py-3 px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">{stats.thisMonth}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Este mes</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalRecipes}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recetas</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{stats.totalPatients}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pacientes</p>
        </div>
      </div>

      {/* Quick Actions Grid - iOS App-like icons */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {action.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom hint - iOS style */}
      <div className="text-center pb-4 md:pb-6">
        <p className="text-xs text-muted-foreground/60">
          Talonario Digital v2.0
        </p>
      </div>
    </div>
  );
};
