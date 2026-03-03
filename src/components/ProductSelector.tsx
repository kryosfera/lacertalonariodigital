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

  // Calculate grid config based on product count - fit to screen
  const getGridConfig = (count: number) => {
    if (count <= 4) return { cols: 2, rows: 2 };
    if (count <= 6) return { cols: 2, rows: 3 };
    if (count <= 9) return { cols: 3, rows: 3 };
    if (count <= 12) return { cols: 3, rows: 4 };
    return { cols: 3, rows: Math.ceil(count / 3) };
  };

  const gridConfig = getGridConfig(filteredProducts.length);
  const needsScroll = filteredProducts.length > 12;

  // Mobile: Grid visual con imágenes maximizadas
  if (isMobile) {
    return (
      <div 
        className={`fixed inset-0 z-50 bg-background flex flex-col pt-safe ${
          isClosing ? 'screen-slide-out' : 'screen-slide-in'
        }`}
      >
        {/* Compact header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-foreground w-8 h-8"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">
                {categoryName}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedProducts.size > 0 && (
              <Badge className="bg-secondary text-secondary-foreground font-bold">
                {selectedProducts.size}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground w-8 h-8"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Search - compact */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 bg-muted border-0 text-sm"
            />
          </div>
        </div>

        {/* Products grid - fills remaining space */}
        <div className="flex-1 overflow-auto p-2">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto w-full">
              {filteredProducts.map((product, index) => {
                const isSelected = selectedProducts.has(product.id);
                
                return (
                  <button
                    key={product.id}
                    onClick={() => onToggleProduct(product.id)}
                    className={`relative flex flex-col bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden card-scale-in aspect-square ${
                      isSelected 
                        ? 'border-secondary ring-2 ring-secondary/30 shadow-md' 
                        : 'border-transparent hover:border-secondary/30'
                    }`}
                    style={{ animationDelay: `${index * 15}ms` }}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 z-10 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    
                    {/* Product image - maximized */}
                    <div className="flex-1 flex items-center justify-center w-full min-h-0 p-3">
                      {product.thumbnail_url ? (
                        <img
                          src={product.thumbnail_url}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Product name */}
                    <div className="px-2 pb-2 pt-1 border-t border-border/20">
                      <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2 block">
                        {product.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Package className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="p-3 border-t border-border/30 bg-background safe-area-pb">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Otra categoría
            </Button>
            <Button
              onClick={onClose}
              className={`flex-1 gap-2 ${selectedProducts.size > 0 ? 'bg-secondary hover:bg-secondary/90' : ''}`}
              variant={selectedProducts.size > 0 ? "default" : "outline"}
            >
              {selectedProducts.size > 0 ? (
                <>
                  <Check className="w-4 h-4" />
                  Continuar ({selectedProducts.size})
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Cerrar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Grid visual con imágenes maximizadas
  return (
    <div 
      className={`fixed inset-0 z-50 bg-secondary pt-safe ${
        isClosing ? 'screen-fade-out' : 'screen-slide-in'
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-secondary border-b border-white/10 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <div className="relative w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-white/90 border-0"
              />
            </div>

            {selectedProducts.size > 0 && (
              <Badge className="bg-white text-secondary font-bold px-3 py-1">
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

      {/* Products Grid - Maximized images */}
      <ScrollArea className="h-[calc(100vh-130px)]">
        <div className="container mx-auto px-6 py-6">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredProducts.map((product, index) => {
                const isSelected = selectedProducts.has(product.id);
                
                return (
                  <button
                    key={product.id}
                    onClick={() => onToggleProduct(product.id)}
                    className={`group relative flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-2xl card-scale-in aspect-[3/4] ${
                      isSelected 
                        ? 'ring-4 ring-white shadow-xl scale-105' 
                        : ''
                    }`}
                    style={{ animationDelay: `${index * 15}ms` }}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Product image - top ~70% */}
                    <div className="flex-1 flex items-center justify-center w-full min-h-0 p-2">
                      {product.thumbnail_url ? (
                        <img
                          src={product.thumbnail_url}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Product name - bottom ~30% */}
                    <div className="px-2 pb-2 pt-1 border-t border-border/20">
                      <span className="text-xs font-medium text-foreground text-center leading-tight line-clamp-2 block">
                        {product.name}
                      </span>
                    </div>
                  </button>
                );
              })}
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
        <Button
          size="lg"
          onClick={onClose}
          className={`shadow-xl px-6 gap-2 ${selectedProducts.size > 0 ? 'bg-white text-secondary hover:bg-white/90 font-bold' : 'bg-white/20 text-white hover:bg-white/30'}`}
        >
          {selectedProducts.size > 0 ? (
            <>
              <Check className="w-4 h-4" />
              Continuar ({selectedProducts.size})
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              Cerrar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};