import { Card, CardContent } from "@/components/ui/card";
import brainIcon from "@/assets/brain-icon.jpg";
import certificationIcon from "@/assets/certification-icon.jpg";
import onlineIcon from "@/assets/online-icon.jpg";

const features = [
  {
    icon: brainIcon,
    title: "Approccio Scientifico",
    description: "Esplora tutti i principali canali biofeedback: SC, sEMG, TEMP, RESP, HRV. Teoria, dimostrazioni pratiche e casi clinici reali.",
  },
  {
    icon: certificationIcon,
    title: "Certificazione BFE",
    description: "Al termine del corso ottieni la Certificazione di I livello della Biofeedback Federation of Europe, riconosciuta internazionalmente.",
  },
  {
    icon: onlineIcon,
    title: "Formazione Online Live",
    description: "4 giornate da 4 ore su piattaforma interattiva. Lezioni il sabato mattina per massima attenzione, con cadenza settimanale ideale per l'apprendimento.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Un Approccio Moderno alla Psicoterapia
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Il corpo parla. La psicoterapia lo ascolta. Impara a leggere e interpretare i segnali fisiologici come parte del dialogo terapeutico.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={feature.icon} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
