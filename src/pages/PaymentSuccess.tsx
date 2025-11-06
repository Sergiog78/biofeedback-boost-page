import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Home, Mail } from "lucide-react";
import bfeLogo from "@/assets/bfe-logo-text.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Send confirmation email
    const sendConfirmationEmail = async () => {
      if (!sessionId || emailSent) return;

      try {
        console.log("Sending confirmation email for session:", sessionId);
        
        const { data, error } = await supabase.functions.invoke("send-confirmation-email", {
          body: { sessionId },
        });

        if (error) {
          console.error("Error sending confirmation email:", error);
          return;
        }

        console.log("Confirmation email sent successfully:", data);
        setEmailSent(true);
      } catch (error) {
        console.error("Error invoking send-confirmation-email function:", error);
      }
    };

    sendConfirmationEmail();
  }, [sessionId, emailSent]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500/10 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-center px-4">
          <img 
            src={bfeLogo} 
            alt="BFE Logo" 
            className="h-8 opacity-80"
          />
        </div>
      </header>

      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card className="border-2 border-green-500/20">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-3xl">Pagamento completato!</CardTitle>
            <p className="text-muted-foreground">
              La tua iscrizione al corso è stata confermata con successo.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Controlla la tua email</h3>
                  <p className="text-sm text-muted-foreground">
                    Ti abbiamo inviato una conferma con tutti i dettagli del corso e le istruzioni per accedere.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 py-4 border-y">
              <h3 className="font-semibold">Cosa succede ora?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Riceverai un'email di conferma con i dettagli di accesso</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Ti contatteremo prima dell'inizio del corso con tutte le informazioni</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Avrai accesso ai materiali digitali sulla piattaforma dedicata</span>
                </li>
              </ul>
            </div>

            {sessionId && (
              <div className="text-xs text-muted-foreground text-center py-2">
                Riferimento transazione: {sessionId.slice(0, 20)}...
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => navigate("/")} 
                className="flex-1"
                variant="hero"
              >
                <Home className="h-4 w-4 mr-2" />
                Torna alla home
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>Hai domande? Contattaci a:</p>
              <p className="font-medium text-foreground mt-1">info@biofeedback-corso.it</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
