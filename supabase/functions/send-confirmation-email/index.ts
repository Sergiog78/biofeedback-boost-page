import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log("Processing confirmation email for session:", sessionId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session with line items to verify the product
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
    
    console.log("Retrieved session:", session.id, "Payment status:", session.payment_status);

    // Verify payment was successful
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // CRITICAL: Verify this is specifically for the Biofeedback course
    const BIOFEEDBACK_COURSE_PRICE_ID = "price_1SPPGeGSUlmGTzYSahKSeVIJ";
    const lineItems = session.line_items?.data || [];
    
    const isBiofeedbackCourse = lineItems.some((item: any) => 
      item.price?.id === BIOFEEDBACK_COURSE_PRICE_ID
    );

    if (!isBiofeedbackCourse) {
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

    console.log("Confirmed: This is a Biofeedback course purchase");

    // Get customer details
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "Cliente";
    
    if (!customerEmail) {
      throw new Error("Customer email not found");
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
                <p><span class="emoji">🧠</span> Il corso inizierà <strong>mercoledì 4 dicembre</strong> e si svolgerà in diretta online, offrendo un percorso pratico e approfondito per integrare le tecniche di biofeedback nella pratica clinica.</p>
              </div>
              
              <p><strong>Nelle prossime settimane riceverà via email:</strong></p>
              <ul>
                <li>📩 le istruzioni dettagliate per accedere alla piattaforma online,</li>
                <li>📅 il calendario delle lezioni in diretta,</li>
                <li>e tutte le informazioni utili per prepararsi al meglio all'avvio del corso.</li>
              </ul>
              
              <p>Nel frattempo, le consigliamo di salvare questo indirizzo email tra i contatti per assicurarsi di ricevere senza problemi tutti gli aggiornamenti.</p>
              
              <p>Per qualsiasi necessità, può contattare la nostra segreteria didattica all'indirizzo:<br>
              📧 <a href="mailto:formazione@centronovamentis.it">formazione@centronovamentis.it</a></p>
            </div>
            
            <div class="footer">
              <p><strong>A presto,<br>
              Segreteria Didattica – Centro Nova Mentis</strong></p>
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
