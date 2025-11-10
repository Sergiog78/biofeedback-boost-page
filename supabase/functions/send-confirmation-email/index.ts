import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, paymentIntentId } = await req.json();
    
    if (!sessionId && !paymentIntentId) {
      throw new Error("Either sessionId or paymentIntentId is required");
    }

    console.log("Processing confirmation email", { sessionId, paymentIntentId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const BIOFEEDBACK_COURSE_PRICE_ID = "price_1SPPGeGSUlmGTzYSahKSeVIJ";
    let customerEmail: string | null = null;
    let customerName = "Cliente";
    let customerPhone: string | null = null;
    let stripeCustomerId: string | null = null;
    let amountPaid = 28000; // Default 280 EUR
    let profession: string | null = null;

    // Handle PaymentIntent (card payments)
    let paymentIntent: any = null;
    if (paymentIntentId) {
      console.log("Processing PaymentIntent:", paymentIntentId);
      
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      console.log("Retrieved PaymentIntent:", paymentIntent.id, "Status:", paymentIntent.status);

      // Verify payment was successful
      if (paymentIntent.status !== "succeeded") {
        throw new Error("Payment not completed");
      }

      // CRITICAL: Verify this is for the Biofeedback course (280 EUR = 28000 cents)
      if (paymentIntent.amount !== 28000) {
        console.log("Skipping email - not a Biofeedback course purchase (wrong amount)");
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Not a Biofeedback course purchase - wrong amount" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      console.log("Confirmed: This is a Biofeedback course purchase (card payment)");

      // PRIORITY: Get customer details from metadata FIRST (most recent and complete data from form)
      if (paymentIntent.metadata) {
        customerEmail = paymentIntent.metadata.customerEmail || null;
        customerName = paymentIntent.metadata.customerName || "Cliente";
        customerPhone = paymentIntent.metadata.customerPhone || null;
        profession = paymentIntent.metadata.customerProfession || null;
        console.log("Metadata found:", { email: customerEmail, name: customerName, phone: customerPhone, profession });
      }

      // Get Stripe customer ID for reference
      if (paymentIntent.customer) {
        const customerId = typeof paymentIntent.customer === 'string' 
          ? paymentIntent.customer 
          : paymentIntent.customer.id;
        stripeCustomerId = customerId;
        console.log("Stripe customer ID:", stripeCustomerId);
      }

      // Fallback to Stripe customer object ONLY if metadata is empty
      if (!customerEmail && paymentIntent.customer) {
        const customerId = typeof paymentIntent.customer === 'string' 
          ? paymentIntent.customer 
          : paymentIntent.customer.id;
        
        const customer = await stripe.customers.retrieve(customerId);
        if ('email' in customer) {
          customerEmail = customer.email;
          customerName = customer.name || "Cliente";
        }
        console.log("Fallback to customer object:", { email: customerEmail, name: customerName });
      }

      amountPaid = paymentIntent.amount;
      console.log("PaymentIntent customer details:", { email: customerEmail, name: customerName, phone: customerPhone });
    }
    
    // Handle Checkout Session (PayPal payments)
    if (sessionId) {
      console.log("Processing Checkout Session:", sessionId);
      
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
      });
      
      console.log("Retrieved session:", session.id, "Payment status:", session.payment_status);

      // Verify payment was completed
      if (session.payment_status !== 'paid') {
        throw new Error("Payment not completed");
      }

      // CRITICAL: Verify this is for the Biofeedback course
      const lineItems = session.line_items?.data || [];
      const hasBiofeedbackCourse = lineItems.some((item: any) => 
        item.price?.id === BIOFEEDBACK_COURSE_PRICE_ID
      );

      if (!hasBiofeedbackCourse) {
        console.log("Skipping email - not a Biofeedback course purchase");
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Not a Biofeedback course purchase" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      console.log("Confirmed: This is a Biofeedback course purchase (PayPal payment)");

      // Get customer details from session
      customerEmail = session.customer_details?.email || session.customer_email;
      customerName = session.customer_details?.name || "Cliente";
      customerPhone = session.customer_details?.phone || null;
      
      // Get profession from session metadata
      if (session.metadata) {
        profession = session.metadata.customerProfession || null;
      }
      
      if (session.customer) {
        stripeCustomerId = typeof session.customer === 'string' 
          ? session.customer 
          : session.customer.id;
      }

      amountPaid = session.amount_total || 28000;
      console.log("Session customer details:", { email: customerEmail, name: customerName, phone: customerPhone, profession });
    }
    
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Split customer name into first and last name
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || customerName;
    const lastName = nameParts.slice(1).join(' ') || '';

    console.log("Final customer details:", { email: customerEmail, name: customerName, phone: customerPhone, profession });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if email already sent to prevent duplicates
    console.log("Checking for existing enrollment...");
    
    // Build query based on which ID is present
    let query = supabaseClient
      .from('course_enrollments')
      .select('id, email_sent_at');
    
    if (sessionId) {
      query = query.eq('stripe_session_id', sessionId);
    } else if (paymentIntentId) {
      query = query.eq('stripe_payment_intent_id', paymentIntentId);
    }
    
    const { data: existingEnrollment } = await query.maybeSingle();

    if (existingEnrollment?.email_sent_at) {
      console.log("Email already sent for this enrollment, skipping", {
        enrollmentId: existingEnrollment.id,
        emailSentAt: existingEnrollment.email_sent_at
      });
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email already sent",
          enrollmentId: existingEnrollment.id 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Save enrollment data to database
    try {
      console.log("Saving enrollment data to database...");
      
      const { data: enrollmentData, error: enrollmentError } = await supabaseClient
        .from('course_enrollments')
        .insert({
          email: customerEmail,
          first_name: firstName,
          last_name: lastName,
          phone: customerPhone,
          profession: profession,
          stripe_session_id: sessionId || null,
          stripe_payment_intent_id: paymentIntentId || null,
          stripe_customer_id: stripeCustomerId,
          payment_status: 'paid',
          amount_paid: amountPaid,
        })
        .select()
        .single();

      if (enrollmentError) {
        // Log error but don't fail the entire function
        console.error("Error saving enrollment to database:", enrollmentError);
        // Continue with sending email even if database save fails
      } else {
        console.log("Enrollment saved successfully:", enrollmentData?.id);
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      // Continue with sending email even if database save fails
    }

    console.log("Sending confirmation email to:", customerEmail);

    // Initialize Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Send confirmation email
    const { data, error } = await resend.emails.send({
      from: "Centro Nova Mentis <formazione@centronovamentis.it>",
      to: [customerEmail],
      subject: "✅ Conferma iscrizione al Corso Online di Biofeedback – Dott. Gabriele Ciccarese",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .content {
                padding: 20px 0;
              }
              .highlight {
                background-color: #e8f5e9;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
              }
              .emoji {
                font-size: 1.2em;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin: 0; color: #2c5f2d;">✅ Conferma Iscrizione</h2>
            </div>
            
            <div class="content">
              <p>Gentile <strong>${customerName}</strong>,</p>
              
              <p>la ringraziamo per la sua iscrizione al <strong>Corso Online di Biofeedback in Psicoterapia</strong> tenuto dal <strong>Dott. Gabriele Ciccarese</strong>.</p>
              
              <p>Abbiamo ricevuto correttamente il pagamento della quota di <strong>280€</strong>: la sua iscrizione è ora confermata ✅</p>
              
              <div class="highlight">
                <p><span class="emoji">🧠</span> Il corso inizierà <strong>Giovedi 4 dicembre 2025</strong> e si svolgerà in diretta online, offrendo un percorso pratico e approfondito per integrare le tecniche di biofeedback nella pratica clinica.</p>
              </div>
              
              <p><strong>Nelle prossime settimane riceverà via email:</strong></p>
              <ul>
                <li>📩 le istruzioni dettagliate per accedere alla piattaforma online,</li>
                <li>📖 i materiali didattici preparatori,</li>
                <li>👥 informazioni per interagire con il docente e gli altri partecipanti.</li>
              </ul>
              
              <p><strong>Dettagli del corso:</strong></p>
              <ul>
                <li>📅 Inizio: Giovedi 4 dicembre 2025</li>
                <li>⏰ 10 lezioni da 2 ore (20 ore totali)</li>
                <li>💻 Modalità: online in diretta</li>
                <li>🎓 Certificazione BFE Italia</li>
              </ul>
              
              <div class="footer">
                <p>Per qualsiasi domanda o necessità, non esiti a contattarci:</p>
                <p><strong>Email:</strong> formazione@centronovamentis.it</p>
                <p style="margin-top: 20px;">Cordiali saluti,<br><strong>Il Team del Centro Nova Mentis</strong></p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    // Update enrollment with email_sent_at timestamp
    try {
      let updateQuery = supabaseClient
        .from('course_enrollments')
        .update({ email_sent_at: new Date().toISOString() });
      
      if (sessionId) {
        updateQuery = updateQuery.eq('stripe_session_id', sessionId);
      } else if (paymentIntentId) {
        updateQuery = updateQuery.eq('stripe_payment_intent_id', paymentIntentId);
      }
      
      const { error: updateError } = await updateQuery;
      
      if (updateError) {
        console.error("Failed to update email_sent_at:", updateError);
      } else {
        console.log("Updated enrollment with email_sent_at timestamp");
      }
    } catch (updateError) {
      console.error("Failed to update email_sent_at:", updateError);
      // Don't fail the request if this update fails
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});