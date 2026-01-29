import { FileText, Clock, Users, Scissors, CalendarDays, TrendingUp, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo-color.png";
import homeBanner from "@/assets/home-banner.jpg";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LegalFooter } from "@/components/LegalFooter";

interface HomeScreenBentoProps {
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
      staggerChildren: 0.08,
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

export const HomeScreenBento = ({
  onNavigate,
  userMode = 'basic',
  stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 }
}: HomeScreenBentoProps) => {
  const isProfessional = userMode === 'professional';

  return (
    <motion.div 
      className="h-[calc(100vh-80px)] flex flex-col px-4 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Theme Toggle - Top right corner (mobile only) */}
      <div className="absolute top-2 right-2 z-10 md:hidden">
        <ThemeToggle />
      </div>

      {/* Main Bento Grid - Full Height */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 py-4">
        
        {/* Hero Banner - Large Left Card */}
        <motion.div 
          className="lg:col-span-7 relative rounded-3xl overflow-hidden group cursor-pointer min-h-[200px] lg:min-h-0"
          variants={itemVariants}
        >
          <img 
            src={homeBanner} 
            alt="Talonario Digital" 
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <img src={lacerLogo} alt="Lacer" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">
                  Talonario Digital
                </h1>
                <p className="text-sm lg:text-base text-white/80">
                  {isProfessional ? 'Modo Profesional' : 'Modo Rápido'}
                </p>
              </div>
            </div>
            <p className="text-sm lg:text-base text-white/70 max-w-md leading-relaxed hidden lg:block">
              Gestiona tus recetas de forma digital. Rápido, sencillo y profesional.
            </p>
          </div>
        </motion.div>

        {/* Right Column - Actions Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 lg:gap-4">
          {/* Primary Action - Nueva Receta */}
          <motion.button 
            onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")} 
            className="col-span-2 lg:col-span-2 group flex items-center gap-4 p-5 lg:p-6 rounded-2xl lg:rounded-3xl bg-secondary text-secondary-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            variants={itemVariants}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/20 flex items-center justify-center">
              <FileText className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div className="text-left">
              <p className="text-lg lg:text-xl font-semibold">Nueva Receta</p>
              <p className="text-sm text-secondary-foreground/70">Crear y enviar</p>
            </div>
          </motion.button>

          {/* Post-Cirugía */}
          <motion.button 
            onClick={() => onNavigate("recomendaciones")} 
            className="group flex flex-col items-center justify-center gap-3 p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-secondary/50"
            variants={itemVariants}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <Scissors className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" />
            </div>
            <div className="text-center">
              <p className="text-sm lg:text-base font-medium text-foreground">Post-Cirugía</p>
              <p className="text-xs text-muted-foreground hidden lg:block">Recomendaciones</p>
            </div>
          </motion.button>

          {/* Historial - Only Professional */}
          {isProfessional ? (
            <motion.button 
              onClick={() => onNavigate("historial")} 
              className="group flex flex-col items-center justify-center gap-3 p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-secondary/50"
              variants={itemVariants}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" />
              </div>
              <div className="text-center">
                <p className="text-sm lg:text-base font-medium text-foreground">Historial</p>
                <p className="text-xs text-muted-foreground hidden lg:block">Ver recetas</p>
              </div>
            </motion.button>
          ) : (
            <Link 
              to="/auth"
              className="group flex flex-col items-center justify-center gap-3 p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-muted/50 border border-dashed border-border shadow-sm transition-all duration-300 hover:border-secondary/50"
            >
              <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">¿Profesional?</p>
              </div>
            </Link>
          )}

          {/* Professional Only Actions */}
          {isProfessional && (
            <>
              <motion.button 
                onClick={() => onNavigate("pacientes")} 
                className="group flex flex-col items-center justify-center gap-3 p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-secondary/50"
                variants={itemVariants}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" />
                </div>
                <div className="text-center">
                  <p className="text-sm lg:text-base font-medium text-foreground">Pacientes</p>
                  <p className="text-xs text-muted-foreground hidden lg:block">Gestionar</p>
                </div>
              </motion.button>

              <motion.button 
                onClick={() => onNavigate("dashboard")} 
                className="group flex flex-col items-center justify-center gap-3 p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-secondary/50"
                variants={itemVariants}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" />
                </div>
                <div className="text-center">
                  <p className="text-sm lg:text-base font-medium text-foreground">Dashboard</p>
                  <p className="text-xs text-muted-foreground hidden lg:block">Estadísticas</p>
                </div>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Stats Row - Professional Only */}
      {isProfessional && (
        <motion.div 
          className="grid grid-cols-3 gap-3 lg:gap-4 pb-4"
          variants={containerVariants}
        >
          <motion.div 
            className="flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-card border border-border"
            variants={itemVariants}
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
            </div>
            <div>
              <p className="text-lg lg:text-xl font-bold text-foreground">{stats.thisMonth}</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wide">Este mes</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-card border border-border"
            variants={itemVariants}
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
            </div>
            <div>
              <p className="text-lg lg:text-xl font-bold text-foreground">{stats.totalRecipes}</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wide">Recetas</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-card border border-border"
            variants={itemVariants}
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
            </div>
            <div>
              <p className="text-lg lg:text-xl font-bold text-foreground">{stats.totalPatients}</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wide">Pacientes</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="py-2 text-center">
        <p className="text-[10px] text-muted-foreground/50 tracking-wide">
          v2.0 • {isProfessional ? 'PROFESIONAL' : 'MODO RÁPIDO'}
        </p>
      </div>
    </motion.div>
  );
};
