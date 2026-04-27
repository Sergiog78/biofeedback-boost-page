import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Devo avere conoscenze di neuroanatomia o biofeedback per seguire il corso?",
    answer: "No. Il corso è progettato anche per chi parte da zero. I concetti vengono spiegati in modo chiaro e sempre collegati alla pratica clinica, senza richiedere competenze tecniche avanzate.",
  },
  {
    question: "È un corso teorico o imparerò davvero a usarlo in seduta?",
    answer: "L'obiettivo del corso non è solo farti capire il biofeedback, ma metterti nelle condizioni di iniziare a usarlo nella pratica clinica. Tutto è orientato all'applicazione reale, con esempi e indicazioni concrete.",
  },
  {
    question: "Dopo il corso sarò davvero in grado di utilizzare il biofeedback con i pazienti?",
    answer: "Sì, l'obiettivo è proprio questo. Al termine del corso avrai le basi per iniziare a introdurre il biofeedback nelle tue sedute e fare le prime esperienze pratiche con i pazienti.",
  },
  {
    question: "Serve avere già una strumentazione biofeedback?",
    answer: "No, non è necessario avere già dispositivi. Durante il corso verranno fornite indicazioni su strumenti accessibili e su come iniziare in modo graduale e sostenibile.",
  },
  {
    question: "E se poi ho dubbi o difficoltà dopo il corso?",
    answer: "Non rimani solo. Avrai accesso a un gruppo privato di confronto clinico continuo con colleghi, tutor e docenti, dove potrai fare domande, chiedere chiarimenti e confrontarti anche dopo la fine del corso.",
  },
  {
    question: "Questo corso è adatto al mio approccio terapeutico?",
    answer: "Sì. Il biofeedback non sostituisce il tuo approccio, ma lo integra. È uno strumento trasversale che può essere utilizzato all'interno di diversi modelli terapeutici.",
  },
  {
    question: "Quanto tempo serve per iniziare a usarlo davvero?",
    answer: "Già durante il corso acquisirai le basi per iniziare. L'obiettivo è permetterti di introdurre il biofeedback in modo semplice e graduale fin dalle prime sedute.",
  },
  {
    question: "È previsto un attestato o certificazione?",
    answer: "Sì, il corso rilascia una certificazione riconosciuta (BFE di I livello), utile per il tuo percorso professionale.",
  },
  {
    question: "Il corso è registrato o live?",
    answer: "Il corso è live. Questo ti permette di fare domande, confrontarti direttamente con i docenti e avere chiarimenti in tempo reale.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 md:py-28 bg-card">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Label */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Domande frequenti
          </h2>
          <p className="text-lg text-muted-foreground">
            Se hai ancora qualche dubbio, probabilmente trovi qui la risposta
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="multiple" defaultValue={["faq-0", "faq-1", "faq-2"]} className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border border-border/50 rounded-xl px-6 bg-background shadow-sm"
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
