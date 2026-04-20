import { Card, CardContent } from "@/components/ui/card";
import { FileText, MessageCircle, Award } from "lucide-react";

const items = [
  {
    icon: FileText,
    title: "Slide complete del corso",
    text: "Tutte le slide presentate durante le 4 giornate live, in formato PDF. Il materiale di riferimento che puoi consultare ogni volta che ne hai bisogno nella tua pratica clinica.",
  },
  {
    icon: MessageCircle,
    title: "Gruppo WhatsApp riservato agli iscritti",
    text: "Accesso immediato dopo l'iscrizione. Un gruppo privato con colleghi, docenti e tutor dove ricevere supporto continuo, confrontarti su casi clinici e partecipare a sessioni di supervisione gratuita di gruppo.",
  },
  {
    icon: Award,
    title: "Certificazione BFE di I° livello",
    text: "Al termine del percorso ricevi la certificazione ufficiale rilasciata dalla Biofeedback Federation of Europe — Centro Nova Mentis, riconosciuta a livello internazionale.",
  },
];

const CourseIncludes = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Cosa ricevi con l'iscrizione
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tutto quello che ti serve per iniziare davvero
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Non solo le lezioni live. Un percorso completo con gli strumenti per continuare a crescere anche dopo il corso.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="border-2 hover:border-primary/40 transition-colors">
                  <CardContent className="p-8 text-center md:text-left">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 mx-auto md:mx-0">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseIncludes;
