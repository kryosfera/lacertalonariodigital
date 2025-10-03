import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Printer, Download, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export const RecipeCreator = () => {
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSend = (method: string) => {
    toast.success(`Receta enviada por ${method}`);
  };

  return (
    <Card className="shadow-medical">
      <CardHeader>
        <CardTitle>Crear Nueva Receta</CardTitle>
        <CardDescription>Completa los datos del paciente y los medicamentos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente</Label>
            <Select>
              <SelectTrigger id="patient">
                <SelectValue placeholder="Selecciona o busca paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p1">María García López</SelectItem>
                <SelectItem value="p2">Juan Martínez Ruiz</SelectItem>
                <SelectItem value="p3">Ana Fernández Torres</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {/* Medications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">Medicamentos</Label>
            <Button onClick={addMedication} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Añadir medicamento
            </Button>
          </div>

          {medications.map((med, index) => (
            <Card key={index} className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`med-name-${index}`}>Nombre del medicamento</Label>
                    <Input
                      id={`med-name-${index}`}
                      placeholder="Ej: Ibuprofeno 600mg"
                      value={med.name}
                      onChange={(e) => updateMedication(index, "name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`med-dosage-${index}`}>Dosis</Label>
                    <Input
                      id={`med-dosage-${index}`}
                      placeholder="Ej: 1 comprimido"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`med-frequency-${index}`}>Frecuencia</Label>
                    <Select
                      value={med.frequency}
                      onValueChange={(value) => updateMedication(index, "frequency", value)}
                    >
                      <SelectTrigger id={`med-frequency-${index}`}>
                        <SelectValue placeholder="Selecciona frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8h">Cada 8 horas</SelectItem>
                        <SelectItem value="12h">Cada 12 horas</SelectItem>
                        <SelectItem value="24h">Cada 24 horas</SelectItem>
                        <SelectItem value="breakfast">Desayuno</SelectItem>
                        <SelectItem value="lunch">Comida</SelectItem>
                        <SelectItem value="dinner">Cena</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`med-duration-${index}`}>Duración</Label>
                    <Input
                      id={`med-duration-${index}`}
                      placeholder="Ej: 7 días"
                      value={med.duration}
                      onChange={(e) => updateMedication(index, "duration", e.target.value)}
                    />
                  </div>

                  {medications.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeMedication(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas adicionales</Label>
          <Textarea
            id="notes"
            placeholder="Indicaciones especiales, recomendaciones, etc."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleSend("WhatsApp")} className="flex-1 sm:flex-none">
            <Send className="w-4 h-4 mr-2" />
            Enviar por WhatsApp
          </Button>
          <Button onClick={() => handleSend("Email")} variant="secondary" className="flex-1 sm:flex-none">
            <Send className="w-4 h-4 mr-2" />
            Enviar por Email
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
