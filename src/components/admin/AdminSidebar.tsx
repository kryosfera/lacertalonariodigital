import { LayoutDashboard, Package, FolderTree, Users, FileText, Wrench, ArrowLeft, LogOut, BookOpen, LifeBuoy, Activity, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import lacerLogo from '@/assets/lacer-logo-clean.png';

export type AdminSection = 'dashboard' | 'products' | 'categories' | 'recommendations' | 'users' | 'recipes' | 'tickets' | 'sessions' | 'audit' | 'maintenance';

const menuItems: { title: string; icon: typeof LayoutDashboard; section: AdminSection }[] = [
  { title: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { title: 'Productos', icon: Package, section: 'products' },
  { title: 'Categorías', icon: FolderTree, section: 'categories' },
  { title: 'Recomendaciones', icon: BookOpen, section: 'recommendations' },
  { title: 'Usuarios', icon: Users, section: 'users' },
  { title: 'Recetas', icon: FileText, section: 'recipes' },
  { title: 'Incidencias', icon: LifeBuoy, section: 'tickets' },
  { title: 'Sesiones activas', icon: Activity, section: 'sessions' },
  { title: 'Auditoría', icon: ShieldCheck, section: 'audit' },
  { title: 'Mantenimiento', icon: Wrench, section: 'maintenance' },
];

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onSignOut: () => void;
  openTicketsCount?: number;
}

export function AdminSidebar({ activeSection, onSectionChange, onSignOut, openTicketsCount = 0 }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className={`flex items-center gap-2.5 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="rounded-lg bg-white p-1 shadow-sm shrink-0">
            <img src={lacerLogo} alt="Lacer" className="h-7 w-7 object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none">Lacer</p>
              <p className="text-xs font-bold text-foreground leading-tight truncate">Talonario Digital</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && 'Administración'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className="relative"
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                  {item.section === 'tickets' && openTicketsCount > 0 && (
                    <SidebarMenuBadge>{openTicketsCount > 99 ? '99+' : openTicketsCount}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Volver a la app">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                {!collapsed && <span>Volver</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSignOut} tooltip="Cerrar sesión">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Cerrar Sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
