import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { enrollmentId } = await req.json();
    
    console.log("Resending email for enrollment:", enrollmentId);

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get enrollment details
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from("course_enrollments")
      .select("*")
      .eq("id", enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      throw new Error("Enrollment not found");
    }

    console.log("Found enrollment:", enrollment.email);

    // Initialize Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

    // Split name
    const firstName = enrollment.first_name || "Cliente";
    const lastName = enrollment.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Send email
    const emailData = await resend.emails.send({
      from: "Corso Biofeedback <formazione@centronovamentis.it>",
      to: [enrollment.email],
      subject: "✅ Conferma iscrizione - Corso di Biofeedback",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Iscrizione Confermata!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; color: #667eea; margin-top: 0;">Ciao ${firstName},</p>
            
            <p style="font-size: 16px;">Benvenuto/a nel <strong>Corso di Biofeedback Applicato</strong>! 🚀</p>
            
            <p>La tua iscrizione è stata confermata con successo. Ecco i dettagli del corso:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">📚 Dettagli del Corso</h2>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">📅 <strong>Inizio:</strong> 4 dicembre 2025</li>
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">⏰ <strong>Durata:</strong> 10 lezioni (20 ore totali)</li>
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">🎓 <strong>Certificazione:</strong> BFE Italia</li>
                <li style="padding: 8px 0;">💻 <strong>Modalità:</strong> Online in diretta</li>
              </ul>
            </div>
            
            <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c5aa0; margin-top: 0;">🔜 Prossimi Passi</h3>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">Riceverai un'email con il link alla piattaforma di formazione</li>
                <li style="margin-bottom: 10px;">Ti contatteremo prima dell'inizio del corso con tutte le informazioni</li>
                <li style="margin-bottom: 10px;">Avrai accesso ai materiali digitali sulla piattaforma dedicata</li>
              </ol>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>📧 Importante:</strong> Controlla anche la cartella spam per non perdere comunicazioni importanti!
              </p>
            </div>
            
            <p style="margin-top: 30px;">Per qualsiasi domanda, non esitare a contattarci:</p>
            <p style="text-align: center; font-size: 16px;">
              <strong>📧 formazione@centronovamentis.it</strong>
            </p>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Ti aspettiamo!<br>
              <strong style="color: #667eea;">Il Team del Centro Nova Mentis</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Hai ricevuto questa email perché ti sei iscritto al Corso di Biofeedback Applicato</p>
            <p style="margin-top: 10px;">Riferimento transazione: ${enrollment.stripe_payment_intent_id || enrollment.stripe_session_id || enrollmentId}</p>
          </div>
          
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.data?.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error resending email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to send email" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});