import { Zap, Building2, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import lacerLogo from "@/assets/lacer-logo-color.png";

interface ProfileSelectorProps {
  onSelectMode: (mode: 'basic' | 'professional') => void;
}

export const ProfileSelector = ({ onSelectMode }: ProfileSelectorProps) => {
  const navigate = useNavigate();

  const handleSelectBasic = () => {
    onSelectMode('basic');
  };

  const handleSelectProfessional = () => {
    onSelectMode('professional');
    navigate('/auth');
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8 min-h-full flex flex-col justify-center">
        {/* Logo and Header */}
        <div className="text-center space-y-2 md:space-y-4 flex-shrink-0">
          <img 
            src={lacerLogo} 
            alt="Lacer" 
            className="h-10 md:h-12 mx-auto"
          />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Bienvenido al Talonario Digital
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            ¿Cómo quieres usar la aplicación?
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid gap-3 md:gap-4 md:grid-cols-2 flex-shrink-0">
          {/* Basic Mode */}
          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group"
            onClick={handleSelectBasic}
          >
            <CardHeader className="text-center pb-2 pt-4 md:pt-6">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
              </div>
              <CardTitle className="text-lg md:text-xl">Modo Rápido</CardTitle>
              <CardDescription className="text-xs md:text-sm">Sin registro necesario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3 pt-0 pb-4 md:pb-6">
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                  <span>Crea recetas al instante</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                  <span>Envía por WhatsApp o Email</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                  <span>Descarga en PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                  <span>Recomendaciones post-cirugía</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-3 md:mt-4 text-sm">
                Empezar sin registro
              </Button>
            </CardContent>
          </Card>

          {/* Professional Mode */}
          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group border-primary/50"
            onClick={handleSelectProfessional}
          >
            <CardHeader className="text-center pb-2 pt-4 md:pt-6">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Building2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-xl">Modo Profesional</CardTitle>
              <CardDescription className="text-xs md:text-sm">Todas las funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3 pt-0 pb-4 md:pb-6">
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                  <span>Todo lo del modo rápido</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                  <span>Historial de recetas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                  <span>Gestión de pacientes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                  <span>Estadísticas y dashboard</span>
                </li>
              </ul>
              <Button className="w-full mt-3 md:mt-4 text-sm">
                Crear cuenta gratis
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] md:text-xs text-muted-foreground flex-shrink-0 pb-4">
          Puedes cambiar de modo en cualquier momento
        </p>
      </div>
    </div>
  );
};
