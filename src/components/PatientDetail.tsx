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
    <div className="screen-wrapper">
      {/* Header */}
      <div className="screen-header">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="absolute left-3 md:left-5 rounded-full h-8 px-3 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Volver
          </Button>
        </div>
        <h1 className="screen-title break-words">{patient.name}</h1>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
          {patient.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{patient.phone}</span>
          )}
          {patient.email && (
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{patient.email}</span>
          )}
        </div>
        {patient.notes && (
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">{patient.notes}</p>
        )}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => onNewRecipe(patient)}
            className="rounded-full h-9 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nueva receta
          </Button>
        </div>
      </div>

      {/* Recipes section */}
      <div className="screen-body">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
          Recetas ({recipes.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="card-soft py-10 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Aún no hay recetas para este paciente</p>
            <Button onClick={() => onNewRecipe(patient)} variant="outline" className="mt-4 rounded-full h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Crear primera receta
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recipes.map((recipe) => (
              <li key={recipe.id} className="card-soft card-soft-hover p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getStatusBadge(recipe.sent_via)}
                      {getDispenseBadge(recipe)}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(recipe.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {recipe.products.slice(0, 3).map((product, index) => (
                        <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0">
                          {product.quantity > 1 && `${product.quantity}x `}{product.name}
                        </Badge>
                      ))}
                      {recipe.products.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{recipe.products.length - 3} más</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="rounded-full h-8 text-xs" onClick={() => onDuplicate(recipe)}>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Duplicar
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full h-8 text-xs" onClick={() => handleDownloadPDF(recipe)}>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      PDF
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
