import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, Mail, MessageSquare, Calendar, Loader2, FileText, ChevronDown, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecipes, Recipe, PAGE_SIZE } from "@/hooks/useRecipes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { downloadPDF } from "@/lib/recipeUtils";
import { toast } from "sonner";

interface RecipeHistoryProps {
  onDuplicate?: (recipe: Recipe) => void;
}

export const RecipeHistory = ({ onDuplicate }: RecipeHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentVia, setFilterSentVia] = useState("all");
  const [page, setPage] = useState(0);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  const { data, isLoading, error, isFetching } = useRecipes(page);

  // Accumulate recipes across pages
  const currentPageRecipes = data?.recipes ?? [];
  const hasMore = data?.hasMore ?? false;

  // Merge new page into accumulated list (avoid duplicates by id)
  const accumulatedIds = new Set(allRecipes.map(r => r.id));
  const mergedRecipes = [
    ...allRecipes,
    ...currentPageRecipes.filter(r => !accumulatedIds.has(r.id))
  ];

  const handleLoadMore = () => {
    // Update accumulated list before changing page
    const currentIds = new Set(allRecipes.map(r => r.id));
    const newOnes = currentPageRecipes.filter(r => !currentIds.has(r.id));
    setAllRecipes(prev => [...prev, ...newOnes]);
    setPage(p => p + 1);
  };

  // Use merged list for display
  const displayRecipes = page === 0 ? currentPageRecipes : mergedRecipes;

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

  const getSentViaIcon = (via: string | null) => {
    if (via === "both") {
      return (
        <div className="flex gap-1">
          <Mail className="w-4 h-4 text-primary" />
          <MessageSquare className="w-4 h-4 text-[#25D366]" />
        </div>
      );
    }
    if (via === "email") return <Mail className="w-4 h-4 text-primary" />;
    if (via === "whatsapp") return <MessageSquare className="w-4 h-4 text-[#25D366]" />;
    return <FileText className="w-4 h-4 text-muted-foreground" />;
  };

  const handleDownloadPDF = async (recipe: Recipe) => {
    try {
      await downloadPDF({
        patientName: recipe.patient_name,
        date: format(new Date(recipe.created_at), "dd/MM/yyyy", { locale: es }),
        products: recipe.products.map(p => ({
          id: p.id,
          name: p.name,
          reference: p.reference,
          quantity: p.quantity,
          thumbnail_url: p.thumbnail_url || null,
          category_id: null
        })),
        notes: recipe.notes || ""
      });
      toast.success("PDF descargado");
    } catch {
      toast.error("Error al generar el PDF");
    }
  };

  const filteredRecipes = displayRecipes.filter((recipe) => {
    const matchesSearch =
      recipe.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSentVia === "all" || recipe.sent_via === filterSentVia;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es });
  };

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
                placeholder="Buscar por paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSentVia} onValueChange={setFilterSentVia}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por envío" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="print">Impresa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && page === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {searchTerm || filterSentVia !== "all"
                ? "No se encontraron recetas"
                : "Aún no has enviado ninguna receta"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="transition-smooth hover:shadow-medical">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{recipe.patient_name}</h3>
                          {getStatusBadge(recipe.sent_via)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {recipe.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(recipe.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentViaIcon(recipe.sent_via)}
                      </div>
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
                    {onDuplicate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDuplicate(recipe)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(recipe)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isFetching}
                className="gap-2"
              >
                {isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {isFetching ? "Cargando..." : `Cargar más (${PAGE_SIZE} por página)`}
              </Button>
            </div>
          )}

          {!hasMore && displayRecipes.length > PAGE_SIZE && (
            <p className="text-center text-sm text-muted-foreground py-2">
              Has visto todas las recetas
            </p>
          )}
        </div>
      )}
    </div>
  );
};
