import { useEffect } from "react";

// Extend Window interface to include fbq
declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, any>) => void;
  }
}

export const useMetaPixel = () => {
  const trackEvent = (event: string, params?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.fbq) {
      console.log(`🎯 Meta Pixel: Tracking ${event}`, params);
      window.fbq("track", event, params);
    } else {
      console.warn("⚠️ Meta Pixel not loaded");
    }
  };

  const trackViewContent = (contentName: string, value?: number, currency?: string) => {
    trackEvent("ViewContent", {
      content_name: contentName,
      ...(value && { value, currency: currency || "EUR" })
    });
  };

  const trackInitiateCheckout = (value: number, currency: string = "EUR") => {
    trackEvent("InitiateCheckout", {
      value,
      currency,
      content_name: "Corso Biofeedback"
    });
  };

  const trackPurchase = (value: number, currency: string = "EUR", transactionId?: string) => {
    trackEvent("Purchase", {
      value,
      currency,
      content_name: "Corso Biofeedback",
      ...(transactionId && { transaction_id: transactionId })
    });
  };

  return {
    trackEvent,
    trackViewContent,
    trackInitiateCheckout,
    trackPurchase
  };
};
