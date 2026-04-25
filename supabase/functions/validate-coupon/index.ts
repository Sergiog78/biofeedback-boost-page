import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Pricing tiers (mirror frontend) ──
const IVA_RATE = 0.22;
const LAUNCH_DATE = new Date("2026-04-09T08:00:00Z");
const COURSE_DATE = new Date("2026-05-08T21:59:59Z");

const TIER_DEFS = [
  { basePrice: 299, durationHours: 7 * 24 },
  { basePrice: 329, durationHours: 7 * 24 },
  { basePrice: 359, durationHours: 7 * 24 },
  { basePrice: 399, durationHours: 0 },
];

function getCurrentPriceCents(): number {
  const now = Date.now();
  let start = LAUNCH_DATE.getTime();
  for (let i = 0; i < TIER_DEFS.length; i++) {
    const def = TIER_DEFS[i];
    const end = i === TIER_DEFS.length - 1
      ? COURSE_DATE.getTime()
      : start + def.durationHours * 3600000;
    if (now < end || i === TIER_DEFS.length - 1) {
      return Math.round(def.basePrice * (1 + IVA_RATE) * 100);
    }
    start = end;
  }
  return Math.round(399 * (1 + IVA_RATE) * 100);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const rawCode = (body?.code ?? "").toString().trim();

    if (!rawCode || rawCode.length < 2 || rawCode.length > 80) {
      return new Response(
        JSON.stringify({ valid: false, error: "Codice coupon non valido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const baseAmount = getCurrentPriceCents();
    let couponId: string | null = null;
    let promotionCodeId: string | null = null;
    let percentOff: number | null = null;
    let amountOffCents: number | null = null;
    let currency = "eur";

    // First try as a Promotion Code (case-insensitive, what users normally type)
    try {
      const promo = await stripe.promotionCodes.list({
        code: rawCode,
        active: true,
        limit: 1,
      });
      if (promo.data.length > 0) {
        const p = promo.data[0];
        promotionCodeId = p.id;
        const c = p.coupon;
        if (c && c.valid) {
          couponId = c.id;
          percentOff = c.percent_off ?? null;
          amountOffCents = c.amount_off ?? null;
          currency = (c.currency ?? "eur").toLowerCase();
        }
      }
    } catch (e) {
      console.error("Promotion code lookup failed:", e);
    }

    // Fallback: try as direct Coupon ID
    if (!couponId) {
      try {
        const c = await stripe.coupons.retrieve(rawCode);
        if (c && c.valid) {
          couponId = c.id;
          percentOff = c.percent_off ?? null;
          amountOffCents = c.amount_off ?? null;
          currency = (c.currency ?? "eur").toLowerCase();
        }
      } catch (e) {
        // Not a coupon either
      }
    }

    if (!couponId) {
      return new Response(
        JSON.stringify({ valid: false, error: "Codice coupon non valido o scaduto" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (currency !== "eur" && amountOffCents != null) {
      return new Response(
        JSON.stringify({ valid: false, error: "Coupon in valuta non supportata" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let discountCents = 0;
    if (percentOff != null) {
      discountCents = Math.round((baseAmount * percentOff) / 100);
    } else if (amountOffCents != null) {
      discountCents = amountOffCents;
    }
    if (discountCents > baseAmount) discountCents = baseAmount;
    const finalAmount = Math.max(0, baseAmount - discountCents);

    return new Response(
      JSON.stringify({
        valid: true,
        couponId,
        promotionCodeId,
        percentOff,
        amountOffCents,
        baseAmountCents: baseAmount,
        discountCents,
        finalAmountCents: finalAmount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("validate-coupon error:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Errore validazione coupon" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
