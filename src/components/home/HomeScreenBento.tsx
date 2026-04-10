import { FileText, Clock, Users, Scissors, TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo.png";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LegalFooter } from "@/components/LegalFooter";
import type { Profile } from "@/hooks/useProfile";

interface HomeScreenBentoProps {
  onNavigate: (tab: string) => void;
  userMode?: UserMode;
  profile?: Profile | null;
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

export const HomeScreenBento = ({
  onNavigate,
  userMode = 'basic',
  profile,
  stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 }
}: HomeScreenBentoProps) => {
  const isProfessional = userMode === 'professional';
  const hasClinicInfo = isProfessional && profile && (profile.clinic_name || profile.professional_name);

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col px-5 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* Hero Red Section */}
      <motion.div
        className="relative -mx-5 lg:-mx-8 px-6 pt-14 pb-10 md:pt-16 md:pb-12 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3rem]"
        style={{ background: 'linear-gradient(160deg, hsl(0 72% 51%) 0%, hsl(0 72% 38%) 100%)' }}
        initial={{ opacity: 0, y: -80, scaleY: 0.6, originY: 0 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.05 }}
      >
        {/* Theme Toggle - Mobile */}
        <div className="absolute top-3 right-3 z-10 md:hidden">
          <ThemeToggle />
        </div>
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(0 72% 70%) 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(0 0% 100%) 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-col items-center text-center">
          {/* Logo - big and proud */}
          <motion.div
            className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center mb-5"
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: -2 }}
          >
            <img src={lacerLogo} alt="Lacer" className="w-14 h-14 md:w-16 md:h-16 object-contain" />
          </motion.div>

          <motion.h1
            className="text-[1.75rem] sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.1] mb-2"
            variants={itemVariants}
          >
            Talonario Digital
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-white/80 max-w-xs leading-relaxed"
            variants={itemVariants}
          >
            Recetas digitales para tus pacientes, directo a su móvil.
          </motion.p>
        </div>
      </motion.div>

      {/* Actions Area */}
      <div className="flex-1 flex flex-col items-center w-full max-w-sm mx-auto pt-8 pb-6 gap-3">

        {/* Primary CTA */}
        <motion.button
          onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")}
          className="w-full group flex items-center justify-between px-6 py-4 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-base shadow-lg transition-shadow hover:shadow-xl"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-[15px] font-semibold">Nueva Receta</span>
              <span className="block text-[11px] text-white/70 font-normal">Crear y enviar al paciente</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </motion.button>

        {/* Secondary CTA */}
        <motion.button
          onClick={() => onNavigate("recomendaciones")}
          className="w-full group flex items-center justify-between px-6 py-4 rounded-2xl bg-card border border-border text-foreground transition-colors hover:bg-muted"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <span className="block text-[15px] font-semibold">Recomendaciones</span>
              <span className="block text-[11px] text-muted-foreground font-normal">Post-cirugía por tipo</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-0.5 transition-transform" />
        </motion.button>

        {/* Professional quick links */}
        {isProfessional && (
          <motion.div
            className="w-full grid grid-cols-3 gap-2 mt-4"
            variants={itemVariants}
          >
            {[
              { id: "historial", label: "Historial", icon: Clock },
              { id: "pacientes", label: "Pacientes", icon: Users },
              { id: "dashboard", label: "Dashboard", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-semibold tracking-wide">{item.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Stats row – professional */}
        {isProfessional && (
          <motion.div
            className="w-full flex items-center justify-center gap-6 py-4 mt-2 rounded-2xl bg-card border border-border"
            variants={itemVariants}
          >
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{stats.thisMonth}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">este mes</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{stats.totalRecipes}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">recetas</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{stats.totalPatients}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">pacientes</p>
            </div>
          </motion.div>
        )}

        {/* Basic mode upgrade hint */}
        {!isProfessional && (
          <motion.div className="mt-6" variants={itemVariants}>
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

      {/* Footer */}
      <div className="mt-auto pb-4 text-center">
        <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase mb-2">
          v2.0 · {isProfessional ? 'profesional' : 'modo rápido'}
        </p>
        <LegalFooter className="" />
      </div>
    </motion.div>
  );
};
