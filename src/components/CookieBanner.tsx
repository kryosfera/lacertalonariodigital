import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export const CookieBanner = () => {
  const { showBanner, acceptAll, rejectAll, openPreferences } = useCookieConsent();

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 lg:p-8"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-border/50 bg-card/95 backdrop-blur-lg shadow-2xl p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Icon and Text */}
              <div className="flex items-start gap-3 flex-1">
                <div className="rounded-xl bg-secondary/10 p-2.5 shrink-0">
                  <Cookie className="w-5 h-5 text-secondary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    Usamos cookies
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Utilizamos cookies técnicas necesarias para el funcionamiento de la aplicación. 
                    Puedes consultar nuestra{" "}
                    <a href="/politica-cookies" className="text-secondary hover:underline">
                      política de cookies
                    </a>{" "}
                    para más información.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openPreferences}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4 mr-1.5" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAll}
                  className="border-border hover:bg-muted"
                >
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="btn-gradient-red"
                >
                  Aceptar todas
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
