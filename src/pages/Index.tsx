import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeCreator } from "@/components/RecipeCreator";
import { PatientList } from "@/components/PatientList";
import { PatientDetail } from "@/components/PatientDetail";
import { RecipeHistory } from "@/components/RecipeHistory";
import { DashboardStats } from "@/components/DashboardStats";
import { HomeScreen } from "@/components/HomeScreen";
import { HomeScreenBento } from "@/components/home";
import { SurgeryRecommendations } from "@/components/SurgeryRecommendations";
import { BottomNavigation } from "@/components/BottomNavigation";
import { DesktopNavigation } from "@/components/DesktopNavigation";

import { ProfilePage } from "@/components/ProfilePage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserMode } from "@/hooks/useUserMode";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import { useHomeStats } from "@/hooks/useHomeStats";
import { OnboardingTour } from "@/components/OnboardingTour";
import { LegalFooter } from "@/components/LegalFooter";
import { Recipe } from "@/hooks/useRecipes";
import { Patient } from "@/hooks/usePatients";
import lacerLogo from "@/assets/lacer-logo-clean.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [startWithCategories, setStartWithCategories] = useState(false);
  const [duplicateRecipe, setDuplicateRecipe] = useState<{ products: Array<{ id: string; quantity: number }>; notes?: string | null; patient_name?: string; patient_id?: string | null } | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const isMobile = useIsMobile();
  const { userMode, isLoading } = useUserMode();
  const { user, isAdmin } = useAuth();
  const { data: profileData } = useProfile();
  const { data: homeStats, isLoading: homeStatsLoading, isError: homeStatsError, refetch: refetchHomeStats } = useHomeStats();
  const isProfessional = userMode === 'professional';
  const tour = useOnboardingTour(userMode);
  const navigate = useNavigate();

  // Admins land directly on the admin dashboard (any device)
  useEffect(() => {
    if (isAdmin) {
      if (sessionStorage.getItem('admin_skip_mobile_redirect') === '1') {
        sessionStorage.removeItem('admin_skip_mobile_redirect');
        return;
      }
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isProfessional && activeTab !== "home" && activeTab !== "nueva-receta" && activeTab !== "recomendaciones") {
      setActiveTab("home");
    }
  }, [isProfessional, activeTab]);

  // Always refresh Home stats when returning to the Home tab
  useEffect(() => {
    if (activeTab === "home" && user) {
      refetchHomeStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id]);

  // When the tour ends (finish or skip), return the user to Home
  const handleTourNext = () => {
    const wasLast = tour.currentStep === tour.totalSteps - 1;
    tour.nextStep();
    if (wasLast) setActiveTab("home");
  };
  const handleTourSkip = () => {
    tour.skipTour();
    setActiveTab("home");
  };

  const handleNavigate = (tab: string) => {
    if (tab === "seleccionar-categoria") {
      setStartWithCategories(true);
      setActiveTab("nueva-receta");
    } else {
      setStartWithCategories(false);
      setActiveTab(tab);
    }
  };

  const handleDuplicateRecipe = (recipe: Recipe) => {
    setDuplicateRecipe({
      products: recipe.products.map(p => ({ id: p.id, quantity: p.quantity })),
      notes: recipe.notes,
      patient_name: recipe.patient_name,
      patient_id: recipe.patient_id,
    });
    setActiveTab("nueva-receta");
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab("paciente-detalle");
  };

  const handleNewRecipeForPatient = (patient: Patient) => {
    setDuplicateRecipe({
      products: [],
      patient_name: patient.name,
      patient_id: patient.id,
    });
    setActiveTab("nueva-receta");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }


  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreenBento
            onNavigate={handleNavigate}
            userMode={userMode}
            profile={profileData}
            stats={homeStats}
            statsLoading={homeStatsLoading}
            statsError={homeStatsError}
            onRetryStats={() => refetchHomeStats()}
          />
        );
      
      case "dashboard":
        if (!isProfessional) return null;
        return (
          <div className="screen-wrapper">
            <div className="screen-header">
              <h1 className="screen-title">Dashboard</h1>
              <p className="screen-subtitle">Vista general de tu actividad</p>
            </div>
            <div className="screen-body">
              <DashboardStats />
            </div>
          </div>
        );
      
      case "nueva-receta":
        return (
          <div className="screen-wrapper">
            <div className="screen-header">
              <h1 className="screen-title">Nueva receta</h1>
              <p className="screen-subtitle">Crea y envía recetas a tus pacientes</p>
            </div>
            <div className="screen-body">
              <RecipeCreator 
                startWithCategories={startWithCategories} 
                onCategoriesShown={() => setStartWithCategories(false)}
                onGoHome={() => setActiveTab("home")}
                initialRecipe={duplicateRecipe}
                onInitialRecipeLoaded={() => setDuplicateRecipe(null)}
              />
            </div>
          </div>
        );
      
      case "recomendaciones":
        return <SurgeryRecommendations />;
      
      case "pacientes":
        if (!isProfessional) return null;
        return <PatientList onViewPatient={handleViewPatient} />;
      
      case "paciente-detalle":
        if (!isProfessional || !selectedPatient) return null;
        return (
          <PatientDetail
            patient={selectedPatient}
            onBack={() => setActiveTab("pacientes")}
            onNewRecipe={handleNewRecipeForPatient}
            onDuplicate={handleDuplicateRecipe}
          />
        );
      
      case "historial":
        if (!isProfessional) return null;
        return <RecipeHistory onDuplicate={handleDuplicateRecipe} />;
      
      case "perfil":
        if (!isProfessional) return null;
        return <ProfilePage />;
      
      default:
        return <HomeScreen onNavigate={handleNavigate} userMode={userMode} />;
    }
  };

  return (
    <div className="min-h-screen pt-safe bg-background">
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

      <OnboardingTour
        isActive={tour.isActive}
        step={tour.step}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        onNext={handleTourNext}
        onPrev={tour.prevStep}
        onSkip={handleTourSkip}
      />
    </div>
  );
};

export default Index;
