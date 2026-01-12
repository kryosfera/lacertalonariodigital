import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Printer, Download, Search, X, ShoppingCart, Package, ChevronLeft, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  reference: string;
  thumbnail_url: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export const RecipeCreator = () => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery({
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

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
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

  // Get products for selected category, filtered by search
  const categoryProducts = useMemo(() => {
    if (!selectedCategoryId) return [];
    
    let filtered = products.filter((p) => {
      if (selectedCategoryId === "uncategorized") {
        return !p.category_id;
      }
      return p.category_id === selectedCategoryId;
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
  }, [products, selectedCategoryId, searchTerm]);

  // Get selected products data
  const selectedProductsData = useMemo(() => {
    return products.filter((p) => selectedProducts.has(p.id));
  }, [products, selectedProducts]);

  // Get selected category name
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return "";
    if (selectedCategoryId === "uncategorized") return "Otros productos";
    return categories.find((c) => c.id === selectedCategoryId)?.name || "";
  }, [selectedCategoryId, categories]);

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

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSearchTerm("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Catalog - Talonario Style */}
      <div className="lg:col-span-2">
        <div className="bg-secondary rounded-xl p-4 md:p-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {selectedCategoryId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToCategories}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <img 
                src="https://www.lacer.es/themes/custom/flavor/logo.svg" 
                alt="Lacer" 
                className="h-8 brightness-0 invert"
              />
              <div>
                <h2 className="text-lg font-bold text-white">Talonario Digital</h2>
                <p className="text-xs text-white/70">
                  {selectedCategoryId 
                    ? selectedCategoryName 
                    : "Selecciona una categoría"}
                </p>
              </div>
            </div>
            
            {/* Search - only show when category is selected */}
            {selectedCategoryId && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto o C.N..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/90 border-0"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : !selectedCategoryId ? (
              /* Categories Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((category) => {
                  const count = productCountByCategory.get(category.id) || 0;
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className="group relative bg-white/10 hover:bg-white/20 rounded-lg p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        {category.image_url ? (
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <img 
                              src={category.image_url} 
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <FolderOpen className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <h3 className="text-sm font-semibold text-white line-clamp-2">
                          {category.name}
                        </h3>
                        <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                          {count} productos
                        </Badge>
                      </div>
                    </button>
                  );
                })}
                
                {/* Uncategorized */}
                {(productCountByCategory.get("uncategorized") || 0) > 0 && (
                  <button
                    onClick={() => setSelectedCategoryId("uncategorized")}
                    className="group relative bg-white/10 hover:bg-white/20 rounded-lg p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-white line-clamp-2">
                        Otros productos
                      </h3>
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        {productCountByCategory.get("uncategorized")} productos
                      </Badge>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              /* Products Grid */
              <>
                {categoryProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {categoryProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        reference={product.reference}
                        thumbnailUrl={product.thumbnail_url}
                        isSelected={selectedProducts.has(product.id)}
                        onToggle={toggleProduct}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-white/70">
                    <Package className="w-12 h-12 mb-2 opacity-50" />
                    <p>No se encontraron productos</p>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Recipe Summary */}
      <div className="lg:col-span-1">
        <Card className="shadow-medical sticky top-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Receta</CardTitle>
              </div>
              <Badge variant="secondary" className="font-bold">
                {selectedProducts.size}
              </Badge>
            </div>
            <CardDescription>Productos seleccionados para la prescripción</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Patient Info */}
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

            {/* Selected Products List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Productos ({selectedProducts.size})</Label>
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
              
              <ScrollArea className="h-[180px] rounded-md border p-2">
                {selectedProductsData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                    <Package className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Selecciona productos del catálogo</p>
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
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Package className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            C.N. {product.reference?.replace(".", "")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="w-3 h-3" />
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
    </div>
  );
};
