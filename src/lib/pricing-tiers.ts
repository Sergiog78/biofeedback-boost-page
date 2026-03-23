// Single source of truth for dynamic pricing tiers
// Launch: 25 marzo 2026, ore 10:00 CET

export const IVA_RATE = 0.22;

// Launch date in CET (UTC+1 for March)
export const LAUNCH_DATE = new Date('2026-03-25T09:00:00Z'); // 10:00 CET = 09:00 UTC
export const COURSE_DATE = new Date('2026-05-08T21:59:59Z'); // 23:59 CET

export interface PricingTier {
  index: number;
  label: string;
  basePrice: number; // ex-IVA
  totalPrice: number; // IVA inclusa (rounded to 2 decimals)
  totalPriceCents: number; // for Stripe
  startDate: Date;
  endDate: Date;
}

const tierDefs = [
  { label: "Early Bird", basePrice: 139, durationHours: 72 },
  { label: "Fase 2", basePrice: 169, durationHours: 7 * 24 },
  { label: "Fase 3", basePrice: 179, durationHours: 7 * 24 },
  { label: "Prezzo Finale", basePrice: 199, durationHours: 0 }, // ends at COURSE_DATE
];

function buildTiers(): PricingTier[] {
  const tiers: PricingTier[] = [];
  let currentStart = new Date(LAUNCH_DATE);

  for (let i = 0; i < tierDefs.length; i++) {
    const def = tierDefs[i];
    const totalPrice = Math.round(def.basePrice * (1 + IVA_RATE) * 100) / 100;
    const totalPriceCents = Math.round(def.basePrice * (1 + IVA_RATE) * 100);

    let endDate: Date;
    if (i === tierDefs.length - 1) {
      endDate = new Date(COURSE_DATE);
    } else {
      endDate = new Date(currentStart.getTime() + def.durationHours * 60 * 60 * 1000);
    }

    tiers.push({
      index: i,
      label: def.label,
      basePrice: def.basePrice,
      totalPrice,
      totalPriceCents,
      startDate: new Date(currentStart),
      endDate,
    });

    currentStart = new Date(endDate);
  }

  return tiers;
}

export const PRICING_TIERS = buildTiers();

export interface CurrentTierInfo {
  tier: PricingTier;
  nextTier: PricingTier | null;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  };
  isBeforeLaunch: boolean;
  isAfterCourse: boolean;
}

export function getCurrentTier(now: Date = new Date()): CurrentTierInfo {
  const nowMs = now.getTime();

  // Before launch — show first tier
  if (nowMs < LAUNCH_DATE.getTime()) {
    const diff = PRICING_TIERS[0].endDate.getTime() - LAUNCH_DATE.getTime();
    return {
      tier: PRICING_TIERS[0],
      nextTier: PRICING_TIERS[1] || null,
      timeRemaining: msToTimeRemaining(diff),
      isBeforeLaunch: true,
      isAfterCourse: false,
    };
  }

  // After course date — show last tier
  if (nowMs >= COURSE_DATE.getTime()) {
    return {
      tier: PRICING_TIERS[PRICING_TIERS.length - 1],
      nextTier: null,
      timeRemaining: msToTimeRemaining(0),
      isBeforeLaunch: false,
      isAfterCourse: true,
    };
  }

  // Find active tier
  for (let i = 0; i < PRICING_TIERS.length; i++) {
    const t = PRICING_TIERS[i];
    if (nowMs >= t.startDate.getTime() && nowMs < t.endDate.getTime()) {
      const remaining = t.endDate.getTime() - nowMs;
      return {
        tier: t,
        nextTier: PRICING_TIERS[i + 1] || null,
        timeRemaining: msToTimeRemaining(remaining),
        isBeforeLaunch: false,
        isAfterCourse: false,
      };
    }
  }

  // Fallback to last tier
  return {
    tier: PRICING_TIERS[PRICING_TIERS.length - 1],
    nextTier: null,
    timeRemaining: msToTimeRemaining(0),
    isBeforeLaunch: false,
    isAfterCourse: false,
  };
}

function msToTimeRemaining(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, totalMs: ms };
}

export function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',');
}
