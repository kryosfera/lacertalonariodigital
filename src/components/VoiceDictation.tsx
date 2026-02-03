import { useState, useCallback } from 'react';
import { Mic, MicOff, Loader2, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  reference: string | null;
  ean: string | null;
}

interface ExtractedProduct {
  productId: string | null;
  productName: string;
  matchedProduct: Product | null;
  quantity: number;
  confidence: 'high' | 'medium' | 'low';
  suggestions?: Product[];
}

interface ProcessedRecipe {
  products: ExtractedProduct[];
  instructions: string;
  rawText: string;
}

interface VoiceDictationProps {
  onProductsConfirmed: (products: { id: string; quantity: number }[], instructions: string) => void;
  existingNotes?: string;
}

export function VoiceDictation({ onProductsConfirmed, existingNotes = '' }: VoiceDictationProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedRecipe, setProcessedRecipe] = useState<ProcessedRecipe | null>(null);
  const [editedInstructions, setEditedInstructions] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Map<string, { product: Product; quantity: number }>>(new Map());

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: 'es-ES',
    continuous: true,
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleStartDictation = useCallback(() => {
    setShowDialog(true);
    resetTranscript();
    setProcessedRecipe(null);
    setSelectedProducts(new Map());
    // Small delay to ensure dialog is open
    setTimeout(() => {
      startListening();
    }, 300);
  }, [resetTranscript, startListening]);

  const handleStopAndProcess = useCallback(async () => {
    stopListening();
    
    const finalTranscript = transcript.trim();
    if (!finalTranscript) {
      toast.error('No se detectó ningún texto. Intenta de nuevo.');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-voice-recipe', {
        body: { transcript: finalTranscript },
      });

      if (error) {
        console.error('Error processing voice recipe:', error);
        throw new Error(error.message || 'Error al procesar la receta');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setProcessedRecipe(data);
      setEditedInstructions(data.instructions || '');

      // Pre-select high confidence matches
      const initialSelected = new Map<string, { product: Product; quantity: number }>();
      data.products.forEach((p: ExtractedProduct) => {
        if (p.matchedProduct && (p.confidence === 'high' || p.confidence === 'medium')) {
          initialSelected.set(p.matchedProduct.id, {
            product: p.matchedProduct,
            quantity: p.quantity,
          });
        }
      });
      setSelectedProducts(initialSelected);

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar el dictado');
    } finally {
      setIsProcessing(false);
    }
  }, [stopListening, transcript]);

  const handleCancel = useCallback(() => {
    stopListening();
    setShowDialog(false);
    resetTranscript();
    setProcessedRecipe(null);
  }, [stopListening, resetTranscript]);

  const handleConfirm = useCallback(() => {
    const products = Array.from(selectedProducts.entries()).map(([id, data]) => ({
      id,
      quantity: data.quantity,
    }));

    if (products.length === 0) {
      toast.error('Selecciona al menos un producto');
      return;
    }

    onProductsConfirmed(products, editedInstructions);
    setShowDialog(false);
    resetTranscript();
    setProcessedRecipe(null);
    toast.success(`${products.length} producto(s) añadido(s) a la receta`);
  }, [selectedProducts, editedInstructions, onProductsConfirmed, resetTranscript]);

  const toggleProductSelection = useCallback((product: Product, quantity: number) => {
    setSelectedProducts(prev => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, { product, quantity });
      }
      return next;
    });
  }, []);

  const selectSuggestion = useCallback((suggestion: Product, originalQuantity: number) => {
    setSelectedProducts(prev => {
      const next = new Map(prev);
      next.set(suggestion.id, { product: suggestion, quantity: originalQuantity });
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setSelectedProducts(prev => {
      const next = new Map(prev);
      const existing = next.get(productId);
      if (existing && quantity > 0) {
        next.set(productId, { ...existing, quantity });
      }
      return next;
    });
  }, []);

  if (!isSupported) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <MicOff className="w-4 h-4" />
        <span className="hidden sm:inline">No soportado</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleStartDictation}
        className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/5"
      >
        <Mic className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline">Dictar</span>
      </Button>

      <Dialog open={showDialog} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Dictado de Receta con IA
            </DialogTitle>
            <DialogDescription>
              Dicta los productos y las instrucciones. La IA los identificará automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Recording Phase */}
            {!processedRecipe && (
              <div className="space-y-4">
                {/* Microphone indicator */}
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                    isListening 
                      ? "bg-red-500/20 animate-pulse" 
                      : "bg-muted"
                  )}>
                    {isProcessing ? (
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    ) : isListening ? (
                      <Mic className="w-10 h-10 text-red-500" />
                    ) : (
                      <MicOff className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    {isProcessing 
                      ? "Procesando con IA..." 
                      : isListening 
                        ? "Escuchando... Habla claro y cerca del micrófono" 
                        : "Pulsa el botón para empezar a dictar"}
                  </p>
                </div>

                {/* Live transcript */}
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Transcripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[100px] max-h-[200px] overflow-y-auto">
                      <p className="text-sm">
                        {transcript}
                        {interimTranscript && (
                          <span className="text-muted-foreground italic">
                            {transcript ? ' ' : ''}{interimTranscript}
                          </span>
                        )}
                        {!transcript && !interimTranscript && (
                          <span className="text-muted-foreground italic">
                            Ejemplo: "Pasta Lacer 125ml, dos unidades, y colutorio Lacer Oros. 
                            Usar la pasta después del desayuno y antes de dormir."
                          </span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Controls */}
                <div className="flex justify-center gap-3">
                  {!isListening && !isProcessing && (
                    <Button onClick={startListening} className="gap-2">
                      <Mic className="w-4 h-4" />
                      Empezar a dictar
                    </Button>
                  )}
                  {isListening && (
                    <Button 
                      onClick={handleStopAndProcess} 
                      variant="default"
                      className="gap-2 bg-primary"
                    >
                      <Check className="w-4 h-4" />
                      Procesar dictado
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Confirmation Phase */}
            {processedRecipe && (
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 pb-4">
                  {/* Detected Products */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      Productos detectados
                      <Badge variant="secondary">{processedRecipe.products.length}</Badge>
                    </h4>
                    <div className="space-y-2">
                      {processedRecipe.products.map((item, index) => (
                        <Card 
                          key={index} 
                          className={cn(
                            "transition-all cursor-pointer",
                            item.matchedProduct && selectedProducts.has(item.matchedProduct.id)
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground/30"
                          )}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm text-muted-foreground">
                                    Mencionado: "{item.productName}"
                                  </span>
                                  <Badge 
                                    variant={
                                      item.confidence === 'high' ? 'default' :
                                      item.confidence === 'medium' ? 'secondary' : 'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {item.confidence === 'high' ? 'Seguro' :
                                     item.confidence === 'medium' ? 'Probable' : 'Incierto'}
                                  </Badge>
                                </div>
                                
                                {item.matchedProduct ? (
                                  <div 
                                    className="flex items-center gap-2"
                                    onClick={() => toggleProductSelection(item.matchedProduct!, item.quantity)}
                                  >
                                    <div className={cn(
                                      "w-5 h-5 rounded border flex items-center justify-center",
                                      selectedProducts.has(item.matchedProduct.id)
                                        ? "bg-primary border-primary"
                                        : "border-input"
                                    )}>
                                      {selectedProducts.has(item.matchedProduct.id) && (
                                        <Check className="w-3 h-3 text-primary-foreground" />
                                      )}
                                    </div>
                                    <span className="font-medium">{item.matchedProduct.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      (x{item.quantity})
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-amber-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">No encontrado en catálogo</span>
                                  </div>
                                )}

                                {/* Suggestions for low confidence */}
                                {item.suggestions && item.suggestions.length > 0 && (
                                  <div className="mt-2 pl-7">
                                    <p className="text-xs text-muted-foreground mb-1">
                                      ¿Quisiste decir?
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {item.suggestions.map((suggestion) => (
                                        <Button
                                          key={suggestion.id}
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => selectSuggestion(suggestion, item.quantity)}
                                        >
                                          {suggestion.name}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Quantity controls */}
                              {item.matchedProduct && selectedProducts.has(item.matchedProduct.id) && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const current = selectedProducts.get(item.matchedProduct!.id)?.quantity || 1;
                                      if (current > 1) updateQuantity(item.matchedProduct!.id, current - 1);
                                    }}
                                  >
                                    -
                                  </Button>
                                  <span className="w-8 text-center text-sm">
                                    {selectedProducts.get(item.matchedProduct.id)?.quantity || item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const current = selectedProducts.get(item.matchedProduct!.id)?.quantity || 1;
                                      updateQuantity(item.matchedProduct!.id, current + 1);
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-medium mb-2">Instrucciones detectadas</h4>
                    <Textarea
                      value={editedInstructions}
                      onChange={(e) => setEditedInstructions(e.target.value)}
                      placeholder="Las instrucciones extraídas aparecerán aquí..."
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Puedes editar las instrucciones antes de confirmar
                    </p>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            {processedRecipe && (
              <Button onClick={handleConfirm} disabled={selectedProducts.size === 0}>
                <Check className="w-4 h-4 mr-2" />
                Añadir {selectedProducts.size} producto(s)
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
