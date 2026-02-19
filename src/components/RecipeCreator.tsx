import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, Printer, Download, ShoppingCart, Plus, MessageCircle, Mail, User, Check, Package, Minus, Save, FolderOpen, Trash2, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CategorySelector } from "./CategorySelector";
import { ProductSelector } from "./ProductSelector";
import { sendViaWhatsApp, sendViaEmail, downloadPDF, generateRecipeUrl, generateShortRecipeUrl, createShortUrl } from "@/lib/recipeUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserMode } from "@/hooks/useUserMode";
import { usePatients, Patient } from "@/hooks/usePatients";
import { useCreateRecipe, RecipeProduct } from "@/hooks/useRecipes";
import { cn } from "@/lib/utils";
import { VoiceDictation } from "./VoiceDictation";

interface Product {
  id: string;
  name: string;
  reference: string;
  ean: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
}

interface ProductWithQuantity extends Product {
  quantity: number;
}

interface RecipeCreatorProps {
  startWithCategories?: boolean;
  onCategoriesShown?: () => void;
  onGoHome?: () => void;
}

export const RecipeCreator = ({ startWithCategories = false, onCategoriesShown, onGoHome }: RecipeCreatorProps) => {
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
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  
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

  // Fetch templates - available for all users to load saved templates
  const { data: templates = [], refetch: refetchTemplates } = useQuery({
    queryKey: ["recipe-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — templates change rarely
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, reference, ean, thumbnail_url, category_id")
        .eq("is_active", true)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — products change rarely
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

  // Handle voice dictation results
  const handleVoiceProductsConfirmed = useCallback((
    voiceProducts: { id: string; quantity: number }[], 
    instructions: string
  ) => {
    // Add products from voice dictation
    setSelectedProducts((prev) => {
      const next = new Map(prev);
      voiceProducts.forEach(({ id, quantity }) => {
        const existingQty = next.get(id) || 0;
        next.set(id, existingQty + quantity);
      });
      return next;
    });

    // Append instructions to notes
    if (instructions.trim()) {
      setNotes((prev) => {
        if (prev.trim()) {
          return prev + '\n\n' + instructions;
        }
        return instructions;
      });
    }
  }, []);

  const getRecipeData = () => ({
    patientName,
    date: new Date().toLocaleDateString("es-ES"),
    products: selectedProductsData,
    notes,
  });

  // Template functions
  const saveAsTemplate = async () => {
    if (!templateName.trim() || selectedProducts.size === 0) return;
    
    setSavingTemplate(true);
    try {
      const templateProducts = selectedProductsData.map(p => ({
        id: p.id,
        name: p.name,
        reference: p.reference,
        quantity: p.quantity,
        thumbnail_url: p.thumbnail_url
      }));

      const { error } = await supabase.from("recipe_templates").insert({
        name: templateName.trim(),
        products: templateProducts,
        notes,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;
      
      toast.success("Plantilla guardada correctamente");
      setShowTemplateDialog(false);
      setTemplateName("");
      refetchTemplates();
    } catch (error) {
      toast.error("Error al guardar la plantilla");
    } finally {
      setSavingTemplate(false);
    }
  };

  const loadTemplate = (template: typeof templates[0]) => {
    const productsArray = template.products as Array<{ id: string; quantity: number }>;
    const newSelection = new Map<string, number>();
    productsArray.forEach((p) => {
      newSelection.set(p.id, p.quantity || 1);
    });
    setSelectedProducts(newSelection);
    if (template.notes) setNotes(template.notes);
    toast.success(`Plantilla "${template.name}" cargada`);
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("recipe_templates")
        .delete()
        .eq("id", templateId);
      
      if (error) throw error;
      toast.success("Plantilla eliminada");
      refetchTemplates();
    } catch (error) {
      toast.error("Error al eliminar la plantilla");
    }
  };

  const saveRecipeToDb = async (sentVia: 'whatsapp' | 'email' | 'both' | 'pdf' | 'print'): Promise<string | null> => {
    if (!isProfessional) return null;
    
    const recipeProducts: RecipeProduct[] = selectedProductsData.map(p => ({
      id: p.id,
      name: p.name,
      reference: p.reference,
      ean: p.ean,
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
    
    setIsSending(true);
    
    // Capture data BEFORE any reset
    const recipeData = getRecipeData();
    const phone = patientPhone;
    let recipeUrl: string | undefined;
    
    try {
      if (isProfessional) {
        // Professional users: save to DB and get permanent URL
        const recipeCode = await saveRecipeToDb('whatsapp');
        if (recipeCode) {
          recipeUrl = generateRecipeUrl(recipeCode);
        }
        toast.success("Receta guardada en historial");
        resetForm();
      } else {
        // Basic users: create short URL
        const shortCode = await createShortUrl(recipeData);
        if (shortCode) {
          recipeUrl = generateShortRecipeUrl(shortCode);
        }
      }
      
      sendViaWhatsApp(recipeData, phone, recipeUrl);
      toast.success("Abriendo WhatsApp...");
    } catch (error) {
      toast.error("Error al generar el enlace");
    } finally {
      setIsSending(false);
      setShowSendDialog(false);
    }
  };

  const handleSendEmail = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }
    
    setIsSending(true);
    
    // Capture data BEFORE any reset
    const recipeData = getRecipeData();
    const email = patientEmail;
    let recipeUrl: string | undefined;
    
    try {
      if (isProfessional) {
        const recipeCode = await saveRecipeToDb('email');
        if (recipeCode) {
          recipeUrl = generateRecipeUrl(recipeCode);
        }
        toast.success("Receta guardada en historial");
        resetForm();
      } else {
        // Basic users: create short URL
        const shortCode = await createShortUrl(recipeData);
        if (shortCode) {
          recipeUrl = generateShortRecipeUrl(shortCode);
        }
      }
      
      sendViaEmail(recipeData, email, recipeUrl);
      toast.success("Abriendo cliente de correo...");
    } catch (error) {
      toast.error("Error al generar el enlace");
    } finally {
      setIsSending(false);
      setShowSendDialog(false);
    }
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
        const shortCode = await createShortUrl(recipeData);
        if (shortCode) {
          recipeUrl = generateShortRecipeUrl(shortCode);
        }
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
        const shortCode = await createShortUrl(recipeData);
        if (shortCode) {
          recipeUrl = generateShortRecipeUrl(shortCode);
        }
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
          onGoHome={onGoHome}
          productCountByCategory={productCountByCategory}
          selectedProductsCount={selectedProducts.size}
          isClosing={isClosingCategory}
          templates={templates}
          onLoadTemplate={loadTemplate}
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

      {/* Recipe Summary - Maximized for mobile */}
      <div className="max-w-2xl mx-auto pb-24 md:pb-4">
        {/* Mobile: Full-height flex layout */}
        <div className="flex flex-col h-full md:block">
          
          {/* Quick Actions Bar - Mobile first */}
          <div className="px-3 md:px-0 mb-2 md:mb-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-12 md:h-14 border-dashed border-2 hover:border-secondary hover:bg-secondary/5 transition-colors font-medium"
                onClick={handleOpenCategorySelector}
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Añadir </span>Productos
              </Button>
              <VoiceDictation 
                onProductsConfirmed={handleVoiceProductsConfirmed}
                existingNotes={notes}
              />
            </div>
          </div>

          {/* Products Grid - Main content area */}
          <div className="flex-1 px-3 md:px-0">
            <TooltipProvider delayDuration={300}>
              {selectedProducts.size > 0 ? (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  {/* Compact header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-secondary text-secondary-foreground font-bold">
                        {selectedProducts.size}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        producto{selectedProducts.size !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Limpiar
                    </Button>
                  </div>
                  
                  {/* Products list - Compact visual grid with animations */}
                  <div className="p-2 max-h-[30vh] md:max-h-[40vh] overflow-y-auto">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
                      <AnimatePresence mode="popLayout">
                        {selectedProductsData.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 400, 
                              damping: 25,
                              delay: index * 0.03 
                            }}
                            className="relative group"
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => removeProduct(product.id)}
                                  className="w-full aspect-square bg-white rounded-lg border overflow-hidden hover:ring-2 hover:ring-destructive/50 transition-all"
                                >
                                  {product.thumbnail_url ? (
                                    <img
                                      src={product.thumbnail_url}
                                      alt={product.name}
                                      className="w-full h-full object-contain p-1"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-6 h-6 text-muted-foreground/50" />
                                    </div>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[200px] text-center">
                                <p className="text-xs font-medium">{product.name}</p>
                                <p className="text-[10px] text-muted-foreground">C.N. {product.reference}</p>
                              </TooltipContent>
                            </Tooltip>
                            {/* Quantity badge */}
                            {product.quantity > 1 && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center shadow"
                              >
                                {product.quantity}
                              </motion.div>
                            )}
                            {/* Quick quantity controls on hover/touch */}
                            <div className="absolute bottom-0 left-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, product.quantity - 1); }}
                                className="flex-1 bg-black/70 text-white text-xs py-0.5 rounded-bl-lg hover:bg-black/90"
                              >
                                −
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, product.quantity + 1); }}
                                className="flex-1 bg-black/70 text-white text-xs py-0.5 rounded-br-lg hover:bg-black/90"
                              >
                                +
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Floating summary when > 6 products */}
                  <AnimatePresence>
                    {selectedProducts.size > 6 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t bg-secondary/5 px-3 py-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-secondary" />
                            <span className="text-sm font-medium text-foreground">
                              {selectedProductsData.reduce((acc, p) => acc + p.quantity, 0)} unidades totales
                            </span>
                          </div>
                          <div className="flex -space-x-2">
                            {selectedProductsData.slice(0, 4).map((p) => (
                              <div key={p.id} className="w-6 h-6 rounded-full bg-white border-2 border-background overflow-hidden">
                                {p.thumbnail_url ? (
                                  <img src={p.thumbnail_url} alt="" className="w-full h-full object-contain" />
                                ) : (
                                  <Package className="w-full h-full p-1 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                            {selectedProducts.size > 4 && (
                              <div className="w-6 h-6 rounded-full bg-secondary text-white text-[10px] font-bold border-2 border-background flex items-center justify-center">
                                +{selectedProducts.size - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-8 md:py-12 text-center"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Sin productos</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Pulsa "Añadir Productos" para comenzar
                  </p>
                </motion.div>
              )}
            </TooltipProvider>
          </div>

          {/* Notes - Compact on mobile */}
          <div className="px-3 md:px-0 mt-3">
            <Textarea
              placeholder="Notas adicionales (opcional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none text-sm bg-muted/30 border-muted"
            />
          </div>

          {/* Patient Info - Only for Professional users, compact */}
          {isProfessional && (
            <div className="px-3 md:px-0 mt-3">
              <div className="flex gap-2">
                <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Paciente..."
                        value={patientName}
                        onChange={(e) => {
                          setPatientName(e.target.value);
                          setSelectedPatient(null);
                          if (e.target.value.length > 0) {
                            setPatientSearchOpen(true);
                          }
                        }}
                        onFocus={() => patients.length > 0 && setPatientSearchOpen(true)}
                        className="pl-10 h-10"
                      />
                      {selectedPatient && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[280px]" align="start">
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
              </div>
            </div>
          )}

          {/* Templates - Professional only, inline chips */}
          {isProfessional && templates.length > 0 && (
            <div className="px-3 md:px-0 mt-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Plantillas:</span>
                {templates.slice(0, 3).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 whitespace-nowrap flex-shrink-0"
                    onClick={() => loadTemplate(template)}
                  >
                    <FolderOpen className="w-3 h-3" />
                    {template.name.slice(0, 12)}{template.name.length > 12 ? '…' : ''}
                  </Button>
                ))}
                {selectedProducts.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 whitespace-nowrap flex-shrink-0"
                    onClick={() => setShowTemplateDialog(true)}
                  >
                    <Save className="w-3 h-3" />
                    Guardar
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons - Integrated in content flow (NOT fixed) */}
          <div className="px-3 md:px-0 mt-4 mb-4 space-y-3">
            {/* Primary action - WhatsApp full width */}
            <Button
              onClick={() => {
                setSendMethod("whatsapp");
                setShowSendDialog(true);
              }}
              className="w-full h-12 md:h-14 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-base gap-2"
              disabled={selectedProducts.size === 0}
            >
              <MessageCircle className="w-5 h-5" />
              Enviar por WhatsApp
              {selectedProducts.size > 0 && (
                <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                  {selectedProductsData.reduce((acc, p) => acc + p.quantity, 0)} uds
                </Badge>
              )}
            </Button>

            {/* Secondary actions - Inline row */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSendMethod("email");
                  setShowSendDialog(true);
                }}
                variant="outline"
                className="flex-1 h-11 gap-2"
                disabled={selectedProducts.size === 0}
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11 gap-2"
                disabled={selectedProducts.size === 0 || isSending}
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">PDF</span>
              </Button>
              <Button
                variant="outline"
                className="h-11 w-11 p-0"
                disabled={selectedProducts.size === 0 || isSending}
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {sendMethod === "whatsapp" ? "Enviar por WhatsApp" : "Enviar por Email"}
            </DialogTitle>
            <DialogDescription>
              Revisa la receta y añade los datos del paciente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Visual Recipe Summary with quantity controls */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Resumen de la receta
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedProductsData.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center gap-2 bg-background rounded-md p-2"
                  >
                    <div className="w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.thumbnail_url ? (
                        <img
                          src={product.thumbnail_url}
                          alt={product.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <Package className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        C.N. {product.reference}
                      </p>
                    </div>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(product.id, product.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {product.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(product.id, product.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {notes && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Notas:</span> {notes}
                  </p>
                </div>
              )}
            </div>

            {/* Contact input */}
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
              Enviar receta ({selectedProducts.size} productos)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Save Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar como plantilla</DialogTitle>
            <DialogDescription>
              Guarda esta selección de productos para usarla en futuras recetas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nombre de la plantilla</Label>
              <Input
                id="template-name"
                placeholder="Ej: Tratamiento periodoncia básico"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {selectedProducts.size} productos seleccionados
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedProductsData.slice(0, 5).map((p) => (
                  <Badge key={p.id} variant="secondary" className="text-xs">
                    {p.name.slice(0, 20)}...
                  </Badge>
                ))}
                {selectedProducts.size > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedProducts.size - 5} más
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={saveAsTemplate}
              disabled={!templateName.trim() || savingTemplate}
            >
              <Save className="w-4 h-4 mr-2" />
              {savingTemplate ? "Guardando..." : "Guardar plantilla"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
