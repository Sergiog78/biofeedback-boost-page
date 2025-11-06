import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

          <div className="grid border rounded-lg p-8 grid-cols-1 gap-8 items-center lg:grid-cols-2">
            <div className="flex gap-10 flex-col">
              <div className="flex gap-4 flex-col">
                <div>
                  <Badge variant="outline">Docente</Badge>
                </div>
                <div className="flex gap-2 flex-col">
                  <h2 className="text-3xl lg:text-5xl tracking-tighter max-w-xl text-left font-regular">
                    Dott. Gabriele Ciccarese
                  </h2>
                  <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left">
                    Psicologo e psicoterapeuta specializzato nell'integrazione del biofeedback nella pratica clinica.
                  </p>
                </div>
              </div>
              <div className="grid lg:pl-6 grid-cols-1 sm:grid-cols-3 items-start lg:grid-cols-1 gap-6">
                <div className="flex flex-row gap-6 items-start">
                  <Check className="w-4 h-4 mt-2 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">Certificazione BFE</p>
                    <p className="text-muted-foreground text-sm">
                      Formazione avanzata in psicofisiologia e biofeedback
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-6 items-start">
                  <Check className="w-4 h-4 mt-2 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">Oltre 10 anni di esperienza</p>
                    <p className="text-muted-foreground text-sm">
                      Pratica clinica specializzata con biofeedback
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-6 items-start">
                  <Check className="w-4 h-4 mt-2 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">Docente senior</p>
                    <p className="text-muted-foreground text-sm">
                      Formatore presso il Centro Nova Mentis
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-md aspect-square overflow-hidden">
              <img
                src={gabrieleCiccarese}
                alt="Dott. Gabriele Ciccarese"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Instructor;
