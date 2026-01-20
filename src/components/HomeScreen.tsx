import { FileText, Clock, Users, Scissors, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo-color.png";
import homeBanner from "@/assets/home-banner.jpg";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

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
    <motion.div 
      className="flex flex-col h-[calc(100vh-140px)] md:h-auto md:min-h-0 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Theme Toggle - Top right corner */}
      <div className="absolute top-2 right-2 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Image - Compact for basic mode */}
      <motion.div 
        className={`relative mx-4 mt-3 rounded-2xl overflow-hidden group cursor-pointer ${!isProfessional ? 'h-24' : ''}`}
        variants={itemVariants}
      >
        <img 
          src={homeBanner} 
          alt="Talonario Digital" 
          className={`w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110 ${isProfessional ? 'h-32' : 'h-24'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-secondary/30" />
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
      </motion.div>

      {/* Description - Hidden on basic mode mobile for space */}
      {isProfessional && (
        <motion.p 
          className="text-xs text-muted-foreground text-center mx-4 mt-3 leading-relaxed hidden md:block"
          variants={itemVariants}
        >
          Un talonario de recetas en formato digital que permite gestionar electrónicamente las recetas para sus pacientes.
        </motion.p>
      )}

      {/* Stats Row - Only for Professional */}
      {isProfessional && (
        <motion.div 
          className="flex justify-between rounded-2xl mx-4 mt-3 px-4 py-3 bg-secondary"
          variants={itemVariants}
        >
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
        </motion.div>
      )}

      {/* Quick Actions - Larger and more prominent */}
      <div className={`flex-1 flex items-center justify-center px-4 ${isProfessional ? 'py-4' : 'py-6'}`}>
        <motion.div 
          className={`grid gap-4 w-full ${isProfessional ? 'grid-cols-2 max-w-sm' : 'grid-cols-2 max-w-md'}`}
          variants={containerVariants}
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button 
                key={action.id} 
                onClick={() => onNavigate(action.id)} 
                className={`group flex flex-col items-center gap-3 rounded-2xl bg-secondary text-secondary-foreground shadow-lg transition-colors active:scale-95 hover:shadow-xl hover:bg-secondary/90 ${isProfessional ? 'p-5' : 'p-6'}`}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`rounded-2xl bg-white/20 flex items-center justify-center shadow-md group-hover:bg-white/30 transition-colors ${isProfessional ? 'w-14 h-14' : 'w-16 h-16'}`}>
                  <Icon className={`text-secondary-foreground ${isProfessional ? 'w-7 h-7' : 'w-8 h-8'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-secondary-foreground leading-tight ${isProfessional ? 'text-sm' : 'text-base'}`}>
                    {action.title}
                  </p>
                  <p className="text-[10px] text-secondary-foreground/70 mt-0.5">
                    {action.subtitle}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Discrete upgrade link for Basic Users */}
      {!isProfessional && (
        <motion.div 
          className="text-center pb-2"
          variants={itemVariants}
        >
          <Link 
            to="/auth"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>¿Eres profesional? Activa todas las funciones</span>
          </Link>
        </motion.div>
      )}

      {/* Bottom hint */}
      <motion.div 
        className="text-center pb-3"
        variants={itemVariants}
      >
        <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide">
          v2.0 • {isProfessional ? 'PROFESIONAL' : 'MODO RÁPIDO'}
        </p>
      </motion.div>
    </motion.div>
  );
};
