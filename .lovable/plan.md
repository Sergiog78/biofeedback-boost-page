

## Dynamic Pricing System with Countdown

### Overview
Implement a time-based pricing system that starts at €139+IVA on March 25, 2026 and increases through 4 tiers until the course date (May 8). Each tier shows a countdown and a visual pricing roadmap.

### Pricing Tiers (launch: 25 marzo 2026, ore 10:00 CET)

| Fascia | Periodo | Prezzo (+ IVA 22%) | Totale IVA incl. | Durata |
|--------|---------|-------------------|-------------------|--------|
| 1 | 25 mar 10:00 → 28 mar 10:00 | €139 | €169,58 | 72 ore |
| 2 | 28 mar 10:00 → 4 apr 10:00 | €169 | €206,18 | 7 giorni |
| 3 | 4 apr 10:00 → 11 apr 10:00 | €179 | €218,38 | 7 giorni |
| 4 | 11 apr 10:00 → 8 mag 23:59 | €199 | €242,78 | fino al corso |

### Architecture

**1. Shared pricing config** — `src/lib/pricing-tiers.ts`
- Single source of truth for tier dates, base prices, and IVA-inclusive prices
- `getCurrentTier()` function returns active tier + time remaining to next tier
- Used by both frontend components and passed as reference for backend validation

**2. Backend enforcement (security-critical)**
- Update `create-payment-intent` edge function: replace hardcoded €497 with date-based tier calculation (same logic, server-side)
- Update `create-payment` edge function (PayPal): create 4 Stripe Price objects (one per tier) and select the correct one based on current date server-side
- Create 4 new Stripe prices via Stripe tools for the PayPal checkout flow

**3. Frontend — Pricing Roadmap component** — `src/components/PricingRoadmap.tsx`
- Visual stepper showing all 4 tiers vertically
- Past tiers: strikethrough price, grayed out, with a checkmark
- Current tier: highlighted with accent color, shows the active price prominently
- Future tiers: visible but subdued
- Countdown timer (days, hours, minutes, seconds) showing time until next price increase
- Used in both `Pricing.tsx` and `Checkout.tsx` order summary

**4. Update existing components**
- **Hero.tsx**: Change CTA button text to show current dynamic price instead of hardcoded "497 euro"
- **Pricing.tsx**: Replace static €497 card with the PricingRoadmap component + current price display
- **Checkout.tsx**: Update order summary sidebar (right column) to show current tier price instead of €497, include the PricingRoadmap, update Meta Pixel tracking values
- **Checkout.tsx**: Remove hardcoded `amount: 497` from the form re-creation flow (line 372)

### Technical Details

**Pricing config structure:**
```text
LAUNCH_DATE = 2026-03-25T10:00:00+01:00 (CET)

tiers[] = [
  { end: LAUNCH + 72h,  basePrice: 139, label: "Early Bird" },
  { end: LAUNCH + 72h + 7d, basePrice: 169, label: "Fase 2" },
  { end: LAUNCH + 72h + 14d, basePrice: 179, label: "Fase 3" },
  { end: 2026-05-08T23:59:59, basePrice: 199, label: "Prezzo Finale" },
]

IVA_RATE = 0.22
```

**Server-side price calculation** (in both edge functions):
- Calculate current tier from `new Date()` using same date boundaries
- Use tier's price in cents for PaymentIntent amount
- For PayPal, map tier index → corresponding Stripe price_id

**Countdown component**: Uses `setInterval(1000)` with cleanup, recalculates `getCurrentTier()` each tick. When a tier expires, the UI automatically transitions to the next tier.

### Files to create/modify
1. **Create** `src/lib/pricing-tiers.ts` — shared config + helper functions
2. **Create** `src/components/PricingRoadmap.tsx` — visual tier stepper with countdown
3. **Modify** `src/components/Pricing.tsx` — integrate roadmap, dynamic price
4. **Modify** `src/components/Hero.tsx` — dynamic CTA price
5. **Modify** `src/pages/Checkout.tsx` — dynamic prices in order summary + roadmap
6. **Modify** `supabase/functions/create-payment-intent/index.ts` — date-based amount
7. **Modify** `supabase/functions/create-payment/index.ts` — date-based price_id selection
8. **Create** 4 Stripe prices via Stripe tools (for PayPal flow)

