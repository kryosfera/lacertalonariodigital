import { useState, useCallback, useEffect } from "react";
import { UserMode } from "./useUserMode";
import step1 from "@/assets/onboarding/step1.png";
import step2 from "@/assets/onboarding/step2.png";
import step3 from "@/assets/onboarding/step3.png";
import step4 from "@/assets/onboarding/step4.png";
import step5 from "@/assets/onboarding/step5.png";
import step6 from "@/assets/onboarding/step6.png";
import step7 from "@/assets/onboarding/step7.png";
import step8 from "@/assets/onboarding/step8.png";

export interface TourStep {
  id: string;
  image: string;
  title: string;
  description: string;
}

const STEPS: TourStep[] = [
  {
    id: "recetas",
    image: step1,
    title: "Crea recetas digitales",
    description: "Genera recetas digitales completas y personalizadas con facilidad desde tu dispositivo.",
  },
  {
    id: "guias",
    image: step2,
    title: "Guías y recomendaciones",
    description: "Accede a guías clínicas y vídeos formativos para tus pacientes.",
  },
  {
    id: "historial",
    image: step3,
    title: "Historial Completo",
    description: "Accede y organiza todo el historial de recetas y pacientes en un solo lugar.",
  },
  {
    id: "pacientes",
    image: step4,
    title: "Pacientes",
    description: "Organiza y accede fácilmente a tus pacientes y sus últimas recetas.",
  },
  {
    id: "dashboard",
    image: step5,
    title: "Dashboard",
    description: "Visualiza tus métricas clave y el estado de tus recetas en un solo lugar.",
  },
  {
    id: "perfil",
    image: step6,
    title: "Perfil",
    description: "Personaliza tus recetas con el logo y la información de contacto de tu clínica.",
  },
  {
    id: "envio",
    image: step7,
    title: "Envío instantáneo",
    description: "Envía la receta digital al instante a tus pacientes a través de WhatsApp, email o SMS.",
  },
  {
    id: "fin",
    image: step8,
    title: "Enhorabuena",
    description: "Ya puedes empezar a usar el Talonario digital.",
  },
];

const ONBOARDING_KEY = "onboarding_v2_done";

export function useOnboardingTour(_userMode?: UserMode) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-start on first visit
  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, "true");
      setIsActive(false);
      setCurrentStep(0);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const skipTour = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  return {
    isActive,
    currentStep,
    steps: STEPS,
    step: STEPS[currentStep],
    totalSteps: STEPS.length,
    startTour,
    nextStep,
    prevStep,
    skipTour,
  };
}
