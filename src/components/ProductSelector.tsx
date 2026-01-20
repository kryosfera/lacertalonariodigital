import { useMemo } from "react";
import { ChevronLeft, Search, Package, X, Check, Home, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./ProductCard";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onGoHome?: () => void;
  isClosing?: boolean;
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
  onGoHome,
  isClosing = false,
}: ProductSelectorProps) => {
  const isMobile = useIsMobile();

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

  // Mobile: Lista minimalista
  if (isMobile) {
    return (
      <div 
        className={`fixed inset-0 z-50 bg-background ${
          isClosing ? 'screen-slide-out' : 'screen-slide-in'
        }`}
      >
        {/* Header minimalista */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center gap-2 px-2 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-foreground truncate">
                {categoryName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {filteredProducts.length} productos
              </p>
            </div>
            {selectedProducts.size > 0 && (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {selectedProducts.size}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Búsqueda */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-10 bg-muted border-0"
              />
            </div>
          </div>
        </div>

        {/* Lista de productos - with bottom padding for action bar */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="py-1">
            {filteredProducts.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredProducts.map((product, index) => {
                  const isSelected = selectedProducts.has(product.id);
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => onToggleProduct(product.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors card-scale-in ${
                        isSelected 
                          ? 'bg-secondary/10' 
                          : 'hover:bg-muted/50 active:bg-muted'
                      }`}
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          C.N. {product.reference}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-secondary border-secondary' 
                          : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Package className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No se encontraron productos</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t border-border/50 safe-area-pb">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Otra categoría
            </Button>
            {onGoHome && (
              <Button
                variant={selectedProducts.size > 0 ? "default" : "outline"}
                onClick={onGoHome}
                className={`flex-1 gap-2 ${selectedProducts.size > 0 ? 'bg-secondary hover:bg-secondary/90' : ''}`}
              >
                <Home className="w-4 h-4" />
                {selectedProducts.size > 0 ? `Listo (${selectedProducts.size})` : 'Terminar'}
              </Button>
            )}
            {!onGoHome && selectedProducts.size > 0 && (
              <Button
                onClick={onClose}
                className="flex-1 bg-secondary hover:bg-secondary/90"
              >
                Listo ({selectedProducts.size})
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Grid de tarjetas
  return (
    <div 
      className={`fixed inset-0 z-50 bg-secondary ${
        isClosing ? 'screen-fade-out' : 'screen-slide-in'
      }`}
    >
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
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="card-scale-in"
                  style={{ animationDelay: `${index * 15}ms` }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    reference={product.reference}
                    thumbnailUrl={product.thumbnail_url}
                    isSelected={selectedProducts.has(product.id)}
                    onToggle={onToggleProduct}
                  />
                </div>
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

      {/* Bottom action bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          className="shadow-xl px-6 bg-white hover:bg-white/90 gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          Otra categoría
        </Button>
        {onGoHome && (
          <Button
            size="lg"
            onClick={onGoHome}
            className={`shadow-xl px-6 gap-2 ${selectedProducts.size > 0 ? 'bg-primary hover:bg-primary/90' : 'bg-white text-foreground hover:bg-white/90'}`}
          >
            <Home className="w-4 h-4" />
            {selectedProducts.size > 0 ? `Listo (${selectedProducts.size})` : 'Terminar'}
          </Button>
        )}
        {!onGoHome && selectedProducts.size > 0 && (
          <Button
            size="lg"
            onClick={onClose}
            className="shadow-xl px-8"
          >
            Listo ({selectedProducts.size} productos)
          </Button>
        )}
      </div>
    </div>
  );
};