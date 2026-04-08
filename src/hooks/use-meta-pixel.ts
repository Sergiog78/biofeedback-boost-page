import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Extend Window interface to include fbq
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

// Generate a unique event ID for deduplication between Pixel and CAPI
const generateEventId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

// Send event to Meta Conversions API (server-side)
const sendCAPIEvent = async (params: {
  eventName: string;
  eventId: string;
  sourceUrl?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  transactionId?: string;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke("meta-conversions-api", {
      body: {
        ...params,
        sourceUrl: params.sourceUrl || window.location.href,
      },
    });
    if (error) {
      console.warn("⚠️ CAPI send failed:", error);
    } else {
      console.log(`✅ CAPI: ${params.eventName} sent (event_id: ${params.eventId})`);
    }
    return data;
  } catch (e) {
    console.warn("⚠️ CAPI send error:", e);
  }
};

export const useMetaPixel = () => {
  const trackEvent = (event: string, params?: Record<string, any>, eventId?: string) => {
    if (typeof window !== "undefined" && window.fbq) {
      // Pass eventId for deduplication
      const fbParams = eventId ? { ...params, eventID: eventId } : params;
      console.log(`🎯 Meta Pixel: Tracking ${event}`, fbParams);
      window.fbq("track", event, params, eventId ? { eventID: eventId } : undefined);
    } else {
      console.warn("⚠️ Meta Pixel not loaded");
    }
  };

  const trackViewContent = (contentName: string, value?: number, currency?: string) => {
    const eventId = generateEventId();
    trackEvent("ViewContent", {
      content_name: contentName,
      ...(value && { value, currency: currency || "EUR" })
    }, eventId);
    sendCAPIEvent({
      eventName: "ViewContent",
      eventId,
      contentName,
      value,
      currency: currency || "EUR",
    });
  };

  const trackInitiateCheckout = (
    value: number,
    currency: string = "EUR",
    userData?: { email?: string; firstName?: string; lastName?: string; phone?: string }
  ) => {
    const eventId = generateEventId();
    trackEvent("InitiateCheckout", {
      value,
      currency,
      content_name: "Corso Biofeedback"
    }, eventId);
    sendCAPIEvent({
      eventName: "InitiateCheckout",
      eventId,
      value,
      currency,
      contentName: "Corso Biofeedback",
      ...userData,
    });
  };

  const trackPurchase = (
    value: number,
    currency: string = "EUR",
    transactionId?: string,
    userData?: { email?: string; firstName?: string; lastName?: string; phone?: string }
  ) => {
    const eventId = generateEventId();
    trackEvent("Purchase", {
      value,
      currency,
      content_name: "Corso Biofeedback",
      ...(transactionId && { transaction_id: transactionId })
    }, eventId);
    sendCAPIEvent({
      eventName: "Purchase",
      eventId,
      value,
      currency,
      contentName: "Corso Biofeedback",
      transactionId,
      ...userData,
    });
  };

  return {
    trackEvent,
    trackViewContent,
    trackInitiateCheckout,
    trackPurchase
  };
};
