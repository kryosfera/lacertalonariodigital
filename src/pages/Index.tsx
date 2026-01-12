import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, BarChart3, Clock, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCreator } from "@/components/RecipeCreator";
import { PatientList } from "@/components/PatientList";
import { RecipeHistory } from "@/components/RecipeHistory";
import { DashboardStats } from "@/components/DashboardStats";
import { HomeScreen } from "@/components/HomeScreen";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import lacerLogo from "@/assets/lacer-logo.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const isMobile = useIsMobile();

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - iOS style with Lacer logo */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2.5 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={lacerLogo} 
                alt="Lacer" 
                className="h-8 md:h-9 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-semibold text-foreground leading-tight">
                  Talonario Digital
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link to="/admin" className="hidden md:inline-flex">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Admin
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2 md:py-6">
        {/* Desktop: Tabs navigation */}
        {!isMobile && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-5 h-auto p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="home" className="flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Inicio</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="nueva-receta" className="flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Plus className="w-4 h-4" />
                <span className="text-xs">Nueva</span>
              </TabsTrigger>
              <TabsTrigger value="pacientes" className="flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Users className="w-4 h-4" />
                <span className="text-xs">Pacientes</span>
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Historial</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-6">
              <HomeScreen onNavigate={handleNavigate} />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground">
                  Vista general de tu actividad y estadísticas
                </p>
              </div>
              <DashboardStats />
            </TabsContent>

            <TabsContent value="nueva-receta" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Nueva Receta</h2>
                <p className="text-muted-foreground">
                  Crea y envía recetas a tus pacientes de forma rápida
                </p>
              </div>
              <RecipeCreator />
            </TabsContent>

            <TabsContent value="pacientes" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Pacientes</h2>
                <p className="text-muted-foreground">
                  Gestiona tu base de datos de pacientes
                </p>
              </div>
              <PatientList />
            </TabsContent>

            <TabsContent value="historial" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Historial</h2>
                <p className="text-muted-foreground">
                  Consulta todas las recetas enviadas
                </p>
              </div>
              <RecipeHistory />
            </TabsContent>

            <TabsContent value="perfil" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Perfil</h2>
                <p className="text-muted-foreground">
                  Configuración y ajustes de tu cuenta
                </p>
              </div>
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Próximamente disponible</p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Mobile: Content without tabs (bottom nav handles navigation) */}
        {isMobile && (
          <div>
            {activeTab === "home" && (
              <HomeScreen onNavigate={handleNavigate} />
            )}

            {activeTab === "dashboard" && (
              <div className="space-y-4 pb-20">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
                  <p className="text-sm text-muted-foreground">
                    Vista general de tu actividad
                  </p>
                </div>
                <DashboardStats />
              </div>
            )}

            {activeTab === "nueva-receta" && (
              <div className="space-y-3 pb-20">
                <div className="text-center py-2">
                  <h2 className="text-lg font-semibold text-foreground">Nueva Receta</h2>
                </div>
                <RecipeCreator />
              </div>
            )}

            {activeTab === "pacientes" && (
              <div className="space-y-4 pb-20">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">Pacientes</h2>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu base de datos
                  </p>
                </div>
                <PatientList />
              </div>
            )}

            {activeTab === "historial" && (
              <div className="space-y-4 pb-20">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">Historial</h2>
                  <p className="text-sm text-muted-foreground">
                    Consulta las recetas enviadas
                  </p>
                </div>
                <RecipeHistory />
              </div>
            )}

            {activeTab === "perfil" && (
              <div className="space-y-4 pb-20">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">Perfil</h2>
                  <p className="text-sm text-muted-foreground">
                    Configuración y ajustes
                  </p>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Próximamente disponible</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
};

export default Index;
