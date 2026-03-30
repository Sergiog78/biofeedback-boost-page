import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const perceivedProblems = [
  "\"Mi interessa, ma temo sia troppo complesso da imparare davvero\"",
  "\"Ho capito la teoria, ma non saprei come usarlo con un paziente\"",
  "\"Non ho una preparazione tecnica o neurofisiologica abbastanza forte\"",
  "\"Non voglio investire tempo e denaro in qualcosa che poi non riesco a integrare in seduta\"",
  "\"Cerco uno strumento concreto, non altra teoria difficile da tradurre nella pratica\"",
];

const bulletPoints = [
  "comprendere cosa osservare davvero",
  "collegare i segnali fisiologici all'esperienza del paziente",
  "avere più chiarezza nei processi clinici",
  "introdurre il biofeedback fin dalle prime sedute in modo più sicuro e consapevole",
];

const Features = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4 max-w-[1200px] mx-auto">
        {/* ===== BLOCCO PROBLEMA ===== */}
        <Card className="border-border/40 shadow-sm mb-16 md:mb-20">
          <CardContent className="p-8 md:p-12 lg:p-16">
            <div className="max-w-[760px] mx-auto">
              {/* Label */}
              <span className="text-sm font-semibold uppercase tracking-widest text-accent mb-4 block">
                Perché oggi molti terapeuti restano bloccati
              </span>

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
                Il problema non è che il biofeedback sia troppo difficile.{" "}
                <span className="text-muted-foreground">
                  Il problema è che spesso viene insegnato in modo{" "}
                  <strong className="text-foreground">troppo tecnico</strong>,{" "}
                  <strong className="text-foreground">poco clinico</strong> e{" "}
                  <strong className="text-foreground">difficile da applicare in seduta</strong>.
                </span>
              </h2>

              {/* Paragrafo introduttivo */}
              <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg mb-12">
                <p>
                  Molti psicologi e psicoterapeuti si avvicinano al biofeedback con interesse, ma anche con una sensazione molto precisa:{" "}
                  <em>"sembra utile, sembra scientificamente valido… ma non so davvero come portarlo dentro la mia pratica clinica"</em>.
                </p>
                <p>E così rimangono fermi.</p>
                <p>
                  Non perché manchino curiosità, apertura o competenza.<br />
                  Ma perché il biofeedback viene spesso presentato in un modo che aumenta la distanza invece di ridurla.
                </p>
              </div>

              {/* Elenco problemi percepiti */}
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-6">
                  Se ti sei riconosciuto in uno di questi pensieri, non sei il solo
                </h3>
                <div className="space-y-3">
                  {perceivedProblems.map((problem, i) => (
                    <div
                      key={i}
                      className="bg-secondary/60 border border-border/30 rounded-xl p-4 md:p-5 text-muted-foreground text-sm md:text-base italic leading-relaxed"
                    >
                      {problem}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transizione alla tesi */}
              <div className="mt-12 md:mt-16">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                  Ed è proprio qui che nasce il blocco
                </h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
                  <p>Il punto non è il biofeedback in sé.</p>
                  <p>Il punto è che molta formazione in questo ambito è ancora:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>troppo accademica</li>
                    <li>troppo fredda</li>
                    <li>troppo focalizzata sulla spiegazione tecnica</li>
                    <li>troppo poco centrata sulla realtà della psicoterapia</li>
                  </ul>
                  <p>
                    Il risultato è che tanti terapeuti finiscono per pensare che il biofeedback "non faccia per loro", quando in realtà non hanno ancora trovato un modo chiaro, umano e clinicamente applicabile per impararlo.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== BLOCCO TESI ===== */}
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-8 md:p-12 lg:p-16">
            <div className="max-w-[760px] mx-auto">
              {/* Label */}
              <span className="text-sm font-semibold uppercase tracking-widest text-accent mb-4 block">
                La nostra tesi
              </span>

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
                Il biofeedback può diventare uno strumento concreto nella pratica clinica, se viene insegnato{" "}
                <strong>partendo dalla seduta e non dalla complessità</strong>.
              </h2>

              {/* Paragrafo */}
              <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg mb-10">
                <p>
                  Questo corso nasce esattamente da questa idea, ed è il risultato di oltre dieci anni di lavoro clinico e di ricerca sul biofeedback all'interno del Centro Nova Mentis.
                </p>
                <p>
                  Un contesto in cui il biofeedback non viene studiato solo a livello teorico, ma utilizzato quotidianamente nella pratica psicoterapeutica.
                </p>
              </div>

              {/* Mini bullet di rinforzo */}
              <div className="mb-10">
                <p className="text-foreground font-semibold mb-4 text-base md:text-lg">
                  Con questo approccio puoi iniziare a:
                </p>
                <div className="space-y-3">
                  {bulletPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      <span className="text-muted-foreground text-base md:text-lg leading-relaxed">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA soft / transizione */}
              <div className="border-t border-border/40 pt-8">
                <p className="text-muted-foreground text-base md:text-lg italic text-center leading-relaxed">
                  Nel prossimo blocco vedi in concreto cosa imparerai nel corso live di 16 ore e perché questo approccio è diverso dalla formazione tradizionale.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Features;
