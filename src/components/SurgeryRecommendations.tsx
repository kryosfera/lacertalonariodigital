import { useMemo, useState } from "react";
import { FileText, Play, Scissors, Syringe, BookOpen, X, Share2, Mail, MessageCircle, ExternalLink, Phone, Smartphone, Stethoscope, HeartPulse, Pill, Activity, ClipboardList, Link as LinkIcon, Loader2, LayoutGrid, List } from "lucide-react";
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
import { cn } from "@/lib/utils";
import lacerLogo from "@/assets/lacer-logo-color.png";

interface WhatsAppShareData {
  type: 'pdf' | 'video' | 'link';
  title: string;
  message: string;
}

type FilterType = 'all' | 'pdf' | 'video' | 'link';

const ICONS: Record<string, any> = {
  Scissors, FileText, Syringe, Play, BookOpen, Stethoscope, HeartPulse, Pill, Activity, ClipboardList, Link: LinkIcon,
};

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Vídeo' },
  { value: 'link', label: 'Enlace' },
];

export const SurgeryRecommendations = () => {
  const { data: items, isLoading } = useRecommendations(false);

  const [activeVideo, setActiveVideo] = useState<Recommendation | null>(null);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppShareData | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

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
    <div className="space-y-6 pb-24 md:pb-8 pt-safe">
      {/* Header */}
      <div className="px-5 pt-4 text-center">
        <div className="flex justify-center mb-4">
          <img src={lacerLogo} alt="Lacer" className="h-7 md:h-9 w-auto" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none">
          Recomendaciones
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Material para tus pacientes
        </p>

        {/* Filters + view toggle on one line */}
        <div className="flex items-center gap-2 mt-5">
          <div className="flex gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none">
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={cn(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 active:scale-95",
                    isActive
                      ? "border-primary text-primary bg-background shadow-sm"
                      : "border-border text-muted-foreground bg-background hover:border-muted-foreground/40"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* View mode toggle */}
          <div className="shrink-0 flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                viewMode === 'card' ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              )}
              aria-label="Vista tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                viewMode === 'list' ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              )}
              aria-label="Vista lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No hay recomendaciones disponibles.</p>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((rec) => {
              const Icon = ICONS[rec.icon ?? 'FileText'] ?? FileText;
              const isVideo = rec.kind === 'video';
              return (
                <article
                  key={rec.id}
                  className="group bg-card rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-border/40"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-[16/10] overflow-hidden bg-muted cursor-pointer"
                    onClick={() => openResource(rec)}
                  >
                    {rec.image_url ? (
                      <img
                        src={rec.image_url}
                        alt={rec.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Icon className="w-10 h-10 text-primary/40" />
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-background/90 backdrop-blur-md text-[10px] font-semibold text-foreground shadow-sm">
                      {typeLabel(rec.kind)}
                    </div>

                    {/* Video play overlay */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-background/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-primary ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="space-y-1 min-h-[56px]">
                      <h3 className="font-bold text-base text-foreground leading-tight tracking-tight line-clamp-1">
                        {rec.title}
                      </h3>
                      {rec.description && (
                        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                          {rec.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openResource(rec)}
                        className="flex-1 h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5 shadow-sm"
                      >
                        {isVideo ? (
                          <Play className="w-3.5 h-3.5" fill="currentColor" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        Ver
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="w-9 h-9 rounded-full border border-primary/40 text-primary hover:bg-primary/5 flex items-center justify-center transition-colors active:scale-95"
                            aria-label="Compartir"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
                          <DropdownMenuItem onClick={() => handleShareWhatsApp(rec)} className="gap-2 cursor-pointer">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            Compartir por WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareEmail(rec)} className="gap-2 cursor-pointer">
                            <Mail className="w-4 h-4 text-primary" />
                            Enviar por Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          // LIST VIEW
          <div className="flex flex-col gap-2">
            {filtered.map((rec) => {
              const isVideo = rec.kind === 'video';
              return (
                <article
                  key={rec.id}
                  className="group bg-card rounded-2xl border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 px-4 py-3"
                >
                  {/* Title row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {typeLabel(rec.kind)}
                    </span>
                    <h3 className="font-semibold text-sm text-foreground leading-tight flex-1">
                      {rec.title}
                    </h3>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openResource(rec)}
                      className="flex-1 h-9 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary/90 active:scale-95"
                    >
                      {isVideo ? (
                        <Play className="w-3.5 h-3.5" fill="currentColor" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      Ver
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="h-9 px-4 rounded-full border border-primary/40 text-primary text-xs font-semibold hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                          aria-label="Compartir"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Compartir
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
                        <DropdownMenuItem onClick={() => handleShareWhatsApp(rec)} className="gap-2 cursor-pointer">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          Compartir por WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareEmail(rec)} className="gap-2 cursor-pointer">
                          <Mail className="w-4 h-4 text-primary" />
                          Enviar por Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </article>
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

            <div className="flex md:hidden items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 border-b border-primary/20 landscape:hidden">
              <div className="animate-rotate-phone">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-primary font-medium">Gira el móvil para una mejor experiencia</span>
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
