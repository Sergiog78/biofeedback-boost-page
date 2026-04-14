import { Card, CardContent } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";

const valuePoints = [
  "quali dispositivi hanno davvero senso per iniziare",
  "come scegliere strumenti accessibili ma clinicamente utili",
  "come integrare il biofeedback in terapia in modo semplice ed efficace",
  "come partire gradualmente, senza fare investimenti inutili",
];

const InstrumentationObjection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container px-4 max-w-[1200px] mx-auto">
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-8 md:p-12 lg:p-16">
            <div className="max-w-[760px] mx-auto text-center md:text-left">
              {/* Label */}
              <span className="text-sm font-semibold uppercase tracking-widest text-accent mb-4 block">
                Un'obiezione molto diffusa
              </span>

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                "Il biofeedback mi interessa, ma la strumentazione costa troppo"
              </h2>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                È una delle convinzioni che blocca più terapeuti. Ma oggi non è più così.
              </p>

              {/* Intro */}
              <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg mb-12">
                <p>
                  Molti psicologi e psicoterapeuti rinunciano ancora prima di iniziare perché pensano che per integrare il biofeedback nella pratica clinica servano fin da subito strumenti costosi, complessi e poco sostenibili.
                </p>
                <p>Ed è proprio qui che nasce un fraintendimento.</p>
              </div>

              {/* Break — key insight */}
              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 md:p-8 mb-12">
                <p className="text-foreground font-semibold text-lg md:text-xl leading-relaxed mb-4">
                  Oggi si può iniziare a utilizzare il biofeedback in modo reale, concreto ed efficace anche con dispositivi accessibili, intorno ai 100–150€.
                </p>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-1">Non come soluzione "provvisoria".</p>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">Non come compromesso.</p>
                <p className="text-foreground text-base md:text-lg leading-relaxed font-medium">
                  <span className="mr-1.5">👉</span> Ma come strumentazione valida per iniziare davvero a integrarlo nel lavoro clinico, anche per i primi anni di pratica.
                </p>
              </div>

              {/* Prova autorità */}
              <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg mb-12">
                <p>
                  È esattamente così che ho iniziato anche io.
                </p>
                <p>
                  Con strumenti semplici, accessibili e sostenibili, che ha integrato in terapia e con cui ha lavorato per anni nella pratica clinica.
                </p>
                <p className="text-foreground font-medium">Questo significa una cosa molto importante:</p>
                <p className="text-foreground font-medium pl-1">
                  <span className="mr-1.5">👉</span> il problema non è spendere tanto
                </p>
                <p className="text-foreground font-medium pl-1">
                  <span className="mr-1.5">👉</span> il problema è sapere cosa scegliere e come usarlo bene
                </p>
              </div>

              {/* Mission */}
              <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg mb-12">
                <p>
                  Ed è proprio da qui che nasce anche la missione di <strong className="text-foreground">Gabriele Ciccarese</strong>:
                </p>
                <p className="text-foreground font-medium pl-1">
                  <span className="mr-1.5">👉</span> rendere il biofeedback accessibile, sostenibile e utilizzabile davvero da tutti i clinici
                </p>
                <p className="text-foreground font-medium pl-1">
                  <span className="mr-1.5">👉</span> non qualcosa riservato a una nicchia ristretta di specialisti
                </p>
                <p>Oggi questo è possibile anche grazie all'evoluzione tecnologica.</p>
                <p>
                  Dispositivi più accessibili, più semplici da utilizzare e sempre più integrabili nella pratica clinica stanno rendendo il biofeedback uno strumento in forte crescita.
                </p>
                <p className="text-foreground font-medium pl-1">
                  <span className="mr-1.5">👉</span> Non perché sia cambiata la teoria
                </p>
                <p className="text-foreground font-medium pl-1">
                  <span className="mr-1.5">👉</span> ma perché è diventato finalmente utilizzabile nella realtà
                </p>
              </div>

              {/* Value block */}
              <div className="mb-10">
                <p className="text-foreground font-semibold mb-5 text-base md:text-lg">
                  Nel corso non ti lasciamo solo su questo aspetto. Riceverai indicazioni chiare e concrete su:
                </p>
                <div className="space-y-3 text-left">
                  {valuePoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      <span className="text-muted-foreground text-base md:text-lg leading-relaxed">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra value */}
              <div className="bg-secondary/60 border border-border/30 rounded-xl p-5 md:p-6 mb-12">
                <p className="text-foreground text-base md:text-lg leading-relaxed font-medium">
                  In più, tutti i partecipanti avranno accesso a <strong>convenzioni riservate</strong> per acquistare strumentazione biofeedback a condizioni agevolate.
                </p>
              </div>

              {/* Closing */}
              <div className="border-t border-border/40 pt-8 space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
                <p className="text-foreground font-semibold text-lg md:text-xl">
                  Il biofeedback non è riservato a chi parte con grandi budget.
                </p>
                <p className="font-medium text-foreground pl-1">
                  <span className="mr-1.5">👉</span> Può diventare parte della tua pratica clinica anche in modo accessibile, sostenibile e professionale.
                </p>
                <p>Quello che fa davvero la differenza non è partire con la strumentazione più costosa.</p>
                <p className="font-medium text-foreground pl-1">
                  <span className="mr-1.5">👉</span> È partire con i dispositivi giusti e con una guida chiara su come usarli davvero.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default InstrumentationObjection;
