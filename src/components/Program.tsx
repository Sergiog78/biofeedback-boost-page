import { Calendar, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sessions = [
  {
    date: "4 dicembre",
    number: "1ª Lezione",
    title: "Mente, corpo e relazione",
    subtitle: "Le basi del dialogo psicofisiologico",
    objectives: "Comprendere il razionale del biofeedback e la sua integrazione nella psicoterapia contemporanea.",
    content: [
      "Cos'è il biofeedback: definizione, principi di funzionamento e feedback visivo",
      "Il modello mente-corpo nella regolazione emotiva: sistema nervoso autonomo, simpatico e parasimpatico",
      "Dall'approccio top-down (cognitivo) all'approccio bottom-up (fisiologico)",
      "Le quattro funzioni del biofeedback in psicoterapia: Assessment psicofisiologico, Gancio relazionale, Insight corporeo ed emotivo, Intervento bottom-up",
      "Introduzione ai principali canali fisiologici: SC, sEMG, TEMP, RESP, HRV"
    ]
  },
  {
    date: "11 dicembre",
    number: "2ª Lezione",
    title: "Conduttanza cutanea (SC)",
    subtitle: "Indicatore di attivazione emotiva",
    objectives: "Comprendere la fisiologia della conduttanza cutanea e il suo valore come indicatore di attivazione emotiva.",
    content: [
      "Cos'è la conduttanza cutanea e come viene misurata",
      "Risposta simpatica e correlati emotivi",
      "Lettura dei tracciati SC: SCL, SCR, SSCR",
      "Riconoscimento e gestione degli artefatti: movimento, sudorazione ambientale, trazione dei cavi",
      "Cut-off e interpretazione di pattern tipici",
      "Dimostrazione o simulazione di lettura di un tracciato SC"
    ]
  },
  {
    date: "18 dicembre",
    number: "3ª Lezione",
    title: "Elettromiografia (sEMG)",
    subtitle: "La tensione muscolare come finestra sull'attivazione corporea",
    objectives: "Comprendere la fisiologia del tono muscolare e il suo significato come indicatore di attivazione e controllo corporeo.",
    content: [
      "Cos'è il segnale sEMG e come viene acquisito",
      "Significato psicofisiologico del tono muscolare",
      "Lettura dei tracciati sEMG e identificazione dei pattern di attivazione",
      "Riconoscimento e gestione degli artefatti: movimenti oculari, postura, interferenze elettriche",
      "Cut-off e interpretazione di pattern tipici",
      "Dimostrazione o simulazione di lettura di un tracciato sEMG"
    ]
  },
  {
    date: "8 gennaio",
    number: "4ª Lezione",
    title: "Temperatura cutanea (TEMP)",
    subtitle: "Il termometro della regolazione corporea",
    objectives: "Comprendere la fisiologia della temperatura cutanea e il suo ruolo come indicatore del bilanciamento autonomico.",
    content: [
      "Meccanismi di vasocostrizione e vasodilatazione",
      "Significato fisiologico delle variazioni termiche",
      "Lettura delle variazioni di temperatura nel tempo",
      "Riconoscimento e gestione degli artefatti: contatto, temperatura ambientale, sudorazione",
      "Cut-off e interpretazione di pattern tipici",
      "Dimostrazione o simulazione di lettura di un tracciato TEMP"
    ]
  },
  {
    date: "15 gennaio",
    number: "5ª Lezione",
    title: "Respirazione (RESP)",
    subtitle: "Il respiro come ponte tra fisiologia e consapevolezza",
    objectives: "Comprendere la meccanica e la fisiologia della respirazione e la sua influenza sul sistema nervoso autonomo.",
    content: [
      "Meccanica della respirazione: diaframma, torace e coordinazione muscolare",
      "Differenze tra respirazione toracica e diaframmatica",
      "Ritmo, ampiezza e regolarità del respiro",
      "Lettura dei tracciati respiratori e riconoscimento dei pattern disfunzionali",
      "Riconoscimento e gestione degli artefatti: movimenti posturali, posizionamento sensori, incongruenze di ritmo",
      "Dimostrazione o simulazione di lettura di un tracciato RESP"
    ]
  },
  {
    date: "22 gennaio",
    number: "6ª Lezione",
    title: "Variabilità cardiaca (HRV)",
    subtitle: "Il cuore come specchio della flessibilità fisiologica",
    objectives: "Introdurre la fisiologia della HRV e il suo valore come indicatore dell'equilibrio autonomico.",
    content: [
      "Cos'è la HRV e come viene misurata: metriche del dominio del tempo e delle frequenze",
      "Componenti principali: LF, HF, LF/HF",
      "Lettura dei tracciati HRV e interpretazione dei principali pattern",
      "Riconoscimento e gestione degli artefatti: movimenti, variazioni respiratorie, segnale instabile",
      "Dimostrazione o simulazione di lettura di un tracciato HRV"
    ]
  },
  {
    date: "29 gennaio",
    number: "7ª Lezione",
    title: "Assessment psicofisiologico",
    subtitle: "Valutare lo stress per comprendere la regolazione",
    objectives: "Apprendere come strutturare e interpretare una valutazione psicofisiologica completa.",
    content: [
      "Struttura dello stress assessment: baseline, stress cognitivi, stress emotivi, fasi di recupero",
      "Integrazione dei parametri SC, sEMG, TEMP, RESP, HRV",
      "Lettura integrata dei tracciati e coerenza tra parametri",
      "Identificazione dei principali pattern fisiologici",
      "Dimostrazione o analisi guidata di un assessment completo"
    ]
  },
  {
    date: "5 febbraio",
    number: "8ª Lezione",
    title: "Training biofeedback",
    subtitle: "Dal dato fisiologico al cambiamento terapeutico",
    objectives: "Imparare a costruire un percorso di training biofeedback integrato nella relazione terapeutica.",
    content: [
      "Strutturazione di un training biofeedback personalizzato",
      "Scelta dei canali da allenare e definizione degli obiettivi",
      "Preparazione cognitiva del partecipante e costruzione della motivazione",
      "Uso del feedback come strumento di consapevolezza e regolazione",
      "Integrazione del biofeedback nel processo terapeutico e nella relazione"
    ]
  },
  {
    date: "12 febbraio",
    number: "9ª Lezione",
    title: "Casi clinici complessi",
    subtitle: "Il corpo racconta la mente",
    objectives: "Analizzare e discutere casi clinici reali, comprendendo come integrare i dati psicofisiologici nel ragionamento clinico e nel processo terapeutico.",
    content: [
      "Lettura e discussione di tracciati reali in diversi profili clinici: Disturbi d'Ansia, Disturbi Borderline di Personalità, Disturbi da Sintomi Somatici, Disturbi correlati al Trauma",
      "Integrazione tra dati fisiologici e osservazione clinica",
      "Discussione interattiva sui processi di regolazione, insight corporeo e relazione terapeutica",
      "Elaborazione condivisa di strategie di intervento e training",
      "Sintesi conclusiva: dal pattern fisiologico alla formulazione clinica integrata"
    ]
  },
  {
    date: "19 febbraio",
    number: "10ª Lezione",
    title: "Strumentazione e pratica",
    subtitle: "Dalla teoria alla valigetta",
    objectives: "Offrire una panoramica essenziale sugli strumenti disponibili e orientare ciascun partecipante nella scelta della dotazione più adatta alle proprie esigenze cliniche e formative.",
    content: [
      "Panoramica delle principali tipologie di dispositivi biofeedback: professionali e user friendly",
      "Differenze tra sistemi multi-canale e dispositivi portatili",
      "Strumenti affidabili per iniziare: caratteristiche di base, accessibilità e criteri di scelta",
      "Considerazioni pratiche su costi, supporto tecnico e compatibilità software",
      "Convenzione Nova Mentis – Rifletto S.r.l.: agevolazioni e sconti riservati ai corsisti",
      "Orientamento finale personalizzato per la scelta dello strumento più idoneo"
    ]
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
        
        <Accordion type="single" collapsible className="max-w-6xl mx-auto space-y-4">
          {sessions.map((session, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 text-left">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full">
                        {session.number}
                      </div>
                      <span className="text-sm text-muted-foreground">{session.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">{session.subtitle}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-2">
                  <div>
                    <h4 className="font-semibold text-accent mb-2">Obiettivi</h4>
                    <p className="text-muted-foreground">{session.objectives}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-accent mb-2">Contenuti</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      {session.content.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-accent mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Program;
