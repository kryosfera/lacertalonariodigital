import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, Mail, MessageSquare, Loader2, FileText,
  ChevronDown, ChevronRight, CheckCircle2, Clock, LayoutGrid, List, Download, Copy,
} from "lucide-react";
import { useRecipes, Recipe, PAGE_SIZE } from "@/hooks/useRecipes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { downloadPDF } from "@/lib/recipeUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RecipeDetailSheet } from "@/components/RecipeDetailSheet";

interface RecipeHistoryProps {
  onDuplicate?: (recipe: Recipe) => void;
}

type FilterType = "all" | "whatsapp" | "email" | "pdf" | "pending" | "dispensed";

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "pdf", label: "PDF" },
  { value: "pending", label: "Pendientes" },
  { value: "dispensed", label: "Retiradas" },
];

export const RecipeHistory = ({ onDuplicate }: RecipeHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [page, setPage] = useState(0);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, error, isFetching } = useRecipes(page);

  const currentPageRecipes = data?.recipes ?? [];
  const hasMore = data?.hasMore ?? false;

  const accumulatedIds = new Set(allRecipes.map((r) => r.id));
  const mergedRecipes = [
    ...allRecipes,
    ...currentPageRecipes.filter((r) => !accumulatedIds.has(r.id)),
  ];

  const handleLoadMore = () => {
    const currentIds = new Set(allRecipes.map((r) => r.id));
    const newOnes = currentPageRecipes.filter((r) => !currentIds.has(r.id));
    setAllRecipes((prev) => [...prev, ...newOnes]);
    setPage((p) => p + 1);
  };

  const displayRecipes = page === 0 ? currentPageRecipes : mergedRecipes;

  const channelIcon = (via: string | null) => {
    if (via === "both")
      return (
        <span className="flex gap-0.5 shrink-0">
          <Mail className="w-3.5 h-3.5 text-primary" />
          <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
        </span>
      );
    if (via === "email") return <Mail className="w-3.5 h-3.5 text-primary shrink-0" />;
    if (via === "whatsapp") return <MessageSquare className="w-3.5 h-3.5 text-[#25D366] shrink-0" />;
    return <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  };

  const handleDownloadPDF = async (recipe: Recipe) => {
    try {
      await downloadPDF({
        patientName: recipe.patient_name,
        date: format(new Date(recipe.created_at), "dd/MM/yyyy", { locale: es }),
        products: recipe.products.map((p) => ({
          id: p.id,
          name: p.name,
          reference: p.reference,
          quantity: p.quantity,
          thumbnail_url: p.thumbnail_url || null,
          category_id: null,
        })),
        notes: recipe.notes || "",
      });
      toast.success("PDF descargado");
    } catch {
      toast.error("Error al generar el PDF");
    }
  };

  const openDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setSheetOpen(true);
  };

  const filteredRecipes = displayRecipes.filter((recipe) => {
    const matchesSearch =
      recipe.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.id.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (activeFilter === "pending") matchesFilter = !recipe.dispensed_at;
    else if (activeFilter === "dispensed") matchesFilter = !!recipe.dispensed_at;
    else if (activeFilter !== "all") matchesFilter = recipe.sent_via === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const formatShortDate = (dateString: string) =>
    format(new Date(dateString), "dd MMM", { locale: es });
  const formatLongDate = (dateString: string) =>
    format(new Date(dateString), "dd MMM yyyy", { locale: es });

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Error al cargar el historial</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5 pb-24 md:pb-8 pt-safe">
      {/* Header */}
      <div className="px-3 md:px-5 pt-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none">
          Historial
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Recetas enviadas y dispensadas
        </p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar paciente o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-full bg-background"
          />
        </div>

        {/* Filters + view toggle */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none">
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={cn(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 active:scale-95",
                    isActive
                      ? "border-primary text-primary bg-background shadow-sm"
                      : "border-border text-muted-foreground bg-background hover:border-muted-foreground/40"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="shrink-0 flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={() => setViewMode("card")}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                viewMode === "card" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              )}
              aria-label="Vista tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                viewMode === "list" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              )}
              aria-label="Vista lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 md:px-5">
        {isLoading && page === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {searchTerm || activeFilter !== "all"
                ? "No se encontraron recetas"
                : "Aún no has enviado ninguna receta"}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <ul className="flex flex-col gap-2" role="list" aria-label="Listado de recetas">
            {filteredRecipes.map((recipe) => {
              const titleId = `recipe-title-${recipe.id}`;
              return (
                <li key={recipe.id}>
                  <button
                    onClick={() => openDetail(recipe)}
                    aria-labelledby={titleId}
                    className="w-full text-left bg-card rounded-2xl border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] transition-all duration-200 px-3 py-2.5 flex items-center gap-2.5"
                  >
                    {channelIcon(recipe.sent_via)}
                    <div className="flex-1 min-w-0">
                      <h3
                        id={titleId}
                        className="font-semibold text-sm text-foreground leading-tight break-words"
                      >
                        {recipe.patient_name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatShortDate(recipe.created_at)}
                      </p>
                    </div>
                    {recipe.dispensed_at ? (
                      <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 gap-0.5 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Retirada
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] px-1.5 py-0 bg-orange-500/10 text-orange-600 gap-0.5 shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        Pendiente
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          // CARD VIEW
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRecipes.map((recipe) => (
              <article
                key={recipe.id}
                className="bg-card rounded-2xl border border-border/40 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-3 flex flex-col"
              >
                <button
                  onClick={() => openDetail(recipe)}
                  className="text-left flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground break-words">
                        {recipe.patient_name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatLongDate(recipe.created_at)}
                      </p>
                    </div>
                    {channelIcon(recipe.sent_via)}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.dispensed_at ? (
                      <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Retirada
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] px-1.5 py-0 bg-orange-500/10 text-orange-600 gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        Pendiente
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {recipe.products.length} prod.
                    </Badge>
                  </div>
                </button>

                <div className="flex gap-1.5">
                  {onDuplicate && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 rounded-full text-xs"
                      onClick={() => onDuplicate(recipe)}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Duplicar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 rounded-full text-xs"
                    onClick={() => handleDownloadPDF(recipe)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    PDF
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        {hasMore && filteredRecipes.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isFetching}
              className="gap-2 rounded-full"
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {isFetching ? "Cargando..." : `Cargar más`}
            </Button>
          </div>
        )}

        {!hasMore && displayRecipes.length > PAGE_SIZE && (
          <p className="text-center text-xs text-muted-foreground py-3">
            Has visto todas las recetas
          </p>
        )}
      </div>

      <RecipeDetailSheet
        recipe={selectedRecipe}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDuplicate={onDuplicate}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
};
