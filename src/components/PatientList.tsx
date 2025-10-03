import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, Mail, FileText } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalRecipes: number;
}

export const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const patients: Patient[] = [
    {
      id: "1",
      name: "María García López",
      phone: "+34 612 345 678",
      email: "maria.garcia@email.com",
      lastVisit: "15/03/2024",
      totalRecipes: 12,
    },
    {
      id: "2",
      name: "Juan Martínez Ruiz",
      phone: "+34 623 456 789",
      email: "juan.martinez@email.com",
      lastVisit: "12/03/2024",
      totalRecipes: 8,
    },
    {
      id: "3",
      name: "Ana Fernández Torres",
      phone: "+34 634 567 890",
      email: "ana.fernandez@email.com",
      lastVisit: "10/03/2024",
      totalRecipes: 15,
    },
    {
      id: "4",
      name: "Carlos Rodríguez Sánchez",
      phone: "+34 645 678 901",
      email: "carlos.rodriguez@email.com",
      lastVisit: "08/03/2024",
      totalRecipes: 6,
    },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pacientes</CardTitle>
              <CardDescription>Gestiona tu base de datos de pacientes</CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="transition-smooth hover:shadow-medical">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Última visita: {patient.lastVisit}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{patient.totalRecipes} recetas</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{patient.email}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver recetas
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron pacientes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
