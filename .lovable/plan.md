

## Hero Section Redesign — VSL + New Copy + Sticky CTA

### What changes

Complete rewrite of the Hero section following the mobile-first conversion structure provided, with a VSL video block and sticky CTA.

### Structure (exact order, mobile-first)

```text
┌──────────────────────────────┐
│  Eyebrow (pill badge)        │
│  Headline (h1)               │
│  Sottotitolo (p)             │
│  Social proof line (⭐)      │
│  CTA primaria (button)       │
│  Microproof (3 checkmarks)   │
│                              │
│  Video intro text            │
│  ┌────────────────────────┐  │
│  │   VIDEO VSL (mp4)      │  │
│  │   9:16 aspect ratio    │  │
│  └────────────────────────┘  │
│  Bullet points (4 items)     │
│  CTA secondaria (button)     │
│                              │
│  Partner logos (BFE+Righetto) │
└──────────────────────────────┘
```

### Video hosting

- Create a **public** Supabase Storage bucket `videos` via SQL migration
- User will upload the mp4 file, which gets served from the bucket URL
- For now, render a placeholder thumbnail container with a play button overlay; the video `<video>` element loads the mp4 with `controls`, no autoplay, showing duration
- Aspect ratio: vertical (9:16) on mobile, constrained max-width ~400px centered on desktop

### Copy (verbatim from brief)

- **Eyebrow**: "Corso online live di 16 ore | Introduzione al Biofeedback in Psicoterapia"
- **Headline**: "Impara a integrare il biofeedback nella tua pratica clinica in modo semplice, concreto e scientificamente rigoroso"
- **Sottotitolo**: "Per psicologi e psicoterapeuti che vogliono iniziare a usare il biofeedback in seduta senza perdersi nella complessità tecnica e senza snaturare la relazione terapeutica."
- **Social proof**: "⭐ Già scelto da psicologi e psicoterapeuti che vogliono integrare il biofeedback nella pratica clinica"
- **CTA primaria**: "Iscriviti ora al corso" + dynamic price
- **Microproof**: 3 check items (Corso live, Accessibile senza basi tecniche, Supporto + community + supervisione)
- **Video intro**: "Guarda il video e scopri perché il biofeedback non è complesso come ti hanno fatto credere"
- **Bullets** (under video): 4 discovery points
- **CTA secondaria**: "Iscriviti ora e inizia a usare il biofeedback nella tua pratica clinica"

### Sticky CTA

- After 5-7 seconds of scrolling, show a fixed bottom bar (mobile) / bottom-right floating button (desktop) with "Iscriviti al corso" that navigates to checkout
- Disappears when hero section is back in viewport
- Uses Intersection Observer + timeout

### Files to change

1. **SQL migration** — Create `videos` storage bucket (public) with open read policy
2. **`src/components/Hero.tsx`** — Full rewrite with new structure, copy, video container, sticky CTA logic
3. No other files need changes; dynamic pricing imports remain the same

### Design details

- Dark overlay background stays (same as current)
- Video container: rounded corners, subtle border, max-w-sm centered, 9:16 aspect ratio
- Bullet points: left-aligned list with check icons, white/90 text
- Sticky CTA: bg-accent, full-width on mobile, z-50, smooth slide-up animation
- All spacing optimized mobile-first with responsive adjustments

