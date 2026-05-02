import { Home, Clock, User, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMode } from "@/hooks/useUserMode";
import lacerLogo from "@/assets/lacer-logo-clean.png";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userMode?: UserMode;
}

const basicNavItems = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "nueva-receta", label: "Nueva", icon: null, isCenter: true },
  { id: "recomendaciones", label: "Recomendaciones", icon: Scissors },
];

const professionalNavItems = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "recomendaciones", label: "Recomendaciones", icon: Scissors },
  { id: "nueva-receta", label: "Crear", icon: null, isCenter: true },
  { id: "historial", label: "Historial", icon: Clock },
  { id: "perfil", label: "Perfil", icon: User },
];

export const BottomNavigation = ({ activeTab, onTabChange, userMode = 'basic' }: BottomNavigationProps) => {
  const isProfessional = userMode === 'professional';
  const navItems = isProfessional ? professionalNavItems : basicNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around h-[72px] px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isCenter = item.isCenter;
          
          if (isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-label={`${item.label} receta`}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center bg-white transition-all duration-200 overflow-hidden",
                  isActive
                    ? "scale-110 shadow-[0_8px_20px_hsl(var(--secondary)/0.35)]"
                    : "shadow-[0_4px_14px_hsl(var(--secondary)/0.25)] active:scale-95"
                )}>
                  <img
                    src={lacerLogo}
                    alt="Lacer"
                    loading="lazy"
                    width={56}
                    height={56}
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </button>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 active:scale-95",
                isActive 
                  ? "text-secondary" 
                  : "text-muted-foreground"
              )}
            >
              {Icon && (
                <Icon className={cn(
                  "w-6 h-6 transition-transform",
                  isActive && "scale-105"
                )} strokeWidth={isActive ? 2.5 : 2} />
              )}
              <span className={cn(
                "text-[10px] mt-1 font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
