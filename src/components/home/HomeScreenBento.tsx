import { FileText, Clock, Users, Scissors, TrendingUp, ChevronRight, Sparkles, AlertCircle, RefreshCw, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo-clean.png";
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
  statsLoading?: boolean;
  statsError?: boolean;
  onRetryStats?: () => void;
  onLaunchTour?: () => void;
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
  stats,
  statsLoading = false,
  statsError = false,
  onRetryStats,
  onLaunchTour,
}: HomeScreenBentoProps) => {
  const isProfessional = userMode === 'professional';
  const hasClinicInfo = isProfessional && profile && (profile.clinic_name || profile.professional_name);
  const safeStats = stats ?? { totalRecipes: 0, totalPatients: 0, thisMonth: 0 };

  // Show skeleton when loading and we have no data yet
  const showSkeleton = statsLoading && !stats;

  const StatValue = ({ value }: { value: number }) =>
    showSkeleton ? (
      <span className="inline-block h-5 w-8 rounded bg-muted-foreground/15 animate-pulse" />
    ) : (
      <span>{value}</span>
    );

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col px-5 lg:px-8 pb-20 md:pb-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* Hero Red Section */}
      <motion.div
        className="relative -mx-5 lg:-mx-8 px-6 pt-5 pb-4 md:pt-8 md:pb-6 overflow-hidden rounded-b-[2rem] md:rounded-b-[2.5rem]"
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
          {/* Logo */}
          <motion.div
            className="w-14 h-14 md:w-18 md:h-18 rounded-[1.1rem] bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center mb-2"
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: -2 }}
          >
            {hasClinicInfo && profile?.logo_url ? (
              <img src={profile.logo_url} alt={profile.clinic_name || "Clínica"} className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg" />
            ) : (
              <img src={lacerLogo} alt="Lacer" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            )}
          </motion.div>

          {hasClinicInfo ? (
            <>
              <motion.h1
                className="text-[1.75rem] sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.1] mb-1"
                variants={itemVariants}
              >
                {profile?.clinic_name || 'Talonario Digital'}
              </motion.h1>

              {profile?.professional_name && (
                <motion.p
                  className="text-sm md:text-base text-white/90 font-medium mb-1"
                  variants={itemVariants}
                >
                  Dr/Dra. {profile.professional_name}
                </motion.p>
              )}

              <motion.p
                className="text-xs text-white/60 max-w-xs leading-relaxed"
                variants={itemVariants}
              >
                Talonario Digital · Powered by Lacer
              </motion.p>
            </>
          ) : (
            <>
              <motion.h1
                className="text-[1.5rem] sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-[1.1] mb-1"
                variants={itemVariants}
              >
                Talonario Digital
              </motion.h1>

              <motion.p
                className="text-[11px] md:text-sm text-white/80 max-w-xs leading-snug"
                variants={itemVariants}
              >
                Recetas digitales para tus pacientes, directo a su móvil.
              </motion.p>
            </>
          )}
        </div>
      </motion.div>

      {/* Actions Area */}
      <div className="flex-1 flex flex-col items-center w-full max-w-sm mx-auto pt-5 md:pt-5 pb-2 gap-2.5">

        {/* Primary CTA */}
        <motion.button
          onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")}
          className="w-full group flex items-center justify-between px-6 py-4 rounded-2xl text-white font-semibold text-base shadow-lg transition-shadow hover:shadow-xl"
          style={{ background: 'linear-gradient(160deg, hsl(0 72% 51%) 0%, hsl(0 72% 38%) 100%)' }}
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
            className="w-full mt-2 rounded-2xl bg-card border border-border overflow-hidden"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">
                  <StatValue value={safeStats.thisMonth} />
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">este mes</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">
                  <StatValue value={safeStats.totalRecipes} />
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">recetas</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">
                  <StatValue value={safeStats.totalPatients} />
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">pacientes</p>
              </div>
            </div>
            {statsError && (
              <button
                type="button"
                onClick={onRetryStats}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 border-t border-destructive/20 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>No se pudieron cargar las estadísticas</span>
                <RefreshCw className="w-3 h-3 ml-1" />
                <span className="underline underline-offset-2">Reintentar</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Basic mode upgrade hint */}
        {!isProfessional && (
          <motion.div
            className="w-full mt-2"
            variants={itemVariants}
          >
            <Link
              to="/auth?tab=signup"
              className="block w-full rounded-2xl border border-secondary/30 p-3 md:p-4 text-center transition-colors hover:border-secondary/60 bg-transparent"
            >
              <Sparkles className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="text-sm md:text-base font-bold text-foreground mb-0.5">¿Eres profesional?</p>
              <p className="text-[11px] md:text-xs text-muted-foreground mb-2">Regístrate gratis y activa gestión de pacientes e historial</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md"
                style={{ background: 'linear-gradient(160deg, hsl(0 72% 51%) 0%, hsl(0 72% 38%) 100%)' }}
              >
                Activar cuenta profesional
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pb-2 text-center">
        <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase mb-1">
          v2.0 · {isProfessional ? 'profesional' : 'modo rápido'}
        </p>
        <LegalFooter className="" />
      </div>
    </motion.div>
  );
};
