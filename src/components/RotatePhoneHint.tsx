import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";

export function RotatePhoneHint() {
  const [visible, setVisible] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  // Auto-hide after 6s or if already landscape
  useEffect(() => {
    if (isLandscape) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [isLandscape]);

  if (!visible || isLandscape) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg border border-secondary/20 animate-fade-in">
      <div className="animate-[rotate-phone_1.5s_ease-in-out_infinite]">
        <Smartphone className="w-5 h-5 text-secondary" />
      </div>
      <span className="text-xs text-secondary font-medium">
        Gira el móvil para ver el vídeo en pantalla completa
      </span>
    </div>
  );
}
