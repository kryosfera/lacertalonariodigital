import { FileText, Clock, Users, Scissors, Sparkles, TrendingUp, CalendarDays, UserCheck, ChevronRight, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo-color.png";
import homeBanner from "@/assets/home-banner.jpg";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LegalFooter } from "@/components/LegalFooter";

interface HomeScreenBoldProps {
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
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 }
  }
};

export const HomeScreenBold = ({
  onNavigate,
  userMode = 'basic',
  onChangeStyle,
  stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 }
}: HomeScreenBoldProps) => {
  const isProfessional = userMode === 'professional';

  const mainActions = [
    {
      id: isProfessional ? "nueva-receta" : "seleccionar-categoria",
      title: "Nueva Receta",
      subtitle: "Crear y enviar receta digital",
      icon: FileText,
    },
    {
      id: "recomendaciones",
      title: "Recomendaciones",
      subtitle: "Documentos y vídeos útiles",
      icon: Scissors,
    },
  ];

  const proActions = [
    { id: "historial", title: "Historial", subtitle: "Ver recetas enviadas", icon: Clock },
    { id: "pacientes", title: "Pacientes", subtitle: "Gestionar pacientes", icon: Users },
  ];

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
          <button onClick={onChangeStyle} className="w-9 h-9 flex items-center justify-center rounded-full bg-card/80 backdrop-blur border border-border/50 shadow-sm">
            <Palette className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <ThemeToggle />
      </div>

      {/* Hero banner — full-width red bar with logo, Lacer corporate style */}
      <motion.div
        className="relative overflow-hidden bg-secondary"
        variants={itemVariants}
      >
        <div className="relative flex items-center gap-4 px-5 py-6 md:px-8 md:py-8 lg:px-12">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center shadow-md flex-shrink-0">
            <img src={lacerLogo} alt="Lacer" className="w-10 h-10 md:w-11 md:h-11 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              Talonario Digital
            </h1>
            <p className="text-sm md:text-base text-white/80 mt-0.5">
              Recetas digitales para profesionales
            </p>
          </div>
        </div>
        {/* Decorative red accent line at bottom */}
        <div className="h-1 bg-gradient-to-r from-secondary via-red-400 to-secondary" />
      </motion.div>

      {/* Content area */}
      <div className="px-4 md:px-8 lg:px-12 mt-6 space-y-4">
        
        {/* Main action cards — clean white cards with left red border, Lacer corporate style */}
        {mainActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="group w-full flex items-center gap-4 p-4 md:p-5 rounded-xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all text-left"
              style={{ borderLeftWidth: 4, borderLeftColor: 'hsl(var(--secondary))' }}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/15 transition-colors">
                <Icon className="w-6 h-6 md:w-7 md:h-7 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-lg font-semibold text-foreground">{action.title}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{action.subtitle}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </motion.button>
          );
        })}

        {/* Professional extra actions — 2-col grid */}
        {isProfessional && (
          <motion.div className="grid grid-cols-2 gap-3 mt-2" variants={containerVariants}>
            {proActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={() => onNavigate(action.id)}
                  className="group flex flex-col items-start gap-3 p-4 rounded-xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all text-left"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/15 transition-colors">
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

        {/* Stats row for professional */}
        {isProfessional && (
          <motion.div
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/60 shadow-sm"
            variants={itemVariants}
          >
            {[
              { value: stats.thisMonth, label: "Este mes", icon: CalendarDays },
              { value: stats.totalRecipes, label: "Recetas", icon: TrendingUp },
              { value: stats.totalPatients, label: "Pacientes", icon: UserCheck },
            ].map((stat, i) => (
              <div key={stat.label} className="flex-1 text-center">
                {i > 0 && <div className="hidden" />}
                <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Basic user upgrade link */}
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

      {/* Version tag */}
      <motion.div className="text-center py-4 mt-4" variants={itemVariants}>
        <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide">
          v2.0 • {isProfessional ? 'PROFESIONAL' : 'MODO RÁPIDO'}
        </p>
      </motion.div>

      <LegalFooter />
    </motion.div>
  );
};
