import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  PlusCircle, Scissors, Send, Building2, BarChart3,
  FilePlus, Clock, Users, QrCode, UserCog, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { TourStep } from "@/hooks/useOnboardingTour";

const iconMap: Record<string, React.ElementType> = {
  "plus-circle": PlusCircle,
  "scissors": Scissors,
  "send": Send,
  "building-2": Building2,
  "bar-chart-3": BarChart3,
  "file-plus": FilePlus,
  "clock": Clock,
  "users": Users,
  "qr-code": QrCode,
  "user-cog": UserCog,
};

interface OnboardingTourProps {
  isActive: boolean;
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onNavigate: (tab: string) => void;
}

export const OnboardingTour = ({
  isActive,
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onNavigate,
}: OnboardingTourProps) => {
  // Navigate to the correct tab when step changes
  useEffect(() => {
    if (isActive && step) {
      onNavigate(step.tab);
    }
  }, [isActive, step, onNavigate]);

  const Icon = iconMap[step?.icon] || PlusCircle;
  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;

  return (
    <AnimatePresence>
      {isActive && step && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onSkip}
          />

          {/* Tooltip card */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4 mb-24 md:mb-0 bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
          >
            {/* Header with icon */}
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-6 pb-4 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
              <button
                onClick={onSkip}
                className="shrink-0 p-1 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Progress + buttons */}
            <div className="px-6 py-4 flex items-center justify-between gap-3">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-primary"
                        : i < currentStep
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <Button variant="ghost" size="sm" onClick={onPrev}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                )}
                <Button size="sm" onClick={onNext} className="min-w-[100px]">
                  {isLast ? (
                    "¡Empezar!"
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Step counter */}
            <div className="px-6 pb-3">
              <p className="text-xs text-muted-foreground text-center">
                Paso {currentStep + 1} de {totalSteps}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
