import { FileText, Clock, Users, Scissors, Sparkles, TrendingUp, CalendarDays, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo-color.png";
import homeBanner from "@/assets/home-banner.jpg";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LegalFooter } from "@/components/LegalFooter";
import { useIsMobile } from "@/hooks/use-mobile";

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
    id: "seleccionar-categoria",
    title: "Nueva Receta",
    subtitle: "Crear y enviar",
    icon: FileText
  },
  {
    id: "recomendaciones",
    title: "Recomendaciones",
    subtitle: "Post-cirugía",
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
    title: "Recomendaciones",
    subtitle: "Post-cirugía",
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
  const isMobile = useIsMobile();

  return (
    <motion.div 
      className="flex flex-col pb-20 md:pb-0"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Theme Toggle - Top right corner (mobile only) */}
      {isMobile && (
        <div className="absolute top-2 right-2 z-10">
          <ThemeToggle />
        </div>
      )}

      {/* Desktop/Tablet: Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 mt-3 lg:mt-0">
        
        {/* Left Column: Hero Banner */}
        <motion.div 
          className="relative rounded-2xl overflow-hidden group cursor-pointer lg:w-3/5"
          variants={itemVariants}
        >
          <div className="relative h-48 md:h-64 lg:h-80 xl:h-96">
            <img 
              src={homeBanner} 
              alt="Talonario Digital" 
              className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 via-secondary/40 to-transparent" />
            <div className="absolute left-4 bottom-4 md:left-6 md:bottom-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <img src={lacerLogo} alt="Lacer" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                    Talonario Digital
                  </h2>
                  <p className="text-sm md:text-base text-white/90 drop-shadow-md">
140:                     Recetas digitales
141:                   </p>
142:                 </div>
143:               </div>
144:               {/* Description - visible on desktop */}
145:               <p className="hidden lg:block text-sm text-white/80 max-w-md leading-relaxed drop-shadow-md">
146:                 Un talonario de recetas en formato digital que permite gestionar electrónicamente las recetas para sus pacientes, de forma simplificada, mediante envío directo por WhatsApp o email.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Quick Actions */}
        <motion.div 
          className="lg:w-2/5 flex flex-col justify-center"
          variants={containerVariants}
        >
          <div className={`grid gap-4 ${isProfessional ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button 
                  key={action.id} 
                  onClick={() => onNavigate(action.id)} 
                  className="group flex flex-col items-center gap-3 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground shadow-lg transition-all duration-300 active:scale-95 hover:shadow-xl hover:-translate-y-1"
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-md group-hover:bg-white/30 transition-colors">
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-secondary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm md:text-base font-semibold text-secondary-foreground leading-tight">
                      {action.title}
                    </p>
                    <p className="text-[10px] md:text-xs text-secondary-foreground/70 mt-0.5">
                      {action.subtitle}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Discrete upgrade link for Basic Users - inside right column on desktop */}
          {!isProfessional && (
            <motion.div 
              className="text-center mt-6 hidden lg:block"
              variants={itemVariants}
            >
              <Link 
                to="/auth"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>¿Eres profesional? Activa todas las funciones</span>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Stats Row - Only for Professional */}
      {isProfessional && (
        <motion.div 
          className="grid grid-cols-3 gap-4 mx-4 mt-6"
          variants={containerVariants}
        >
          <motion.div 
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 shadow-sm"
            variants={itemVariants}
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <CalendarDays className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{stats.thisMonth}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Este mes</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 shadow-sm"
            variants={itemVariants}
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{stats.totalRecipes}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recetas</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 shadow-sm"
            variants={itemVariants}
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <UserCheck className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{stats.totalPatients}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pacientes</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Discrete upgrade link for Basic Users - mobile */}
      {!isProfessional && (
        <motion.div 
          className="text-center mt-6 lg:hidden px-4"
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
        className="text-center py-4"
        variants={itemVariants}
      >
        <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide">
          v2.0 • {isProfessional ? 'PROFESIONAL' : 'MODO RÁPIDO'}
        </p>
      </motion.div>

      {/* Legal Footer */}
      <LegalFooter />
    </motion.div>
  );
};
