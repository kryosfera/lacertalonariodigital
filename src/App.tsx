import { useState } from "react";
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
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Recipe from "./pages/Recipe";
import ShortRecipe from "./pages/ShortRecipe";
import CookiePolicy from "./pages/CookiePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

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
                <Toaster />
                <Sonner />
                <CookieBanner />
                <CookiePreferences />
                <BrowserRouter>
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
