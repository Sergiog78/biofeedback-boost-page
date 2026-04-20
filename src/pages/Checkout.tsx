import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm, { StripePaymentFormRef } from "@/components/StripePaymentForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import WhatsAppButton from "@/components/WhatsAppButton";
import bfeLogo from "@/assets/bfe-logo-text.png";
import righettoLogo from "@/assets/righetto-logo.png";
import mastercardLogo from "@/assets/mastercard.svg";
import centersOfExcellenceLogo from "@/assets/centers-of-excellence.jpeg";
import novaMentisLogo from "@/assets/logo-nova-mentis.svg";
import gabrieleCiccarese from "@/assets/gabriele-ciccarese.png";
import { useMetaPixel } from "@/hooks/use-meta-pixel";
import { getCurrentTier, formatPrice } from "@/lib/pricing-tiers";

// Validation schema for checkout form
const checkoutSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, "Nome richiesto")
    .max(100, "Nome troppo lungo")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contiene caratteri non validi"),
  lastName: z.string()
    .trim()
    .min(1, "Cognome richiesto")
    .max(100, "Cognome troppo lungo")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Cognome contiene caratteri non validi"),
  email: z.string()
    .trim()
    .email("Email non valida")
    .max(255, "Email troppo lunga")
    .toLowerCase(),
  phone: z.string()
    .trim()
    .min(8, "Numero di telefono troppo corto")
    .max(20, "Numero di telefono troppo lungo")
    .regex(/^[0-9+\s()-]+$/, "Numero di telefono non valido"),
  // Profession is OPTIONAL: empty allowed, but if provided must be reasonable length
  profession: z.string()
    .trim()
    .max(100, "Professione troppo lunga")
    .optional()
    .or(z.literal("")),
});

type BillingDetails = {
  businessName: string;
  vatNumber: string;
  fiscalCode: string;
  sdiOrPec: string;
  billingAddress: string;
};

const emptyBilling: BillingDetails = {
  businessName: "",
  vatNumber: "",
  fiscalCode: "",
  sdiOrPec: "",
  billingAddress: "",
};

function isBillingValid(b: BillingDetails): boolean {
  return (
    b.businessName.trim().length > 0 &&
    b.vatNumber.trim().length >= 5 &&
    b.sdiOrPec.trim().length >= 3 &&
    b.billingAddress.trim().length >= 5
  );
}

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'klarna'>('card');
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<any>(undefined);
  const [stripeReady, setStripeReady] = useState(false);
  const stripeFormRef = useRef<StripePaymentFormRef>(null);
  const isCreatingIntent = useRef(false);
  const { trackViewContent, trackInitiateCheckout } = useMetaPixel();
  const [tierInfo, setTierInfo] = useState(getCurrentTier());

  // Billing / P.IVA section
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [billing, setBilling] = useState<BillingDetails>(emptyBilling);
  const billingValid = !wantsInvoice || isBillingValid(billing);

  // Installment amount (Klarna 3x): exact thirds of total IVA inclusa
  const installment = (tierInfo.tier.totalPrice / 3);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profession: "",
    },
    mode: "onChange",
  });

  // Update tier info every second
  useEffect(() => {
    const interval = setInterval(() => setTierInfo(getCurrentTier()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top on mount + track Meta Pixel events
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const price = getCurrentTier().tier.totalPrice;
    trackViewContent("Checkout - Corso Biofeedback", price, "EUR");
    trackInitiateCheckout(price, "EUR");
  }, []);

  // Load saved data or PayPal data on mount
  useEffect(() => {
    const loadCheckoutData = async () => {
      // Check if returning from PayPal with session_id
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      console.log("=== Checkout Page Load ===");
      console.log("Current URL:", window.location.href);
      console.log("Session ID from URL:", sessionId);
      
      if (sessionId) {
        console.log("🎯 Returning from PayPal with session_id:", sessionId);
        try {
          console.log("📞 Calling get-checkout-session...");
          // Retrieve customer data from Stripe session
          const { data, error } = await supabase.functions.invoke('get-checkout-session', {
            body: { sessionId }
          });

          console.log("Response from get-checkout-session:", { data, error });

          if (error) {
            console.error("❌ Error from get-checkout-session:", error);
            throw error;
          }

          if (data?.paymentStatus === 'paid') {
              console.log("✅ PayPal payment confirmed, redirecting to success page with session_id:", sessionId);
              toast({
                title: "Pagamento completato",
                description: "Il tuo pagamento è stato elaborato con successo!",
              });
              setTimeout(() => {
                console.log("🔀 Navigating to:", `/payment-success?session_id=${sessionId}`);
                navigate(`/payment-success?session_id=${sessionId}`);
              }, 2000);
            } else {
              console.log("⚠️ Payment not completed yet. Status:", data?.paymentStatus);
            }

          // Clean up URL
          console.log("🧹 Cleaning up URL");
          window.history.replaceState({}, '', '/checkout');
        } catch (e) {
          console.error('❌ Error loading PayPal data:', e);
        }
      } else {
        console.log("No session_id in URL, checking localStorage...");
        // Load saved data from localStorage
        const savedData = localStorage.getItem('checkoutData');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            console.log("✅ Loaded data from localStorage");
            form.reset(parsed);
            setRememberMe(true);
          } catch (e) {
            console.error('Error loading saved checkout data:', e);
          }
        } else {
          console.log("No saved data in localStorage");
        }
      }
    };

    loadCheckoutData();
  }, []);

  // Stripe loader with retry and timeout
  const reloadStripe = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔵 (Re)loading Stripe initialization...`);

    try {
      console.log(`[${timestamp}] 📞 Calling get-stripe-publishable-key...`);
      const { data, error } = await supabase.functions.invoke('get-stripe-publishable-key');

      if (error) {
        console.error(`[${timestamp}] ❌ Error getting Stripe key:`, error);
        throw error;
      }

      if (data?.publishableKey) {
        console.log(`[${timestamp}] ✅ Stripe key received, loading Stripe.js...`);
        // First attempt (default)
        let stripe = await loadStripe(data.publishableKey);

        // Fallback for aggressive blockers (Safari with content filters, etc.)
        if (!stripe) {
          console.warn(`[${timestamp}] ⚠️ First loadStripe returned null, retrying with advancedFraudSignals: false`);
          stripe = await loadStripe(data.publishableKey, { advancedFraudSignals: false } as any);
        }

        if (!stripe) {
          throw new Error('Stripe.js failed to load');
        }

        setStripePromise(stripe);
        console.log(`[${timestamp}] ✅ Stripe initialized successfully`);
      } else {
        throw new Error('No publishable key in response');
      }
    } catch (error: any) {
      console.error(`[${timestamp}] ❌ Error initializing Stripe:`, error);
      toast({
        title: 'Errore caricamento pagamento',
        description: 'Impossibile caricare il sistema di pagamento. Riprova o usa PayPal.',
        variant: 'destructive',
      });
      setStripePromise(null);
    }
  };

  // Initialize Stripe on mount
  useEffect(() => {
    // mark as loading state
    setStripePromise(undefined as any);

    // Timeout detection (15s)
    const timeoutId = setTimeout(() => {
      if (stripePromise === undefined) {
        console.warn('⚠️ Stripe initialization timeout after 15 seconds');
        toast({
          title: 'Caricamento lento',
          description: 'Il sistema di pagamento sta impiegando più tempo del normale. Puoi attendere ancora o usare PayPal.',
        });
      }
    }, 15000);

    reloadStripe();

    return () => clearTimeout(timeoutId);
  }, []);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    navigate(`/payment-success?payment_intent_id=${paymentIntentId}`);
  };

  const isFormValid = form.formState.isValid && billingValid;
  
  // Store form values used to create clientSecret (to detect staleness)
  const clientSecretFormValuesRef = useRef<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    profession: string;
    billingSnapshot: string; // serialized billing or "" when not requested
  } | null>(null);

  // Create clientSecret when card is selected and form is valid
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Payment method effect triggered`, { 
      paymentMethod, 
      isFormValid, 
      hasClientSecret: !!clientSecret,
      hasStripePromise: !!stripePromise,
      isCreatingIntent: isCreatingIntent.current
    });

    const createClientSecret = async () => {
      if (paymentMethod === 'card' && isFormValid && !clientSecret && !isCreatingIntent.current && stripePromise) {
        isCreatingIntent.current = true;
        const formValues = form.getValues();
        console.log(`[${new Date().toISOString()}] 💳 Creating PaymentIntent for card payment`, {
          formData: formValues,
          hasExistingSecret: !!clientSecret,
          stripeInitialized: !!stripePromise
        });
        
        try {
          const { data: intentData, error: intentError } = await supabase.functions.invoke(
            'create-payment-intent',
            {
              body: { 
                email: formValues.email,
                firstName: formValues.firstName,
                lastName: formValues.lastName,
                phone: formValues.phone,
                profession: formValues.profession || '',
                billingDetails: wantsInvoice ? billing : undefined,
              },
            }
          );

          if (intentError) {
            console.error(`[${new Date().toISOString()}] ❌ Error creating payment intent:`, intentError);
            toast({
              title: "Errore",
              description: "Impossibile inizializzare il pagamento. Riprova.",
              variant: "destructive",
            });
            isCreatingIntent.current = false;
            return;
          }

          if (intentData?.clientSecret) {
            console.log(`[${new Date().toISOString()}] ✅ PaymentIntent created successfully`, {
              clientSecretPreview: intentData.clientSecret.substring(0, 20) + "...",
              formData: formValues
            });
            // Store form values used for this clientSecret
            clientSecretFormValuesRef.current = {
              email: formValues.email,
              firstName: formValues.firstName,
              lastName: formValues.lastName,
              phone: formValues.phone,
              profession: formValues.profession || '',
              billingSnapshot: wantsInvoice ? JSON.stringify(billing) : '',
            };
            setClientSecret(intentData.clientSecret);
          } else {
            console.error(`[${new Date().toISOString()}] ❌ No clientSecret in response`);
          }
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] ❌ Error creating PaymentIntent:`, error);
        } finally {
          isCreatingIntent.current = false;
        }
      } else {
        console.log(`[${new Date().toISOString()}] ⏭️ Skipping PaymentIntent creation:`, {
          isCard: paymentMethod === 'card',
          isFormValid,
          hasClientSecret: !!clientSecret,
          isCreatingIntent: isCreatingIntent.current,
          hasStripePromise: !!stripePromise
        });
      }
    };

    if (paymentMethod === 'card' && isFormValid && stripePromise) {
      createClientSecret();
    } else if (paymentMethod === 'paypal') {
      console.log(`[${new Date().toISOString()}] 💰 Switched to PayPal, clearing clientSecret`);
      setClientSecret('');
      setStripeReady(false);
      isCreatingIntent.current = false;
      clientSecretFormValuesRef.current = null;
    }
  }, [paymentMethod, isFormValid, stripePromise]);

  const handleFormSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    if (!acceptedTerms) {
      toast({
        title: "Accetta i termini",
        description: "Devi accettare i termini e le condizioni per procedere",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage if remember me is checked
    if (rememberMe) {
      localStorage.setItem('checkoutData', JSON.stringify(values));
    } else {
      localStorage.removeItem('checkoutData');
    }

    // Save form data temporarily
    localStorage.setItem('checkoutFormData', JSON.stringify(values));

    if (paymentMethod === 'card') {
      // CRITICAL: Check if form values changed since clientSecret was created
      const currentValues = form.getValues();
      const storedValues = clientSecretFormValuesRef.current;
      
      const currentBillingSnapshot = wantsInvoice ? JSON.stringify(billing) : '';
      const hasFormChanged = storedValues && (
        currentValues.email !== storedValues.email ||
        currentValues.firstName !== storedValues.firstName ||
        currentValues.lastName !== storedValues.lastName ||
        currentValues.phone !== storedValues.phone ||
        (currentValues.profession || '') !== storedValues.profession ||
        currentBillingSnapshot !== storedValues.billingSnapshot
      );

      if (hasFormChanged) {
        console.log(`[${new Date().toISOString()}] ⚠️ Form values changed since clientSecret creation, recreating...`);
        setIsProcessing(true);
        
        try {
          // Recreate clientSecret with current values
          const { data: intentData, error: intentError } = await supabase.functions.invoke(
            'create-payment-intent',
            {
              body: { 
                email: currentValues.email,
                firstName: currentValues.firstName,
                lastName: currentValues.lastName,
                phone: currentValues.phone,
                profession: currentValues.profession || '',
                billingDetails: wantsInvoice ? billing : undefined,
              },
            }
          );

          if (intentError || !intentData?.clientSecret) {
            console.error(`[${new Date().toISOString()}] ❌ Error recreating payment intent`);
            toast({
              title: "Errore",
              description: "Impossibile aggiornare il pagamento. Riprova.",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }

          console.log(`[${new Date().toISOString()}] ✅ PaymentIntent recreated with updated data`);
          clientSecretFormValuesRef.current = {
            email: currentValues.email!,
            firstName: currentValues.firstName!,
            lastName: currentValues.lastName!,
            phone: currentValues.phone!,
            profession: currentValues.profession || '',
            billingSnapshot: currentBillingSnapshot,
          };
          setClientSecret(intentData.clientSecret);
          
          // Wait a bit for Stripe to process the new secret
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] ❌ Error recreating PaymentIntent:`, error);
          toast({
            title: "Errore",
            description: "Si è verificato un errore. Riprova.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
      }

      // Submit payment with current (or recreated) clientSecret
      setIsProcessing(true);
      try {
        if (stripeFormRef.current) {
          await stripeFormRef.current.submitPayment();
        }
      } catch (error: any) {
        console.error('Error in card payment flow:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore. Riprova tra poco.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Handle PayPal or Klarna checkout (Stripe Checkout session)
      await handleRedirectCheckout(paymentMethod);
    }
  };

  const handleRedirectCheckout = async (method: 'paypal' | 'klarna') => {
    const formValues = form.getValues();

    console.log(`=== ${method.toUpperCase()} Checkout Started ===`);
    console.log("Form values:", formValues);

    if (!formValues.email || !formValues.firstName || !formValues.lastName) {
      toast({
        title: "Dati mancanti",
        description: "Compila tutti i campi richiesti prima di procedere",
        variant: "destructive",
      });
      return;
    }

    if (wantsInvoice && !isBillingValid(billing)) {
      toast({
        title: "Dati di fatturazione incompleti",
        description: "Compila tutti i campi obbligatori della sezione fatturazione P.IVA",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log("📞 Calling create-payment edge function...");
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          email: formValues.email,
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          profession: formValues.profession || '',
          paymentMethod: method,
          billingDetails: wantsInvoice ? billing : undefined,
        }
      });

      console.log("Response from create-payment:", { data, error });

      if (error) {
        console.error("❌ Error from create-payment:", error);
        throw error;
      }
      if (!data?.url) {
        console.error("❌ No checkout URL returned");
        throw new Error('No checkout URL returned');
      }

      console.log("✅ Checkout URL received:", data.url);
      // Klarna requires same-tab redirect (popup blockers + Klarna SDK constraints)
      if (method === 'klarna') {
        window.location.href = data.url;
      } else {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error(`❌ ${method} checkout error:`, error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova tra poco.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Backwards-compatible alias used by the express PayPal button at the top
  const handlePayPalCheckout = () => handleRedirectCheckout('paypal');


  const canSubmit = isFormValid && acceptedTerms && (
    paymentMethod === 'paypal' ||
    paymentMethod === 'klarna' ||
    (paymentMethod === 'card' && stripeReady && clientSecret)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Torna alla home"
            >
              <svg 
                className="w-5 h-5 text-gray-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
            </button>
            <img src={bfeLogo} alt="BFE Logo" className="h-8" />
          </div>
          <div className="w-8" />
        </div>
      </header>

      <div className="container max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Scrollable Form */}
          <div className="bg-white px-4 py-8 lg:px-12 lg:py-12 order-2 lg:order-1">
            <div className="max-w-xl mx-auto space-y-8">
              {/* PayPal Express Checkout */}
              <div className="space-y-4">
                <h2 className="text-sm font-medium text-foreground">Check-out rapido</h2>
                <Button 
                  variant="outline" 
                  className="w-full h-14 bg-[#FFC439] hover:bg-[#FFC439]/90 border-0 disabled:opacity-50"
                  onClick={handlePayPalCheckout}
                  disabled={isProcessing || !isFormValid}
                  type="button"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#003087]" />
                  ) : (
                    <img 
                      src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png" 
                      alt="PayPal" 
                      className="h-5"
                    />
                  )}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">OPPURE</span>
                  </div>
                </div>
              </div>

              {/* Contact Information and Payment Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                  {/* Contatti Section */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-medium text-foreground">Contatti</h2>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Email" 
                              {...field} 
                              className="h-14 text-base border-gray-300"
                              autoComplete="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dati personali Section */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-medium text-foreground">Dati personali</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Nome" 
                                {...field} 
                                className="h-14 text-base border-gray-300"
                                autoComplete="given-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cognome" 
                                {...field} 
                                className="h-14 text-base border-gray-300"
                                autoComplete="family-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Telefono" 
                              {...field} 
                              className="h-14 text-base border-gray-300"
                              autoComplete="tel"
                              type="tel"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Professione (opzionale, es. Psicologo, Psicoterapeuta)"
                              {...field}
                              className="h-14 text-base border-gray-300"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fatturazione P.IVA Section */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="invoice"
                        checked={wantsInvoice}
                        onCheckedChange={(checked) => setWantsInvoice(checked as boolean)}
                        className="mt-1"
                      />
                      <Label
                        htmlFor="invoice"
                        className="text-sm font-medium cursor-pointer leading-relaxed"
                      >
                        Richiedo fattura con P.IVA / dati di fatturazione
                      </Label>
                    </div>

                    {wantsInvoice && (
                      <div className="space-y-3 animate-in slide-in-from-top-2 pl-7">
                        <Input
                          placeholder="Ragione sociale / Nome professionista *"
                          value={billing.businessName}
                          onChange={(e) => setBilling({ ...billing, businessName: e.target.value })}
                          maxLength={200}
                          className="h-12 text-base border-gray-300"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            placeholder="Partita IVA *"
                            value={billing.vatNumber}
                            onChange={(e) => setBilling({ ...billing, vatNumber: e.target.value })}
                            maxLength={30}
                            className="h-12 text-base border-gray-300"
                          />
                          <Input
                            placeholder="Codice fiscale"
                            value={billing.fiscalCode}
                            onChange={(e) => setBilling({ ...billing, fiscalCode: e.target.value })}
                            maxLength={30}
                            className="h-12 text-base border-gray-300"
                          />
                        </div>
                        <Input
                          placeholder="Codice SDI oppure PEC *"
                          value={billing.sdiOrPec}
                          onChange={(e) => setBilling({ ...billing, sdiOrPec: e.target.value })}
                          maxLength={100}
                          className="h-12 text-base border-gray-300"
                        />
                        <Input
                          placeholder="Indirizzo di fatturazione *"
                          value={billing.billingAddress}
                          onChange={(e) => setBilling({ ...billing, billingAddress: e.target.value })}
                          maxLength={500}
                          className="h-12 text-base border-gray-300"
                        />
                        <p className="text-xs text-muted-foreground">
                          La fattura elettronica verrà inviata tramite SDI o all'indirizzo PEC indicato.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pagamento Section with Radio Buttons */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-medium text-foreground">Pagamento</h2>
                    
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'paypal' | 'klarna')}>
                      {/* Card Payment Option */}
                      <div className={`border rounded-lg transition-all ${paymentMethod === 'card' ? 'border-foreground border-2' : 'border-gray-300'}`}>
                        <div className="p-4 flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="cursor-pointer font-medium text-sm">Carta di credito</Label>
                          </div>
                          	<div className="flex items-center gap-1.5">
                            	<img src="https://cdn.worldvectorlogo.com/logos/visa-2.svg" alt="Visa" className="h-5 w-8 object-contain" />
                            	<img src="https://cdn.worldvectorlogo.com/logos/maestro-2.svg" alt="Maestro" className="h-5 w-8 object-contain" />
                            	<img src={mastercardLogo} alt="Mastercard" className="h-5 w-8 object-contain" />
                            	<span className="text-xs text-muted-foreground ml-1">+2</span>
                          	</div>
                        </div>
                        
                        {paymentMethod === 'card' && (
                          <div className="px-4 pb-4 pt-2 border-t animate-in slide-in-from-top-2">
                            {stripePromise ? (
                              clientSecret ? (
                                <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
                                  <StripePaymentForm 
                                    ref={stripeFormRef}
                                    onSuccess={handlePaymentSuccess}
                                    onValidationChange={setStripeReady}
                                    clientSecret={clientSecret}
                                  />
                                </Elements>
                              ) : (
                                <div className="text-sm text-muted-foreground py-4 space-y-2">
                                  <p>💳 Compila tutti i campi sopra per abilitare il pagamento con carta</p>
                                </div>
                              )
                            ) : stripePromise === null ? (
                              <div className="text-sm text-muted-foreground py-4 space-y-2">
                                <p>⚠️ Impossibile caricare il sistema di pagamento con carta.</p>
                                <p className="text-xs">
                                  Riprova ricaricare la pagina o usa <strong>PayPal</strong> come metodo alternativo.
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Button 
                                    onClick={reloadStripe}
                                    size="sm"
                                  >
                                    Riprova
                                  </Button>
                                  <Button 
                                    onClick={() => setPaymentMethod('paypal')} 
                                    variant="outline" 
                                    size="sm"
                                  >
                                    Passa a PayPal
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground py-4">
                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                Caricamento del sistema di pagamento...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* PayPal Option */}
                      <div className={`border rounded-lg transition-all ${paymentMethod === 'paypal' ? 'border-foreground border-2' : 'border-gray-300'}`}>
                        <div className="p-4 flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal" className="cursor-pointer font-medium text-sm">PayPal</Label>
                          </div>
                          <img 
                            src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png" 
                            alt="PayPal" 
                            className="h-4"
                          />
                        </div>
                        
                        {paymentMethod === 'paypal' && (
                          <div className="px-4 pb-4 pt-2 border-t animate-in slide-in-from-top-2">
                            <p className="text-sm text-muted-foreground">
                              Dopo aver cliccato su "Paga con PayPal", sarai reindirizzato a PayPal per completare il pagamento in modo sicuro.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Klarna — Pay in 3 installments */}
                      <div className={`border rounded-lg transition-all ${paymentMethod === 'klarna' ? 'border-foreground border-2' : 'border-gray-300'}`}>
                        <div className="p-4 flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="klarna" id="klarna" />
                            <div className="flex flex-col">
                              <Label htmlFor="klarna" className="cursor-pointer font-medium text-sm">
                                💳 Paga in 3 rate senza interessi
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                3 rate da €{formatPrice(installment)} · Nessun interesse · Powered by Klarna
                              </span>
                            </div>
                          </div>
                          <img
                            src="https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg"
                            alt="Klarna"
                            className="h-5"
                          />
                        </div>

                        {paymentMethod === 'klarna' && (
                          <div className="px-4 pb-4 pt-2 border-t animate-in slide-in-from-top-2">
                            <p className="text-sm text-muted-foreground">
                              Dopo aver cliccato su "Paga con Klarna", sarai reindirizzato a Klarna per completare il pagamento in 3 rate senza interessi.
                            </p>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Remember Me Section */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="mt-1"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer leading-relaxed"
                    >
                      Salva le mie informazioni per un checkout più veloce la prossima volta
                    </Label>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3 pt-4">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor="terms" 
                      className="text-sm font-normal cursor-pointer leading-relaxed"
                    >
                      Accetto i{" "}
                      <a href="#" className="underline hover:no-underline">
                        termini e condizioni
                      </a>{" "}
                      e l'
                      <a href="#" className="underline hover:no-underline">
                        informativa sulla privacy
                      </a>
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className={`w-full h-14 text-base font-semibold disabled:opacity-100 ${
                      paymentMethod === 'paypal' && canSubmit
                        ? 'bg-[#0070BA] hover:bg-[#003087] text-white'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                    disabled={!canSubmit || isProcessing || (stripeFormRef.current?.isProcessing ?? false)}
                    variant="default"
                  >
                    {isProcessing || (stripeFormRef.current?.isProcessing ?? false) ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Elaborazione...
                      </>
                    ) : paymentMethod === 'paypal' ? (
                      <>
                        <img 
                          src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png" 
                          alt="PayPal" 
                          className="h-4 mr-2"
                        />
                        Paga con PayPal
                      </>
                    ) : (
                      'Paga ora'
                    )}
                  </Button>

                  {/* Trust info under button */}
                  {paymentMethod === 'card' && (
                    <div className="text-center space-y-1 pt-1">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pagamento sicuro tramite Stripe · Transazioni crittografate
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Accesso confermato via email entro pochi minuti dall'iscrizione
                      </p>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          </div>

          {/* Right Column - Sticky Order Summary */}
          <div className="bg-secondary/5 px-4 py-8 lg:px-12 lg:py-12 order-1 lg:order-2 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-6">
              {/* Product Info */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg border bg-white flex-shrink-0 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                      alt="Corso" 
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-semibold">
                      1
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      Introduzione al Biofeedback in Psicoterapia
                    </h3>
                    <p className="text-sm text-muted-foreground">Certificazione BFE di I° livello</p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prezzo corrente ({tierInfo.tier.label})</span>
                  <span>€{formatPrice(tierInfo.tier.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA 22%</span>
                  <span>€{formatPrice(tierInfo.tier.totalPrice - tierInfo.tier.basePrice)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-base font-semibold">Totale IVA inclusa</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">€{formatPrice(tierInfo.tier.totalPrice)}</div>
                  </div>
                </div>
                {tierInfo.nextTier && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Il prezzo passerà a €{tierInfo.nextTier.basePrice} + IVA alla scadenza del timer. Stai completando l'iscrizione al prezzo attuale.
                  </p>
                )}
              </div>

              {/* Partner Logos */}
              <div className="border-t pt-6">
                <p className="text-xs text-muted-foreground mb-3">In collaborazione con:</p>
                <div className="flex items-center justify-start gap-6">
                  <img src={righettoLogo} alt="Righetto" className="h-8 object-contain" />
                  <img src={centersOfExcellenceLogo} alt="Centers of Excellence 2025-26" className="h-8 object-contain" />
                </div>
              </div>

              {/* Course Benefits */}
              <div className="border-t pt-6 space-y-3">
                <p className="text-sm font-semibold">Il corso include:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>16 ore di formazione online in diretta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Certificazione professionale riconosciuta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Materiale didattico scaricabile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Accesso a vita alla piattaforma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Supporto diretto con i docenti</span>
                  </li>
                </ul>
              </div>

              {/* Security Badge */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Pagamento sicuro e protetto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
