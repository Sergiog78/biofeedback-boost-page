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
import bfeLogo from "@/assets/bfe-logo-text.png";
import righettoLogo from "@/assets/righetto-logo.png";

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
  profession: z.string()
    .trim()
    .min(1, "Professione richiesta")
    .max(200, "Professione troppo lunga"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const stripeFormRef = useRef<StripePaymentFormRef>(null);

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

  // Load saved data or PayPal data on mount
  useEffect(() => {
    const loadCheckoutData = async () => {
      // Check if returning from PayPal with session_id
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (sessionId) {
        try {
          // Retrieve customer data from Stripe session
          const { data, error } = await supabase.functions.invoke('get-checkout-session', {
            body: { sessionId }
          });

          if (error) throw error;

          if (data?.customer) {
            // Prefill form with PayPal data
            form.reset({
              firstName: data.customer.firstName || '',
              lastName: data.customer.lastName || '',
              email: data.customer.email || '',
              phone: data.customer.phone || '',
              profession: '',
            });

            toast({
              title: "Dati importati da PayPal",
              description: "I tuoi dati sono stati precompilati. Completa la professione per continuare.",
            });

            // Check if payment was already completed
            if (data.customer.paymentStatus === 'paid') {
              toast({
                title: "Pagamento completato",
                description: "Il tuo pagamento è stato elaborato con successo!",
              });
              setTimeout(() => navigate('/payment-success'), 2000);
            }
          }

          // Clean up URL
          window.history.replaceState({}, '', '/checkout');
        } catch (e) {
          console.error('Error loading PayPal data:', e);
        }
      } else {
        // Load saved data from localStorage
        const savedData = localStorage.getItem('checkoutData');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            form.reset(parsed);
            setRememberMe(true);
          } catch (e) {
            console.error('Error loading saved checkout data:', e);
          }
        }
      }
    };

    loadCheckoutData();
  }, []);

  // Initialize Stripe on mount
  useEffect(() => {
    const initStripe = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-stripe-publishable-key');
        
        if (error) throw error;
        
        if (data?.publishableKey) {
          const stripe = await loadStripe(data.publishableKey);
          setStripePromise(stripe);
        }
      } catch (error: any) {
        console.error('Error initializing Stripe:', error);
      }
    };

    initStripe();
  }, []);

  const handlePaymentSuccess = () => {
    navigate('/payment-success');
  };

  const isFormValid = form.formState.isValid;

  // Reset clientSecret when switching to PayPal
  useEffect(() => {
    if (paymentMethod === 'paypal') {
      setClientSecret('');
      setStripeReady(false);
    }
  }, [paymentMethod]);

  // Create PaymentIntent when card payment is selected
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (paymentMethod === 'card' && !clientSecret && !isProcessing) {
        const formValues = form.getValues();
        const safeEmail = formValues.email || 'guest@checkout.com';
        const safeFirstName = formValues.firstName || 'Guest';
        const safeLastName = formValues.lastName || 'User';
        
        setIsProcessing(true);
        try {
          const { data: intentData, error: intentError } = await supabase.functions.invoke(
            'create-payment-intent',
            {
              body: { 
                amount: 280,
                email: safeEmail,
                firstName: safeFirstName,
                lastName: safeLastName,
              },
            }
          );

          if (intentError) throw intentError;

          if (intentData?.clientSecret) {
            setClientSecret(intentData.clientSecret);
          }
        } catch (error: any) {
          console.error('Error creating payment intent:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    createPaymentIntent();
  }, [paymentMethod, clientSecret, isProcessing]);

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
      // Submit Stripe payment
      if (stripeFormRef.current && clientSecret) {
        await stripeFormRef.current.submitPayment();
      }
    } else {
      // Handle PayPal checkout
      await handlePayPalCheckout();
    }
  };

  const handlePayPalCheckout = async () => {
    const formValues = form.getValues();
    
    setIsProcessing(true);

    try {
      // Create checkout session with PayPal
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          email: formValues.email || 'guest@checkout.com',
          firstName: formValues.firstName || 'Guest',
          lastName: formValues.lastName || 'User',
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe Checkout with PayPal
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova tra poco.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const canSubmit = isFormValid && acceptedTerms && (paymentMethod === 'paypal' || (paymentMethod === 'card' && stripeReady && clientSecret));

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
                  className="w-full h-14 bg-[#FFC439] hover:bg-[#FFC439]/90 border-0"
                  onClick={handlePayPalCheckout}
                  disabled={isProcessing}
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
                              placeholder="Professione (es. Psicologo, Psicoterapeuta)" 
                              {...field} 
                              className="h-14 text-base border-gray-300"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Pagamento Section with Radio Buttons */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-medium text-foreground">Pagamento</h2>
                    
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'paypal')}>
                      {/* Card Payment Option */}
                      <div className={`border rounded-lg transition-all ${paymentMethod === 'card' ? 'border-foreground border-2' : 'border-gray-300'}`}>
                        <div className="p-4 flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="cursor-pointer font-medium text-sm">Carta di credito</Label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <img src="https://cdn.worldvectorlogo.com/logos/visa-2.svg" alt="Visa" className="h-5" />
                            <img src="https://cdn.worldvectorlogo.com/logos/maestro-2.svg" alt="Maestro" className="h-5" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                            <span className="text-xs text-muted-foreground ml-1">+2</span>
                          </div>
                        </div>
                        
                        {paymentMethod === 'card' && (
                          <div className="px-4 pb-4 pt-2 border-t animate-in slide-in-from-top-2">
                            {clientSecret && stripePromise ? (
                              <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
                                <StripePaymentForm 
                                  ref={stripeFormRef}
                                  onSuccess={handlePaymentSuccess}
                                  onValidationChange={setStripeReady}
                                  clientSecret={clientSecret}
                                />
                              </Elements>
                            ) : (
                              <div className="text-sm text-muted-foreground py-4">
                                Caricamento dei metodi di pagamento...
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
                    className={`w-full h-14 text-base font-semibold ${
                      paymentMethod === 'paypal' && canSubmit
                        ? 'bg-[#0070BA] hover:bg-[#003087] text-white' 
                        : ''
                    }`}
                    disabled={!canSubmit || isProcessing || (stripeFormRef.current?.isProcessing ?? false)}
                    variant={paymentMethod === 'card' ? 'hero' : 'default'}
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
                      Corso Completo di Biofeedback
                    </h3>
                    <p className="text-sm text-muted-foreground">Certificazione BFE di I° livello</p>
                  </div>
                  <p className="font-semibold text-sm">€500,00</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                {/* Discount Badge */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    SCONTO CONVEGNO
                  </div>
                  <span className="text-muted-foreground">-€220 di risparmio</span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotale</span>
                  <span>€500,00</span>
                </div>

                {/* Discount */}
                <div className="flex justify-between text-sm text-green-600">
                  <span>Sconto Convegno (-44%)</span>
                  <span>-€220,00</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-base font-semibold">Totale</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">€280,00</div>
                    <div className="text-sm text-muted-foreground">IVA inclusa</div>
                  </div>
                </div>
              </div>

              {/* Partner Logos */}
              <div className="border-t pt-6">
                <p className="text-xs text-muted-foreground mb-3">In collaborazione con:</p>
                <div className="flex items-center justify-start gap-6">
                  <img src={righettoLogo} alt="Righetto" className="h-8 object-contain" />
                  <img src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" alt="Partner" className="h-8 object-contain grayscale opacity-60" />
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
                    <span>20 ore di formazione online</span>
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
