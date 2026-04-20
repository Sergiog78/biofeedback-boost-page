import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
              Le esperienze di psicologi e psicoterapeuti che hanno già partecipato alla prima edizione del corso
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
          <div className="text-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <a href="#pricing">
                Iscriviti ora e blocca il prezzo attuale
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
