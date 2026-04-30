import { Link } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalFooter";

const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 pt-safe">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-secondary" />
            <h1 className="font-semibold text-foreground">Aviso Legal</h1>
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
            <h2 className="text-lg font-semibold text-foreground">1. Datos identificativos</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la 
              Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa:
            </p>
            <div className="rounded-xl border border-border p-4 space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Denominación social:</strong> Kryosfera Solutions SL</p>
              <p><strong className="text-foreground">CIF:</strong> B67219345</p>
              <p><strong className="text-foreground">Domicilio social:</strong> C/ Nicaragua 106, 08029 Barcelona</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Objeto</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Talonario Digital es una aplicación web destinada a profesionales de la salud bucodental 
              para la gestión electrónica de recetas y recomendaciones de productos de higiene oral 
              a sus pacientes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Condiciones de uso</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El acceso y uso de esta aplicación implica la aceptación de las presentes condiciones. 
              El usuario se compromete a:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Hacer un uso adecuado y lícito de la aplicación</li>
              <li>No utilizar la aplicación para fines ilícitos o contrarios al orden público</li>
              <li>No introducir virus ni programas maliciosos</li>
              <li>Proporcionar información veraz en caso de registro</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Propiedad intelectual</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Todos los contenidos de la aplicación (textos, imágenes, marcas, logotipos, código fuente, 
              diseño gráfico) son propiedad de Kryosfera Solutions SL o de terceros que han autorizado 
              su uso, y están protegidos por las leyes de propiedad intelectual e industrial.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Queda prohibida la reproducción, distribución, comunicación pública o transformación de 
              estos contenidos sin autorización expresa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Exclusión de responsabilidad</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kryosfera Solutions SL no se hace responsable de:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Errores u omisiones en los contenidos</li>
              <li>Daños derivados del uso de la aplicación</li>
              <li>Interrupciones del servicio por causas técnicas o de fuerza mayor</li>
              <li>Uso inadecuado de la aplicación por parte del usuario</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Uso profesional</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Las funciones profesionales de esta aplicación están destinadas exclusivamente a 
              profesionales sanitarios debidamente cualificados. El uso de estas funciones implica 
              la declaración de poseer la habilitación profesional correspondiente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Legislación aplicable</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Las presentes condiciones se rigen por la legislación española. Para cualquier 
              controversia que pudiera derivarse del acceso o uso de esta aplicación, las partes 
              se someten a los Juzgados y Tribunales de Barcelona.
            </p>
          </section>

        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default LegalNotice;
