import { FileText, Clock, Users, Scissors, Sparkles, TrendingUp, ArrowRight, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import lacerLogo from "@/assets/lacer-logo.png";
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
    transition: { staggerChildren: 0.06, delayChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 350, damping: 28 }
  }
};

export const HomeScreenBold = ({
  onNavigate,
  userMode = 'basic',
  onChangeStyle,
  stats = { totalRecipes: 0, totalPatients: 0, thisMonth: 0 }
}: HomeScreenBoldProps) => {
  const isProfessional = userMode === 'professional';

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col px-5 lg:px-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Theme Toggle + Style - Mobile */}
      <div className="absolute top-3 right-3 z-10 md:hidden flex items-center gap-1">
        {onChangeStyle && (
          <button onClick={onChangeStyle} className="w-9 h-9 flex items-center justify-center rounded-full bg-card/80 backdrop-blur border border-border/50 shadow-sm">
            <Palette className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <ThemeToggle />
      </div>

      {/* Big logo */}
      <motion.div className="pt-16 md:pt-20 mb-6" variants={itemVariants}>
        <div
          className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-secondary flex items-center justify-center"
          style={{ boxShadow: '6px 6px 0px hsl(0 72% 35%)' }}
        >
          <img src={lacerLogo} alt="Lacer" className="w-20 h-20 md:w-24 md:h-24 object-contain invert brightness-0 contrast-100 dark:invert-0 dark:brightness-200" 
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </motion.div>

      {/* Title – large, no subtitle */}
      <motion.h1
        className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-[0.9] mb-8"
        variants={itemVariants}
      >
        Talonario<br />Digital
      </motion.h1>

      {/* Block buttons */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <motion.button
          onClick={() => onNavigate(isProfessional ? "nueva-receta" : "seleccionar-categoria")}
          className="group w-full flex items-center justify-between px-6 py-5 bg-secondary text-secondary-foreground font-bold text-lg rounded-xl transition-transform active:translate-x-1 active:translate-y-1"
          style={{ boxShadow: '4px 4px 0px hsl(0 72% 35%)' }}
          variants={itemVariants}
          whileHover={{ x: 2, y: 2, boxShadow: '2px 2px 0px hsl(0, 72%, 35%)' }}
          whileTap={{ x: 4, y: 4, boxShadow: '0px 0px 0px hsl(0, 72%, 35%)' }}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            Nueva Receta
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <motion.button
          onClick={() => onNavigate("recomendaciones")}
          className="group w-full flex items-center justify-between px-6 py-5 bg-card text-foreground font-bold text-lg rounded-xl border-2 border-foreground transition-transform active:translate-x-1 active:translate-y-1"
          style={{ boxShadow: '4px 4px 0px hsl(var(--foreground))' }}
          variants={itemVariants}
          whileHover={{ x: 2, y: 2, boxShadow: '2px 2px 0px hsl(var(--foreground))' }}
          whileTap={{ x: 4, y: 4, boxShadow: '0px 0px 0px hsl(var(--foreground))' }}
        >
          <div className="flex items-center gap-3">
            <Scissors className="w-6 h-6" />
            Recomendaciones
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Professional tools */}
        {isProfessional && (
          <motion.div className="flex gap-2 mt-3" variants={itemVariants}>
            {[
              { id: "historial", label: "Historial", icon: Clock },
              { id: "pacientes", label: "Pacientes", icon: Users },
              { id: "dashboard", label: "Stats", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 border-foreground bg-card font-bold text-xs uppercase tracking-wider transition-transform active:translate-x-0.5 active:translate-y-0.5"
                  style={{ boxShadow: '3px 3px 0px hsl(var(--foreground))' }}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Stats */}
        {isProfessional && (
          <motion.div
            className="flex items-center justify-between mt-4 px-4 py-4 rounded-xl border-2 border-foreground bg-card"
            style={{ boxShadow: '3px 3px 0px hsl(var(--foreground))' }}
            variants={itemVariants}
          >
            <div className="text-center flex-1">
              <p className="text-2xl font-black text-foreground">{stats.thisMonth}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">mes</p>
            </div>
            <div className="w-0.5 h-10 bg-foreground/20" />
            <div className="text-center flex-1">
              <p className="text-2xl font-black text-foreground">{stats.totalRecipes}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">recetas</p>
            </div>
            <div className="w-0.5 h-10 bg-foreground/20" />
            <div className="text-center flex-1">
              <p className="text-2xl font-black text-foreground">{stats.totalPatients}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">pacientes</p>
            </div>
          </motion.div>
        )}

        {/* Basic upgrade */}
        {!isProfessional && (
          <motion.div className="mt-8" variants={itemVariants}>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-secondary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ¿Profesional? Activa todo →
            </Link>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pb-4 text-left">
        <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase font-bold mb-2">
          v2.0 · {isProfessional ? 'pro' : 'quick'}
        </p>
        <LegalFooter />
      </div>
    </motion.div>
  );
};
