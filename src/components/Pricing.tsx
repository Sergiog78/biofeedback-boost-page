import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentTier, formatPrice } from "@/lib/pricing-tiers";
import PricingRoadmap from "@/components/PricingRoadmap";

const benefits = [
  "16 ore di formazione live con applicazione clinica",
  "Certificazione BFE di I livello",
  "Materiali pratici e casi clinici guidati",
  "Dimostrazioni reali durante le lezioni",
  "Accesso a convenzioni per dispositivi professionali",
  "Accesso a un gruppo privato di confronto clinico continuo, con colleghi, tutor e docenti, per chiarimenti, domande e supporto anche dopo il corso",
];

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

  const { tier, nextTier } = tierInfo;

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-accent/10 rounded-full">
            <Star className="h-5 w-5 text-accent fill-accent" />
            <span className="text-accent font-semibold">Accesso al corso</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Inizia a integrare il biofeedback nella tua pratica clinica
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Un percorso completo, pratico e guidato per passare dalla teoria all'utilizzo reale in seduta
          </p>
        </div>

        {/* Pre-bridge emotivo */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-lg text-muted-foreground">
            Questo non è un corso in più da seguire.
          </p>
          <p className="text-lg text-muted-foreground mt-3">
            È uno strumento che puoi iniziare a usare nella tua pratica clinica per avere più chiarezza, più sicurezza e un riferimento oggettivo nel lavoro con i pazienti.
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
                  <p className="text-white/70 text-sm">IVA inclusa nel totale</p>
                </div>
                <p className="text-white/90 text-lg">
                  {tier.label === "Early Bird"
                    ? "Prezzo Early Bird — solo per pochi giorni!"
                    : `${tier.label} — Prezzo riservato`}
                </p>
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
                  👉 Iscriviti ora e blocca il prezzo attuale
                </Button>

                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Prezzo attuale: €{tier.basePrice} + IVA
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Il prezzo aumenterà nei prossimi giorni
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pagamento sicuro tramite Stripe · Accesso immediato dopo l'iscrizione
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
