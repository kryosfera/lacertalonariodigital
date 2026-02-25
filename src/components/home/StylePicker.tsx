import { motion } from "framer-motion";
import { LayoutGrid, Minus, Sparkles, Square, Palette } from "lucide-react";
import lacerLogo from "@/assets/lacer-logo.png";

export type HomeStyle = 'bento' | 'minimal' | 'glass' | 'bold';

interface StylePickerProps {
  onSelectStyle: (style: HomeStyle) => void;
}

const styles: { id: HomeStyle; name: string; description: string; icon: typeof LayoutGrid; preview: string }[] = [
  {
    id: 'bento',
    name: 'Bento',
    description: 'Hero rojo, cards con iconos, estilo app moderna',
    icon: LayoutGrid,
    preview: 'linear-gradient(160deg, hsl(0 72% 51%) 0%, hsl(0 72% 38%) 60%, hsl(0 0% 98%) 60%)'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra limpio, botones pill, máximo espacio',
    icon: Minus,
    preview: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 96%) 100%)'
  },
  {
    id: 'glass',
    name: 'Glass',
    description: 'Glassmorphism, blur y transparencias, estilo iOS',
    icon: Sparkles,
    preview: 'linear-gradient(145deg, hsl(0 72% 51% / 0.2) 0%, hsl(0 0% 98%) 70%)'
  },
  {
    id: 'bold',
    name: 'Lacer',
    description: 'Estilo corporativo Lacer, limpio y profesional',
    icon: Square,
    preview: 'linear-gradient(180deg, hsl(0 72% 51%) 0%, hsl(0 72% 51%) 35%, hsl(0 0% 100%) 35%)'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  }
};

export const StylePicker = ({ onSelectStyle }: StylePickerProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-5 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-secondary" />
          <span className="text-xs font-semibold text-secondary uppercase tracking-widest">Personaliza tu experiencia</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Elige tu estilo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Podrás cambiarlo en cualquier momento
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {styles.map((style) => {
          const Icon = style.icon;
          return (
            <motion.button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className="group relative flex flex-col rounded-2xl border border-border overflow-hidden bg-card shadow-md hover:shadow-xl transition-shadow"
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Preview area */}
              <div
                className="h-28 md:h-32 w-full relative"
                style={{ background: style.preview }}
              >
                {/* Mini logo preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    style.id === 'bento' ? 'bg-white/90 shadow-lg' :
                    style.id === 'minimal' ? 'bg-transparent' :
                    style.id === 'glass' ? 'bg-white/30 backdrop-blur border border-white/30' :
                    'bg-secondary shadow-[3px_3px_0px_hsl(0_72%_35%)]'
                  }`}>
                    <img src={lacerLogo} alt="" className="w-6 h-6 object-contain" />
                  </div>
                </div>
                {/* Bold style decorative shadow blocks */}
                {style.id === 'bold' && (
                  <>
                    <div className="absolute bottom-2 left-2 w-16 h-3 bg-foreground/10 rounded" style={{ boxShadow: '2px 2px 0px hsl(var(--foreground) / 0.15)' }} />
                    <div className="absolute bottom-7 left-2 w-12 h-3 bg-secondary/30 rounded" style={{ boxShadow: '2px 2px 0px hsl(0 72% 35% / 0.2)' }} />
                  </>
                )}
              </div>
              {/* Label */}
              <div className="px-3 py-3 text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-sm font-bold text-foreground">{style.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">{style.description}</p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
