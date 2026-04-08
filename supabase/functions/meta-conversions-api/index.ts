import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIXEL_ID = "916507733967731";
const API_VERSION = "v21.0";

interface CAPIEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: "website";
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string[]; // hashed email
    ph?: string[]; // hashed phone
    fn?: string[]; // hashed first name
    ln?: string[]; // hashed last name
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    transaction_id?: string;
  };
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("META_CONVERSIONS_API_TOKEN");
    if (!accessToken) {
      console.error("META_CONVERSIONS_API_TOKEN not configured");
      return new Response(JSON.stringify({ error: "CAPI not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const body = await req.json();
    const {
      eventName,
      eventId,
      sourceUrl,
      email,
      phone,
      firstName,
      lastName,
      value,
      currency,
      contentName,
      transactionId,
    } = body;

    if (!eventName || !eventId) {
      return new Response(JSON.stringify({ error: "eventName and eventId required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Build user_data with hashed PII
    const userData: CAPIEvent["user_data"] = {
      client_ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || undefined,
      client_user_agent: req.headers.get("user-agent") || undefined,
    };

    if (email) userData.em = [await hashSHA256(email)];
    if (phone) userData.ph = [await hashSHA256(phone)];
    if (firstName) userData.fn = [await hashSHA256(firstName)];
    if (lastName) userData.ln = [await hashSHA256(lastName)];

    const event: CAPIEvent = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl || "https://biofeedback-boost-page.lovable.app",
      action_source: "website",
      user_data: userData,
    };

    if (value || currency || contentName || transactionId) {
      event.custom_data = {};
      if (value) event.custom_data.value = value;
      if (currency) event.custom_data.currency = currency;
      if (contentName) event.custom_data.content_name = contentName;
      if (transactionId) event.custom_data.transaction_id = transactionId;
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [event],
        access_token: accessToken,
      }),
    });

    const result = await response.json();
    console.log("Meta CAPI response:", JSON.stringify(result));

    if (!response.ok) {
      console.error("Meta CAPI error:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "CAPI request failed", details: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      });
    }

    return new Response(JSON.stringify({ success: true, events_received: result.events_received }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Meta CAPI error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
