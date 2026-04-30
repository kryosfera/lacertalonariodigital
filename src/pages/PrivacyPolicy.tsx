import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalFooter";

const PrivacyPolicy = () => {
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
            <Shield className="w-5 h-5 text-secondary" />
            <h1 className="font-semibold text-foreground">Política de Privacidad</h1>
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
            <h2 className="text-lg font-semibold text-foreground">1. Responsable del tratamiento</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El responsable del tratamiento de tus datos personales es Kryosfera Solutions SL, 
              con CIF B67219345 y domicilio en C/ Nicaragua 106, 08029 Barcelona (España). 
              Para cualquier consulta relacionada con la protección de datos, puedes contactarnos 
              a través de los canales indicados en el Aviso Legal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Datos que recopilamos</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dependiendo del uso que hagas de Talonario Digital, podemos recopilar:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Datos de cuenta: email, nombre profesional, datos de clínica (usuarios registrados)</li>
              <li>Datos de pacientes: nombre, teléfono, email, notas clínicas (introducidos por profesionales)</li>
              <li>Datos de uso: recetas creadas, productos seleccionados, historial de actividad</li>
              <li>Datos técnicos: preferencias de tema e interfaz</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Finalidad del tratamiento</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tratamos tus datos para:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Prestarte el servicio de gestión de recetas digitales</li>
              <li>Gestionar tu cuenta de usuario</li>
              <li>Mejorar la aplicación y la experiencia de usuario</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Base legal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La base legal para el tratamiento de tus datos es:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Ejecución del contrato de servicio</li>
              <li>Consentimiento expreso (cuando sea requerido)</li>
              <li>Interés legítimo en mejorar nuestros servicios</li>
              <li>Cumplimiento de obligaciones legales</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Conservación de datos</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conservaremos tus datos mientras mantengas tu cuenta activa o mientras sean necesarios 
              para cumplir con las finalidades descritas. Posteriormente, los datos serán bloqueados 
              durante los plazos legales de prescripción.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Tus derechos</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tienes derecho a:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la supresión de tus datos</li>
              <li>Oponerte al tratamiento</li>
              <li>Solicitar la limitación del tratamiento</li>
              <li>Portabilidad de datos</li>
              <li>Presentar reclamación ante la AEPD</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Seguridad</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso 
              no autorizado, pérdida o alteración. Los datos se transmiten de forma cifrada y se 
              almacenan en servidores seguros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Transferencias internacionales</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tus datos pueden ser procesados por proveedores de servicios ubicados fuera del 
              Espacio Económico Europeo. En estos casos, garantizamos que existan las salvaguardas 
              adecuadas conforme al RGPD.
            </p>
          </section>

        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default PrivacyPolicy;
