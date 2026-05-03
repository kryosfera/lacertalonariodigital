import { useQuery } from "@tanstack/react-query";
import { Package, Check, Plus, X, PlayCircle, FileText } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface ProductDetailDialogProps {
  productId: string | null;
  isSelected: boolean;
  onClose: () => void;
  onToggle: (productId: string) => void;
}

export const ProductDetailDialog = ({
  productId,
  isSelected,
  onClose,
  onToggle,
}: ProductDetailDialogProps) => {
  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, reference, ean, description_html, main_image_url, thumbnail_url, gallery_urls, video_urls, categories(name)"
        )
        .eq("id", productId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const open = !!productId;
  const image = product?.main_image_url || product?.thumbnail_url;
  const formattedCN = product?.reference?.replace(".", "") || "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col">
        {/* Header image */}
        <div className="relative bg-white flex items-center justify-center h-56 border-b border-border/40">
          {image ? (
            <img
              src={image}
              alt={product?.name}
              className="max-h-full max-w-full object-contain p-6"
            />
          ) : (
            <Package className="w-16 h-16 text-muted-foreground/40" />
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
              </div>
            ) : product ? (
              <>
                <div>
                  {product.categories?.name && (
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                      {product.categories.name}
                    </p>
                  )}
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {product.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formattedCN && (
                      <Badge variant="outline" className="font-mono text-xs">
                        C.N. {formattedCN}
                      </Badge>
                    )}
                    {product.ean && (
                      <Badge variant="outline" className="font-mono text-xs">
                        EAN {product.ean}
                      </Badge>
                    )}
                  </div>
                </div>

                {product.description_html && (
                  <div
                    className="prose prose-sm max-w-none text-foreground/90 [&_p]:my-2 [&_ul]:my-2 [&_li]:my-0.5"
                    dangerouslySetInnerHTML={{ __html: product.description_html }}
                  />
                )}

                {product.video_urls && product.video_urls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Vídeos
                    </p>
                    <div className="flex flex-col gap-2">
                      {product.video_urls.map((url: string, i: number) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:bg-muted/40 text-sm"
                        >
                          <PlayCircle className="w-4 h-4 text-secondary" />
                          <span className="truncate">Ver vídeo {i + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {product.gallery_urls && product.gallery_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.gallery_urls.slice(0, 6).map((url: string, i: number) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-full h-20 object-contain bg-white rounded-lg border border-border/40"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No se pudo cargar el producto
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Action bar */}
        <div className="border-t border-border/40 p-4 bg-background">
          <Button
            onClick={() => {
              if (productId) onToggle(productId);
              onClose();
            }}
            className={`w-full h-12 gap-2 rounded-xl text-base font-semibold ${
              isSelected ? "" : "btn-gradient-red"
            }`}
            variant={isSelected ? "outline" : "default"}
          >
            {isSelected ? (
              <>
                <Check className="w-5 h-5" />
                Quitar de la receta
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Añadir a la receta
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
