import { FileText, Clock, Users, Settings, Sparkles } from "lucide-react";
import lacerLogo from "@/assets/lacer-logo-color.png";

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
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-auto md:min-h-0 overflow-hidden">
      {/* Hero Section with Glassmorphism */}
      <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/30 rounded-full blur-xl transform -translate-x-6 translate-y-6" />
        
        {/* Content */}
        <div className="relative px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/80" />
                <p className="text-white/80 text-sm font-medium">{greeting}</p>
              </div>
              <h2 className="text-xl font-bold text-white">
                ¿Qué deseas hacer hoy?
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              <img src={lacerLogo} alt="Lacer" className="w-10 h-10 object-contain" />
            </div>
          </div>

          {/* Stats Row - Inside Hero */}
          <div className="flex justify-between bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Este mes</p>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-white">{stats.totalRecipes}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Recetas</p>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-white">{stats.totalPatients}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Pacientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border border-border/50 shadow-sm transition-all duration-200 active:scale-95 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
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

      {/* Bottom hint */}
      <div className="text-center pb-3">
        <p className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">
          TALONARIO DIGITAL v2.0
        </p>
      </div>
    </div>
  );
};
