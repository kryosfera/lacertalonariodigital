import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, AlertCircle } from "lucide-react";
import { getShortUrlData } from "@/lib/recipeUtils";

export default function ShortRecipe() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!code) {
        setError(true);
        setLoading(false);
        return;
      }

      const data = await getShortUrlData(code);
      
      if (data) {
        // Encode the data and redirect to the recipe page
        const minimalData = {
          p: data.patientName,
          d: data.date,
          n: data.notes,
          pr: data.products.map(p => ({
            i: p.id,
            n: p.name,
            r: p.reference,
            e: (p as { ean?: string | null }).ean || null,
            q: p.quantity || 1,
            t: p.thumbnail_url,
            v: p.video_urls && p.video_urls.length > 0 ? p.video_urls : undefined
          }))
        };
        const encoded = btoa(encodeURIComponent(JSON.stringify(minimalData)));
        setRedirectUrl(`/receta?d=${encoded}`);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    loadRecipe();
  }, [code]);

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

  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Enlace no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            El enlace de la receta no es válido o ha expirado.
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
