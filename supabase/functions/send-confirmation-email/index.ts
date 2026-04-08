import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, paymentIntentId } = await req.json();
    
    if (!sessionId && !paymentIntentId) {
      throw new Error("Either sessionId or paymentIntentId is required");
    }

    console.log("Processing confirmation email", { sessionId, paymentIntentId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let customerEmail: string | null = null;
    let customerName = "Cliente";
    let customerPhone: string | null = null;
    let stripeCustomerId: string | null = null;
    let amountPaid = 0;
    let profession: string | null = null;

    // Handle PaymentIntent (card payments)
    if (paymentIntentId) {
      console.log("Processing PaymentIntent:", paymentIntentId);
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log("Retrieved PaymentIntent:", paymentIntent.id, "Status:", paymentIntent.status);

      if (paymentIntent.status !== "succeeded") {
        throw new Error("Payment not completed");
      }

      // Get customer details from metadata FIRST
      if (paymentIntent.metadata) {
        customerEmail = paymentIntent.metadata.customerEmail || null;
        customerName = paymentIntent.metadata.customerName || "Cliente";
        customerPhone = paymentIntent.metadata.customerPhone || null;
        profession = paymentIntent.metadata.customerProfession || null;
      }

      if (paymentIntent.customer) {
        const customerId = typeof paymentIntent.customer === 'string' 
          ? paymentIntent.customer 
          : paymentIntent.customer.id;
        stripeCustomerId = customerId;
      }

      // Fallback to Stripe customer object if metadata is empty
      if (!customerEmail && paymentIntent.customer) {
        const customerId = typeof paymentIntent.customer === 'string' 
          ? paymentIntent.customer 
          : paymentIntent.customer.id;
        
        const customer = await stripe.customers.retrieve(customerId);
        if ('email' in customer) {
          customerEmail = customer.email;
          customerName = customer.name || "Cliente";
        }
      }

      amountPaid = paymentIntent.amount;
      console.log("PaymentIntent customer details:", { email: customerEmail, name: customerName, phone: customerPhone, amount: amountPaid });
    }
    
    // Handle Checkout Session (PayPal payments)
    if (sessionId) {
      console.log("Processing Checkout Session:", sessionId);
      
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log("Retrieved session:", session.id, "Payment status:", session.payment_status);

      if (session.payment_status !== 'paid') {
        throw new Error("Payment not completed");
      }

      customerEmail = session.customer_details?.email || session.customer_email;
      customerName = session.customer_details?.name || "Cliente";
      customerPhone = session.customer_details?.phone || null;
      
      if (session.metadata) {
        profession = session.metadata.customerProfession || null;
      }
      
      if (session.customer) {
        stripeCustomerId = typeof session.customer === 'string' 
          ? session.customer 
          : session.customer.id;
      }

      amountPaid = session.amount_total || 0;
      console.log("Session customer details:", { email: customerEmail, name: customerName, phone: customerPhone, amount: amountPaid });
    }
    
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || customerName;
    const lastName = nameParts.slice(1).join(' ') || '';

    // Format the amount paid in EUR
    const amountEur = (amountPaid / 100).toFixed(2).replace('.', ',');

    console.log("Final customer details:", { email: customerEmail, name: customerName, phone: customerPhone, profession, amountEur });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if email already sent to prevent duplicates
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
      console.log("Email already sent for this enrollment, skipping");
      return new Response(
        JSON.stringify({ success: true, message: "Email already sent", enrollmentId: existingEnrollment.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Save enrollment data to database
    try {
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
        console.error("Error saving enrollment to database:", enrollmentError);
      } else {
        console.log("Enrollment saved successfully:", enrollmentData?.id);
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
    }

    console.log("Sending confirmation email to:", customerEmail);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { data, error } = await resend.emails.send({
      from: "Centro Nova Mentis <formazione@centronovamentis.it>",
      to: [customerEmail],
      subject: "✅ Conferma iscrizione – Corso Online di Biofeedback in Psicoterapia",
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
              
              <p>la ringraziamo per la sua iscrizione al <strong>Corso Online di Biofeedback in Psicoterapia – "Dal dato fisiologico alla relazione terapeutica"</strong>, tenuto dal <strong>Dott. Gabriele Ciccarese</strong>.</p>
              
              <p>Abbiamo ricevuto correttamente il pagamento di <strong>€${amountEur}</strong>: la sua iscrizione è ora confermata ✅</p>
              
              <div class="highlight">
                <p><span class="emoji">🧠</span> Il corso inizierà <strong>Sabato 9 maggio 2026</strong> e si svolgerà in diretta online il sabato mattina, offrendo un percorso pratico e approfondito per integrare le tecniche di biofeedback nella pratica clinica.</p>
              </div>
              
              <p><strong>Dettagli del corso:</strong></p>
              <ul>
                <li>📅 <strong>Date:</strong> 9, 16, 23 e 30 maggio 2026</li>
                <li>⏰ <strong>Orario:</strong> Sabato mattina, 09:00 – 13:00</li>
                <li>📖 <strong>Durata:</strong> 4 giornate, 16 ore totali</li>
                <li>💻 <strong>Modalità:</strong> Online in diretta</li>
                <li>🎓 <strong>Certificazione:</strong> BFE di I livello (Biofeedback Federation of Europe)</li>
              </ul>
              
              <p><strong>Nelle prossime settimane riceverà via email:</strong></p>
              <ul>
                <li>📩 le istruzioni dettagliate per collegarsi e partecipare alle lezioni online,</li>
                <li>📖 i materiali didattici preparatori,</li>
                <li>👥 informazioni per interagire con il docente e gli altri partecipanti.</li>
              </ul>

              <p>Resti in attesa delle nostre comunicazioni: la contatteremo con tutti i dettagli operativi prima dell'inizio del corso.</p>
              
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
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
