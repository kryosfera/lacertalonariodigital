import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Printer, Download, ShoppingCart, Plus, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CategorySelector } from "./CategorySelector";
import { ProductSelector } from "./ProductSelector";
import { SelectedProductsBadge } from "./SelectedProductsBadge";
import { sendViaWhatsApp, sendViaEmail, downloadPDF } from "@/lib/recipeUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  reference: string;
  thumbnail_url: string | null;
  category_id: string | null;
}

interface ProductWithQuantity extends Product {
  quantity: number;
}

export const RecipeCreator = () => {
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [isClosingCategory, setIsClosingCategory] = useState(false);
  const [isClosingProduct, setIsClosingProduct] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendMethod, setSendMethod] = useState<"whatsapp" | "email" | null>(null);
  const [isSending, setIsSending] = useState(false);

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

  // Get selected products with quantity
  const selectedProductsData = useMemo((): ProductWithQuantity[] => {
    return products
      .filter((p) => selectedProducts.has(p.id))
      .map((p) => ({
        ...p,
        quantity: selectedProducts.get(p.id) || 1,
      }));
  }, [products, selectedProducts]);

  // Create Set for ProductSelector compatibility
  const selectedProductsSet = useMemo(() => {
    return new Set(selectedProducts.keys());
  }, [selectedProducts]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Map(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.set(productId, 1);
      }
      return next;
    });
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    setSelectedProducts((prev) => {
      const next = new Map(prev);
      next.set(productId, Math.min(quantity, 99));
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedProducts(new Map());
  };

  const getRecipeData = () => ({
    patientName,
    date: new Date().toLocaleDateString("es-ES"),
    products: selectedProductsData,
    notes,
  });

  const handleSendWhatsApp = () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    sendViaWhatsApp(getRecipeData(), patientPhone);
    toast.success("Abriendo WhatsApp...");
    setShowSendDialog(false);
  };

  const handleSendEmail = () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    sendViaEmail(getRecipeData(), patientEmail);
    toast.success("Abriendo cliente de correo...");
    setShowSendDialog(false);
  };

  const handleDownloadPDF = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    setIsSending(true);
    try {
      await downloadPDF(getRecipeData());
      toast.success("PDF descargado correctamente");
    } catch (error) {
      toast.error("Error al generar el PDF");
    } finally {
      setIsSending(false);
    }
  };

  const handlePrint = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    setIsSending(true);
    try {
      const { generateRecipePDF } = await import("@/lib/recipeUtils");
      const blob = await generateRecipePDF(getRecipeData());
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      toast.error("Error al preparar la impresión");
    } finally {
      setIsSending(false);
    }
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
          selectedProducts={selectedProductsSet}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleProduct={toggleProduct}
          onBack={handleBackToCategories}
          onClose={handleCloseSelector}
          isClosing={isClosingProduct}
        />
      )}

      {/* Recipe Summary */}
      <div className="max-w-2xl mx-auto pb-20 md:pb-0">
        <Card className="shadow-medical">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Receta Digital</CardTitle>
                  <CardDescription>Crea y envía recetas a tus pacientes</CardDescription>
                </div>
              </div>
              {selectedProducts.size > 0 && (
                <Badge className="bg-secondary text-secondary-foreground font-bold text-lg px-3 py-1">
                  {selectedProducts.size}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full h-14 border-dashed border-2 hover:border-secondary hover:bg-secondary/5 transition-colors"
              onClick={handleOpenCategorySelector}
            >
              <Plus className="w-5 h-5 mr-2" />
              Añadir Productos
            </Button>

            {/* Selected Products List with improved badges */}
            <div className="rounded-lg border bg-muted/20 p-3">
              <SelectedProductsBadge
                products={selectedProductsData}
                onRemove={removeProduct}
                onUpdateQuantity={updateQuantity}
                onClear={clearSelection}
              />
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
                onClick={() => {
                  setSendMethod("whatsapp");
                  setShowSendDialog(true);
                }}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                disabled={selectedProducts.size === 0}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => {
                  setSendMethod("email");
                  setShowSendDialog(true);
                }}
                variant="secondary"
                className="w-full"
                disabled={selectedProducts.size === 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={selectedProducts.size === 0 || isSending}
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={selectedProducts.size === 0 || isSending}
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {sendMethod === "whatsapp" ? "Enviar por WhatsApp" : "Enviar por Email"}
            </DialogTitle>
            <DialogDescription>
              Introduce los datos del paciente para enviar la receta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {sendMethod === "whatsapp" ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Si no introduces un número, se abrirá WhatsApp para que lo selecciones
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="paciente@email.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                />
              </div>
            )}
            
            <Button
              className="w-full"
              onClick={sendMethod === "whatsapp" ? handleSendWhatsApp : handleSendEmail}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar receta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
