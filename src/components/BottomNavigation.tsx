import { Home, Plus, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "nueva-receta", label: "Crear", icon: Plus },
  { id: "historial", label: "Historial", icon: Clock },
  { id: "perfil", label: "Perfil", icon: User },
];

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isCreate = item.id === "nueva-receta";
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200",
                isActive 
                  ? "text-secondary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isCreate ? (
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center -mt-4 shadow-lg transition-all",
                  isActive 
                    ? "bg-secondary text-secondary-foreground scale-110" 
                    : "bg-secondary/80 text-secondary-foreground hover:bg-secondary"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
              ) : (
                <>
                  <Icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110"
                  )} />
                  <span className={cn(
                    "text-[10px] mt-1 font-medium",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
