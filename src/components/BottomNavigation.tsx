import { Home, Plus, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "historial", label: "Historial", icon: Clock },
  { id: "nueva-receta", label: "Crear", icon: Plus, isCenter: true },
  { id: "pacientes", label: "Pacientes", icon: User },
  { id: "perfil", label: "Perfil", icon: User },
];

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  // Reorder for display: Home, Historial, Create (center), Pacientes, Perfil
  const displayItems = [
    navItems[0], // home
    navItems[1], // historial
    navItems[2], // create (center)
    navItems[3], // pacientes
    navItems[4], // perfil
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around h-[72px] px-2 pb-safe">
        {displayItems.map((item) => {
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
