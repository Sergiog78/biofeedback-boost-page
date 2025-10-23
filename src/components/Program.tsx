import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const sessions = [
  {
    date: "4 dicembre",
    number: "1ª Lezione",
    title: "Mente, corpo e relazione",
    description: "Introduzione al modello psicofisiologico e le quattro funzioni del biofeedback in psicoterapia."
  },
  {
    date: "11 dicembre",
    number: "2ª Lezione",
    title: "Conduttanza cutanea (SC)",
    description: "Comprensione della fisiologia della conduttanza cutanea come indicatore di attivazione emotiva."
  },
  {
    date: "18 dicembre",
    number: "3ª Lezione",
    title: "Elettromiografia (sEMG)",
    description: "La tensione muscolare come finestra sull'attivazione corporea e il controllo."
  },
  {
    date: "8 gennaio",
    number: "4ª Lezione",
    title: "Temperatura cutanea (TEMP)",
    description: "Il termometro della regolazione corporea e bilanciamento autonomico."
  },
  {
    date: "15 gennaio",
    number: "5ª Lezione",
    title: "Respirazione (RESP)",
    description: "Il respiro come ponte tra fisiologia e consapevolezza."
  },
  {
    date: "22 gennaio",
    number: "6ª Lezione",
    title: "Variabilità cardiaca (HRV)",
    description: "Il cuore come specchio della flessibilità fisiologica."
  },
  {
    date: "29 gennaio",
    number: "7ª Lezione",
    title: "Assessment psicofisiologico",
    description: "Valutare lo stress per comprendere la regolazione."
  },
  {
    date: "5 febbraio",
    number: "8ª Lezione",
    title: "Training biofeedback",
    description: "Dal dato fisiologico al cambiamento terapeutico."
  },
  {
    date: "17 febbraio",
    number: "9ª Lezione",
    title: "Casi clinici complessi",
    description: "Analisi di disturbi d'ansia, borderline, sintomi somatici e trauma."
  },
  {
    date: "12 febbraio",
    number: "10ª Lezione",
    title: "Strumentazione e pratica",
    description: "Dalla teoria alla valigetta: orientamento alla scelta della strumentazione."
  }
];

const Program = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Programma Completo
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            10 incontri strutturati per sviluppare competenza autentica nell'integrazione mente-corpo
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
              <Calendar className="h-5 w-5 text-accent" />
              <span className="font-medium">Inizio: 4 dicembre 2024</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
              <Clock className="h-5 w-5 text-accent" />
              <span className="font-medium">Orario: 10:00-12:00</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {sessions.map((session, index) => (
            <Card key={index} className="border-l-4 border-l-accent hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full">
                    {session.number}
                  </div>
                  <span className="text-sm text-muted-foreground">{session.date}</span>
                </div>
                <CardTitle className="text-xl">{session.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{session.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Program;
