import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

interface LegalFooterProps {
  className?: string;
}

export const LegalFooter = ({ className = "" }: LegalFooterProps) => {
  const { openPreferences } = useCookieConsent();

  return (
    <footer className={`py-4 px-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-muted-foreground/60">
        <Link 
          to="/politica-cookies" 
          className="hover:text-muted-foreground transition-colors"
        >
          Política de Cookies
        </Link>
        <span className="hidden sm:inline">•</span>
        <Link 
          to="/politica-privacidad" 
          className="hover:text-muted-foreground transition-colors"
        >
          Política de Privacidad
        </Link>
        <span className="hidden sm:inline">•</span>
        <Link 
          to="/aviso-legal" 
          className="hover:text-muted-foreground transition-colors"
        >
          Aviso Legal
        </Link>
        <span className="hidden sm:inline">•</span>
        <button
          onClick={openPreferences}
          className="inline-flex items-center gap-1 hover:text-muted-foreground transition-colors"
        >
          <Settings2 className="w-3 h-3" />
          Cookies
        </button>
      </div>
    </footer>
  );
};
