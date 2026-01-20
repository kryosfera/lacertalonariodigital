import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Printer, Download, ShoppingCart, Plus, MessageCircle, Mail, User, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CategorySelector } from "./CategorySelector";
import { ProductSelector } from "./ProductSelector";
import { SelectedProductsBadge } from "./SelectedProductsBadge";
import { sendViaWhatsApp, sendViaEmail, downloadPDF, generateRecipeUrl, generateTemporaryRecipeUrl } from "@/lib/recipeUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserMode } from "@/hooks/useUserMode";
import { usePatients, Patient } from "@/hooks/usePatients";
import { useCreateRecipe, RecipeProduct } from "@/hooks/useRecipes";
import { cn } from "@/lib/utils";

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

interface RecipeCreatorProps {
  startWithCategories?: boolean;
  onCategoriesShown?: () => void;
}

export const RecipeCreator = ({ startWithCategories = false, onCategoriesShown }: RecipeCreatorProps) => {
  const { userMode } = useUserMode();
  const isProfessional = userMode === 'professional';
  
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
  
  // Auto-open categories when startWithCategories prop is true
  useEffect(() => {
    if (startWithCategories && !showCategorySelector) {
      setShowCategorySelector(true);
      onCategoriesShown?.();
    }
  }, [startWithCategories, onCategoriesShown, showCategorySelector]);
  
  // Patient autocomplete state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);

  // Professional mode hooks
  const { data: patients = [] } = usePatients();
  const createRecipe = useCreateRecipe();

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

  // Filter patients for autocomplete
  const filteredPatients = useMemo(() => {
    if (!patientName.trim()) return patients.slice(0, 5);
    return patients.filter(p => 
      p.name.toLowerCase().includes(patientName.toLowerCase())
    ).slice(0, 5);
  }, [patients, patientName]);

  // Handle patient selection
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientName(patient.name);
    setPatientPhone(patient.phone || "");
    setPatientEmail(patient.email || "");
    setPatientSearchOpen(false);
  };

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

  const saveRecipeToDb = async (sentVia: 'whatsapp' | 'email' | 'both' | 'pdf' | 'print'): Promise<string | null> => {
    if (!isProfessional) return null;
    
    const recipeProducts: RecipeProduct[] = selectedProductsData.map(p => ({
      id: p.id,
      name: p.name,
      reference: p.reference,
      quantity: p.quantity,
      thumbnail_url: p.thumbnail_url
    }));

    const result = await createRecipe.mutateAsync({
      patient_id: selectedPatient?.id || null,
      patient_name: patientName || "Sin nombre",
      products: recipeProducts,
      notes,
      sent_via: sentVia
    });

    return result?.recipe_code || null;
  };

  const resetForm = () => {
    setSelectedProducts(new Map());
    setPatientName("");
    setPatientPhone("");
    setPatientEmail("");
    setNotes("");
    setSelectedPatient(null);
  };

  const handleSendWhatsApp = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    
    // Capture data BEFORE any reset
    const recipeData = getRecipeData();
    const phone = patientPhone;
    let recipeUrl: string | undefined;
    
    if (isProfessional) {
      // Professional users: save to DB and get permanent URL
      const recipeCode = await saveRecipeToDb('whatsapp');
      if (recipeCode) {
        recipeUrl = generateRecipeUrl(recipeCode);
      }
      toast.success("Receta guardada en historial");
      resetForm();
    } else {
      // Basic users: generate temporary encoded URL (no DB storage)
      recipeUrl = generateTemporaryRecipeUrl(recipeData);
    }
    
    sendViaWhatsApp(recipeData, phone, recipeUrl);
    toast.success("Abriendo WhatsApp...");
    setShowSendDialog(false);
  };

  const handleSendEmail = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    
    // Capture data BEFORE any reset
    const recipeData = getRecipeData();
    const email = patientEmail;
    let recipeUrl: string | undefined;
    
    if (isProfessional) {
      const recipeCode = await saveRecipeToDb('email');
      if (recipeCode) {
        recipeUrl = generateRecipeUrl(recipeCode);
      }
      toast.success("Receta guardada en historial");
      resetForm();
    } else {
      recipeUrl = generateTemporaryRecipeUrl(recipeData);
    }
    
    sendViaEmail(recipeData, email, recipeUrl);
    toast.success("Abriendo cliente de correo...");
    setShowSendDialog(false);
  };

  const handleDownloadPDF = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    setIsSending(true);
    
    // Capture data BEFORE any reset
    const recipeData = getRecipeData();
    
    try {
      let recipeUrl: string | undefined;
      
      if (isProfessional) {
        const recipeCode = await saveRecipeToDb('pdf');
        if (recipeCode) {
          recipeUrl = generateRecipeUrl(recipeCode);
        }
        toast.success("Receta guardada en historial");
        resetForm();
      } else {
        recipeUrl = generateTemporaryRecipeUrl(recipeData);
      }
      
      await downloadPDF(recipeData, recipeUrl);
      toast.success("PDF descargado con código QR");
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
    
    // Capture data BEFORE any reset
    const recipeData = getRecipeData();
    
    try {
      let recipeUrl: string | undefined;
      
      if (isProfessional) {
        const recipeCode = await saveRecipeToDb('print');
        if (recipeCode) {
          recipeUrl = generateRecipeUrl(recipeCode);
        }
        toast.success("Receta guardada en historial");
        resetForm();
      } else {
        recipeUrl = generateTemporaryRecipeUrl(recipeData);
      }
      
      const { generateRecipePDF } = await import("@/lib/recipeUtils");
      const blob = await generateRecipePDF(recipeData, recipeUrl);
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
                {isProfessional ? (
                  <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="patient-name"
                          placeholder="Buscar o escribir nombre..."
                          value={patientName}
                          onChange={(e) => {
                            setPatientName(e.target.value);
                            setSelectedPatient(null);
                            if (e.target.value.length > 0) {
                              setPatientSearchOpen(true);
                            }
                          }}
                          onFocus={() => patients.length > 0 && setPatientSearchOpen(true)}
                          className="pl-10"
                        />
                        {selectedPatient && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px]" align="start">
                      <Command>
                        <CommandList>
                          {filteredPatients.length === 0 ? (
                            <CommandEmpty>No se encontraron pacientes</CommandEmpty>
                          ) : (
                            <CommandGroup heading="Pacientes">
                              {filteredPatients.map((patient) => (
                                <CommandItem
                                  key={patient.id}
                                  value={patient.name}
                                  onSelect={() => handleSelectPatient(patient)}
                                  className="cursor-pointer"
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  <div className="flex flex-col">
                                    <span>{patient.name}</span>
                                    {patient.phone && (
                                      <span className="text-xs text-muted-foreground">{patient.phone}</span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    id="patient-name"
                    placeholder="Nombre del paciente"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                )}
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
