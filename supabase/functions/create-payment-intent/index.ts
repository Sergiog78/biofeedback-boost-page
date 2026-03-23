import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Course price is hard-coded server-side to prevent manipulation
const COURSE_PRICE_CENTS = 49700; // €497

// Input validation schema
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

  // Phone is optional but if provided must be valid
  if (data.phone && (typeof data.phone !== 'string' || data.phone.length < 8 || data.phone.length > 20)) {
    errors.push('Invalid phone number');
  }

  // Profession is required
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
    
    const { email, firstName, lastName, phone, profession } = body;

    console.log("Creating PaymentIntent with data:", { email, firstName, lastName, phone, profession });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      const customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        phone: phone || undefined,
      });
      customerId = customer.id;
      console.log("Created new customer:", customerId);
    }

    // Create payment intent restricted to card only
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency: "eur",
      customer: customerId,
      payment_method_types: ["card"],
      receipt_email: email, // Ensure correct email appears in Stripe dashboard
      metadata: {
        customerEmail: email,
        customerName: `${firstName} ${lastName}`,
        customerPhone: phone || '',
        customerProfession: profession,
      },
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
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
