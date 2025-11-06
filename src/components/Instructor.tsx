import { GraduationCap, Award, BookOpen, Users } from "lucide-react";
import gabrieleCiccarese from "@/assets/gabriele-ciccarese.png";

const Instructor = () => {
  return (
    <section className="py-20 bg-secondary/5">
      <div className="container px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Il Docente
            </h2>
            <p className="text-xl text-muted-foreground">
              Un professionista di riferimento nel campo del biofeedback
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Large Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={gabrieleCiccarese}
                  alt="Dott. Gabriele Ciccarese"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Name Badge */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                <h3 className="text-3xl font-bold mb-1">Dott. Gabriele Ciccarese</h3>
                <p className="text-lg text-muted-foreground">Psicologo, Psicoterapeuta</p>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Il Dott. <strong className="text-foreground">Gabriele Ciccarese</strong> è psicologo e psicoterapeuta specializzato nell'integrazione del biofeedback nella pratica clinica. 
                  Con anni di esperienza nella formazione e nella supervisione clinica, ha contribuito allo sviluppo di protocolli innovativi per l'uso del biofeedback in psicoterapia.
                </p>
              </div>

              {/* Key Credentials */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Formazione</h4>
                    <p className="text-sm text-muted-foreground">
                      Certificazione BFE e formazione avanzata in psicofisiologia
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                  <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
                    <Award className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Esperienza</h4>
                    <p className="text-sm text-muted-foreground">
                      Oltre 10 anni di pratica clinica con biofeedback
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Docenza</h4>
                    <p className="text-sm text-muted-foreground">
                      Docente senior presso il Centro Nova Mentis
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                  <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Supervisione</h4>
                    <p className="text-sm text-muted-foreground">
                      Supervisore clinico per professionisti della salute mentale
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional highlights */}
              <div className="pt-4 space-y-3 border-t border-border">
                <h4 className="font-semibold text-lg">Aree di specializzazione:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">
                      Integrazione del biofeedback nei disturbi d'ansia e dello stress
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">
                      Protocolli evidence-based per la regolazione emotiva
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">
                      Formazione professionale per psicologi e psicoterapeuti
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Instructor;
