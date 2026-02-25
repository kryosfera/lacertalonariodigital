import { FileText, Clock, Users, Scissors, Sparkles, CalendarDays, TrendingUp, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo-color.png";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HomeScreenCenteredProps {
  onNavigate: (tab: string) => void;
  userMode?: UserMode;
  stats?: {
    totalRecipes: number;
    totalPatients: number;
    thisMonth: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20
    }
  }
};

export const HomeScreenCentered = ({
  onNavigate,
  userMode = 'basic',
  stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 }
}: HomeScreenCenteredProps) => {
  const isProfessional = userMode === 'professional';

  return (
    <motion.div 
      className="h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Theme Toggle - Top right corner (mobile only) */}
      <div className="absolute top-2 right-2 z-10 md:hidden">
        <ThemeToggle />
      </div>

      {/* Centered Content */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8 lg:space-y-12">
        
        {/* Logo */}
        <motion.div variants={itemVariants}>
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-card border border-border shadow-lg flex items-center justify-center mx-auto">
            <img src={lacerLogo} alt="Lacer" className="w-14 h-14 lg:w-16 lg:h-16 object-contain" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div className="space-y-3" variants={itemVariants}>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight">
            Talonario Digital
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-lg mx-auto">
            Un talonario de recetas en formato digital que permite gestionar electrónicamente las recetas para sus pacientes, de forma simplificada, mediante envío directo por WhatsApp o email.
          </p>
        </motion.div>

        {/* Primary Actions */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          variants={itemVariants}
        >
          <motion.button 
            onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")} 
            className="flex-1 group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-secondary text-secondary-foreground font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-5 h-5" />
            Nueva Receta
          </motion.button>
          
          <motion.button 
            onClick={() => onNavigate("recomendaciones")} 
            className="flex-1 group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-secondary/50"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Scissors className="w-5 h-5 text-secondary" />
            Recomendaciones
          </motion.button>
        </motion.div>

        {/* Secondary Actions - Professional Only */}
        {isProfessional && (
          <motion.div 
            className="flex flex-wrap justify-center gap-3"
            variants={itemVariants}
          >
            <button 
              onClick={() => onNavigate("historial")} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <Clock className="w-4 h-4" />
              Historial
            </button>
            <button 
              onClick={() => onNavigate("pacientes")} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <Users className="w-4 h-4" />
              Pacientes
            </button>
            <button 
              onClick={() => onNavigate("dashboard")} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </button>
          </motion.div>
        )}

        {/* Upgrade Link - Basic Only */}
        {!isProfessional && (
          <motion.div variants={itemVariants}>
            <Link 
              to="/auth"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>¿Eres profesional? Activa todas las funciones</span>
            </Link>
          </motion.div>
        )}

        {/* Stats - Professional Only */}
        {isProfessional && (
          <motion.div 
            className="flex items-center justify-center gap-8 lg:gap-12 pt-4 border-t border-border/50 w-full max-w-lg"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">{stats.thisMonth}</span>
              <span className="text-xs text-muted-foreground uppercase">este mes</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">{stats.totalRecipes}</span>
              <span className="text-xs text-muted-foreground uppercase">recetas</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">{stats.totalPatients}</span>
              <span className="text-xs text-muted-foreground uppercase">pacientes</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.div 
        className="absolute bottom-4 left-0 right-0 text-center"
        variants={itemVariants}
      >
        <p className="text-[10px] text-muted-foreground/50 tracking-wide">
          v2.0 • {isProfessional ? 'PROFESIONAL' : 'MODO RÁPIDO'}
        </p>
      </motion.div>
    </motion.div>
  );
};
