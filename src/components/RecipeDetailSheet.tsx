import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/hooks/useRecipes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar, Mail, MessageSquare, FileText, Copy, Download,
  CheckCircle2, Clock, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeDetailSheetProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate?: (recipe: Recipe) => void;
  onDownloadPDF: (recipe: Recipe) => void;
}

const channelLabel = (via: string | null) => {
  switch (via) {
    case "whatsapp": return { label: "WhatsApp", icon: <MessageSquare className="w-3.5 h-3.5" />, className: "bg-[#25D366]/10 text-[#25D366]" };
    case "email": return { label: "Email", icon: <Mail className="w-3.5 h-3.5" />, className: "bg-primary/10 text-primary" };
    case "both": return { label: "Email + WhatsApp", icon: <Mail className="w-3.5 h-3.5" />, className: "bg-accent/10 text-accent" };
    default: return { label: "PDF", icon: <FileText className="w-3.5 h-3.5" />, className: "bg-muted text-muted-foreground" };
  }
};

export const RecipeDetailSheet = ({
  recipe, open, onOpenChange, onDuplicate, onDownloadPDF,
}: RecipeDetailSheetProps) => {
  if (!recipe) return null;
  const channel = channelLabel(recipe.sent_via);
  const longDate = format(new Date(recipe.created_at), "dd MMM yyyy, HH:mm", { locale: es });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[88vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl break-words">{recipe.patient_name}</SheetTitle>
          <SheetDescription className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-3 h-3" />
            {longDate}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge className={cn("text-[10px] px-2 py-0.5 gap-1", channel.className)}>
            {channel.icon}{channel.label}
          </Badge>
          {recipe.dispensed_at ? (
            <Badge className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-600 gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Retirada
            </Badge>
          ) : (
            <Badge className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-600 gap-1">
              <Clock className="w-3 h-3" />
              Pendiente
            </Badge>
          )}
        </div>

        <div className="mt-5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            Productos ({recipe.products.length})
          </h4>
          <ul className="flex flex-col gap-1.5">
            {recipe.products.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/40"
              >
                <span className="text-sm text-foreground break-words flex-1">{p.name}</span>
                {p.quantity > 1 && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    x{p.quantity}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>

        {recipe.notes && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Notas
            </h4>
            <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/40 rounded-xl p-3 border border-border/40">
              {recipe.notes}
            </p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground mt-4 font-mono break-all">
          ID: {recipe.id}
        </p>

        <div className="flex gap-2 mt-5 sticky bottom-0 bg-background pt-2">
          {onDuplicate && (
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => { onDuplicate(recipe); onOpenChange(false); }}
            >
              <Copy className="w-4 h-4 mr-1.5" />
              Duplicar
            </Button>
          )}
          <Button
            className="flex-1 rounded-full"
            onClick={() => onDownloadPDF(recipe)}
          >
            <Download className="w-4 h-4 mr-1.5" />
            PDF
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
