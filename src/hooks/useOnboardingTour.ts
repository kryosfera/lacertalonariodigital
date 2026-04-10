import { useState, useCallback, useEffect } from "react";
import { UserMode } from "./useUserMode";

export interface TourStep {
  id: string;
  tab: string; // which tab to navigate to
  title: string;
  description: string;
  icon: string; // lucide icon name
  highlightSelector?: string; // CSS selector to spotlight
}

const BASIC_STEPS: TourStep[] = [
  {
    id: "basic-recipe",
    tab: "nueva-receta",
    title: "Crea tu primera receta",
    description: "Selecciona productos por categoría y crea una receta personalizada para tu paciente.",
    icon: "plus-circle",
  },
  {
    id: "basic-recommendations",
    tab: "recomendaciones",
    title: "Recomendaciones post-cirugía",
    description: "Accede a guías y vídeos para compartir con tus pacientes tras una intervención.",
    icon: "scissors",
  },
  {
    id: "basic-send",
    tab: "nueva-receta",
    title: "Envía por WhatsApp, email o PDF",
    description: "Una vez creada la receta, envíala al instante por el canal que prefieras.",
    icon: "send",
  },
];

const PRO_STEPS: TourStep[] = [
  {
    id: "pro-hero",
    tab: "home",
    title: "Tu clínica, tu marca",
    description: "Tu logo y nombre de clínica aparecen aquí. Personaliza tu espacio desde el perfil.",
    icon: "building-2",
  },
  {
    id: "pro-dashboard",
    tab: "dashboard",
    title: "Dashboard de actividad",
    description: "Visualiza estadísticas de recetas enviadas y pacientes activos de un vistazo.",
    icon: "bar-chart-3",
  },
  {
    id: "pro-recipe",
    tab: "nueva-receta",
    title: "Recetas con autocompletado",
    description: "Crea recetas con datos de paciente pre-rellenados y guarda plantillas para reutilizar.",
    icon: "file-plus",
  },
  {
    id: "pro-recommendations",
    tab: "recomendaciones",
    title: "Guías post-cirugía",
    description: "Comparte vídeos y PDFs de cuidado post-operatorio con tus pacientes.",
    icon: "scissors",
  },
  {
    id: "pro-history",
    tab: "historial",
    title: "Historial completo",
    description: "Consulta todas las recetas enviadas y su estado de dispensación en farmacia.",
    icon: "clock",
  },
  {
    id: "pro-patients",
    tab: "pacientes",
    title: "Gestión de pacientes",
    description: "Crea y gestiona tu base de datos. Accede al historial de cada paciente.",
    icon: "users",
  },
  {
    id: "pro-dispensing",
    tab: "historial",
    title: "Dispensación por QR",
    description: "La farmacia escanea el QR de la receta para confirmar que el paciente la ha retirado.",
    icon: "qr-code",
  },
  {
    id: "pro-profile",
    tab: "perfil",
    title: "Personaliza tu perfil",
    description: "Configura tu clínica, logo, firma digital y datos profesionales.",
    icon: "user-cog",
  },
];

const ONBOARDING_BASIC_KEY = "onboarding_basic_done";
const ONBOARDING_PRO_KEY = "onboarding_pro_done";

export function useOnboardingTour(userMode: UserMode) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = userMode === "professional" ? PRO_STEPS : BASIC_STEPS;
  const storageKey = userMode === "professional" ? ONBOARDING_PRO_KEY : ONBOARDING_BASIC_KEY;

  // Auto-start on first visit
  useEffect(() => {
    if (!userMode) return;
    const done = localStorage.getItem(storageKey);
    if (!done) {
      // Small delay so the UI renders first
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [userMode, storageKey]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Complete
      localStorage.setItem(storageKey, "true");
      setIsActive(false);
      setCurrentStep(0);
    }
  }, [currentStep, steps.length, storageKey]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsActive(false);
    setCurrentStep(0);
  }, [storageKey]);

  return {
    isActive,
    currentStep,
    steps,
    step: steps[currentStep],
    totalSteps: steps.length,
    startTour,
    nextStep,
    prevStep,
    skipTour,
  };
}
