import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserModeProvider } from "@/hooks/useUserMode";
import { ThemeProvider } from "@/hooks/useTheme";
import { CookieConsentProvider } from "@/hooks/useCookieConsent";
import { SplashScreen } from "@/components/SplashScreen";
import { CookieBanner } from "@/components/CookieBanner";
import { CookiePreferences } from "@/components/CookiePreferences";
import { StylePicker, type HomeStyle } from "@/components/home";

// Lazy-loaded route pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Recipe = lazy(() => import("./pages/Recipe"));
const ShortRecipe = lazy(() => import("./pages/ShortRecipe"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showStylePicker, setShowStylePicker] = useState(() => {
    return !localStorage.getItem('home-style');
  });

  const handleStyleSelect = (style: HomeStyle) => {
    localStorage.setItem('home-style', style);
    setShowStylePicker(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserModeProvider>
          <ThemeProvider>
            <CookieConsentProvider>
              <TooltipProvider>
                {showSplash && (
                  <SplashScreen onFinish={() => setShowSplash(false)} />
                )}
                {!showSplash && showStylePicker && (
                  <StylePicker onSelectStyle={handleStyleSelect} />
                )}
                <Toaster />
                <Sonner />
                <CookieBanner />
                <CookiePreferences />
                <BrowserRouter>
                  <Suspense fallback={<div className="min-h-screen bg-background" />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/receta" element={<Recipe />} />
                      <Route path="/r/:code" element={<ShortRecipe />} />
                      <Route path="/politica-cookies" element={<CookiePolicy />} />
                      <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
                      <Route path="/aviso-legal" element={<LegalNotice />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </CookieConsentProvider>
          </ThemeProvider>
        </UserModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
