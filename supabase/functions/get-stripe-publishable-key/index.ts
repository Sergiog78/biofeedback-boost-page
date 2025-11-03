import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const key =
      Deno.env.get("VITE_STRIPE_PUBLISHABLE_KEY") ||
      Deno.env.get("STRIPE_PUBLISHABLE_KEY") ||
      "";

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing publishable key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Security guard: only allow keys starting with pk_
    if (!key.startsWith("pk_")) {
      console.error("Invalid key format detected - must start with pk_");
      return new Response(JSON.stringify({ error: "Invalid publishable key format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ publishableKey: key }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
