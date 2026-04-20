import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentTier, formatPrice, getDiscountPercent } from "@/lib/pricing-tiers";

const benefits: (string | React.ReactNode)[] = [
  "16 ore di formazione live con applicazione clinica",
  "Certificazione BFE di I livello",
  "Materiali pratici e casi clinici guidati",
  "Dimostrazioni reali durante le lezioni",
  "Accesso a convenzioni per dispositivi professionali",
  <><span className="font-bold text-accent">Accesso a un gruppo privato</span> di confronto clinico continuo, con colleghi, tutor e docenti, per chiarimenti, domande e supporto anche dopo il corso</>,
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
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span className="text-5xl font-bold">€{tier.basePrice} + IVA</span>
                    {getDiscountPercent(tier) > 0 && (
                      <span className="inline-flex items-center rounded-full bg-white/20 text-white text-sm font-medium px-3 py-1">
                        −{getDiscountPercent(tier)}%
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm">IVA inclusa nel totale</p>
                  <p className="text-white/80 text-sm">
                    💳 oppure <span className="font-semibold text-white">3 rate da €{(tier.totalPrice / 3).toFixed(2).replace(".", ",")}</span> · Nessun interesse · Klarna
                  </p>
                </div>
                <p className="text-white/90 text-lg">
                  {tier.label === "Early Bird"
                    ? "Prezzo Early Bird — solo per pochi giorni!"
                    : `${tier.label} — Prezzo riservato`}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Countdown to next tier */}
              {nextTier && tierInfo.timeRemaining.totalMs > 0 && (
                <div className="mb-6 bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                      Il prezzo aumenta tra
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center max-w-xs mx-auto">
                    {[
                      { value: tierInfo.timeRemaining.days, label: "Giorni" },
                      { value: tierInfo.timeRemaining.hours, label: "Ore" },
                      { value: tierInfo.timeRemaining.minutes, label: "Min" },
                    ].map(({ value, label }) => (
                      <div key={label} className="bg-background rounded-md py-2 border">
                        <div className="text-xl font-bold text-foreground tabular-nums">
                          {String(value).padStart(2, "0")}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single info line — replaces previous 4-tier ladder */}
              <div className="mb-8 text-center space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Prezzo attuale: €{tier.basePrice} + IVA <span className="text-muted-foreground font-normal">(€{formatPrice(tier.totalPrice)} IVA inclusa)</span>
                </p>
                {nextTier && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
                    Alla scadenza del timer il prezzo passerà a <span className="font-semibold text-foreground">€{nextTier.basePrice} + IVA</span>. Dopo non sarà più possibile accedere a questo prezzo.
                  </p>
                )}
              </div>

              {/* Benefits — keep left aligned */}
              <div className="space-y-4 mb-8 text-left">
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
                <Button variant="hero" size="xl" className="w-full text-base sm:text-xl py-6 whitespace-normal leading-snug" onClick={handleCheckout}>
                  Iscriviti ora e blocca il prezzo attuale
                </Button>

                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground flex items-center justify-center gap-2 flex-wrap">
                    Prezzo attuale: €{tier.basePrice} + IVA
                    {getDiscountPercent(tier) > 0 && (
                      <span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-medium px-2.5 py-0.5">
                        Risparmi €{399 - tier.basePrice} rispetto al prezzo finale
                      </span>
                    )}
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
