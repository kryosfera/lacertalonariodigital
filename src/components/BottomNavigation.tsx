import { Home, Plus, Clock, User, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMode } from "@/hooks/useUserMode";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userMode?: UserMode;
}

const basicNavItems = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "nueva-receta", label: "Crear", icon: Plus, isCenter: true },
  { id: "recomendaciones", label: "Cirugía", icon: Scissors },
];

const professionalNavItems = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "recomendaciones", label: "Cirugía", icon: Scissors },
  { id: "nueva-receta", label: "Crear", icon: Plus, isCenter: true },
  { id: "historial", label: "Historial", icon: Clock },
  { id: "pacientes", label: "Pacientes", icon: User },
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
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
                  isActive 
                    ? "bg-secondary scale-110 shadow-secondary/30" 
                    : "bg-secondary/90 active:scale-95"
                )}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
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
              <Icon className={cn(
                "w-6 h-6 transition-transform",
                isActive && "scale-105"
              )} strokeWidth={isActive ? 2.5 : 2} />
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
