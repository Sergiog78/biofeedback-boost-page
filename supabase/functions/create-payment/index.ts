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
  return Math.round(399 * (1 + IVA_RATE) * 100);
}

function getCurrentBasePrice(): number {
  const now = Date.now();
  let start = LAUNCH_DATE.getTime();

  for (let i = 0; i < TIER_DEFS.length; i++) {
    const def = TIER_DEFS[i];
    const end = i === TIER_DEFS.length - 1
      ? COURSE_DATE.getTime()
      : start + def.durationHours * 3600000;

    if (now < end || i === TIER_DEFS.length - 1) {
      return def.basePrice;
    }
    start = end;
  }
  return 399;
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
  
  // Profession is OPTIONAL — no min length check, only max if provided
  if (data.profession && typeof data.profession === 'string' && data.profession.length > 100) {
    errors.push('Profession too long');
  }

  // paymentMethod must be 'paypal' or 'klarna' (default 'paypal' for backwards compat)
  if (data.paymentMethod && !['paypal', 'klarna'].includes(data.paymentMethod)) {
    errors.push('Invalid payment method');
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
    
    const { email, firstName, lastName, profession, paymentMethod, billingDetails } = body;
    const method: 'paypal' | 'klarna' = paymentMethod || 'paypal';

    const priceCents = getCurrentPriceCents();
    const basePrice = getCurrentBasePrice();
    console.log(`Creating ${method} checkout with dynamic price:`, priceCents, "cents (base:", basePrice, "EUR)");

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
      });
      customerId = customer.id;
    }

    const sessionMetadata: Record<string, string> = {
      customerEmail: email,
      customerName: `${firstName} ${lastName}`,
      customerProfession: profession || '',
      paymentMethod: method,
      hasBillingDetails: billingDetails ? 'true' : 'false',
    };

    if (billingDetails) {
      sessionMetadata.billing_businessName = (billingDetails.businessName || '').slice(0, 200);
      sessionMetadata.billing_vatNumber = (billingDetails.vatNumber || '').slice(0, 30);
      sessionMetadata.billing_fiscalCode = (billingDetails.fiscalCode || '').slice(0, 30);
      sessionMetadata.billing_sdiOrPec = (billingDetails.sdiOrPec || '').slice(0, 100);
      sessionMetadata.billing_address = (billingDetails.billingAddress || '').slice(0, 500);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: [method],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product: 'prod_TU2MR8jyYAbKva',
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: sessionMetadata,
      payment_intent_data: {
        metadata: sessionMetadata,
      },
    });

    // Persist billing_details immediately (linked to session) when present
    if (billingDetails) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        await supabaseAdmin.from("billing_details").insert({
          stripe_session_id: session.id,
          email,
          business_name: billingDetails.businessName,
          vat_number: billingDetails.vatNumber,
          fiscal_code: billingDetails.fiscalCode || null,
          sdi_or_pec: billingDetails.sdiOrPec,
          billing_address: billingDetails.billingAddress,
        });
        console.log("✅ Billing details saved for session", session.id);
      } catch (e) {
        console.error("⚠️ Failed to persist billing details (non-blocking):", e);
      }
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(
      JSON.stringify({ error: "Payment processing failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
