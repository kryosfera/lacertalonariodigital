import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Printer, Download, Search, X, ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CategorySection } from "./CategorySection";

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
}

export const RecipeCreator = () => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
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

  // Filter products by search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, Product[]>();
    
    categories.forEach((cat) => {
      grouped.set(cat.id, []);
    });
    
    // Add "Sin categoría" for products without category
    grouped.set("uncategorized", []);
    
    filteredProducts.forEach((product) => {
      const catId = product.category_id || "uncategorized";
      const existing = grouped.get(catId) || [];
      existing.push(product);
      grouped.set(catId, existing);
    });
    
    return grouped;
  }, [filteredProducts, categories]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Catalog - Talonario Style */}
      <div className="lg:col-span-2">
        <div className="bg-secondary rounded-xl p-4 md:p-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://www.lacer.es/themes/custom/flavor/logo.svg" 
                alt="Lacer" 
                className="h-8 brightness-0 invert"
              />
              <div>
                <h2 className="text-lg font-bold text-white">Talonario Digital</h2>
                <p className="text-xs text-white/70">Selecciona los productos a prescribir</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto o C.N..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/90 border-0"
              />
            </div>
          </div>

          {/* Products Grid */}
          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <>
                {categories.map((category) => {
                  const categoryProducts = productsByCategory.get(category.id) || [];
                  return (
                    <CategorySection
                      key={category.id}
                      name={category.name}
                      products={categoryProducts}
                      selectedProducts={selectedProducts}
                      onToggleProduct={toggleProduct}
                    />
                  );
                })}
                
                {/* Uncategorized products */}
                {(productsByCategory.get("uncategorized") || []).length > 0 && (
                  <CategorySection
                    name="Otros productos"
                    products={productsByCategory.get("uncategorized") || []}
                    selectedProducts={selectedProducts}
                    onToggleProduct={toggleProduct}
                  />
                )}

                {filteredProducts.length === 0 && (
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
