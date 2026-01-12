import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Printer, Download, X, ShoppingCart, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CategorySelector } from "./CategorySelector";
import { ProductSelector } from "./ProductSelector";

interface Product {
  id: string;
  name: string;
  reference: string;
  thumbnail_url: string | null;
  category_id: string | null;
}

export const RecipeCreator = () => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [isClosingCategory, setIsClosingCategory] = useState(false);
  const [isClosingProduct, setIsClosingProduct] = useState(false);

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, reference, thumbnail_url, category_id")
        .eq("is_active", true)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });

  // Count products per category
  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const catId = product.category_id || "uncategorized";
      counts.set(catId, (counts.get(catId) || 0) + 1);
    });
    return counts;
  }, [products]);

  // Get selected products data
  const selectedProductsData = useMemo(() => {
    return products.filter((p) => selectedProducts.has(p.id));
  }, [products, selectedProducts]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const handleSend = (method: string) => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    toast.success(`Receta enviada por ${method}`);
  };

  const handleOpenCategorySelector = useCallback(() => {
    setShowCategorySelector(true);
    setSelectedCategory(null);
    setIsClosingCategory(false);
    setIsClosingProduct(false);
  }, []);

  const handleSelectCategory = useCallback((categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
  }, []);

  const handleBackToCategories = useCallback(() => {
    setIsClosingProduct(true);
    setTimeout(() => {
      setSelectedCategory(null);
      setSearchTerm("");
      setIsClosingProduct(false);
    }, 250);
  }, []);

  const handleCloseSelector = useCallback(() => {
    if (selectedCategory) {
      setIsClosingProduct(true);
    } else {
      setIsClosingCategory(true);
    }
    setTimeout(() => {
      setShowCategorySelector(false);
      setSelectedCategory(null);
      setSearchTerm("");
      setIsClosingCategory(false);
      setIsClosingProduct(false);
    }, 250);
  }, [selectedCategory]);

  return (
    <>
      {/* Category Selector Full Screen */}
      {showCategorySelector && !selectedCategory && !isClosingProduct && (
        <CategorySelector
          onSelectCategory={handleSelectCategory}
          onClose={handleCloseSelector}
          productCountByCategory={productCountByCategory}
          isClosing={isClosingCategory}
        />
      )}

      {/* Product Selector Full Screen */}
      {showCategorySelector && selectedCategory && (
        <ProductSelector
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          products={products}
          selectedProducts={selectedProducts}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleProduct={toggleProduct}
          onBack={handleBackToCategories}
          onClose={handleCloseSelector}
          isClosing={isClosingProduct}
        />
      )}

      {/* Recipe Summary */}
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-medical">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Receta Digital</CardTitle>
              </div>
              <Badge variant="secondary" className="font-bold">
                {selectedProducts.size} productos
              </Badge>
            </div>
            <CardDescription>Crea y envía recetas a tus pacientes</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Paciente</Label>
                <Input
                  id="patient-name"
                  placeholder="Nombre del paciente"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Add Products Button */}
            <Button
              variant="outline"
              className="w-full h-14 border-dashed border-2"
              onClick={handleOpenCategorySelector}
            >
              <Plus className="w-5 h-5 mr-2" />
              Añadir Productos
            </Button>

            {/* Selected Products List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Productos seleccionados</Label>
                {selectedProducts.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Limpiar todo
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[200px] rounded-md border p-2">
                {selectedProductsData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                    <Package className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Pulsa "Añadir Productos" para seleccionar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedProductsData.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
                      >
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            C.N. {product.reference?.replace(".", "")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Indicaciones especiales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                onClick={() => handleSend("WhatsApp")}
                className="w-full"
                disabled={selectedProducts.size === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleSend("Email")}
                variant="secondary"
                className="w-full"
                disabled={selectedProducts.size === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={selectedProducts.size === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={selectedProducts.size === 0}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
