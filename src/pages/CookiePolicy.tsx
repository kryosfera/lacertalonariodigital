import { Link } from "react-router-dom";
import { ArrowLeft, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalFooter";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-secondary" />
            <h1 className="font-semibold text-foreground">Política de Cookies</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground text-sm">
            Última actualización: Enero 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. ¿Qué son las cookies?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo 
              cuando los visitas. Se utilizan ampliamente para hacer que los sitios web funcionen de 
              manera más eficiente, así como para proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Cookies que utilizamos</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              En Talonario Digital utilizamos exclusivamente cookies técnicas necesarias para el 
              funcionamiento de la aplicación:
            </p>
            
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground">Cookie</th>
                    <th className="text-left p-3 font-medium text-foreground">Tipo</th>
                    <th className="text-left p-3 font-medium text-foreground">Propósito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 text-muted-foreground font-mono text-xs">lacer_user_mode</td>
                    <td className="p-3 text-muted-foreground">Técnica</td>
                    <td className="p-3 text-muted-foreground">Guarda tu preferencia de modo (básico/profesional)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground font-mono text-xs">lacer_theme</td>
                    <td className="p-3 text-muted-foreground">Técnica</td>
                    <td className="p-3 text-muted-foreground">Guarda tu preferencia de tema (claro/oscuro)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground font-mono text-xs">sb-*</td>
                    <td className="p-3 text-muted-foreground">Técnica</td>
                    <td className="p-3 text-muted-foreground">Gestión de sesión de autenticación</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground font-mono text-xs">lacer_cookie_consent</td>
                    <td className="p-3 text-muted-foreground">Técnica</td>
                    <td className="p-3 text-muted-foreground">Guarda tus preferencias de cookies</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Base legal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Las cookies técnicas que utilizamos están exentas de consentimiento previo según el 
              artículo 22.2 de la LSSI-CE, ya que son estrictamente necesarias para la prestación 
              del servicio solicitado expresamente por el usuario.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Gestión de cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Puedes gestionar tus preferencias de cookies en cualquier momento a través del enlace 
              "Cookies" en el pie de página de la aplicación. También puedes configurar tu navegador 
              para bloquear o eliminar cookies, aunque esto podría afectar al funcionamiento de 
              algunas funciones.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Actualizaciones</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Esta política puede actualizarse para reflejar cambios en las cookies que utilizamos. 
              Te recomendamos revisarla periódicamente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Contacto</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Si tienes preguntas sobre nuestra política de cookies, puedes contactarnos a través 
              de los canales indicados en el Aviso Legal.
            </p>
          </section>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default CookiePolicy;
