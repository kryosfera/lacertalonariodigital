import { useState, useRef, useEffect } from "react";
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
  Image as ImageIcon, Signature, PenTool, RotateCcw, MapPin, ChevronsUpDown, LogOut,
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

interface SectionCardProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SectionCard = ({ icon, iconBg = "bg-primary/10 text-primary", title, description, children }: SectionCardProps) => (
  <section className="bg-card rounded-2xl border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
    <header className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-sm text-foreground leading-tight">{title}</h2>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug break-words">{description}</p>
        )}
      </div>
    </header>
    <div className="p-4">{children}</div>
  </section>
);

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
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });
    await handleImageUpload(file, 'signature');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'logo') setLogoPreview(reader.result as string);
        else setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    <div className="screen-wrapper">
      {/* Header */}
      <div className="screen-header">
        <h1 className="screen-title">Perfil</h1>
        <p className="screen-subtitle">Configuración de tu cuenta</p>
      </div>

      {/* Content */}
      <div className="screen-body space-y-2 max-w-2xl mx-auto w-full">
        {/* Account */}
        <SectionCard
          icon={<User className="w-4 h-4" />}
          title="Cuenta"
          description={user?.email ?? ""}
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 text-xs"
              onClick={async () => { switchToBasic(); await signOut(); }}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Cerrar sesión
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-8 text-xs"
              onClick={() => {
                localStorage.removeItem("onboarding_pro_done");
                localStorage.removeItem("onboarding_basic_done");
                window.location.reload();
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Repetir tutorial
            </Button>
          </div>
        </SectionCard>

        {/* Clinic */}
        <SectionCard
          icon={<Building2 className="w-4 h-4" />}
          title="Datos de la clínica"
          description="Esta información aparecerá en tus recetas"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="clinic_name" className="text-xs">Nombre de la clínica</Label>
              <Input
                id="clinic_name"
                placeholder="Clínica Dental..."
                value={formData.clinic_name}
                onChange={(e) => handleInputChange('clinic_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clinic_address" className="text-xs">Dirección</Label>
              <Textarea
                id="clinic_address"
                placeholder="Calle, número..."
                value={formData.clinic_address}
                onChange={(e) => handleInputChange('clinic_address', e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="locality" className="text-xs flex items-center gap-1.5">
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
              <div className="space-y-1.5">
                <Label htmlFor="province" className="text-xs">Provincia</Label>
                <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="province"
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={provinceOpen}
                      className={cn(
                        "w-full justify-between font-normal h-10",
                        !formData.province && "text-muted-foreground"
                      )}
                    >
                      <span className="truncate">{formData.province || "Selecciona una provincia"}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar provincia..." />
                      <CommandList>
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup>
                          {SPAIN_PROVINCES.map((p) => (
                            <CommandItem
                              key={p}
                              value={p}
                              onSelect={(val) => {
                                const match = SPAIN_PROVINCES.find(
                                  (x) => x.toLowerCase() === val.toLowerCase()
                                );
                                handleInputChange('province', match || p);
                                setProvinceOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.province === p ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {p}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="professional_name" className="text-xs">Nombre del profesional</Label>
                <Input
                  id="professional_name"
                  placeholder="Dr. Juan García"
                  value={formData.professional_name}
                  onChange={(e) => handleInputChange('professional_name', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="registration_number" className="text-xs">Nº Colegiado</Label>
                <Input
                  id="registration_number"
                  placeholder="12345"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Logo */}
        <SectionCard
          icon={<ImageIcon className="w-4 h-4" />}
          
          title="Logotipo"
          description="Se mostrará en el encabezado de tus recetas"
        >
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'logo')}
          />
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="w-20 h-20 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-center overflow-hidden shrink-0">
                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-center shrink-0">
                <ImageIcon className="w-7 h-7 text-muted-foreground/50" />
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-9 text-xs"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadImage.isPending}
            >
              {uploadImage.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 mr-1.5" />
              )}
              Subir logo
            </Button>
          </div>
        </SectionCard>

        {/* Signature */}
        <SectionCard
          icon={<Signature className="w-4 h-4" />}
          title="Firma digital"
          description="Se añadirá automáticamente a tus recetas"
        >
          <div className="space-y-4">
            {signaturePreview && (
              <div className="flex items-center gap-3">
                <div className="w-40 h-20 rounded-xl border border-border/40 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <img src={signaturePreview} alt="Firma" className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[11px] text-muted-foreground">Firma actual</span>
              </div>
            )}

            <Tabs defaultValue="draw" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="draw" className="text-xs">
                  <PenTool className="w-3.5 h-3.5 mr-1" />
                  Dibujar
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs">
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Subir archivo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="draw" className="mt-3">
                <SignaturePad onSave={handleSignaturePadSave} />
                <p className="text-[11px] text-muted-foreground mt-2">
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
                  size="sm"
                  className="rounded-full h-9 text-xs"
                  onClick={() => signatureInputRef.current?.click()}
                  disabled={uploadImage.isPending}
                >
                  {uploadImage.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Subir imagen de firma
                </Button>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Tip: Firma en papel blanco, hazle una foto y súbela aquí
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </SectionCard>

        {/* Save Button */}
        {hasChanges && (
          <div className="sticky bottom-20 md:bottom-4 flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={upsertProfile.isPending}
              className="shadow-lg rounded-full"
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
    </div>
  );
};
