## Obiettivo

Spostare la sezione delle due video recensioni (Ilaria Mazzotta e Simona Carnevale) in modo che appaia subito dopo la sezione "Cosa imparerai" (che attualmente si trova all'interno del componente `Solution`, nel blocco "Durante il corso imparerai a:").

## Situazione attuale

Ordine attuale delle sezioni nella homepage (`src/pages/Index.tsx`):

```text
Header
Hero
Features
InstrumentationObjection
Solution              ← contiene "Durante il corso imparerai a:"
ClinicalScenarios
Testimonials          ← le 2 video recensioni
Program
CourseIncludes
Instructor
Pricing
FAQ
Footer
WhatsAppButton
```

## Nuovo ordine

```text
Header
Hero
Features
InstrumentationObjection
Solution              ← "Cosa imparerai"
Testimonials          ← spostata qui, subito sotto
ClinicalScenarios
Program
CourseIncludes
Instructor
Pricing
FAQ
Footer
WhatsAppButton
```

## Modifica tecnica

Un solo file da toccare:

- **`src/pages/Index.tsx`**: invertire l'ordine di `<ClinicalScenarios />` e `<Testimonials />` nel JSX, in modo che `Testimonials` venga renderizzata immediatamente dopo `Solution`.

Nessuna modifica ai contenuti, agli stili o alla logica dei componenti. Nessun impatto su tracciamento, checkout o flussi di pagamento.
