import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, Shield, BarChart3, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCookieConsent } from "@/hooks/useCookieConsent";

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
  key: "necessary" | "analytics" | "marketing";
}

const cookieCategories: CookieCategory[] = [
  {
    id: "necessary",
    name: "Cookies necesarias",
    description: "Imprescindibles para el funcionamiento básico de la aplicación. Incluyen autenticación, preferencias de tema y modo de usuario.",
    icon: Shield,
    required: true,
    key: "necessary",
  },
  {
    id: "analytics",
    name: "Cookies analíticas",
    description: "Nos ayudan a entender cómo usas la aplicación para mejorar tu experiencia. Actualmente no utilizamos este tipo de cookies.",
    icon: BarChart3,
    required: false,
    key: "analytics",
  },
  {
    id: "marketing",
    name: "Cookies de marketing",
    description: "Permiten mostrarte contenido personalizado. Actualmente no utilizamos este tipo de cookies.",
    icon: Megaphone,
    required: false,
    key: "marketing",
  },
];

export const CookiePreferences = () => {
  const { showPreferences, closePreferences, savePreferences, consent, rejectAll } = useCookieConsent();
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (consent) {
      setPreferences({
        necessary: true,
        analytics: consent.analytics,
        marketing: consent.marketing,
      });
    }
  }, [consent]);

  const handleToggle = (key: "necessary" | "analytics" | "marketing") => {
    if (key === "necessary") return; // Can't toggle necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    savePreferences(preferences);
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  return (
    <AnimatePresence>
      {showPreferences && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={closePreferences}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] max-w-lg w-full max-h-[90vh] overflow-auto rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary/10 p-2">
                  <Cookie className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="font-semibold text-foreground">Preferencias de cookies</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePreferences}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Gestiona tus preferencias de cookies. Las cookies necesarias no se pueden desactivar 
                ya que son imprescindibles para el funcionamiento de la aplicación.
              </p>

              <div className="space-y-3">
                {cookieCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className="rounded-xl border border-border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {category.name}
                            </p>
                            {category.required && (
                              <span className="text-[10px] text-secondary font-medium uppercase">
                                Siempre activas
                              </span>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={preferences[category.key]}
                          onCheckedChange={() => handleToggle(category.key)}
                          disabled={category.required}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="flex-1"
              >
                Rechazar opcionales
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 btn-gradient-red"
              >
                Guardar preferencias
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
