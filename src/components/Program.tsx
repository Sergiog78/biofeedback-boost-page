import { Calendar, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sessions = [
  {
    date: "Sabato 9 maggio 2026",
    time: "ore 9:00–13:00",
    modules: [
      {
        number: "Modulo 1",
        title: "Mente, corpo e relazione",
        subtitle: "Le basi del dialogo psicofisiologico",
        objectives: "Comprendere in modo chiaro cos'è il biofeedback e come può essere integrato nella pratica clinica per leggere e utilizzare le risposte fisiologiche del paziente.",
        content: [
          "Cos'è il biofeedback: principi di funzionamento e logica del feedback",
          "Il ruolo del sistema nervoso autonomo nella regolazione",
          "Integrazione tra processi cognitivi e fisiologici (top-down e bottom-up)",
          "Le principali funzioni del biofeedback in psicoterapia",
          "Panoramica dei segnali fisiologici principali"
        ],
        application: "Dimostrazione: utilizzo del biofeedback all'interno di una seduta"
      },
      {
        number: "Modulo 2",
        title: "Conduttanza cutanea (SC)",
        subtitle: "Osservare l'attivazione nel momento",
        objectives: "Imparare a leggere un segnale diretto dell'attivazione fisiologica.",
        content: [
          "Cos'è la conduttanza cutanea e cosa misura",
          "Variazioni del segnale in relazione all'attivazione",
          "Lettura dei tracciati (SCL e SCR)",
          "Riconoscimento degli artefatti"
        ],
        clinicalIntegration: [
          "Consente di osservare variazioni dell'attivazione anche non espresse verbalmente",
          "Aiuta a collegare risposta corporea ed esperienza soggettiva",
          "Favorisce la consapevolezza del paziente rispetto alle proprie reazioni"
        ],
        application: "Lettura guidata di un tracciato reale"
      }
    ]
  },
  {
    date: "Sabato 16 maggio 2026",
    time: "ore 9:00–13:00",
    modules: [
      {
        number: "Modulo 3",
        title: "Elettromiografia (sEMG)",
        subtitle: "Osservare la tensione muscolare",
        objectives: "Comprendere il significato clinico del tono muscolare e della sua modulazione.",
        content: [
          "Cos'è il segnale sEMG e come viene acquisito",
          "Tono muscolare e attivazione",
          "Lettura dei tracciati",
          "Artefatti e loro gestione"
        ],
        clinicalIntegration: [
          "Permette di osservare il livello di tensione muscolare nel momento",
          "Aiuta a comprendere se il paziente riesce a modulare l'attivazione",
          "Favorisce il lavoro sulla consapevolezza corporea"
        ],
        application: "Lettura guidata di un tracciato"
      },
      {
        number: "Modulo 4",
        title: "Temperatura cutanea (TEMP)",
        subtitle: "Osservare attivazione e recupero",
        objectives: "Comprendere come la temperatura cutanea rifletta i processi di regolazione.",
        content: [
          "Cos'è la temperatura cutanea e cosa indica",
          "Variazioni nel tempo",
          "Lettura dei tracciati",
          "Artefatti e loro gestione"
        ],
        application: "Lettura guidata di un tracciato"
      }
    ]
  },
  {
    date: "Sabato 23 maggio 2026",
    time: "ore 9:00–13:00",
    modules: [
      {
        number: "Modulo 5",
        title: "Respirazione (RESP)",
        subtitle: "Osservare il ritmo della regolazione",
        objectives: "Comprendere il ruolo della respirazione nei processi di regolazione fisiologica.",
        content: [
          "Meccanica della respirazione",
          "Frequenza, ampiezza e regolarità",
          "Lettura dei tracciati respiratori",
          "Artefatti e loro gestione"
        ],
        clinicalIntegration: [
          "Il respiro fornisce indicazioni sullo stato di attivazione",
          "Permette di osservare pattern respiratori poco funzionali",
          "Può essere utilizzato direttamente nel lavoro clinico"
        ],
        application: "Analisi guidata di tracciati"
      },
      {
        number: "Modulo 6",
        title: "Variabilità cardiaca (HRV)",
        subtitle: "Osservare la capacità di adattamento",
        objectives: "Introdurre la HRV come indicatore della modulazione autonomica.",
        content: [
          "Cos'è la HRV e cosa rappresenta",
          "Componenti principali: metriche nel dominio del tempo e delle frequenze",
          "Lettura dei tracciati",
          "Artefatti e loro gestione"
        ],
        clinicalIntegration: [
          "Fornisce indicazioni sulla capacità di adattamento allo stress",
          "Aiuta a osservare la flessibilità della risposta fisiologica",
          "Supporta il ragionamento clinico nei momenti di incertezza"
        ],
        application: "Lettura guidata di tracciati"
      }
    ]
  },
  {
    date: "Sabato 30 maggio 2026",
    time: "ore 9:00–13:00",
    modules: [
      {
        number: "Modulo 7",
        title: "Dalla valutazione alla formulazione clinica",
        subtitle: "Integrare i dati nel lavoro terapeutico",
        objectives: "Imparare a utilizzare i dati fisiologici all'interno del ragionamento clinico.",
        content: [
          "Struttura della valutazione psicofisiologica",
          "Integrazione dei parametri",
          "Lettura dei pattern",
          "Dal dato alla comprensione clinica"
        ],
        application: "Analisi guidata di un caso completo"
      },
      {
        number: "Modulo 8",
        title: "Biofeedback di addestramento e casi clinici",
        subtitle: "Portare il biofeedback nella pratica",
        objectives: "Apprendere come utilizzare il biofeedback in modo concreto in seduta.",
        content: [
          "Come iniziare a usare il biofeedback con i pazienti",
          "Come scegliere cosa osservare",
          "Come spiegare il biofeedback in modo semplice",
          "Come integrarlo nella relazione terapeutica",
          "Discussione di casi clinici reali",
          "Costruzione guidata di interventi"
        ],
        application: "Sintesi finale: come iniziare in modo graduale nella propria pratica"
      }
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
            8 moduli in 4 giornate per sviluppare competenza autentica nell'integrazione mente-corpo
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
              <Calendar className="h-5 w-5 text-accent" />
              <span className="font-medium">Inizio: 9 maggio 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
              <Clock className="h-5 w-5 text-accent" />
              <span className="font-medium">Orario: 9:00-13:00</span>
            </div>
          </div>
        </div>
        
        <Accordion type="single" collapsible className="max-w-6xl mx-auto space-y-4">
          {sessions.map((session, sessionIndex) => (
            <div key={sessionIndex} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <Calendar className="h-5 w-5 text-accent" />
                <span className="font-semibold text-lg">{session.date}</span>
                <span className="text-muted-foreground">– {session.time}</span>
              </div>
              {session.modules.map((module, moduleIndex) => {
                const itemValue = `item-${sessionIndex}-${moduleIndex}`;
                return (
                  <AccordionItem 
                    key={itemValue} 
                    value={itemValue}
                    className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 text-left">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full">
                              {module.number}
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold mb-1">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">{module.subtitle}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4 pt-2">
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Obiettivi</h4>
                          <p className="text-muted-foreground">{module.objectives}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Contenuti</h4>
                          <ul className="space-y-2 text-muted-foreground">
                            {module.content.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-accent mt-1.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {module.clinicalIntegration && (
                          <div>
                            <h4 className="font-semibold text-accent mb-2">Integrazione clinica</h4>
                            <ul className="space-y-2 text-muted-foreground">
                              {module.clinicalIntegration.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-accent mt-1.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {module.application && (
                          <div>
                            <h4 className="font-semibold text-accent mb-2">Applicazione</h4>
                            <p className="text-muted-foreground">{module.application}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Program;
