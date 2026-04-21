import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { 
  Building2, User, Upload, Loader2, Check, 
  Image as ImageIcon, Signature, PenTool, RotateCcw, MapPin, ChevronsUpDown
} from "lucide-react";
import { useProfile, useUpsertProfile, useUploadProfileImage } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useUserMode } from "@/hooks/useUserMode";
import { SignaturePad } from "@/components/SignaturePad";

const SPAIN_PROVINCES = [
  "A Coruña","Álava","Albacete","Alicante","Almería","Asturias","Ávila","Badajoz",
  "Baleares","Barcelona","Burgos","Cáceres","Cádiz","Cantabria","Castellón","Ceuta",
  "Ciudad Real","Córdoba","Cuenca","Girona","Granada","Guadalajara","Gipuzkoa","Huelva",
  "Huesca","Jaén","La Rioja","Las Palmas","León","Lleida","Lugo","Madrid","Málaga",
  "Melilla","Murcia","Navarra","Ourense","Palencia","Pontevedra","Salamanca",
  "Santa Cruz de Tenerife","Segovia","Sevilla","Soria","Tarragona","Teruel","Toledo",
  "Valencia","Valladolid","Bizkaia","Zamora","Zaragoza"
];

export const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { switchToBasic } = useUserMode();
  const { data: profile, isLoading } = useProfile();
  const upsertProfile = useUpsertProfile();
  const uploadImage = useUploadProfileImage();

  const [formData, setFormData] = useState({
    clinic_name: "",
    clinic_address: "",
    locality: "",
    province: "",
    professional_name: "",
    registration_number: ""
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [provinceOpen, setProvinceOpen] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        clinic_name: profile.clinic_name || "",
        clinic_address: profile.clinic_address || "",
        locality: profile.locality || "",
        province: profile.province || "",
        professional_name: profile.professional_name || "",
        registration_number: profile.registration_number || ""
      });
      setLogoPreview(profile.logo_url);
      setSignaturePreview(profile.signature_url);
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'signature') => {
    const url = await uploadImage.mutateAsync({ file, type });
    
    if (type === 'logo') {
      setLogoPreview(url);
      await upsertProfile.mutateAsync({ logo_url: url });
    } else {
      setSignaturePreview(url);
      await upsertProfile.mutateAsync({ signature_url: url });
    }
  };

  const handleSignaturePadSave = async (dataUrl: string) => {
    // Convert data URL to File
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });
    await handleImageUpload(file, 'signature');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setSignaturePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Upload
      handleImageUpload(file, type);
    }
  };

  const handleSave = async () => {
    await upsertProfile.mutateAsync(formData);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Cuenta</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" onClick={async () => { switchToBasic(); await signOut(); }}>
            Cerrar sesión
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              localStorage.removeItem("onboarding_pro_done");
              localStorage.removeItem("onboarding_basic_done");
              window.location.reload();
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Repetir tutorial
          </Button>
        </CardContent>
      </Card>

      {/* Clinic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <CardTitle>Datos de la Clínica</CardTitle>
              <CardDescription>Esta información aparecerá en tus recetas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinic_name">Nombre de la clínica</Label>
            <Input
              id="clinic_name"
              placeholder="Clínica Dental..."
              value={formData.clinic_name}
              onChange={(e) => handleInputChange('clinic_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic_address">Dirección</Label>
            <Textarea
              id="clinic_address"
              placeholder="Calle, número..."
              value={formData.clinic_address}
              onChange={(e) => handleInputChange('clinic_address', e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locality" className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Localidad
              </Label>
              <Input
                id="locality"
                placeholder="Madrid, Sevilla..."
                value={formData.locality}
                onChange={(e) => handleInputChange('locality', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Select
                value={formData.province || undefined}
                onValueChange={(v) => handleInputChange('province', v)}
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Selecciona una provincia" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SPAIN_PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="professional_name">Nombre del profesional</Label>
              <Input
                id="professional_name"
                placeholder="Dr. Juan García"
                value={formData.professional_name}
                onChange={(e) => handleInputChange('professional_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Nº Colegiado</Label>
              <Input
                id="registration_number"
                placeholder="12345"
                value={formData.registration_number}
                onChange={(e) => handleInputChange('registration_number', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle>Logotipo</CardTitle>
              <CardDescription>Se mostrará en el encabezado de tus recetas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'logo')}
          />
          
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="w-24 h-24 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden">
                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg border border-dashed bg-muted/20 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadImage.isPending}
            >
              {uploadImage.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Subir logo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Signature className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Firma Digital</CardTitle>
              <CardDescription>Se añadirá automáticamente a tus recetas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {signaturePreview && (
            <div className="flex items-center gap-4">
              <div className="w-48 h-24 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                <img src={signaturePreview} alt="Firma" className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-xs text-muted-foreground">Firma actual</span>
            </div>
          )}

          <Tabs defaultValue="draw" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw">
                <PenTool className="w-4 h-4 mr-1" />
                Dibujar
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-1" />
                Subir archivo
              </TabsTrigger>
            </TabsList>
            <TabsContent value="draw" className="mt-3">
              <SignaturePad onSave={handleSignaturePadSave} />
              <p className="text-xs text-muted-foreground mt-2">
                Usa el dedo, un stylus o el ratón para dibujar tu firma
              </p>
            </TabsContent>
            <TabsContent value="upload" className="mt-3">
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'signature')}
              />
              <Button 
                variant="outline" 
                onClick={() => signatureInputRef.current?.click()}
                disabled={uploadImage.isPending}
              >
                {uploadImage.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Subir imagen de firma
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Firma en papel blanco, hazle una foto y súbela aquí
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={upsertProfile.isPending}
            className="shadow-lg"
          >
            {upsertProfile.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </div>
      )}
    </div>
  );
};
