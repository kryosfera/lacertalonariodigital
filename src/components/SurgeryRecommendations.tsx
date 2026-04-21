import { useMemo, useState } from "react";
import { FileText, Play, Scissors, Syringe, BookOpen, X, Share2, Mail, MessageCircle, ExternalLink, Phone, Filter, Smartphone, Stethoscope, HeartPulse, Pill, Activity, ClipboardList, Link as LinkIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecommendations, type Recommendation } from "@/hooks/useRecommendations";

interface WhatsAppShareData {
  type: 'pdf' | 'video' | 'link';
  title: string;
  message: string;
}

type FilterType = 'all' | 'pdf' | 'video' | 'link';

const ICONS: Record<string, any> = {
  Scissors, FileText, Syringe, Play, BookOpen, Stethoscope, HeartPulse, Pill, Activity, ClipboardList, Link: LinkIcon,
};

const filterOptions: { value: FilterType; label: string; icon: typeof FileText }[] = [
  { value: 'all', label: 'Todos', icon: BookOpen },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'video', label: 'Vídeo', icon: Play },
  { value: 'link', label: 'Enlace', icon: LinkIcon },
];

export const SurgeryRecommendations = () => {
  const { data: items, isLoading } = useRecommendations(false);

  const [activeVideo, setActiveVideo] = useState<Recommendation | null>(null);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppShareData | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (!items) return [];
    if (activeFilter === 'all') return items;
    return items.filter(i => i.kind === activeFilter);
  }, [items, activeFilter]);

  const getResourceUrl = (rec: Recommendation): string => {
    if (rec.kind === 'pdf') return rec.pdf_url ?? '';
    if (rec.kind === 'video') return rec.vimeo_url ?? '';
    return rec.external_url ?? '';
  };

  const getFullUrl = (url: string) => url.startsWith('http') ? url : `${window.location.origin}${url}`;

  const formatPhoneNumber = (phone: string) => phone.replace(/[^\d+]/g, '');
  const validatePhoneNumber = (phone: string) => /^\+?\d{9,15}$/.test(formatPhoneNumber(phone));

  const openWhatsAppDialog = (data: WhatsAppShareData) => {
    setWhatsAppData(data);
    setPhoneNumber("");
    setPhoneError("");
    setShowWhatsAppDialog(true);
  };

  const handleShareWhatsApp = (rec: Recommendation) => {
    const url = getResourceUrl(rec);
    const emoji = rec.kind === 'video' ? '🎬' : rec.kind === 'link' ? '🔗' : '📋';
    const verb = rec.kind === 'video' ? '▶️ Ver vídeo' : '📎 Documento';
    const message = `${emoji} *Lacer Talonario Digital*\n\n*${rec.title}*\n${rec.description ?? ''}\n\n${verb}: ${getFullUrl(url)}\n\n_Enviado desde Lacer Talonario Digital_`;
    openWhatsAppDialog({ type: rec.kind, title: rec.title, message });
  };

  const confirmWhatsAppShare = () => {
    if (!whatsAppData) return;
    const formatted = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formatted)) {
      setPhoneError("Introduce un número de teléfono válido (mín. 9 dígitos)");
      return;
    }
    const cleanPhone = formatted.startsWith('+') ? formatted.slice(1) : formatted;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppData.message)}`, "_blank", "noopener,noreferrer");
    setShowWhatsAppDialog(false);
    setPhoneNumber("");
    setPhoneError("");
  };

  const handleShareEmail = (rec: Recommendation) => {
    const url = getResourceUrl(rec);
    const subject = `Lacer Talonario Digital - ${rec.title}`;
    const body = `Estimado/a paciente,\n\nDesde Lacer Talonario Digital le compartimos: ${rec.title}.\n\n${rec.description ?? ''}\n\nPuede consultarlo en el siguiente enlace:\n${getFullUrl(url)}\n\nAtentamente,\nSu equipo dental\n\n---\nLacer Talonario Digital`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const openResource = (rec: Recommendation) => {
    if (rec.kind === 'video') {
      setActiveVideo(rec);
    } else {
      const url = getResourceUrl(rec);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const typeLabel = (k: string) => k === 'pdf' ? 'PDF' : k === 'video' ? 'Vídeo' : 'Enlace';

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Compact Header */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">Recomendaciones</h2>
            <p className="text-xs text-muted-foreground">Material para tus pacientes</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No hay recomendaciones disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {filtered.map((rec) => {
              const Icon = ICONS[rec.icon ?? 'FileText'] ?? FileText;
              const isVideo = rec.kind === 'video';
              return (
                <Card
                  key={rec.id}
                  className="group overflow-hidden border-border/50 hover:border-secondary/30 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                >
                  <CardContent className="p-0">
                    <div
                      className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer"
                      onClick={() => openResource(rec)}
                    >
                      {rec.image_url ? (
                        <img
                          src={rec.image_url}
                          alt={rec.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                          <Icon className="w-10 h-10 text-secondary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-md">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-secondary ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-medium text-white">
                        {typeLabel(rec.kind)}
                      </div>
                    </div>

                    <div className="p-3 space-y-2">
                      <h4 className="font-semibold text-foreground text-sm leading-tight">{rec.title}</h4>
                      {rec.description && <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>}
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="flex-1 gap-1 text-[10px] h-7 px-2"
                          onClick={() => openResource(rec)}>
                          {isVideo ? <Play className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                          Ver
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
                            <DropdownMenuItem onClick={() => handleShareWhatsApp(rec)} className="gap-2 cursor-pointer">
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              Compartir por WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShareEmail(rec)} className="gap-2 cursor-pointer">
                              <Mail className="w-4 h-4 text-secondary" />
                              Enviar por Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Compartir por WhatsApp
            </DialogTitle>
            <DialogDescription>
              Introduce el número de teléfono del paciente para enviar "{whatsAppData?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Teléfono del paciente</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone" type="tel" placeholder="+34 612 345 678"
                  value={phoneNumber}
                  onChange={(e) => { setPhoneNumber(e.target.value); setPhoneError(""); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmWhatsAppShare(); }}
                  className="pl-10" maxLength={20}
                />
              </div>
              {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
              <p className="text-xs text-muted-foreground">Incluye el código de país (ej: +34 para España)</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>Cancelar</Button>
            <Button onClick={confirmWhatsAppShare} className="gap-2 bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-4 h-4" /> Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      {activeVideo && activeVideo.vimeo_id && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-background rounded-xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex md:hidden items-center justify-center gap-2 px-4 py-2.5 bg-secondary/10 border-b border-secondary/20 landscape:hidden">
              <div className="animate-rotate-phone">
                <Smartphone className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-xs text-secondary font-medium">Gira el móvil para una mejor experiencia</span>
            </div>

            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src={`https://player.vimeo.com/video/${activeVideo.vimeo_id}${activeVideo.vimeo_hash ? `?h=${activeVideo.vimeo_hash}` : ''}&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                title={activeVideo.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
