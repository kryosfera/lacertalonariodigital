import { FileText, Clock, Users, Scissors, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import lacerLogo from "@/assets/lacer-logo-color.png";
import homeBanner from "@/assets/home-banner.jpg";
import { UserMode } from "@/hooks/useUserMode";

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
  userMode?: UserMode;
  stats?: {
    totalRecipes: number;
    totalPatients: number;
    thisMonth: number;
  };
}

const basicQuickActions = [
  {
    id: "nueva-receta",
    title: "Nueva Receta",
    subtitle: "Crear y enviar",
    icon: FileText
  },
  {
    id: "recomendaciones",
    title: "Post-Cirugía",
    subtitle: "Recomendaciones",
    icon: Scissors
  }
];

const professionalQuickActions = [
  {
    id: "nueva-receta",
    title: "Nueva Receta",
    subtitle: "Crear y enviar",
    icon: FileText
  },
  {
    id: "recomendaciones",
    title: "Post-Cirugía",
    subtitle: "Recomendaciones",
    icon: Scissors
  },
  {
    id: "historial",
    title: "Historial",
    subtitle: "Ver recetas",
    icon: Clock
  },
  {
    id: "pacientes",
    title: "Pacientes",
    subtitle: "Gestionar",
    icon: Users
  }
];

export const HomeScreen = ({
  onNavigate,
  userMode = 'basic',
  stats = {
    totalRecipes: 0,
    totalPatients: 0,
    thisMonth: 0
  }
}: HomeScreenProps) => {
  const isProfessional = userMode === 'professional';
  const quickActions = isProfessional ? professionalQuickActions : basicQuickActions;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-auto md:min-h-0 overflow-hidden">
      {/* Hero Image - Compact for basic mode */}
      <div className={`relative mx-4 mt-3 rounded-2xl overflow-hidden group cursor-pointer ${!isProfessional ? 'h-24' : ''}`}>
        <img 
          src={homeBanner} 
          alt="Talonario Digital" 
          className={`w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110 ${isProfessional ? 'h-32' : 'h-24'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-primary/20" />
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <img src={lacerLogo} alt="Lacer" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white drop-shadow-md">
              Talonario Digital
            </h2>
            <p className="text-[10px] text-white/90 drop-shadow-sm">
              ¿Qué deseas hacer hoy?
            </p>
          </div>
        </div>
      </div>

      {/* Description - Hidden on basic mode mobile for space */}
      {isProfessional && (
        <p className="text-xs text-muted-foreground text-center mx-4 mt-3 leading-relaxed hidden md:block">
          Un talonario de recetas en formato digital que permite gestionar electrónicamente las recetas para sus pacientes.
        </p>
      )}

      {/* Stats Row - Only for Professional */}
      {isProfessional && (
        <div className="flex justify-between rounded-2xl mx-4 mt-3 px-4 py-3 bg-secondary">
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
      )}

      {/* Quick Actions - Larger and more prominent for basic mode */}
      <div className={`flex-1 flex items-center justify-center px-4 ${isProfessional ? 'py-4' : 'py-6'}`}>
        <div className={`grid gap-4 w-full ${isProfessional ? 'grid-cols-2 max-w-sm' : 'grid-cols-2 max-w-md'}`}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button 
                key={action.id} 
                onClick={() => onNavigate(action.id)} 
                className={`group flex flex-col items-center gap-3 rounded-2xl bg-secondary text-white shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl hover:bg-secondary/90 hover:-translate-y-0.5 opacity-0 animate-fade-in ${isProfessional ? 'p-5' : 'p-6'}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className={`rounded-2xl bg-white/20 flex items-center justify-center shadow-md group-hover:bg-white/30 transition-colors ${isProfessional ? 'w-14 h-14' : 'w-16 h-16'}`}>
                  <Icon className={`text-white ${isProfessional ? 'w-7 h-7' : 'w-8 h-8'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-white leading-tight ${isProfessional ? 'text-sm' : 'text-base'}`}>
                    {action.title}
                  </p>
                  <p className="text-[10px] text-white/70 mt-0.5">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discrete upgrade link for Basic Users - Just a text link */}
      {!isProfessional && (
        <div className="text-center pb-2">
          <Link 
            to="/auth"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>¿Eres profesional? Activa todas las funciones</span>
          </Link>
        </div>
      )}

      {/* Bottom hint */}
      <div className="text-center pb-3">
        <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide">
          v2.0 • {isProfessional ? 'PROFESIONAL' : 'MODO RÁPIDO'}
        </p>
      </div>
    </div>
  );
};
