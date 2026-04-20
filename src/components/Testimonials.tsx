import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";

const SUPABASE_URL = "https://unawxvbbievblwkdttzi.supabase.co/storage/v1/object/public/videos";

const testimonials = [
  {
    name: "Dott.ssa Ilaria Mazzotta",
    role: "Psicologa / Psicoterapeuta",
    quote: "Mi ha aperto un mondo",
    video: `${SUPABASE_URL}/ilaria-mazzotta.mp4`,
  },
  {
    name: "Dott.ssa Simona Carnevale",
    role: "Psicologa / Psicoterapeuta",
    quote: "Finalmente ho capito come usarlo in seduta",
    video: `${SUPABASE_URL}/simona-carnevale.mp4`,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Cosa succede quando inizi a usare davvero il biofeedback
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Le esperienze di psicoterapeuti che hanno già integrato il biofeedback nella loro pratica clinica grazie a questo percorso
            </p>
          </div>

          {/* Intro */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-lg text-muted-foreground">
              Questi sono professionisti che, prima del corso, avevano gli stessi dubbi che potresti avere tu oggi.
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              Oggi stanno iniziando a integrare il biofeedback nella loro pratica clinica.
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 max-w-3xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative aspect-[9/16] bg-muted">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    playsInline
                  >
                    <source src={t.video} type="video/mp4" />
                  </video>
                </div>
                <CardContent className="pt-5 pb-6 text-center">
                  <p className="font-semibold text-lg">{t.name}</p>
                  <p className="text-sm text-muted-foreground mb-3">{t.role}</p>
                  <p className="italic text-muted-foreground">"{t.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Closing */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-lg text-muted-foreground">
              Non si tratta di diventare esperti di tecnologia.
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              Si tratta di avere uno strumento in più per orientarti meglio nella relazione terapeutica.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center mb-14">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <a href="#pricing">
                Iscriviti ora e blocca il prezzo attuale
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              🎁 Slide complete + Gruppo WhatsApp + Supervisioni gratuite incluse
            </p>
          </div>

          {/* Garanzie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-xl border-2 border-green-500/40 bg-green-50/50 dark:bg-green-950/20 p-6">
              <div className="flex items-start gap-3 mb-3">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                <h3 className="font-bold text-lg leading-tight">
                  Garanzia di applicabilità clinica
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Se dopo la prima sessione live (9 maggio) non riesci a vedere come iniziare ad applicare il biofeedback nella tua pratica, scrivici entro 48 ore: rimborso integrale, senza condizioni.
              </p>
            </div>

            <div className="rounded-xl border-2 border-primary/30 bg-background p-6">
              <div className="flex items-start gap-3 mb-3">
                <Users className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <h3 className="font-bold text-lg leading-tight">
                  Supervisione gratuita di gruppo inclusa
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tutti gli iscritti hanno accesso al gruppo WhatsApp riservato dove vengono organizzate sessioni di supervisione gratuita di gruppo con Gabriele Ciccarese. Per continuare a crescere anche dopo il corso, con il supporto diretto del docente e dei colleghi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
