import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const benefits = [
  "10 incontri online live (20 ore totali)",
  "Certificazione BFE di I livello",
  "Materiali digitali e casi clinici guidati",
  "Dimostrazioni pratiche in tempo reale",
  "Accesso a convenzioni per dispositivi professionali",
  "Supporto e discussioni interattive",
];

const Pricing = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2025-11-10T23:59:59').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-accent/10 rounded-full">
            <Star className="h-5 w-5 text-accent fill-accent" />
            <span className="text-accent font-semibold">Offerta Speciale</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Investi nella Tua Formazione
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Approfitta dello sconto early bird e inizia il tuo percorso nel biofeedback
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-accent shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-br from-primary to-primary/90 text-white py-8">
              <CardTitle className="text-3xl mb-4">Corso Completo di Biofeedback</CardTitle>
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-2xl line-through opacity-70">500€</span>
                    <span className="text-5xl font-bold">280€</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
                    <span className="text-sm font-medium text-green-400">Sconto 56% • Risparmi 220€</span>
                  </div>
                </div>
                <p className="text-white/90 text-lg">Offerta speciale riservata ai partecipanti del I Convegno di Biofeedback</p>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Offerta scade tra:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="text-2xl font-bold">{timeLeft.days}</div>
                      <div className="text-xs">Giorni</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="text-2xl font-bold">{timeLeft.hours}</div>
                      <div className="text-xs">Ore</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                      <div className="text-xs">Minuti</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                      <div className="text-xs">Secondi</div>
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-white/80">Scadenza: 10 novembre 2025</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      <Check className="h-5 w-5 text-accent" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full text-xl py-6"
                  onClick={handleCheckout}
                >
                  Iscriviti Ora - 280€
                </Button>
                
                <div className="bg-secondary/50 p-6 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3 font-semibold">Altre opzioni di prezzo:</p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold text-primary">380€</span> - 
                      <span className="text-muted-foreground ml-2">
                        Prezzo standard (iscrizioni dopo il 10 novembre 2025)
                      </span>
                    </p>
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground">
                  Pagamento sicuro tramite Stripe • Riceverai conferma immediata via email
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">
              Hai domande? Contattaci per maggiori informazioni
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
