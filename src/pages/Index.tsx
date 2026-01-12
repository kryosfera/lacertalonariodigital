import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, BarChart3, Clock, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCreator } from "@/components/RecipeCreator";
import { PatientList } from "@/components/PatientList";
import { RecipeHistory } from "@/components/RecipeHistory";
import { DashboardStats } from "@/components/DashboardStats";
import { HomeScreen } from "@/components/HomeScreen";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const isMobile = useIsMobile();

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg gradient-medical flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground">Talonario Digital</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Versión 2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin" className="hidden md:inline-flex">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Acceder</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Desktop: Tabs navigation */}
        {!isMobile && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-5 h-auto p-1">
              <TabsTrigger value="home" className="flex flex-col gap-1 py-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Inicio</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="nueva-receta" className="flex flex-col gap-1 py-2">
                <Plus className="w-4 h-4" />
                <span className="text-xs">Nueva</span>
              </TabsTrigger>
              <TabsTrigger value="pacientes" className="flex flex-col gap-1 py-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Pacientes</span>
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex flex-col gap-1 py-2">
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
          <div className="space-y-4">
            {activeTab === "home" && (
              <HomeScreen onNavigate={handleNavigate} />
            )}

            {activeTab === "dashboard" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                  <p className="text-sm text-muted-foreground">
                    Vista general de tu actividad
                  </p>
                </div>
                <DashboardStats />
              </>
            )}

            {activeTab === "nueva-receta" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Nueva Receta</h2>
                  <p className="text-sm text-muted-foreground">
                    Crea y envía recetas rápidamente
                  </p>
                </div>
                <RecipeCreator />
              </>
            )}

            {activeTab === "pacientes" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Pacientes</h2>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu base de datos
                  </p>
                </div>
                <PatientList />
              </>
            )}

            {activeTab === "historial" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Historial</h2>
                  <p className="text-sm text-muted-foreground">
                    Consulta las recetas enviadas
                  </p>
                </div>
                <RecipeHistory />
              </>
            )}

            {activeTab === "perfil" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Perfil</h2>
                  <p className="text-sm text-muted-foreground">
                    Configuración y ajustes
                  </p>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Próximamente disponible</p>
                </div>
              </>
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
