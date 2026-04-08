

## Aggiornamento email di conferma

### Problema attuale
L'email di conferma contiene dati del primo corso (dicembre 2025, 20 ore, prezzo fisso €280) e una verifica hardcoded dell'importo a 49700 centesimi che blocca l'invio per i nuovi prezzi dinamici.

### Modifiche previste

**File: `supabase/functions/send-confirmation-email/index.ts`**

1. **Rimuovere il controllo hardcoded sull'importo** (riga 54) — attualmente rifiuta pagamenti che non siano esattamente €497. Con il pricing dinamico (€299–€399 + IVA), questo blocco impedisce l'invio dell'email. Sostituirlo con un range ragionevole (es. 30000–60000 centesimi) o rimuoverlo del tutto.

2. **Mostrare il prezzo reale pagato nell'email** — usare la variabile `amountPaid` (già disponibile dal PaymentIntent/Session) per calcolare e visualizzare il prezzo effettivo: `(amountPaid / 100).toFixed(2)` formattato in euro.

3. **Aggiornare i dettagli del corso nell'HTML**:
   - Inizio: **Sabato 9 maggio 2026**
   - Durata: **4 giornate, 16 ore totali** (sabato mattina 9:00–13:00)
   - Date: 9, 16, 23, 30 maggio 2026
   - Certificazione: **BFE di I livello**
   - Modalità: online in diretta

4. **Aggiornare la sezione "prossime comunicazioni"** — informare che riceveranno istruzioni per collegarsi e partecipare al corso online con comunicazioni future.

5. **Rimuovere il riferimento al `BIOFEEDBACK_COURSE_PRICE_ID`** hardcoded per la verifica PayPal (riga 31, 123-125), dato che il pricing è ora dinamico con `price_data` inline.

### Dettagli tecnici
- Il prezzo nell'email sarà calcolato dinamicamente da `amountPaid` (centesimi Stripe → euro)
- La verifica del pagamento rimarrà basata sullo status (`succeeded` / `paid`) senza controllare l'importo esatto
- L'Edge Function verrà ri-deployata automaticamente dopo la modifica

