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
          <header className="h-14 flex items-center border-b bg-card px-4 sticky top-0 z-50">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-lg font-bold text-foreground">Panel de Administración</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {activeSection === 'dashboard' && <AdminDashboard />}
            {activeSection === 'products' && <ProductsAdmin />}
            {activeSection === 'categories' && <CategoriesAdmin />}
            {activeSection === 'users' && <UsersAdmin />}
            {activeSection === 'recipes' && <RecipesAdmin />}
            {activeSection === 'maintenance' && <MaintenanceAdmin />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
