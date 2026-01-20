import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, AlertCircle } from "lucide-react";
import lacerLogo from "@/assets/lacer-logo-color.png";

interface RecipeProduct {
  id: string;
  name: string;
  reference: string;
  quantity: number;
  thumbnail_url?: string | null;
}

interface RecipeData {
  id: string;
  recipe_code: string;
  patient_name: string;
  products: RecipeProduct[];
  notes: string | null;
  created_at: string;
}

export default function Recipe() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("n");
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!code) {
        setError("Código de receta no proporcionado");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("recipes")
          .select("id, recipe_code, patient_name, products, notes, created_at")
          .eq("recipe_code", code)
          .single();

        if (fetchError || !data) {
          setError("Receta no encontrada");
          setLoading(false);
          return;
        }

        // Parse products JSON
        const rawProducts = data.products;
        const products: RecipeProduct[] = Array.isArray(rawProducts) 
          ? rawProducts.map((p: unknown) => {
              const prod = p as Record<string, unknown>;
              return {
                id: String(prod.id || ''),
                name: String(prod.name || ''),
                reference: String(prod.reference || ''),
                quantity: Number(prod.quantity || 1),
                thumbnail_url: prod.thumbnail_url ? String(prod.thumbnail_url) : null
              };
            })
          : [];

        setRecipe({
          ...data,
          products
        });
      } catch (err) {
        setError("Error al cargar la receta");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [code]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="h-8 w-1/2 mb-8" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Receta no encontrada</h2>
            <p className="text-muted-foreground mb-6">
              {error || "El código de receta no es válido o ha expirado."}
            </p>
            <Link to="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-white py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <img src={lacerLogo} alt="Lacer" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TALONARIO</h1>
            <p className="text-sm text-white/80">DIGITAL</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-4">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-secondary">RECETA LACER</h2>
              <p className="text-sm text-muted-foreground">
                Fecha: {formatDate(recipe.created_at)}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            {/* Products */}
            {recipe.products.map((product, index) => (
              <div 
                key={product.id || index}
                className="flex gap-4 p-4 bg-muted/30 rounded-xl border"
              >
                {product.thumbnail_url && (
                  <div className="w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden border">
                    <img 
                      src={product.thumbnail_url} 
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    CN: {product.reference?.replace(".", "") || "N/A"}
                  </p>
                  {product.quantity > 1 && (
                    <p className="text-sm text-secondary font-medium mt-1">
                      Cantidad: {product.quantity}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Notes */}
            {recipe.notes && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Comentarios:
                </h4>
                <p className="text-foreground">{recipe.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Generado con Talonario Digital Lacer
        </p>
      </main>

      {/* Footer bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-secondary text-white py-3 text-center text-xs">
        © {new Date().getFullYear()} Lacer - Talonario Digital
      </footer>
    </div>
  );
}
