import { FileText, Clock, Users, Scissors, Sparkles, TrendingUp, ChevronRight, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo.png";
import { UserMode } from "@/hooks/useUserMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LegalFooter } from "@/components/LegalFooter";

interface HomeScreenGlassProps {
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
    transition: { staggerChildren: 0.09, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 }
  }
};

export const HomeScreenGlass = ({
  onNavigate,
  userMode = 'basic',
  onChangeStyle,
  stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 }
}: HomeScreenGlassProps) => {
  const isProfessional = userMode === 'professional';

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Red gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(145deg, hsl(0 72% 51% / 0.06) 0%, hsl(0 72% 45% / 0.03) 50%, hsl(var(--background)) 100%)'
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-20 -right-20 w-80 h-80 rounded-full opacity-20 -z-10"
        style={{ background: 'radial-gradient(circle, hsl(0 72% 55%) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-40 -left-20 w-60 h-60 rounded-full opacity-10 -z-10"
        style={{ background: 'radial-gradient(circle, hsl(0 72% 50%) 0%, transparent 70%)' }}
      />

      {/* Theme Toggle + Style - Mobile */}
      <div className="absolute top-3 right-3 z-10 md:hidden flex items-center gap-1">
        {onChangeStyle && (
          <button onClick={onChangeStyle} className="w-9 h-9 flex items-center justify-center rounded-full bg-card/80 backdrop-blur border border-border/50 shadow-sm">
            <Palette className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 lg:px-8 py-10">

        {/* Glass Logo Card */}
        <motion.div
          className="w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border"
          style={{
            background: 'hsl(var(--card) / 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'hsl(var(--border) / 0.3)'
          }}
          variants={itemVariants}
          whileHover={{ scale: 1.05, rotate: -3 }}
        >
          <img src={lacerLogo} alt="Lacer" className="w-16 h-16 md:w-18 md:h-18 object-contain" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-1"
          variants={itemVariants}
        >
          Talonario Digital
        </motion.h1>
        <motion.p
          className="text-sm text-muted-foreground mb-8 max-w-xs text-center"
          variants={itemVariants}
        >
          Recetas digitales para tus pacientes, directo a su móvil.
        </motion.p>

        {/* Glass Action Cards */}
        <div className="w-full max-w-sm space-y-3">
          <motion.button
            onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")}
            className="w-full group flex items-center justify-between px-5 py-4 rounded-2xl border shadow-lg transition-all hover:shadow-xl"
            style={{
              background: 'hsl(var(--secondary) / 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderColor: 'hsl(0 0% 100% / 0.15)'
            }}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="text-left">
                <span className="block text-[15px] font-semibold text-secondary-foreground">Nueva Receta</span>
                <span className="block text-[11px] text-white/60 font-normal">Crear y enviar al paciente</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>

          <motion.button
            onClick={() => onNavigate("recomendaciones")}
            className="w-full group flex items-center justify-between px-5 py-4 rounded-2xl border shadow-md transition-all hover:shadow-lg"
            style={{
              background: 'hsl(var(--card) / 0.5)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderColor: 'hsl(var(--border) / 0.3)'
            }}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'hsl(0 72% 51% / 0.12)' }}
              >
                <Scissors className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left">
                <span className="block text-[15px] font-semibold text-foreground">Recomendaciones</span>
                <span className="block text-[11px] text-muted-foreground font-normal">Post-cirugía por tipo</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>

          {/* Professional links */}
          {isProfessional && (
            <motion.div className="grid grid-cols-3 gap-2 mt-4" variants={itemVariants}>
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
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl border transition-colors hover:bg-muted/30"
                    style={{
                      background: 'hsl(var(--card) / 0.35)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderColor: 'hsl(var(--border) / 0.25)'
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">{item.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* Stats */}
          {isProfessional && (
            <motion.div
              className="flex items-center justify-center gap-6 py-4 mt-2 rounded-2xl border"
              style={{
                background: 'hsl(var(--card) / 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderColor: 'hsl(var(--border) / 0.25)'
              }}
              variants={itemVariants}
            >
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{stats.thisMonth}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">este mes</p>
              </div>
              <div className="w-px h-8 bg-border/30" />
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{stats.totalRecipes}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">recetas</p>
              </div>
              <div className="w-px h-8 bg-border/30" />
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{stats.totalPatients}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">pacientes</p>
              </div>
            </motion.div>
          )}

          {/* Basic upgrade */}
          {!isProfessional && (
            <motion.div className="mt-6 text-center" variants={itemVariants}>
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
      </div>

      {/* Footer */}
      <div className="pb-4 text-center">
        <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase mb-2">
          v2.0 · {isProfessional ? 'profesional' : 'modo rápido'}
        </p>
        <LegalFooter />
      </div>
    </motion.div>
  );
};
