import { FileText, Clock, Users, Scissors, TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo-color.png";
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
      staggerChildren: 0.06,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30
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
      className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-5 lg:px-8 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Theme Toggle - Mobile */}
      <div className="absolute top-2 right-2 z-10 md:hidden">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl flex flex-col items-center text-center">

        {/* Logo pill */}
        <motion.div variants={itemVariants}>
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[20px] bg-card border border-border/60 shadow-sm flex items-center justify-center mb-6">
            <img src={lacerLogo} alt="Lacer" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-[2rem] sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-3"
          variants={itemVariants}
        >
          Talonario Digital
        </motion.h1>

        <motion.p
          className="text-base lg:text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed mb-10"
          variants={itemVariants}
        >
          Recetas digitales para tus pacientes. Rápido, simple y directo por WhatsApp o email.
        </motion.p>

        {/* Primary CTA */}
        <motion.div className="w-full max-w-xs mb-4" variants={itemVariants}>
          <motion.button
            onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")}
            className="w-full group flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-secondary text-secondary-foreground font-semibold text-base shadow-md transition-shadow hover:shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <FileText className="w-[18px] h-[18px]" />
            Nueva Receta
            <ChevronRight className="w-4 h-4 opacity-60 -mr-1 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Secondary CTA */}
        <motion.div className="w-full max-w-xs mb-10" variants={itemVariants}>
          <motion.button
            onClick={() => onNavigate("recomendaciones")}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-card border border-border text-foreground font-medium text-base transition-colors hover:bg-muted"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Scissors className="w-[18px] h-[18px] text-secondary" />
            Recomendaciones Post-Cirugía
          </motion.button>
        </motion.div>

        {/* Professional quick links */}
        {isProfessional && (
          <motion.div
            className="flex items-center justify-center gap-6 mb-10"
            variants={itemVariants}
          >
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
                  className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-11 h-11 rounded-2xl bg-muted/60 flex items-center justify-center transition-colors hover:bg-muted">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Stats row – professional */}
        {isProfessional && (
          <motion.div
            className="flex items-center justify-center gap-8 text-center mb-8"
            variants={itemVariants}
          >
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">este mes</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalRecipes}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">recetas</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalPatients}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">pacientes</p>
            </div>
          </motion.div>
        )}

        {/* Basic mode upgrade hint */}
        {!isProfessional && (
          <motion.div variants={itemVariants}>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-secondary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ¿Eres profesional? Activa todas las funciones
            </Link>
          </motion.div>
        )}
      </div>

      {/* Version tag */}
      <motion.p
        className="mt-auto pt-6 text-[10px] text-muted-foreground/40 tracking-widest uppercase"
        variants={itemVariants}
      >
        v2.0 · {isProfessional ? 'profesional' : 'modo rápido'}
      </motion.p>

      <LegalFooter className="mt-2" />
    </motion.div>
  );
};
