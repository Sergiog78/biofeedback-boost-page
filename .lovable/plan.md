

## Modifiche alla sezione Testimonials

### Cosa cambia

1. **Ridurre da 3 a 2 video** — Aggiornare l'array `testimonials` con i dati reali:
   - Video 1: **Ilaria Mazzotta** (Psicologa / Psicoterapeuta)
   - Video 2: **Simona Carnevale** (Psicologa / Psicoterapeuta)

2. **Griglia da 3 a 2 colonne** — Cambiare `md:grid-cols-3` → `md:grid-cols-2` con `max-w-3xl mx-auto` per centrare i due video

3. **Video reali con tag `<video>`** — Ogni card mostrerà un elemento `<video>` con `controls` e `poster` placeholder, che carica il file mp4 dal bucket storage pubblico `videos`

### Dove caricare i video

I video vanno caricati nel **bucket storage "videos"** già configurato nel backend. I file saranno accessibili all'URL:

```
https://unawxvbbievblwkdttzi.supabase.co/storage/v1/object/public/videos/ilaria-mazzotta.mp4
https://unawxvbbievblwkdttzi.supabase.co/storage/v1/object/public/videos/simona-carnevale.mp4
```

Dopo l'implementazione, ti indicherò come caricarli direttamente tramite il pannello Lovable Cloud oppure potrai fornirmeli come file e li carico io nel bucket.

### File da modificare

- `src/components/Testimonials.tsx` — Unico file da aggiornare

