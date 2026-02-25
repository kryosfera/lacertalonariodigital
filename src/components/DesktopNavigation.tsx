import { cn } from "@/lib/utils";
import { UserMode } from "@/hooks/useUserMode";

interface NavLinkProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const NavLink = ({ active, onClick, children }: NavLinkProps) => (
  <button
    onClick={onClick}
    className={cn(
      "relative px-4 py-2 text-sm font-medium transition-colors",
      "hover:text-secondary",
      active ? "text-secondary" : "text-muted-foreground"
    )}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
    )}
  </button>
);

interface DesktopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userMode: UserMode;
}

export const DesktopNavigation = ({ 
  activeTab, 
  onTabChange, 
  userMode 
}: DesktopNavigationProps) => {
  const isProfessional = userMode === 'professional';

  const basicNavItems = [
    { id: "home", label: "Inicio" },
    { id: "nueva-receta", label: "Nueva Receta" },
    { id: "recomendaciones", label: "Recomendaciones" },
  ];

  const professionalNavItems = [
    { id: "home", label: "Inicio" },
    { id: "nueva-receta", label: "Nueva Receta" },
    { id: "recomendaciones", label: "Recomendaciones" },
    { id: "historial", label: "Historial" },
    { id: "pacientes", label: "Pacientes" },
    { id: "perfil", label: "Perfil" },
  ];

  const navItems = isProfessional ? professionalNavItems : basicNavItems;

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          active={activeTab === item.id}
          onClick={() => onTabChange(item.id)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
