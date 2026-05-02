import { useEffect, useState } from "react";
import lacerLogo from "@/assets/lacer-logo-clean.png";

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export const SplashScreen = ({ onFinish, minDuration = 1200 }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Staggered entrance animations
    const cardTimer = setTimeout(() => setShowCard(true), 100);
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    const textTimer = setTimeout(() => setShowText(true), 600);
    const loaderTimer = setTimeout(() => setShowLoader(true), 900);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinish, 500);
    }, minDuration);

    return () => {
      clearTimeout(cardTimer);
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(loaderTimer);
      clearTimeout(exitTimer);
    };
  }, [onFinish, minDuration]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-secondary transition-all duration-500 pt-safe ${
        isExiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-all duration-1000 ${
          showCard ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`} />
        <div className={`absolute bottom-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl transition-all duration-1000 delay-200 ${
          showCard ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`} />
      </div>

      {/* Logo container with glassmorphism card */}
      <div className={`transition-all duration-700 ease-out ${
        isExiting ? "scale-90 opacity-0 -translate-y-4" : 
        showCard ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-8"
      }`}>
        <div className="relative p-6 md:p-8 rounded-3xl bg-white border-2 border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.15)]">
          {/* Logo with separate animation */}
          <div className={`transition-all duration-500 ease-out delay-100 ${
            isExiting ? "opacity-0 scale-90" :
            showLogo ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}>
            <img 
              src={lacerLogo} 
              alt="Lacer" 
              className="relative w-36 h-36 md:w-44 md:h-44 object-contain"
            />
          </div>
        </div>
      </div>
      
      {/* App name with staggered animation */}
      <div className={`mt-8 text-center transition-all duration-500 ease-out ${
        isExiting ? "opacity-0 translate-y-4" : 
        showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide drop-shadow-md">
          Talonario Digital
        </h1>
        <p className={`text-white/80 text-sm mt-2 transition-all duration-300 delay-150 ${
          showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}>
          by Lacer
        </p>
      </div>

      {/* Loading indicator with fade in */}
      <div className={`absolute bottom-16 transition-all duration-400 ${
        isExiting ? "opacity-0 translate-y-4" : 
        showLoader ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white/90 animate-bounce shadow-sm" style={{ animationDelay: "0ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-white/90 animate-bounce shadow-sm" style={{ animationDelay: "150ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-white/90 animate-bounce shadow-sm" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};
