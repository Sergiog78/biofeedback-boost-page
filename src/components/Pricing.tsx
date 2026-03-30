import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentTier, formatPrice } from "@/lib/pricing-tiers";
import PricingRoadmap from "@/components/PricingRoadmap";

const benefits = ["4 giornate online live (16 ore totali)", "Certificazione BFE di I livello", "Materiali digitali e casi clinici guidati", "Dimostrazioni pratiche in tempo reale", "Accesso a convenzioni per dispositivi professionali", "Supporto e discussioni interattive"];

const Pricing = () => {
  const navigate = useNavigate();
  const [tierInfo, setTierInfo] = useState(getCurrentTier());

  useEffect(() => {
    const interval = setInterval(() => {
      setTierInfo(getCurrentTier());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const { tier } = tierInfo;

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
            Approfitta del prezzo riservato e inizia il tuo percorso nel biofeedback
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-accent shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-br from-primary to-primary/90 text-white py-8">
              <CardTitle className="text-3xl mb-4">Corso Completo di Biofeedback</CardTitle>
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center">
                    <span className="text-5xl font-bold">€{tier.basePrice} + IVA</span>
                  </div>
                  <p className="text-white/70 text-sm">IVA 22% inclusa nel totale</p>
                </div>
                <p className="text-white/90 text-lg">{tier.label === "Early Bird" ? "Prezzo Early Bird — solo per pochi giorni!" : `${tier.label} — Prezzo riservato`}</p>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Pricing Roadmap */}
              <div className="mb-8">
                <PricingRoadmap />
              </div>

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
                <Button variant="hero" size="xl" className="w-full text-xl py-6" onClick={handleCheckout}>
                  Iscriviti Ora - €{tier.basePrice} + IVA
                </Button>

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
