import { FileText, Clock, Users, Scissors } from "lucide-react";
import lacerLogo from "@/assets/lacer-logo-color.png";
import homeBanner from "@/assets/home-banner.jpg";

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
  },
  {
    id: "recomendaciones",
    title: "Post-Cirugía",
    subtitle: "Recomendaciones",
    icon: Scissors,
  },
  {
    id: "historial",
    title: "Historial",
    subtitle: "Ver recetas",
    icon: Clock,
  },
  {
    id: "pacientes",
    title: "Pacientes",
    subtitle: "Gestionar",
    icon: Users,
  },
];

export const HomeScreen = ({ onNavigate, stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 } }: HomeScreenProps) => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-auto md:min-h-0 overflow-hidden">
      {/* Hero Image */}
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden">
        <img 
          src={homeBanner} 
          alt="Talonario Digital" 
          className="w-full h-32 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <img src={lacerLogo} alt="Lacer" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white drop-shadow-md">
              Talonario Digital
            </h2>
            <p className="text-xs text-white/90 drop-shadow-sm">
              ¿Qué deseas hacer hoy?
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between bg-primary rounded-2xl mx-4 mt-3 px-4 py-3">
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
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
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
