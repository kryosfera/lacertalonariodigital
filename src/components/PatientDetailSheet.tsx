import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Patient } from "@/hooks/usePatients";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Phone, Mail, Calendar, FileText, Edit, Trash2, StickyNote } from "lucide-react";

interface PatientDetailSheetProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewRecipes: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export const PatientDetailSheet = ({
  patient, open, onOpenChange, onViewRecipes, onEdit, onDelete,
}: PatientDetailSheetProps) => {
  if (!patient) return null;
  const initial = patient.name.trim().charAt(0).toUpperCase() || "?";
  const lastVisit = patient.last_recipe_date
    ? format(new Date(patient.last_recipe_date), "dd MMM yyyy", { locale: es })
    : "Sin visitas";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[88vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary text-lg font-bold flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-xl break-words">{patient.name}</SheetTitle>
              <SheetDescription className="text-xs">
                Paciente
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-wrap gap-1.5 mt-4">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {patient.recipe_count || 0} recetas
          </Badge>
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-1">
            <Calendar className="w-3 h-3" />
            {lastVisit}
          </Badge>
        </div>

        <div className="mt-5 space-y-2">
          {patient.phone && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/40">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <a href={`tel:${patient.phone}`} className="text-sm text-foreground break-all">
                {patient.phone}
              </a>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/40">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <a href={`mailto:${patient.email}`} className="text-sm text-foreground break-all">
                {patient.email}
              </a>
            </div>
          )}
          {!patient.phone && !patient.email && (
            <p className="text-xs text-muted-foreground italic">Sin datos de contacto</p>
          )}
        </div>

        {patient.notes && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" />
              Notas
            </h4>
            <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/40 rounded-xl p-3 border border-border/40">
              {patient.notes}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-6 sticky bottom-0 bg-background pt-2">
          <Button
            className="w-full rounded-full"
            onClick={() => { onViewRecipes(patient); onOpenChange(false); }}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Ver recetas
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => { onEdit(patient); onOpenChange(false); }}
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => { onDelete(patient); onOpenChange(false); }}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Eliminar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
