import { Card, CardContent } from "@/components/ui/card";
import { Check, ArrowRight, BookOpen, Users, MessageCircle } from "lucide-react";

const beforeItems = [
  "Hai una conoscenza vaga o teorica del biofeedback",
  "Ti sembra interessante, ma difficile da applicare",
  "Non sai come integrarlo nella seduta",
  "Ti manca un riferimento oggettivo nei momenti di incertezza",
];

const afterItems = [
  "Sai a cosa serve davvero il biofeedback in psicoterapia",
  "Sai come introdurlo fin dalle prime sedute",
  "Riesci a leggere e interpretare i principali segnali fisiologici",
  "Hai maggiore chiarezza nei processi clinici",
];

const competencies = [
  "comprendere in modo chiaro e applicabile il ruolo del biofeedback nella psicoterapia",
  "introdurre il biofeedback nella tua pratica clinica fin dalle prime sedute",
  "leggere i principali segnali fisiologici e collegarli all'esperienza del paziente",
  "utilizzare strumenti user-friendly in autonomia",
  "integrare il biofeedback senza snaturare il tuo approccio terapeutico",
  "fare le prime esperienze pratiche con i pazienti",
];

const courseFormat = [
  "16 ore di formazione live",
  "spiegazioni chiare e selezionate (solo ciò che serve davvero)",
  "esempi clinici reali",
  "possibilità di confronto diretto durante le lezioni",
];

const supportItems = [
  "accesso a una community di colleghi",
  "supporto continuo post-corso",
  "possibilità di supervisione con psicoterapeuti esperti",
];

const Solution = () => {
  const scrollToCheckout = () => {
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container px-4 max-w-[1200px] mx-auto">
        {/* ===== INTRO ===== */}
        <div className="max-w-[760px] mx-auto mb-16 md:mb-20 text-center md:text-left">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent mb-4 block">
            Cosa cambia davvero con questo approccio
          </span>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
            Un corso pensato per portarti dal "capire" al{" "}
            <strong>"saper usare davvero"</strong> il biofeedback in psicoterapia
          </h2>

          <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
            <p>
              L'obiettivo di questo corso non è farti conoscere il biofeedback.
            </p>
            <p>
              È metterti nelle condizioni di iniziare a usarlo nella tua{" "}
              <strong className="text-foreground">pratica clinica</strong>, in modo chiaro, graduale e sostenibile.
            </p>
            <p>
              Per questo è stato progettato partendo dalla realtà della seduta, non dalla teoria.
            </p>
          </div>
        </div>

        {/* ===== PRIMA / DOPO ===== */}
        <div className="mb-16 md:mb-20">
          <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">
            Cosa cambia concretamente
          </h3>

          <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {/* PRIMA */}
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-6 md:p-8 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-block w-3 h-3 rounded-full bg-muted-foreground/40" />
                  <h4 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
                    Prima
                  </h4>
                </div>
                <ul className="space-y-3">
                  {beforeItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-base leading-relaxed">
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* DOPO */}
            <Card className="border-accent/30 shadow-sm bg-accent/5">
              <CardContent className="p-6 md:p-8 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-block w-3 h-3 rounded-full bg-accent" />
                  <h4 className="text-lg font-semibold text-accent uppercase tracking-wide">
                    Dopo
                  </h4>
                </div>
                <ul className="space-y-3">
                  {afterItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground text-base leading-relaxed">
                      <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ===== COMPETENZE ===== */}
        <Card className="border-border/40 shadow-sm mb-16 md:mb-20">
          <CardContent className="p-8 md:p-12 lg:p-16">
            <div className="max-w-[760px] mx-auto">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center md:text-left">
                Durante il corso imparerai a:
              </h3>
              <div className="space-y-4 text-left">
                {competencies.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground text-base md:text-lg leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== STRUTTURA CORSO ===== */}
        <div className="max-w-[760px] mx-auto mb-16 md:mb-20">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center md:text-left">
            Un formato pensato per l'apprendimento reale
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {courseFormat.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-secondary/50 rounded-xl p-4 md:p-5 text-left"
              >
                <BookOpen className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-base leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== DIFFERENZIAZIONE ===== */}
        <Card className="border-border/40 shadow-sm mb-16 md:mb-20">
          <CardContent className="p-8 md:p-12 lg:p-16">
            <div className="max-w-[760px] mx-auto text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                Perché questo corso è diverso
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
                <p>
                  La maggior parte della formazione sul biofeedback si ferma alla teoria.
                </p>
                <p>
                  Questo corso nasce da un'esperienza clinica reale e continua, ed è progettato per tradurre il biofeedback in uno strumento concreto nella relazione terapeutica.
                </p>
                <p>
                  Non è pensato per insegnarti "tutto".
                </p>
                <p>
                  È pensato per insegnarti{" "}
                  <strong className="text-foreground">ciò che serve per iniziare davvero</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== SUPPORTO ===== */}
        <div className="max-w-[760px] mx-auto mb-16 md:mb-20">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center md:text-left">
            E soprattutto, non rimani solo
          </h3>
          <div className="space-y-4 text-left">
            {supportItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-secondary/50 rounded-xl p-4 md:p-5">
                {i === 0 ? (
                  <Users className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                ) : i === 1 ? (
                  <MessageCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                ) : (
                  <BookOpen className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                )}
                <span className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== CTA ===== */}
        <div className="text-center">
          <button
            onClick={scrollToCheckout}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-4 rounded-full transition-colors"
          >
            👉 Iscriviti ora e inizia a integrare il biofeedback nella tua pratica clinica
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Solution;
