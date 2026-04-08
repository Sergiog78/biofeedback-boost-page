import { MessageCircle } from "lucide-react";
import { useState } from "react";

const WHATSAPP_NUMBER = "393497707987";
const WHATSAPP_MESSAGE = "Ciao! Ho una domanda sul corso di Biofeedback.";

const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="fixed bottom-20 right-[calc(env(safe-area-inset-right)+2rem)] sm:right-4 z-40 flex items-center gap-3">
      {/* Tooltip / messaggio */}
      {!dismissed && (
        <div className="relative bg-white text-foreground text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-border max-w-[200px] leading-snug animate-fade-in">
          Hai qualche dubbio? Siamo qui per risponderti!
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs hover:bg-muted-foreground hover:text-white transition-colors"
            aria-label="Chiudi"
          >
            ✕
          </button>
          {/* Arrow */}
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white" />
        </div>
      )}

      {/* Pulsante WhatsApp */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatta su WhatsApp"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform duration-200 hover:shadow-xl shrink-0"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-white" />
      </a>
    </div>
  );
};

export default WhatsAppButton;
