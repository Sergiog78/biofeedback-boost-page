import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowLeft, RefreshCw } from "lucide-react";
import bfeLogo from "@/assets/bfe-logo-text.png";
const PaymentCanceled = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);
  return <div className="min-h-screen bg-gradient-to-b from-secondary/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-center px-4">
          <img src={bfeLogo} alt="BFE Logo" className="h-8 opacity-80" />
        </div>
      </header>

      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card className="border-2 border-orange-500/20">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                <X className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-3xl">Pagamento annullato</CardTitle>
            <p className="text-muted-foreground">
              Non hai completato il pagamento. Nessun addebito è stato effettuato.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
              <p className="text-sm text-muted-foreground">
                Hai annullato il processo di pagamento. I tuoi dati sono stati salvati e puoi riprovare quando vuoi.
              </p>
            </div>

            <div className="space-y-3 py-4 border-y">
              <h3 className="font-semibold">Cosa puoi fare?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Torna alla pagina di checkout per completare l'iscrizione</li>
                <li>• Torna alla home per maggiori informazioni sul corso</li>
                <li>• Contattaci se hai bisogno di assistenza</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate("/checkout")} className="flex-1" variant="hero">
                <RefreshCw className="h-4 w-4 mr-2" />
                Riprova il pagamento
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla home
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>Hai domande? Contattaci a:</p>
              <p className="font-medium text-foreground mt-1">formazione@centronovamentis.it</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default PaymentCanceled;