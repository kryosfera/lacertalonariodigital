import { useState } from "react";
import { FileText, Play, Scissors, Syringe, BookOpen, X, Share2, Mail, MessageCircle, ExternalLink, Phone, Filter } from "lucide-react";
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

interface WhatsAppShareData {
  type: 'pdf' | 'video';
  title: string;
  message: string;
}

type FilterType = 'all' | 'pdf' | 'video';

const STORAGE_BASE = "https://wvqqoigrslatxnbykcji.supabase.co/storage/v1/object/public/recomendaciones";

const recommendations = [
  {
    id: "cirugia-oral-general",
    title: "Cirugía Oral General",
    description: "Recomendaciones generales tras una cirugía oral",
    icon: Scissors,
    pdfUrl: `${STORAGE_BASE}/docs/Cirugia_Oral_General.pdf`,
    imageUrl: "https://www.lacertalonariodigital.com/archivos/recomendacion-cirujia-p.jpg",
    gradient: "from-secondary to-secondary/80",
    type: 'pdf' as const,
  },
  {
    id: "extracciones-dentales",
    title: "Extracciones Dentales",
    description: "Cuidados posteriores a una extracción dental",
    icon: FileText,
    pdfUrl: `${STORAGE_BASE}/docs/Extracciones.pdf`,
    imageUrl: "https://www.lacertalonariodigital.com/archivos/recomendacion-extraccion-p.jpg",
    gradient: "from-secondary to-secondary/80",
    type: 'pdf' as const,
  },
  {
    id: "injerto-encias",
    title: "Injerto de Encías",
    description: "Recomendaciones tras un injerto de encías",
    icon: Syringe,
    pdfUrl: `${STORAGE_BASE}/docs/Injerto_Encias.pdf`,
    imageUrl: "https://www.lacertalonariodigital.com/archivos/recomendacion-injerto-p.jpg",
    gradient: "from-secondary to-secondary/80",
    type: 'pdf' as const,
  },
];

const videoRecommendation = {
  id: "video-recomendacion",
  title: "Video Recomendaciones",
  description: "Vídeo explicativo con las recomendaciones post-cirugía",
  icon: Play,
  vimeoId: "943145092",
  vimeoHash: "757334f829",
  vimeoUrl: "https://vimeo.com/943145092",
  imageUrl: "https://www.lacertalonariodigital.com/archivos/video_600x600.png",
  gradient: "from-muted-foreground/60 to-muted-foreground/40",
  type: 'video' as const,
};

const filterOptions: { value: FilterType; label: string; icon: typeof FileText }[] = [
  { value: 'all', label: 'Todos', icon: BookOpen },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'video', label: 'Vídeo', icon: Play },
];

export const SurgeryRecommendations = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppShareData | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleOpenPdf = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const getFullUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${window.location.origin}${url}`;
  };

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const formatted = formatPhoneNumber(phone);
    const phoneRegex = /^\+?\d{9,15}$/;
    return phoneRegex.test(formatted);
  };

  const openWhatsAppDialog = (data: WhatsAppShareData) => {
    setWhatsAppData(data);
    setPhoneNumber("");
    setPhoneError("");
    setShowWhatsAppDialog(true);
  };

  const handleShareWhatsApp = (rec: typeof recommendations[0]) => {
    const message = `📋 *Lacer Talonario Digital*\n\n*${rec.title}*\n${rec.description}\n\n📎 Documento: ${getFullUrl(rec.pdfUrl)}\n\n_Enviado desde Lacer Talonario Digital_`;
    openWhatsAppDialog({ type: 'pdf', title: rec.title, message });
  };

  const handleShareVideoWhatsApp = () => {
    const message = `🎬 *Lacer Talonario Digital*\n\n*Recomendaciones Post-Cirugía Oral*\nVídeo explicativo con los cuidados necesarios tras una cirugía oral.\n\n▶️ Ver video: ${videoRecommendation.vimeoUrl}\n\n_Enviado desde Lacer Talonario Digital_`;
    openWhatsAppDialog({ type: 'video', title: 'Video Recomendaciones', message });
  };

  const confirmWhatsAppShare = () => {
    if (!whatsAppData) return;
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedPhone)) {
      setPhoneError("Introduce un número de teléfono válido (mín. 9 dígitos)");
      return;
    }
    const cleanPhone = formattedPhone.startsWith('+') ? formattedPhone.slice(1) : formattedPhone;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppData.message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setShowWhatsAppDialog(false);
    setPhoneNumber("");
    setPhoneError("");
  };

  const handleShareEmail = (rec: typeof recommendations[0]) => {
    const subject = `Lacer Talonario Digital - Recomendaciones: ${rec.title}`;
    const body = `Estimado/a paciente,\n\nDesde Lacer Talonario Digital le compartimos las recomendaciones de ${rec.title}.\n\n${rec.description}\n\nPuede consultar el documento en el siguiente enlace:\n${getFullUrl(rec.pdfUrl)}\n\nAtentamente,\nSu equipo dental\n\n---\nLacer Talonario Digital`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareVideoEmail = () => {
    const subject = "Lacer Talonario Digital - Recomendaciones Post-Cirugía Oral";
    const body = `Estimado/a paciente,\n\nDesde Lacer Talonario Digital le compartimos el vídeo con las recomendaciones post-cirugía oral.\n\nPuede verlo en el siguiente enlace:\n${videoRecommendation.vimeoUrl}\n\nAtentamente,\nSu equipo dental\n\n---\nLacer Talonario Digital`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const showPdfs = activeFilter === 'all' || activeFilter === 'pdf';
  const showVideo = activeFilter === 'all' || activeFilter === 'video';

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Compact Header */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              Recomendaciones
            </h2>
            <p className="text-xs text-muted-foreground">
              Material para tus pacientes
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* PDF Cards */}
          {showPdfs && recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <Card
                key={rec.id}
                className="group overflow-hidden border-border/50 hover:border-secondary/30 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={rec.imageUrl}
                      alt={rec.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className={`absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-gradient-to-br ${rec.gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-medium text-white">
                      PDF
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <h4 className="font-semibold text-foreground text-xs leading-tight line-clamp-2">
                      {rec.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 hidden sm:block">
                      {rec.description}
                    </p>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 text-[10px] h-7 px-2"
                        onClick={() => handleOpenPdf(rec.pdfUrl)}
                      >
                        <ExternalLink className="w-3 h-3" />
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

          {/* Video Card – same grid */}
          {showVideo && (
            <Card
              className="group overflow-hidden border-border/50 hover:border-secondary/30 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            >
              <CardContent className="p-0">
                {/* Image */}
                <div
                  className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setShowVideoModal(true)}
                >
                  <img
                    src={videoRecommendation.imageUrl}
                    alt={videoRecommendation.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-secondary ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-medium text-white">
                    Vídeo
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <h4 className="font-semibold text-foreground text-xs leading-tight line-clamp-2">
                    {videoRecommendation.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 hidden sm:block">
                    {videoRecommendation.description}
                  </p>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 text-[10px] h-7 px-2"
                      onClick={() => setShowVideoModal(true)}
                    >
                      <Play className="w-3 h-3" />
                      Ver
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
                        <DropdownMenuItem onClick={handleShareVideoWhatsApp} className="gap-2 cursor-pointer">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          Compartir por WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShareVideoEmail} className="gap-2 cursor-pointer">
                          <Mail className="w-4 h-4 text-secondary" />
                          Enviar por Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* WhatsApp Phone Dialog */}
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
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono del paciente
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+34 612 345 678"
                  value={phoneNumber}
                  onChange={(e) => { setPhoneNumber(e.target.value); setPhoneError(""); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmWhatsAppShare(); }}
                  className="pl-10"
                  maxLength={20}
                />
              </div>
              {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
              <p className="text-xs text-muted-foreground">
                Incluye el código de país (ej: +34 para España)
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmWhatsAppShare} className="gap-2 bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-4 h-4" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-background rounded-xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src={`https://player.vimeo.com/video/${videoRecommendation.vimeoId}?h=${videoRecommendation.vimeoHash}&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                title="Lacer - Recomendaciones Post-Cirugía Oral"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
