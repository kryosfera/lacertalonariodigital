import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Phone, Mail, Calendar, Download, Copy, FileText, Loader2, CheckCircle2, Clock } from "lucide-react";
import { Patient } from "@/hooks/usePatients";
import { Recipe } from "@/hooks/useRecipes";
import { usePatientRecipes } from "@/hooks/usePatientRecipes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { downloadPDF } from "@/lib/recipeUtils";
import { toast } from "sonner";

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onNewRecipe: (patient: Patient) => void;
  onDuplicate: (recipe: Recipe) => void;
}

export const PatientDetail = ({ patient, onBack, onNewRecipe, onDuplicate }: PatientDetailProps) => {
  const { data: recipes = [], isLoading } = usePatientRecipes(patient.id);

  const handleDownloadPDF = async (recipe: Recipe) => {
    try {
      await downloadPDF({
        patientName: recipe.patient_name,
        date: format(new Date(recipe.created_at), "dd/MM/yyyy", { locale: es }),
        products: recipe.products.map(p => ({
          id: p.id, name: p.name, reference: p.reference,
          quantity: p.quantity, thumbnail_url: p.thumbnail_url || null, category_id: null
        })),
        notes: recipe.notes || ""
      });
      toast.success("PDF descargado");
    } catch {
      toast.error("Error al generar el PDF");
    }
  };

  const getStatusBadge = (sentVia: string | null) => {
    const variants: Record<string, { label: string; className: string }> = {
      whatsapp: { label: "WhatsApp", className: "bg-[#25D366]/10 text-[#25D366]" },
      email: { label: "Email", className: "bg-primary/10 text-primary" },
      both: { label: "Ambos", className: "bg-accent/10 text-accent" },
      pdf: { label: "PDF", className: "bg-muted text-muted-foreground" },
      print: { label: "Impresa", className: "bg-muted text-muted-foreground" },
    };
    const variant = variants[sentVia || 'pdf'] || variants.pdf;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getDispenseBadge = (recipe: Recipe) => {
    if ((recipe as any).dispensed_at) {
      return (
        <Badge className="bg-green-500/10 text-green-600 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Retirada
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-500/10 text-orange-600 gap-1">
        <Clock className="w-3 h-3" />
        Pendiente
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="mt-0.5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-xl">{patient.name}</CardTitle>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                {patient.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{patient.phone}</span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{patient.email}</span>
                )}
              </div>
              {patient.notes && (
                <p className="text-sm text-muted-foreground mt-2">{patient.notes}</p>
              )}
            </div>
            <Button onClick={() => onNewRecipe(patient)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva receta
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Recipe list */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground px-1">
          Recetas ({recipes.length})
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aún no hay recetas para este paciente</p>
            <Button onClick={() => onNewRecipe(patient)} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Crear primera receta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="transition-smooth hover:shadow-medical">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(recipe.sent_via)}
                      {getDispenseBadge(recipe)}
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(recipe.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recipe.products.slice(0, 3).map((product, index) => (
                        <Badge key={index} variant="outline">
                          {product.quantity > 1 && `${product.quantity}x `}{product.name}
                        </Badge>
                      ))}
                      {recipe.products.length > 3 && (
                        <Badge variant="outline">+{recipe.products.length - 3} más</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onDuplicate(recipe)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(recipe)}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
