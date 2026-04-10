import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Home, AlertCircle, Clock, Barcode, Play, MapPin, Award, CheckCircle2, ShieldCheck } from "lucide-react";
import lacerLogo from "@/assets/lacer-logo-color.png";
import { decodeRecipeData } from "@/lib/recipeUtils";
import { BarcodeDisplay } from "@/components/BarcodeDisplay";
import { RotatePhoneHint } from "@/components/RotatePhoneHint";
import { toast } from "sonner";

interface RecipeProduct {
  id: string;
  name: string;
  reference: string;
  ean?: string | null;
  quantity: number;
  thumbnail_url?: string | null;
  video_urls?: string[] | null;
}

interface ProfileData {
  clinic_name: string | null;
  clinic_address: string | null;
  professional_name: string | null;
  registration_number: string | null;
  signature_url: string | null;
  logo_url: string | null;
}

interface RecipeData {
  id?: string;
  recipe_code?: string;
  patient_name: string;
  products: RecipeProduct[];
  notes: string | null;
  created_at: string;
  isTemporary?: boolean;
  user_id?: string;
  profile?: ProfileData | null;
  dispensed_at?: string | null;
  dispensed_by?: string | null;
}

export default function Recipe() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("n");
  const encodedData = searchParams.get("d");
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dispensing, setDispensing] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("");

  useEffect(() => {
    const loadRecipe = async () => {
      if (encodedData) {
        const decoded = decodeRecipeData(encodedData);
        if (decoded) {
          setRecipe({
            patient_name: decoded.patientName,
            products: decoded.products.map(p => ({
              id: p.id,
              name: p.name,
              reference: p.reference,
              ean: (p as { ean?: string | null }).ean || null,
              quantity: (p as { quantity?: number }).quantity || 1,
              thumbnail_url: p.thumbnail_url,
              video_urls: (p as { video_urls?: string[] | null }).video_urls || null
            })),
            notes: decoded.notes,
            created_at: decoded.date,
            isTemporary: true
          });
          setLoading(false);
          return;
        } else {
          setError("Enlace de receta inválido o expirado");
          setLoading(false);
          return;
        }
      }

      if (!code) {
        setError("Código de receta no proporcionado");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("recipes")
          .select("id, recipe_code, patient_name, products, notes, created_at, user_id, dispensed_at, dispensed_by")
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
                ean: prod.ean ? String(prod.ean) : null,
                quantity: Number(prod.quantity || 1),
                thumbnail_url: prod.thumbnail_url ? String(prod.thumbnail_url) : null,
                video_urls: Array.isArray(prod.video_urls) ? prod.video_urls.map(String) : null
              };
            })
          : [];

        // Fetch professional profile
        let profile: ProfileData | null = null;
        if (data.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("clinic_name, clinic_address, professional_name, registration_number, signature_url, logo_url")
            .eq("user_id", data.user_id)
            .maybeSingle();
          
          profile = profileData;
        }

        setRecipe({
          id: data.id,
          recipe_code: data.recipe_code || undefined,
          patient_name: data.patient_name,
          products,
          notes: data.notes,
          created_at: data.created_at,
          isTemporary: false,
          user_id: data.user_id,
          profile,
          dispensed_at: data.dispensed_at,
          dispensed_by: data.dispensed_by,
        });
      } catch (err) {
        setError("Error al cargar la receta");
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [code, encodedData]);

  const formatDate = (dateString: string) => {
    if (dateString.includes("/")) return dateString;
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const profile = recipe?.profile;
  const hasProfileData = profile && (profile.clinic_name || profile.professional_name || profile.logo_url);

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
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {hasProfileData && profile?.logo_url ? (
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
              <img src={profile.logo_url} alt={profile.clinic_name || "Clínica"} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <img src={lacerLogo} alt="Lacer" className="w-8 h-8 object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">TALONARIO</h1>
            <p className="text-sm text-secondary-foreground/80">DIGITAL</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-4">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-secondary">RECETA LACER</h2>
                {recipe.isTemporary && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    Temporal
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Fecha: {formatDate(recipe.created_at)}
              </p>
            </div>

            {/* Professional info */}
            {hasProfileData && (
              <div className="mt-3 pt-3 border-t border-dashed space-y-1">
                {profile?.professional_name && (
                  <p className="font-semibold text-sm text-foreground">
                    {profile.professional_name}
                    {profile?.registration_number && (
                      <span className="font-normal text-muted-foreground ml-2 inline-flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Nº Col. {profile.registration_number}
                      </span>
                    )}
                  </p>
                )}
                {profile?.clinic_name && (
                  <p className="text-sm text-muted-foreground">{profile.clinic_name}</p>
                )}
                {profile?.clinic_address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.clinic_address}
                  </p>
                )}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            {/* Patient Name */}
            {recipe.patient_name && (
              <div className="pb-2">
                <p className="text-sm text-muted-foreground">Paciente</p>
                <p className="font-semibold text-lg">{recipe.patient_name}</p>
              </div>
            )}

            {/* Products */}
            {recipe.products.map((product, index) => (
              <div 
                key={product.id || index}
                className="p-4 bg-muted/30 rounded-xl border space-y-3"
              >
                <div className="flex gap-4">
                  {product.thumbnail_url && (
                    <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border">
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-foreground">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      CN: {product.reference?.replace(".", "") || "N/A"}
                    </p>
                    {product.ean && (
                      <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                        <Barcode className="w-3 h-3" />
                        EAN: {product.ean}
                      </p>
                    )}
                    {product.quantity > 1 && (
                      <Badge variant="secondary" className="mt-2">
                        Cantidad: {product.quantity}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {product.ean && (
                  <div className="bg-white rounded-lg p-3 flex flex-col items-center border">
                    <BarcodeDisplay 
                      ean={product.ean} 
                      height={45}
                      width={1.8}
                      fontSize={11}
                    />
                  </div>
                )}

                {product.video_urls && product.video_urls.length > 0 && (
                  <div className="space-y-2">
                    <div className="md:hidden">
                      <RotatePhoneHint />
                    </div>
                    {product.video_urls.map((videoUrl, vIdx) => (
                      <div key={vIdx} className="rounded-lg overflow-hidden border bg-black">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={`${videoUrl}?autoplay=0&title=0&byline=0&portrait=0`}
                            className="absolute inset-0 w-full h-full"
                            allow="fullscreen; picture-in-picture; autoplay"
                            allowFullScreen
                            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                            title={`Vídeo de ${product.name}`}
                          />
                        </div>
                        <div className="px-3 py-2 bg-muted/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Play className="w-3.5 h-3.5 text-secondary" />
                            <span className="text-xs text-muted-foreground">
                              Vídeo explicativo de uso
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground/60">
                            Toca ⛶ para pantalla completa
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

            {/* Professional signature */}
            {profile?.signature_url && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">Firma del profesional</p>
                <div className="flex justify-center">
                  <img 
                    src={profile.signature_url} 
                    alt="Firma" 
                    className="max-h-20 object-contain"
                  />
                </div>
                {profile?.professional_name && (
                  <p className="text-center text-sm text-muted-foreground mt-1">
                    {profile.professional_name}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {recipe.isTemporary && (
          <p className="text-center text-xs text-muted-foreground mt-4 px-4">
            Esta es una receta temporal. El enlace dejará de funcionar si se borra el historial del navegador del remitente.
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Generado con Talonario Digital Lacer
        </p>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-secondary text-secondary-foreground py-3 text-center text-xs">
        © {new Date().getFullYear()} Lacer - Talonario Digital
      </footer>
    </div>
  );
}
