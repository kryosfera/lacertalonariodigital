import { LayoutDashboard, Package, FolderTree, Users, FileText, Wrench, ArrowLeft, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export type AdminSection = 'dashboard' | 'products' | 'categories' | 'users' | 'recipes' | 'maintenance';

const menuItems: { title: string; icon: typeof LayoutDashboard; section: AdminSection }[] = [
  { title: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { title: 'Productos', icon: Package, section: 'products' },
  { title: 'Categorías', icon: FolderTree, section: 'categories' },
  { title: 'Usuarios', icon: Users, section: 'users' },
  { title: 'Recetas', icon: FileText, section: 'recipes' },
  { title: 'Mantenimiento', icon: Wrench, section: 'maintenance' },
];

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onSignOut: () => void;
}

export function AdminSidebar({ activeSection, onSectionChange, onSignOut }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
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
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
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
