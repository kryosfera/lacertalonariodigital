import { useState } from "react";
import { FileText, Play, Scissors, Syringe, BookOpen, X, Share2, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const recommendations = [
  {
    id: "cirugia-oral-general",
    title: "Cirugía Oral General",
    description: "Recomendaciones generales tras una cirugía oral",
    icon: Scissors,
    pdfUrl: "/docs/Cirugia_Oral_General.pdf",
    imageUrl: "https://www.lacertalonariodigital.com/archivos/recomendacion-cirujia-p.jpg",
    gradient: "from-primary to-primary/80",
  },
  {
    id: "extracciones-dentales",
    title: "Extracciones Dentales",
    description: "Cuidados posteriores a una extracción dental",
    icon: FileText,
    pdfUrl: "/docs/Extracciones.pdf",
    imageUrl: "https://www.lacertalonariodigital.com/archivos/recomendacion-extraccion-p.jpg",
    gradient: "from-secondary to-secondary/80",
  },
  {
    id: "injerto-encias",
    title: "Injerto de Encías",
    description: "Recomendaciones tras un injerto de encías",
    icon: Syringe,
    pdfUrl: "/docs/Injerto_Encias.pdf",
    imageUrl: "https://www.lacertalonariodigital.com/archivos/recomendacion-injerto-p.jpg",
    gradient: "from-success to-success/80",
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
};

export const SurgeryRecommendations = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleOpenPdf = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const getFullUrl = (path: string) => {
    return `${window.location.origin}${path}`;
  };

  const handleShareWhatsApp = (rec: typeof recommendations[0]) => {
    const message = `📋 *${rec.title}*\n\n${rec.description}\n\n📎 Documento: ${getFullUrl(rec.pdfUrl)}\n\n_Enviado desde Lacer Talonario Digital_`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareEmail = (rec: typeof recommendations[0]) => {
    const subject = `Recomendaciones: ${rec.title}`;
    const body = `Estimado/a paciente,\n\nAdjunto le comparto las recomendaciones de ${rec.title}.\n\n${rec.description}\n\nPuede consultar el documento en el siguiente enlace:\n${getFullUrl(rec.pdfUrl)}\n\nAtentamente,\nSu equipo dental`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleShareVideoWhatsApp = () => {
    const message = `🎬 *Recomendaciones Post-Cirugía Oral*\n\nVídeo explicativo con los cuidados necesarios tras una cirugía oral.\n\n▶️ Ver video: ${videoRecommendation.vimeoUrl}\n\n_Enviado desde Lacer Talonario Digital_`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareVideoEmail = () => {
    const subject = "Recomendaciones Post-Cirugía Oral - Vídeo explicativo";
    const body = `Estimado/a paciente,\n\nLe comparto el vídeo con las recomendaciones post-cirugía oral.\n\nPuede verlo en el siguiente enlace:\n${videoRecommendation.vimeoUrl}\n\nAtentamente,\nSu equipo dental`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="relative mx-4 rounded-3xl overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/30 rounded-full blur-xl transform -translate-x-6 translate-y-6" />
        
        {/* Content */}
        <div className="relative px-5 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Recomendaciones Post-Cirugía
              </h2>
              <p className="text-white/80 text-sm">
                Documentos para entregar a tus pacientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="px-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Documentos PDF
        </h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            
            return (
              <Card 
                key={rec.id}
                className="group overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-32 overflow-hidden bg-muted">
                    <img 
                      src={rec.imageUrl} 
                      alt={rec.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${rec.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm leading-tight">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-xs"
                        onClick={() => handleOpenPdf(rec.pdfUrl)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver PDF
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => handleShareWhatsApp(rec)}
                            className="gap-2 cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            Compartir por WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleShareEmail(rec)}
                            className="gap-2 cursor-pointer"
                          >
                            <Mail className="w-4 h-4 text-primary" />
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
      </div>

      {/* Video Section */}
      <div className="px-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Video Informativo
        </h3>
        
        <Card 
          className="group overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-200 hover:shadow-lg"
        >
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              {/* Video Thumbnail */}
              <div 
                className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                onClick={() => setShowVideoModal(true)}
              >
                <img 
                  src={videoRecommendation.imageUrl} 
                  alt={videoRecommendation.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-secondary ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 py-4 pr-4">
                <h4 className="font-semibold text-foreground text-sm leading-tight">
                  {videoRecommendation.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {videoRecommendation.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 gap-1.5 text-xs text-primary"
                    onClick={() => setShowVideoModal(true)}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Ver video
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1.5 text-xs"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Compartir
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem 
                        onClick={handleShareVideoWhatsApp}
                        className="gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        Compartir por WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleShareVideoEmail}
                        className="gap-2 cursor-pointer"
                      >
                        <Mail className="w-4 h-4 text-primary" />
                        Enviar por Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Modal with animation */}
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
