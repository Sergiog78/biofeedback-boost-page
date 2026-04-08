import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "393497707987";
const WHATSAPP_MESSAGE = "Ciao! Ho una domanda sul corso di Biofeedback.";

const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatta su WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform duration-200 hover:shadow-xl"
    >
      <MessageCircle className="w-7 h-7 fill-white stroke-white" />
    </a>
  );
};

export default WhatsAppButton;
