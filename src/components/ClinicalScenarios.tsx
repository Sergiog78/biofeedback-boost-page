import { Card, CardContent } from "@/components/ui/card";
import { Activity, Brain, TrendingUp } from "lucide-react";

const scenarios = [
  {
    icon: Activity,
    title: "Il corpo dice altro",
    description: (
      <>
        <p className="text-muted-foreground mb-3">
          Durante una seduta, il paziente ti dice di sentirsi tranquillo.
        </p>
        <p className="text-muted-foreground mb-3">
          Ma i segnali fisiologici raccontano altro.
        </p>
        <p className="text-foreground font-medium mb-3">
          👉 Il sistema nervoso è attivato, il corpo è in uno stato di allerta.
        </p>
        <p className="text-muted-foreground mb-1">
          Senza un riferimento oggettivo, questo passerebbe inosservato.
        </p>
        <p className="text-primary font-semibold">
          Con il biofeedback, diventa visibile.
        </p>
      </>
    ),
  },
  {
    icon: Brain,
    title: "Quando le parole non bastano",
    description: (
      <>
        <p className="text-muted-foreground mb-3">
          Un paziente fa fatica a spiegare cosa sta provando.
        </p>
        <p className="text-muted-foreground mb-3">
          Le parole non bastano.
        </p>
        <p className="text-foreground font-medium mb-3">
          👉 Ma il corpo sta già mostrando cosa sta succedendo.
        </p>
        <p className="text-muted-foreground">
          Il biofeedback ti permette di avere un punto di accesso in più, anche quando il racconto è confuso o incompleto.
        </p>
      </>
    ),
  },
  {
    icon: TrendingUp,
    title: "Oltre l'impressione clinica",
    description: (
      <>
        <p className="text-muted-foreground mb-3">
          Durante il percorso, un paziente sembra migliorare.
        </p>
        <p className="text-muted-foreground mb-3">
          Ma nel tempo, alcuni parametri fisiologici mostrano instabilità.
        </p>
        <p className="text-foreground font-medium mb-3">
          👉 Questo ti permette di accorgerti prima di eventuali difficoltà, e di intervenire con maggiore precisione.
        </p>
      </>
    ),
  },
];

const ClinicalScenarios = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Label */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-primary mb-4">
            Cosa significa davvero usare il biofeedback in seduta
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground max-w-4xl mx-auto leading-tight mb-6">
            Non è teoria. È qualcosa che puoi osservare in tempo reale mentre lavori con il paziente.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Per capire davvero il valore del biofeedback, non serve partire dalla teoria.
            <br />
            <strong className="text-foreground">Serve vedere cosa cambia dentro la seduta.</strong>
          </p>
        </div>

        {/* Scenarios — card text centered on mobile, left on md+ */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {scenarios.map((scenario, index) => (
            <Card
              key={index}
              className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 md:p-8 text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 mx-auto md:mx-0">
                  <scenario.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {scenario.title}
                </h3>
                {scenario.description}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Closing */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-lg text-muted-foreground">
            Il biofeedback non sostituisce la psicoterapia.
            <br />
            <strong className="text-foreground">👉 La rende più chiara.</strong>
          </p>
          <p className="text-muted-foreground">
            Ti dà un riferimento oggettivo nei momenti in cui prima avevi solo percezioni.
          </p>
          <p className="text-xl md:text-2xl font-bold text-foreground leading-snug max-w-2xl mx-auto">
            Non cambia il modo in cui fai terapia.
            <br />
            <span className="text-primary">👉 Cambia quanto è chiaro ciò che sta accadendo.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ClinicalScenarios;
