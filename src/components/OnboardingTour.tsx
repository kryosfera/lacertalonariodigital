import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { TourStep } from "@/hooks/useOnboardingTour";

interface OnboardingTourProps {
  isActive: boolean;
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({
  isActive,
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: OnboardingTourProps) => {
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-safe"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onSkip}
          />

          {/* Card */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Close */}
            <button
              onClick={onSkip}
              aria-label="Cerrar"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>

            {/* Image */}
            <div className="w-full aspect-square bg-muted overflow-hidden">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="px-6 pt-5 pb-5 text-center flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-foreground leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-primary"
                        : i < currentStep
                        ? "w-1.5 bg-primary/60"
                        : "w-1.5 bg-primary/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="px-6 pb-4 flex items-center gap-3">
              {isLast ? (
                <Button
                  size="lg"
                  onClick={onNext}
                  className="flex-1 rounded-full h-12 text-base font-semibold"
                >
                  Comenzar ahora
                </Button>
              ) : (
                <>
                  {!isFirst ? (
                    <Button
                      variant="ghost"
                      onClick={onPrev}
                      className="text-primary hover:text-primary hover:bg-primary/5 font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <Button
                    size="lg"
                    onClick={onNext}
                    className="ml-auto rounded-full h-12 px-8 font-semibold"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center pb-4">
              Paso {currentStep + 1} de {totalSteps}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
