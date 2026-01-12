import { useMemo } from "react";
import { ChevronLeft, Search, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  reference: string;
  thumbnail_url: string | null;
  category_id: string | null;
}

interface ProductSelectorProps {
  categoryId: string;
  categoryName: string;
  products: Product[];
  selectedProducts: Set<string>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleProduct: (productId: string) => void;
  onBack: () => void;
  onClose: () => void;
}

export const ProductSelector = ({
  categoryId,
  categoryName,
  products,
  selectedProducts,
  searchTerm,
  onSearchChange,
  onToggleProduct,
  onBack,
  onClose,
}: ProductSelectorProps) => {
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      if (categoryId === "uncategorized") {
        return !p.category_id;
      }
      return p.category_id === categoryId;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.reference?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [products, categoryId, searchTerm]);

  return (
    <div className="fixed inset-0 z-50 bg-secondary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-secondary border-b border-white/10 px-4 py-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-lg font-bold text-white">{categoryName}</h2>
                <p className="text-xs text-white/70">
                  {filteredProducts.length} productos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto o C.N..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 bg-white/90 border-0"
                />
              </div>

              {selectedProducts.size > 0 && (
                <Badge className="bg-white text-secondary font-bold">
                  {selectedProducts.size} seleccionados
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
      </div>

      {/* Products Grid */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-6">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  reference={product.reference}
                  thumbnailUrl={product.thumbnail_url}
                  isSelected={selectedProducts.has(product.id)}
                  onToggle={onToggleProduct}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-white/70">
              <Package className="w-12 h-12 mb-2 opacity-50" />
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Done Button */}
      {selectedProducts.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <Button
            size="lg"
            onClick={onClose}
            className="shadow-xl px-8"
          >
            Listo ({selectedProducts.size} productos)
          </Button>
        </div>
      )}
    </div>
  );
};
