import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Pricing tiers (same logic as frontend) ──
const IVA_RATE = 0.22;
const LAUNCH_DATE = new Date('2026-04-09T08:00:00Z'); // 10:00 CEST
const COURSE_DATE = new Date('2026-05-08T21:59:59Z');

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
  // Fallback
  return Math.round(399 * (1 + IVA_RATE) * 100);
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

  // Profession is OPTIONAL
  if (data.profession && typeof data.profession === 'string' && data.profession.length > 100) {
    errors.push('Profession too long');
  }

  // Billing details validation (only when requested)
  if (data.billingDetails) {
    const b = data.billingDetails;
    if (!b.businessName || typeof b.businessName !== 'string' || b.businessName.trim().length < 1 || b.businessName.length > 200) {
      errors.push('Invalid business name');
    }
    if (!b.vatNumber || typeof b.vatNumber !== 'string' || b.vatNumber.trim().length < 5 || b.vatNumber.length > 30) {
      errors.push('Invalid VAT number');
    }
    if (b.fiscalCode && (typeof b.fiscalCode !== 'string' || b.fiscalCode.length > 30)) {
      errors.push('Invalid fiscal code');
    }
    if (!b.sdiOrPec || typeof b.sdiOrPec !== 'string' || b.sdiOrPec.trim().length < 3 || b.sdiOrPec.length > 100) {
      errors.push('Invalid SDI/PEC');
    }
    if (!b.billingAddress || typeof b.billingAddress !== 'string' || b.billingAddress.trim().length < 5 || b.billingAddress.length > 500) {
      errors.push('Invalid billing address');
    }
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
    
    const { email, firstName, lastName, phone, profession, billingDetails } = body;

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

    const piMetadata: Record<string, string> = {
      customerEmail: email,
      customerName: `${firstName} ${lastName}`,
      customerPhone: phone || '',
      customerProfession: profession || '',
      hasBillingDetails: billingDetails ? 'true' : 'false',
    };

    if (billingDetails) {
      piMetadata.billing_businessName = (billingDetails.businessName || '').slice(0, 200);
      piMetadata.billing_vatNumber = (billingDetails.vatNumber || '').slice(0, 30);
      piMetadata.billing_fiscalCode = (billingDetails.fiscalCode || '').slice(0, 30);
      piMetadata.billing_sdiOrPec = (billingDetails.sdiOrPec || '').slice(0, 100);
      piMetadata.billing_address = (billingDetails.billingAddress || '').slice(0, 500);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceCents,
      currency: "eur",
      customer: customerId,
      payment_method_types: ["card"],
      receipt_email: email,
      metadata: piMetadata,
    });

    // Persist billing_details immediately (linked to PaymentIntent)
    if (billingDetails) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        await supabaseAdmin.from("billing_details").insert({
          stripe_payment_intent_id: paymentIntent.id,
          email,
          business_name: billingDetails.businessName,
          vat_number: billingDetails.vatNumber,
          fiscal_code: billingDetails.fiscalCode || null,
          sdi_or_pec: billingDetails.sdiOrPec,
          billing_address: billingDetails.billingAddress,
        });
        console.log("✅ Billing details saved for PI", paymentIntent.id);
      } catch (e) {
        console.error("⚠️ Failed to persist billing details (non-blocking):", e);
      }
    }

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
