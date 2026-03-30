import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import gabrieleCiccarese from "@/assets/gabriele-ciccarese.png";

const credentials = [
  "Fondatore del Centro Nova Mentis (Centro di Psicologia e Neuroscienze Cliniche)",
  "Esperto certificato biofeedback e psicofisiologia (BFE)",
  "Specializzato nel trattamento di ansia e trauma",
  "Consulente per atleti di alto livello",
  "Docente in scuole di specializzazione in psicoterapia",
];

const Instructor = () => {
  return (
    <section className="py-20 bg-secondary/5">
      <div className="container px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Il Docente</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chi ti guiderà nell'integrare il biofeedback nella pratica clinica
            </p>
          </div>

          {/* Intro */}
          <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
            Psicoterapeuta, formatore e fondatore del Centro Nova Mentis, dove il biofeedback viene utilizzato ogni giorno nella pratica clinica con pazienti.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border rounded-lg p-8">
            {/* Left - Text */}
            <div className="flex flex-col gap-8">
              <div>
                <Badge variant="outline" className="mb-4">Docente</Badge>
                <h3 className="text-3xl lg:text-5xl tracking-tighter font-regular mb-6">
                  Dott. Gabriele Ciccarese
                </h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  A differenza di molta formazione teorica sul biofeedback, il lavoro di Gabriele Ciccarese nasce da anni di{" "}
                  <strong className="text-foreground">utilizzo reale in psicoterapia</strong>.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mt-4">
                  Questo significa che ciò che imparerai nel corso non è solo "corretto" dal punto di vista scientifico, ma è già stato utilizzato,{" "}
                  <strong className="text-foreground">testato e integrato nella pratica clinica</strong>.
                </p>
              </div>

              <div>
                <p className="font-semibold text-lg mb-4">Esperienza clinica e formazione:</p>
                <div className="flex flex-col gap-4">
                  {credentials.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-1.5 text-primary flex-shrink-0" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social proof */}
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                "Mi ha aperto un mondo"
              </blockquote>
            </div>

            {/* Right - Image */}
            <div className="relative rounded-md overflow-hidden bg-muted">
              <img
                src={gabrieleCiccarese}
                alt="Dott. Gabriele Ciccarese"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Instructor;
