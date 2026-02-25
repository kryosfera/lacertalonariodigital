import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, User, Settings, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeCreator } from "@/components/RecipeCreator";
import { PatientList } from "@/components/PatientList";
import { RecipeHistory } from "@/components/RecipeHistory";
import { DashboardStats } from "@/components/DashboardStats";
import { HomeScreen } from "@/components/HomeScreen";
import { HomeScreenBento, HomeScreenCentered, HomeScreenMinimal, HomeScreenGlass, HomeScreenBold, StylePicker, type HomeStyle } from "@/components/home";
import { SurgeryRecommendations } from "@/components/SurgeryRecommendations";
import { BottomNavigation } from "@/components/BottomNavigation";
import { DesktopNavigation } from "@/components/DesktopNavigation";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ProfilePage } from "@/components/ProfilePage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserMode } from "@/hooks/useUserMode";
import { useAuth } from "@/hooks/useAuth";
import { LegalFooter } from "@/components/LegalFooter";
import lacerLogo from "@/assets/lacer-logo.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [startWithCategories, setStartWithCategories] = useState(false);
  const [homeStyle, setHomeStyle] = useState<HomeStyle>(() => {
    return (localStorage.getItem('home-style') as HomeStyle) || 'bento';
  });
  const [showStylePicker, setShowStylePicker] = useState(false);
  const isMobile = useIsMobile();
  const { userMode, isLoading, showProfileSelector, setUserMode } = useUserMode();
  const { user } = useAuth();
  const isProfessional = userMode === 'professional';

  // Reset to home when switching to basic mode
  useEffect(() => {
    if (!isProfessional && activeTab !== "home" && activeTab !== "nueva-receta" && activeTab !== "recomendaciones") {
      setActiveTab("home");
    }
  }, [isProfessional, activeTab]);

  const handleNavigate = (tab: string) => {
    if (tab === "seleccionar-categoria") {
      setStartWithCategories(true);
      setActiveTab("nueva-receta");
    } else {
      setStartWithCategories(false);
      setActiveTab(tab);
    }
  };

  const handleChangeStyle = (style: HomeStyle) => {
    localStorage.setItem('home-style', style);
    setHomeStyle(style);
    setShowStylePicker(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (showProfileSelector) {
    return <ProfileSelector onSelectMode={setUserMode} />;
  }

  if (showStylePicker) {
    return <StylePicker onSelectStyle={handleChangeStyle} />;
  }

  const renderHomeScreen = () => {
    switch (homeStyle) {
      case 'minimal':
        return <HomeScreenMinimal onNavigate={handleNavigate} userMode={userMode} />;
      case 'glass':
        return <HomeScreenGlass onNavigate={handleNavigate} userMode={userMode} />;
      case 'bold':
        return <HomeScreenBold onNavigate={handleNavigate} userMode={userMode} />;
      case 'bento':
      default:
        return <HomeScreenBento onNavigate={handleNavigate} userMode={userMode} />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomeScreen();
      
      case "dashboard":
        if (!isProfessional) return null;
        return (
          <div className="space-y-4 pb-20 md:pb-0 px-4">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Vista general de tu actividad</p>
            </div>
            <DashboardStats />
          </div>
        );
      
      case "nueva-receta":
        return (
          <div className="space-y-3 pb-20 md:pb-0 px-4">
            <div className="text-center py-2 space-y-2">
              <div className="inline-flex items-center justify-center rounded-lg bg-background px-4 py-1.5">
                <img src={lacerLogo} alt="Lacer" className="h-8 md:h-10 object-contain" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-semibold text-foreground">Nueva Receta</h2>
                <p className="text-sm text-muted-foreground hidden md:block">Crea y envía recetas a tus pacientes de forma rápida</p>
              </div>
            </div>
            <RecipeCreator 
              startWithCategories={startWithCategories} 
              onCategoriesShown={() => setStartWithCategories(false)}
              onGoHome={() => setActiveTab("home")}
            />
          </div>
        );
      
      case "recomendaciones":
        return (
          <div className="pb-20 md:pb-0 px-4">
            <SurgeryRecommendations />
          </div>
        );
      
      case "pacientes":
        if (!isProfessional) return null;
        return (
          <div className="space-y-4 pb-20 md:pb-0 px-4">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">Pacientes</h2>
              <p className="text-sm text-muted-foreground">Gestiona tu base de datos</p>
            </div>
            <PatientList />
          </div>
        );
      
      case "historial":
        if (!isProfessional) return null;
        return (
          <div className="space-y-4 pb-20 md:pb-0 px-4">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">Historial</h2>
              <p className="text-sm text-muted-foreground">Consulta las recetas enviadas</p>
            </div>
            <RecipeHistory />
          </div>
        );
      
      case "perfil":
        if (!isProfessional) return null;
        return (
          <div className="space-y-4 pb-20 md:pb-0 px-4">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">Perfil</h2>
              <p className="text-sm text-muted-foreground">Configuración de tu cuenta</p>
            </div>
            <ProfilePage />
          </div>
        );
      
      default:
        return <HomeScreen onNavigate={handleNavigate} userMode={userMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-safe">
      {/* Header - Desktop/Tablet only */}
      {!isMobile && (
        <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={lacerLogo} alt="Lacer" className="h-9 object-contain" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-foreground leading-tight">Talonario Digital</h1>
                  <p className="text-xs text-muted-foreground">{isProfessional ? 'Modo Profesional' : 'Modo Rápido'}</p>
                </div>
              </div>

              <DesktopNavigation activeTab={activeTab} onTabChange={setActiveTab} userMode={userMode} />

              <div className="flex items-center gap-2">
                {activeTab === "home" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 hidden md:inline-flex"
                    onClick={() => setShowStylePicker(true)}
                    title="Cambiar estilo"
                  >
                    <Palette className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
                <ThemeToggle />
                <Link to="/admin" className="hidden lg:inline-flex">
                  <Button variant="ghost" size="icon" className="w-9 h-9">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth">
                    <Button variant="ghost" size="icon" className="w-9 h-9">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </Link>
                )}
                {user && (
                  <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setActiveTab("perfil")}>
                    <User className="w-5 h-5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto py-2 md:py-6">
        {renderContent()}
        {!isMobile && activeTab !== "home" && <LegalFooter className="mt-8 px-4" />}
      </main>

      {isMobile && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} userMode={userMode} />
      )}
    </div>
  );
};

export default Index;
