import { FileText, Clock, Users, Scissors, Sparkles, TrendingUp, CalendarDays, UserCheck, ChevronRight, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo-color.png";
import lacerProducts from "@/assets/lacer-products.png";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LegalFooter } from "@/components/LegalFooter";

interface HomeScreenPhotoProps {
  onNavigate: (tab: string) => void;
  userMode?: UserMode;
  onChangeStyle?: () => void;
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
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 }
  }
};

export const HomeScreenPhoto = ({
  onNavigate,
  userMode = 'basic',
  onChangeStyle,
  stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 }
}: HomeScreenPhotoProps) => {
  const isProfessional = userMode === 'professional';

  return (
    <motion.div
      className="flex flex-col pb-20 md:pb-0"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Mobile top bar */}
      <div className="absolute top-3 right-3 z-10 md:hidden flex items-center gap-1">
        {onChangeStyle && (
          <button onClick={onChangeStyle} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border border-border/50 shadow-sm">
            <Palette className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <ThemeToggle />
      </div>

      {/* Hero section with gradient background + products photo */}
      <motion.div
        className="relative overflow-hidden"
        variants={itemVariants}
      >
        <div className="relative pb-0 pt-12 md:pt-14"
          style={{ background: 'linear-gradient(180deg, hsl(0 72% 51%) 0%, hsl(0 72% 42%) 60%, hsl(0 0% 93%) 100%)' }}
        >
          {/* Logo + Title */}
          <div className="px-5 md:px-8 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                <img src={lacerLogo} alt="Lacer" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                  Talonario Digital
                </h1>
                <p className="text-sm text-white/80">
                  Recetas digitales para profesionales
                </p>
              </div>
            </div>
          </div>

          {/* Products image — maximized, white background blended out */}
          <div className="relative px-0 md:px-4 -mb-1"
            style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
          >
            <img
              src={lacerProducts}
              alt="Gama de productos Lacer"
              className="w-full h-auto object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </motion.div>

      {/* Action cards */}
      <div className="px-4 md:px-8 lg:px-12 mt-4 space-y-3">

        {/* Nueva Receta – primary */}
        <motion.button
          onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")}
          className="group w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl transition-all"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-semibold">Nueva Receta</p>
            <p className="text-xs text-secondary-foreground/70">Crear y enviar al paciente</p>
          </div>
          <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Recomendaciones – secondary */}
        <motion.button
          onClick={() => onNavigate("recomendaciones")}
          className="group w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-secondary/30 transition-all"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Scissors className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-semibold text-foreground">Recomendaciones</p>
            <p className="text-xs text-muted-foreground">Documentos y vídeos útiles</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:translate-x-1 group-hover:text-secondary transition-all" />
        </motion.button>

        {/* Professional grid */}
        {isProfessional && (
          <motion.div className="grid grid-cols-2 gap-3 pt-2" variants={containerVariants}>
            {[
              { id: "historial", title: "Historial", subtitle: "Recetas enviadas", icon: Clock },
              { id: "pacientes", title: "Pacientes", subtitle: "Gestionar pacientes", icon: Users },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={() => onNavigate(action.id)}
                  className="group flex flex-col items-start gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-secondary/30 transition-all text-left"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{action.title}</p>
                    <p className="text-[11px] text-muted-foreground">{action.subtitle}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Stats */}
        {isProfessional && (
          <motion.div
            className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm"
            variants={itemVariants}
          >
            {[
              { value: stats.thisMonth, label: "Este mes", icon: CalendarDays },
              { value: stats.totalRecipes, label: "Recetas", icon: TrendingUp },
              { value: stats.totalPatients, label: "Pacientes", icon: UserCheck },
            ].map((stat, i) => (
              <div key={stat.label} className="flex-1 text-center">
                <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Basic upgrade */}
        {!isProfessional && (
          <motion.div className="text-center pt-4" variants={itemVariants}>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>¿Eres profesional? Activa todas las funciones</span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Version */}
      <motion.div className="text-center py-4 mt-4" variants={itemVariants}>
        <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide">
          v2.0 • {isProfessional ? 'PROFESIONAL' : 'MODO RÁPIDO'}
        </p>
      </motion.div>

      <LegalFooter />
    </motion.div>
  );
};
