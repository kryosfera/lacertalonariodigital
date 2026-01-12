import { useQuery } from "@tanstack/react-query";
import { X, FolderOpen, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface CategorySelectorProps {
  onSelectCategory: (categoryId: string, categoryName: string) => void;
  onClose: () => void;
  productCountByCategory: Map<string, number>;
}

export const CategorySelector = ({
  onSelectCategory,
  onClose,
  productCountByCategory,
}: CategorySelectorProps) => {
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

  return (
    <div className="fixed inset-0 z-50 bg-secondary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-secondary border-b border-white/10 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://www.lacer.es/themes/custom/flavor/logo.svg"
              alt="Lacer"
              className="h-8 brightness-0 invert"
            />
            <div>
              <h2 className="text-lg font-bold text-white">Selecciona Categoría</h2>
              <p className="text-xs text-white/70">
                {categoriesWithProducts.length + (uncategorizedCount > 0 ? 1 : 0)} categorías disponibles
              </p>
            </div>
          </div>
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

      {/* Categories Grid */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {categoriesWithProducts.map((category) => {
                const count = productCountByCategory.get(category.id) || 0;

                return (
                  <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id, category.name)}
                    className="group bg-white rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  >
                    {category.image_url ? (
                      <div className="aspect-square w-full">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-contain bg-white p-2"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="p-2 bg-white border-t">
                      <h3 className="text-[10px] sm:text-xs font-semibold text-gray-800 line-clamp-2 text-center leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 text-center mt-0.5">
                        {count} productos
                      </p>
                    </div>
                  </button>
                );
              })}

              {/* Uncategorized */}
              {uncategorizedCount > 0 && (
                <button
                  onClick={() => onSelectCategory("uncategorized", "Otros productos")}
                  className="group bg-white rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="p-2 bg-white border-t">
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-800 line-clamp-2 text-center leading-tight">
                      Otros productos
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 text-center mt-0.5">
                      {uncategorizedCount} productos
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
