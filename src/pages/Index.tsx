import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, BarChart3, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCreator } from "@/components/RecipeCreator";
import { PatientList } from "@/components/PatientList";
import { RecipeHistory } from "@/components/RecipeHistory";
import { DashboardStats } from "@/components/DashboardStats";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-medical flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Talonario Digital</h1>
                <p className="text-xs text-muted-foreground">Versión 2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Acceder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="nueva-receta" className="flex flex-col gap-1 py-2">
              <Plus className="w-4 h-4" />
              <span className="text-xs">Nueva</span>
            </TabsTrigger>
            <TabsTrigger value="pacientes" className="flex flex-col gap-1 py-2">
              <Users className="w-4 h-4" />
              <span className="text-xs">Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="historial" className="flex flex-col gap-1 py-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Historial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
              <p className="text-muted-foreground">
                Vista general de tu actividad y estadísticas
              </p>
            </div>
            <DashboardStats />
          </TabsContent>

          <TabsContent value="nueva-receta" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Nueva Receta</h2>
              <p className="text-muted-foreground">
                Crea y envía recetas a tus pacientes de forma rápida
              </p>
            </div>
            <RecipeCreator />
          </TabsContent>

          <TabsContent value="pacientes" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Pacientes</h2>
              <p className="text-muted-foreground">
                Gestiona tu base de datos de pacientes
              </p>
            </div>
            <PatientList />
          </TabsContent>

          <TabsContent value="historial" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Historial</h2>
              <p className="text-muted-foreground">
                Consulta todas las recetas enviadas
              </p>
            </div>
            <RecipeHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
