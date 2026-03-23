import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Pricing tiers (same logic as frontend) ──
const IVA_RATE = 0.22;
const LAUNCH_DATE = new Date('2026-03-25T09:00:00Z'); // 10:00 CET
const COURSE_DATE = new Date('2026-05-08T21:59:59Z');

const TIER_DEFS = [
  { basePrice: 139, durationHours: 72 },
  { basePrice: 169, durationHours: 7 * 24 },
  { basePrice: 179, durationHours: 7 * 24 },
  { basePrice: 199, durationHours: 0 },
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
  // Fallback
  return Math.round(199 * (1 + IVA_RATE) * 100);
}

// Input validation
const validateInput = (data: any) => {
  const errors: string[] = [];
  
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (data.email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (!data.firstName || typeof data.firstName !== 'string') {
    errors.push('First name is required');
  } else if (data.firstName.length > 100 || !/^[a-zA-ZÀ-ÿ\s'-]+$/.test(data.firstName)) {
    errors.push('Invalid first name');
  }
  
  if (!data.lastName || typeof data.lastName !== 'string') {
    errors.push('Last name is required');
  } else if (data.lastName.length > 100 || !/^[a-zA-ZÀ-ÿ\s'-]+$/.test(data.lastName)) {
    errors.push('Invalid last name');
  }

  if (data.phone && (typeof data.phone !== 'string' || data.phone.length < 8 || data.phone.length > 20)) {
    errors.push('Invalid phone number');
  }

  if (!data.profession || typeof data.profession !== 'string') {
    errors.push('Profession is required');
  } else if (data.profession.length > 100) {
    errors.push('Profession too long');
  }
  
  return errors;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const validationErrors = validateInput(body);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationErrors }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const { email, firstName, lastName, phone, profession } = body;

    const priceCents = getCurrentPriceCents();
    console.log("Creating PaymentIntent with dynamic price:", priceCents, "cents");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        phone: phone || undefined,
      });
      customerId = customer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceCents,
      currency: "eur",
      customer: customerId,
      payment_method_types: ["card"],
      receipt_email: email,
      metadata: {
        customerEmail: email,
        customerName: `${firstName} ${lastName}`,
        customerPhone: phone || '',
        customerProfession: profession,
      },
    });

    console.log("PaymentIntent created:", paymentIntent.id, "amount:", priceCents);

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Payment processing failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
