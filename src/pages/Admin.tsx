import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar, type AdminSection } from '@/components/admin/AdminSidebar';

import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ProductsAdmin } from '@/components/admin/ProductsAdmin';
import { CategoriesAdmin } from '@/components/admin/CategoriesAdmin';
import { UsersAdmin } from '@/components/admin/UsersAdmin';
import { RecipesAdmin } from '@/components/admin/RecipesAdmin';
import { RecommendationsAdmin } from '@/components/admin/RecommendationsAdmin';
import { MaintenanceAdmin } from '@/components/admin/MaintenanceAdmin';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && user && !isAdmin) navigate('/');
  }, [isAdmin, isLoading, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} onSignOut={handleSignOut} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-card/95 backdrop-blur-md px-4 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger />
              <div className="h-9 w-px bg-border shrink-0" aria-hidden />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none hidden sm:block">Panel de Administración</p>
                <h1 className="text-sm md:text-base font-bold text-foreground leading-tight truncate">
                  {activeSection === 'dashboard' && 'Dashboard'}
                  {activeSection === 'products' && 'Productos'}
                  {activeSection === 'categories' && 'Categorías'}
                  {activeSection === 'users' && 'Usuarios'}
                  {activeSection === 'recipes' && 'Recetas'}
                  {activeSection === 'recommendations' && 'Recomendaciones'}
                  {activeSection === 'maintenance' && 'Mantenimiento'}
                </h1>
              </div>
            </div>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Admin
            </span>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {activeSection === 'dashboard' && <AdminDashboard />}
            {activeSection === 'products' && <ProductsAdmin />}
            {activeSection === 'categories' && <CategoriesAdmin />}
            {activeSection === 'users' && <UsersAdmin />}
            {activeSection === 'recipes' && <RecipesAdmin />}
            {activeSection === 'recommendations' && <RecommendationsAdmin />}
            {activeSection === 'maintenance' && <MaintenanceAdmin />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
