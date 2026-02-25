import { FileText, Clock, Users, Scissors, Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo.png";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LegalFooter } from "@/components/LegalFooter";

interface HomeScreenMinimalProps {
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
    transition: { staggerChildren: 0.07, delayChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 30 }
  }
};

export const HomeScreenMinimal = ({
  onNavigate,
  userMode = 'basic',
  stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 }
}: HomeScreenMinimalProps) => {
  const isProfessional = userMode === 'professional';

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col px-6 lg:px-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Theme Toggle - Mobile */}
      <div className="absolute top-3 right-3 z-10 md:hidden">
        <ThemeToggle />
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-[8vh]" />

      {/* Logo – clean, no container */}
      <motion.div className="flex justify-center mb-6" variants={itemVariants}>
        <img src={lacerLogo} alt="Lacer" className="h-12 md:h-14 object-contain" />
      </motion.div>

      {/* Title */}
      <motion.div className="text-center mb-10" variants={itemVariants}>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-none mb-2">
          Talonario Digital
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Recetas digitales, directo al móvil del paciente.
        </p>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col items-center w-full max-w-xs mx-auto gap-3">
        <motion.button
          onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-secondary text-secondary-foreground font-semibold text-[15px] shadow-md hover:shadow-lg transition-shadow"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <FileText className="w-4.5 h-4.5" />
          Nueva Receta
        </motion.button>

        <motion.button
          onClick={() => onNavigate("recomendaciones")}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full border border-border text-foreground font-medium text-[15px] hover:bg-muted transition-colors"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Scissors className="w-4.5 h-4.5 text-secondary" />
          Recomendaciones
        </motion.button>

        {/* Professional links */}
        {isProfessional && (
          <motion.div className="flex gap-2 mt-3 flex-wrap justify-center" variants={itemVariants}>
            {[
              { id: "historial", label: "Historial", icon: Clock },
              { id: "pacientes", label: "Pacientes", icon: Users },
              { id: "dashboard", label: "Dashboard", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Stats */}
        {isProfessional && (
          <motion.div
            className="flex items-center gap-6 mt-4 text-center"
            variants={itemVariants}
          >
            <div>
              <p className="text-lg font-bold text-foreground">{stats.thisMonth}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">este mes</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.totalRecipes}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">recetas</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.totalPatients}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">pacientes</p>
            </div>
          </motion.div>
        )}

        {/* Basic upgrade */}
        {!isProfessional && (
          <motion.div className="mt-6" variants={itemVariants}>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-secondary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ¿Eres profesional? Activa todas las funciones
            </Link>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-1 min-h-[6vh]" />
      <div className="pb-4 text-center">
        <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase mb-2">
          v2.0 · {isProfessional ? 'profesional' : 'modo rápido'}
        </p>
        <LegalFooter />
      </div>
    </motion.div>
  );
};
