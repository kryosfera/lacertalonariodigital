import { Package, X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  reference: string;
  thumbnail_url: string | null;
}

interface ProductWithQuantity extends Product {
  quantity: number;
}

interface SelectedProductsBadgeProps {
  products: ProductWithQuantity[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClear: () => void;
}

export const SelectedProductsBadge = ({
  products,
  onRemove,
  onUpdateQuantity,
  onClear,
}: SelectedProductsBadgeProps) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
        <Package className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">Sin productos seleccionados</p>
        <p className="text-xs text-muted-foreground mt-1">
          Pulsa "Añadir Productos" para comenzar
        </p>
      </div>
    );
  }

  const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);

  return (
    <div className="space-y-3">
      {/* Header con contador total */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="bg-secondary/10 text-secondary font-bold px-3 py-1"
          >
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </Badge>
          {totalItems > products.length && (
            <Badge variant="outline" className="text-xs">
              {totalItems} unidades
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          Limpiar todo
        </Button>
      </div>

      {/* Lista de productos */}
      <ScrollArea className="h-[180px] md:h-[220px]">
        <div className="space-y-2 pr-2">
          {products.map((product) => (
            <div
              key={product.id}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-lg border transition-all",
                "bg-card hover:bg-muted/30 group",
                product.quantity > 1 && "border-secondary/30 bg-secondary/5"
              )}
            >
              {/* Imagen del producto */}
              <div className="relative w-14 h-14 rounded-lg bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground/50" />
                )}
                
                {/* Badge de cantidad */}
                {product.quantity > 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {product.quantity}
                  </div>
                )}
              </div>

              {/* Info del producto */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  C.N. {product.reference?.replace(".", "")}
                </p>
                
                {/* Controles de cantidad */}
                <div className="flex items-center gap-1 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {product.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Botón eliminar */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive absolute top-2 right-2"
                onClick={() => onRemove(product.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
