import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, Eye, Mail, MessageSquare, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Recipe {
  id: string;
  patientName: string;
  date: string;
  medications: string[];
  sentVia: "email" | "whatsapp" | "both";
  status: "sent" | "viewed" | "pending";
}

export const RecipeHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const recipes: Recipe[] = [
    {
      id: "R-2024-001",
      patientName: "María García López",
      date: "15/03/2024",
      medications: ["Ibuprofeno 600mg", "Omeprazol 20mg"],
      sentVia: "both",
      status: "viewed",
    },
    {
      id: "R-2024-002",
      patientName: "Juan Martínez Ruiz",
      date: "12/03/2024",
      medications: ["Paracetamol 1g"],
      sentVia: "whatsapp",
      status: "sent",
    },
    {
      id: "R-2024-003",
      patientName: "Ana Fernández Torres",
      date: "10/03/2024",
      medications: ["Amoxicilina 500mg", "Ibuprofeno 400mg"],
      sentVia: "email",
      status: "viewed",
    },
    {
      id: "R-2024-004",
      patientName: "Carlos Rodríguez Sánchez",
      date: "08/03/2024",
      medications: ["Loratadina 10mg"],
      sentVia: "whatsapp",
      status: "sent",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: { label: "Enviada", className: "bg-accent/10 text-accent" },
      viewed: { label: "Vista", className: "bg-success/10 text-success" },
      pending: { label: "Pendiente", className: "bg-muted text-muted-foreground" },
    };
    const variant = variants[status as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getSentViaIcon = (via: string) => {
    if (via === "both") {
      return (
        <div className="flex gap-1">
          <Mail className="w-4 h-4 text-primary" />
          <MessageSquare className="w-4 h-4 text-success" />
        </div>
      );
    }
    return via === "email" ? (
      <Mail className="w-4 h-4 text-primary" />
    ) : (
      <MessageSquare className="w-4 h-4 text-success" />
    );
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || recipe.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Historial de Recetas</CardTitle>
          <CardDescription>Consulta y gestiona todas las recetas enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por paciente o número de receta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sent">Enviadas</SelectItem>
                <SelectItem value="viewed">Vistas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="transition-smooth hover:shadow-medical">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{recipe.patientName}</h3>
                        {getStatusBadge(recipe.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">Receta: {recipe.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{recipe.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSentViaIcon(recipe.sentVia)}
                      <span className="text-muted-foreground">
                        {recipe.sentVia === "both"
                          ? "Email y WhatsApp"
                          : recipe.sentVia === "email"
                          ? "Email"
                          : "WhatsApp"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recipe.medications.map((med, index) => (
                      <Badge key={index} variant="outline">
                        {med}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron recetas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
