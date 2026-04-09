

## Piano: Aggiornamento scaglioni di prezzo con nuovo lancio (9 aprile 2026)

### Nuovi scaglioni

Il lancio parte oggi, 9 aprile 2026. Il corso inizia il 9 maggio, quindi l'ultimo giorno utile è l'8 maggio. Circa 29 giorni divisi in 4 fasce settimanali:

```text
Scaglione       Prezzo      Periodo                  Durata
─────────────────────────────────────────────────────────────
Early Bird      €299+IVA    9 apr → 16 apr           7 giorni
Fase 2          €329+IVA    16 apr → 23 apr          7 giorni
Fase 3          €359+IVA    23 apr → 30 apr          7 giorni
Prezzo Finale   €399+IVA    30 apr → 8 mag           8 giorni
```

### File da modificare (3 file, stessa logica)

1. **`src/lib/pricing-tiers.ts`** — Aggiornare `LAUNCH_DATE` a `2026-04-09T08:00:00Z` (10:00 CEST) e le durate dei tier a 7 giorni ciascuno (168 ore).

2. **`supabase/functions/create-payment-intent/index.ts`** — Stesso aggiornamento di `LAUNCH_DATE` e durate.

3. **`supabase/functions/create-payment/index.ts`** — Stesso aggiornamento.

### Test

Dopo le modifiche, testerò la edge function `create-payment-intent` con una chiamata diretta per verificare che il prezzo calcolato server-side corrisponda allo scaglione attivo (oggi = €299+IVA = 36478 centesimi).

