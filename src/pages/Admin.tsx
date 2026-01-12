import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, FolderTree, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { ProductsAdmin } from '@/components/admin/ProductsAdmin';
import { CategoriesAdmin } from '@/components/admin/CategoriesAdmin';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      navigate('/');
    }
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
                <p className="text-xs text-muted-foreground">Gestión de productos y categorías</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-auto p-1">
            <TabsTrigger value="products" className="flex items-center gap-2 py-2">
              <Package className="w-4 h-4" />
              <span>Productos</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2 py-2">
              <FolderTree className="w-4 h-4" />
              <span>Categorías</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsAdmin />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
