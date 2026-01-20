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
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <img 
            src={lacerLogo} 
            alt="Lacer" 
            className="h-12 mx-auto"
          />
          <h1 className="text-2xl font-bold text-foreground">
            Bienvenido al Talonario Digital
          </h1>
          <p className="text-muted-foreground">
            ¿Cómo quieres usar la aplicación?
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Basic Mode */}
          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group"
            onClick={handleSelectBasic}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <Zap className="w-8 h-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Modo Rápido</CardTitle>
              <CardDescription>Sin registro necesario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Crea recetas al instante
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Envía por WhatsApp o Email
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Descarga en PDF
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Recomendaciones post-cirugía
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-4">
                Empezar sin registro
              </Button>
            </CardContent>
          </Card>

          {/* Professional Mode */}
          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group border-primary/50"
            onClick={handleSelectProfessional}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Modo Profesional</CardTitle>
              <CardDescription>Todas las funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Todo lo del modo rápido
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Historial de recetas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Gestión de pacientes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Estadísticas y dashboard
                </li>
              </ul>
              <Button className="w-full mt-4">
                Crear cuenta gratis
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          Puedes cambiar de modo en cualquier momento
        </p>
      </div>
    </div>
  );
};
