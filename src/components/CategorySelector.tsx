import { useState } from "react";
import lacerLogoBocasSanas from "@/assets/lacer-logo-bocas_sanas.jpg";
import { useQuery } from "@tanstack/react-query";
import { X, FolderOpen, Package, ShoppingCart, FileText, ArrowLeft } from "lucide-react";
import lacerIcon from "@/assets/lacer-logo-clean.png";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface Template {
  id: string;
  name: string;
  notes: string | null;
  products: unknown;
}

interface CategorySelectorProps {
  onSelectCategory: (categoryId: string, categoryName: string) => void;
  onClose: () => void;
  onGoHome?: () => void;
  productCountByCategory: Map<string, number>;
  selectedProductsCount?: number;
  isClosing?: boolean;
  templates?: Template[];
  onLoadTemplate?: (template: Template) => void;
}

export const CategorySelector = ({
  onSelectCategory,
  onClose,
  onGoHome,
  productCountByCategory,
  selectedProductsCount = 0,
  isClosing = false,
  templates = [],
  onLoadTemplate,
}: CategorySelectorProps) => {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const isMobile = useIsMobile();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });

  const categoriesWithProducts = categories.filter(
    (cat) => (productCountByCategory.get(cat.id) || 0) > 0
  );

  const uncategorizedCount = productCountByCategory.get("uncategorized") || 0;

  const totalItems = categoriesWithProducts.length + (uncategorizedCount > 0 ? 1 : 0);

  const handleLoadTemplate = (template: Template) => {
    onLoadTemplate?.(template);
    setShowTemplateDialog(false);
    onClose();
  };

  // Template Dialog Component
  const TemplateDialogContent = () => (
    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
      <DialogContent className="sm:max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Cargar Plantilla</DialogTitle>
          <DialogDescription>
            Selecciona una plantilla para cargar sus productos
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-2 p-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleLoadTemplate(template)}
                className="w-full p-3 text-left rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-secondary" />
                  <span className="font-medium text-sm">{template.name}</span>
                </div>
                {template.notes && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {template.notes}
                  </p>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  // Mobile: Fullscreen grid with large images - NO SCROLL
  if (isMobile) {
    return (
      <>
        <TemplateDialogContent />
        <div 
          className={`fixed inset-0 z-50 bg-background flex flex-col pt-safe ${
            isClosing ? 'screen-slide-out' : 'screen-slide-in'
          }`}
        >
          {/* Apple-style minimal header */}
          <div className="px-5 pt-3 pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-foreground w-10 h-10 -ml-2"
                aria-label="Volver"
              >
                <ArrowLeft className="w-6 h-6" strokeWidth={2} />
              </Button>

              <img
                src={lacerIcon}
                alt="Lacer"
                className="h-10 w-auto object-contain"
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-foreground w-10 h-10 -mr-2"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" strokeWidth={2} />
              </Button>
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <h2 className="text-2xl font-medium text-foreground tracking-tight">
                Selecciona categoría
              </h2>
              {selectedProductsCount > 0 && (
                <Badge className="bg-secondary text-secondary-foreground font-bold">
                  {selectedProductsCount}
                </Badge>
              )}
            </div>

            {templates.length > 0 && (
              <div className="mt-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateDialog(true)}
                  className="text-muted-foreground h-7 gap-1 text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Plantillas
                </Button>
              </div>
            )}
          </div>

          {/* Categories grid */}
          <div className="flex-1 px-5 pt-3 pb-[100px] overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categoriesWithProducts.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id, category.name)}
                    className="relative flex items-center justify-center bg-white rounded-2xl border border-border/40 hover:border-secondary/50 hover:shadow-md active:scale-[0.97] transition-all duration-200 overflow-hidden card-scale-in aspect-[1/1]"
                    style={{ animationDelay: `${index * 15}ms` }}
                  >
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-base font-bold text-foreground text-center leading-tight px-3">
                        {category.name}
                      </span>
                    )}
                  </button>
                ))}

                {/* Sin categoría */}
                {uncategorizedCount > 0 && (
                  <button
                    onClick={() => onSelectCategory("uncategorized", "Otros productos")}
                    className="flex items-center justify-center bg-muted/20 rounded-2xl border border-border/40 hover:border-secondary/50 hover:shadow-md active:scale-[0.97] transition-all duration-200 aspect-[1/1]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-10 h-10 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Otros
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Floating action bar - sits above bottom navigation (72px) */}
          {selectedProductsCount > 0 && (
            <div className="fixed left-0 right-0 bottom-[72px] px-4 pb-2 pt-2 bg-background/95 backdrop-blur-md border-t border-border/30">
              <Button
                onClick={onClose}
                className="w-full btn-gradient-red gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Continuar con la receta ({selectedProductsCount})
              </Button>
            </div>
          )}
        </div>
      </>
    );
  }

  // Desktop: Grid de tarjetas
  return (
    <>
      <TemplateDialogContent />
      <div 
        className={`fixed inset-0 z-50 bg-secondary pt-safe ${
          isClosing ? 'screen-fade-out' : 'screen-fade-in'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-secondary border-b border-white/10 px-4 py-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={lacerLogoBocasSanas}
                alt="Lacer Talonario Digital"
                className="h-12 object-contain"
              />
              <div>
                <h2 className="text-lg font-bold text-white">Selecciona Categoría</h2>
                <p className="text-xs text-white/70">
                  {categoriesWithProducts.length + (uncategorizedCount > 0 ? 1 : 0)} categorías disponibles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {templates.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateDialog(true)}
                  className="text-white hover:bg-white/10 gap-1"
                >
                  <FileText className="w-4 h-4" />
                  Plantillas
                </Button>
              )}
              {selectedProductsCount > 0 && (
                <Badge className="bg-white text-secondary font-bold px-3 py-1">
                  {selectedProductsCount} seleccionados
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Grid - Maximized logos */}
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="container mx-auto px-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {categoriesWithProducts.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id, category.name)}
                    className="group bg-white rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-2xl card-scale-in aspect-square"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/50 flex items-center justify-center p-4">
                        <span className="text-base font-bold text-foreground text-center leading-tight">
                          {category.name}
                        </span>
                      </div>
                    )}
                  </button>
                ))}

                {/* Uncategorized */}
                {uncategorizedCount > 0 && (
                  <button
                    onClick={() => onSelectCategory("uncategorized", "Otros productos")}
                    className="group bg-white/80 rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-2xl aspect-square flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-12 h-12 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Otros ({uncategorizedCount})
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};