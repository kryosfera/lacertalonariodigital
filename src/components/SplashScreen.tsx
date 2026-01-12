import { useEffect, useState } from "react";
import lacerLogo from "@/assets/lacer-logo.png";

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export const SplashScreen = ({ onFinish, minDuration = 1500 }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinish, 400); // Wait for exit animation
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onFinish, minDuration]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-secondary transition-all duration-400 ${
        isExiting ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      {/* Logo container with glassmorphism card */}
      <div className={`transition-all duration-700 ${isExiting ? "scale-90 opacity-0" : "scale-100 opacity-100"}`}>
        <div className="relative p-8 md:p-10 rounded-3xl backdrop-blur-xl bg-white/15 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          <img 
            src={lacerLogo} 
            alt="Lacer" 
            className="relative w-32 h-32 md:w-40 md:h-40 object-contain animate-pulse-subtle drop-shadow-lg"
            style={{
              filter: "brightness(0) invert(1)", // Make logo white
            }}
          />
        </div>
      </div>
      
      {/* App name */}
      <div className={`mt-8 text-center transition-all duration-500 delay-200 ${
        isExiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
          Talonario Digital
        </h1>
        <p className="text-white/70 text-sm mt-2">
          by Lacer
        </p>
      </div>

      {/* Loading indicator */}
      <div className={`absolute bottom-16 transition-all duration-300 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};
