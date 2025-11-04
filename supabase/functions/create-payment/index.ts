import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation
const validateInput = (data: any) => {
  const errors: string[] = [];
  
  if (!data.email || typeof data.email !== 'string' || data.email.length > 255) {
    errors.push('Invalid email');
  }
  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.length > 100) {
    errors.push('Invalid first name');
  }
  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.length > 100) {
    errors.push('Invalid last name');
  }
  
  return errors;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate inputs
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
    
    const { email, firstName, lastName } = body;

    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
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

    // Create checkout session for express checkout (returns to /checkout to prefill form)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['paypal'],
      line_items: [
        {
          price: "price_1SPPGeGSUlmGTzYSahKSeVIJ",
          quantity: 1,
        },
      ],
      mode: "payment",
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${req.headers.get("origin")}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        customerEmail: email,
        customerName: `${firstName} ${lastName}`,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Don't expose detailed error messages
    return new Response(
      JSON.stringify({ error: "Payment processing failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
