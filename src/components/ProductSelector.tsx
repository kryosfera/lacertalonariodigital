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
        className={`fixed inset-0 z-50 bg-background flex flex-col ${
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
        <div className={`flex-1 p-1.5 ${needsScroll ? 'overflow-auto' : 'overflow-hidden'}`}>
          {filteredProducts.length > 0 ? (
            <div 
              className={`grid gap-1.5 ${needsScroll ? '' : 'h-full'}`}
              style={needsScroll ? {
                gridTemplateColumns: 'repeat(3, 1fr)'
              } : { 
                gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`
              }}
            >
              {filteredProducts.map((product, index) => {
                const isSelected = selectedProducts.has(product.id);
                
                return (
                  <button
                    key={product.id}
                    onClick={() => onToggleProduct(product.id)}
                    className={`relative flex items-center justify-center bg-white rounded-lg border-2 transition-all duration-200 overflow-hidden card-scale-in ${
                      isSelected 
                        ? 'border-secondary ring-2 ring-secondary/30 shadow-md' 
                        : 'border-transparent hover:border-secondary/30'
                    } ${needsScroll ? 'aspect-square' : ''}`}
                    style={{ animationDelay: `${index * 15}ms` }}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 z-10 w-5 h-5 bg-secondary rounded-full flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Product image - maximized */}
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Package className="w-8 h-8 text-muted-foreground/50" />
                        <span className="text-[10px] font-medium text-foreground text-center leading-tight px-1 line-clamp-2">
                          {product.name}
                        </span>
                      </div>
                    )}
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
        <Button
          size="lg"
          onClick={onClose}
          className={`shadow-xl px-6 gap-2 ${selectedProducts.size > 0 ? 'bg-primary hover:bg-primary/90' : 'bg-white text-foreground hover:bg-white/90'}`}
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