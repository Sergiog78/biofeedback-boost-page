import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, Check, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StripePaymentForm from "@/components/StripePaymentForm";
import bfeLogo from "@/assets/bfe-logo-text.png";
import righettoLogo from "@/assets/righetto-logo.png";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast({
        title: "Accetta i termini",
        description: "Devi accettare i termini e condizioni per procedere",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const formDataObj = new FormData(e.currentTarget);
    const customerData = {
      firstName: formDataObj.get('firstName') as string,
      lastName: formDataObj.get('lastName') as string,
      email: formDataObj.get('email') as string,
      phone: formDataObj.get('phone') as string,
      profession: formDataObj.get('profession') as string,
      acceptedNewsletter: formDataObj.get('newsletter') === 'on',
      timestamp: new Date().toISOString()
    };

    setFormData(customerData);
    
    // Salva i dati
    try {
      const existingCustomers = JSON.parse(localStorage.getItem('checkout_customers') || '[]');
      existingCustomers.push(customerData);
      localStorage.setItem('checkout_customers', JSON.stringify(existingCustomers));
      localStorage.setItem('current_customer', JSON.stringify(customerData));
    } catch (error) {
      console.error('Errore nel salvare i dati:', error);
    }
    
    // Crea PaymentIntent e carica Stripe
    try {
      const [paymentResponse, keyResponse] = await Promise.all([
        supabase.functions.invoke('create-payment-intent', {
          body: {
            email: customerData.email,
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            amount: 280,
          }
        }),
        supabase.functions.invoke('get-stripe-publishable-key', { body: {} })
      ]);

      if (paymentResponse.error || !paymentResponse.data?.clientSecret) {
        throw new Error('Errore nella creazione del pagamento');
      }

      // Determina la publishable key (backend -> fallback frontend, solo pk_ valida)
      let publishableKey = keyResponse.data?.publishableKey as string | undefined;
      const envKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
      if (!publishableKey || !publishableKey.startsWith('pk_')) {
        if (envKey && envKey.startsWith('pk_')) {
          publishableKey = envKey;
        } else {
          throw new Error('Errore configurazione Stripe: publishable key non valida');
        }
      }

      setClientSecret(paymentResponse.data.clientSecret);
      setStripePromise(loadStripe(publishableKey));
      setStep('payment');
    } catch (error) {
      console.error('Errore:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova tra poco.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/payment-success');
  };

  const handlePayPalCheckout = async () => {
    setIsProcessing(true);

    try {
      // Create checkout session with PayPal - no customer data needed
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          email: 'guest@checkout.com', // Temporary email, PayPal will provide real one
          firstName: 'Guest',
          lastName: 'User',
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe Checkout with PayPal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova tra poco.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <img src={bfeLogo} alt="BFE Logo" className="h-8" />
          <div className="w-8" />
        </div>
      </header>

      <div className="container max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 lg:min-h-[calc(100vh-4rem)]">
          {/* Left Column - Form */}
          <div className="bg-white px-4 py-8 lg:px-12 lg:py-12 order-2 lg:order-1">
            <div className="max-w-xl mx-auto space-y-8">
              {step === 'info' ? (
                <>
                  {/* Express Checkout */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-medium text-foreground">Check-out rapido</h2>
                    <Button 
                      variant="outline" 
                      className="w-full h-14 bg-[#FFC439] hover:bg-[#FFC439]/90 border-0"
                      onClick={handlePayPalCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[#003087]" />
                      ) : (
                        <>
                          <span className="font-bold text-[#003087]">Pay</span>
                          <span className="font-bold text-[#009CDE]">Pal</span>
                        </>
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

                  {/* Contact Form */}
                  <form onSubmit={handleInfoSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-sm font-medium text-foreground">Contatti</h2>
                      <Input 
                        id="email"
                        name="email"
                        type="email" 
                        placeholder="Email" 
                        required 
                        autoComplete="email"
                        className="h-14 text-base border-gray-300"
                      />
                      <div className="flex items-start gap-3">
                        <Checkbox id="newsletter" name="newsletter" className="mt-1" />
                        <Label 
                          htmlFor="newsletter" 
                          className="text-sm font-normal cursor-pointer leading-relaxed"
                        >
                          Desidero ricevere aggiornamenti su futuri corsi
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-sm font-medium text-foreground">Dati personali</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          id="firstName"
                          name="firstName"
                          placeholder="Nome" 
                          required 
                          autoComplete="given-name"
                          className="h-14 text-base border-gray-300"
                        />
                        <Input 
                          id="lastName"
                          name="lastName"
                          placeholder="Cognome" 
                          required 
                          autoComplete="family-name"
                          className="h-14 text-base border-gray-300"
                        />
                      </div>
                      <Input 
                        id="phone"
                        name="phone"
                        type="tel" 
                        placeholder="Telefono" 
                        required 
                        autoComplete="tel"
                        className="h-14 text-base border-gray-300"
                      />
                      <Input 
                        id="profession"
                        name="profession"
                        placeholder="Professione (es. Psicologo, Psicoterapeuta)" 
                        required
                        className="h-14 text-base border-gray-300"
                      />
                    </div>

                    <div className="flex items-start gap-3 pt-4">
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

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 text-base font-semibold"
                      disabled={isProcessing}
                      variant="hero"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Caricamento...
                        </>
                      ) : (
                        'Continua al pagamento'
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Pagamento</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setStep('info')}
                      className="gap-2 hover:bg-transparent text-sm"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Modifica dati
                    </Button>
                  </div>
                  
                  {clientSecret && stripePromise ? (
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret,
                        locale: 'it',
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: 'hsl(var(--primary))',
                            borderRadius: '0.5rem',
                            fontFamily: 'system-ui, sans-serif',
                          },
                        },
                      }}
                    >
                      <StripePaymentForm onSuccess={handlePaymentSuccess} />
                    </Elements>
                  ) : (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Pagamento sicuro e criptato</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-[#FAFAF8] border-l px-4 py-8 lg:px-12 lg:py-12 order-1 lg:order-2">
            <div className="max-w-xl mx-auto space-y-6">
              {/* Product */}
              <div className="flex gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-white border rounded-lg overflow-hidden">
                    <img 
                      src={bfeLogo} 
                      alt="Corso Biofeedback" 
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    1
                  </div>
                </div>
                <div className="flex-1 flex justify-between">
                  <div>
                    <h3 className="font-medium text-sm">
                      Corso Completo di Biofeedback
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Certificazione BFE - I livello
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    280€
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              <div className="flex gap-2">
                <Input 
                  placeholder="Codice sconto o buono regalo"
                  className="h-12 text-sm border-gray-300 bg-white"
                />
                <Button 
                  variant="outline" 
                  className="h-12 px-6 text-sm font-medium border-gray-300 bg-white hover:bg-gray-50"
                >
                  Applica
                </Button>
              </div>

              {/* Pricing Details */}
              <div className="space-y-3 pt-4 border-t border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotale</span>
                  <span className="font-medium">280€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spedizione</span>
                  <span className="text-muted-foreground">Calcolata al prossimo passaggio</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-300">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">Totale</span>
                  <div className="text-right">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground">EUR</span>
                      <span className="text-2xl font-bold">280€</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Incluse imposte per un ammontare di 45,90 €
                </p>
              </div>

              {/* Partner Logo */}
              <div className="pt-6 border-t border-gray-300">
                <div className="flex justify-center mb-2">
                  <img 
                    src={righettoLogo} 
                    alt="Righetto" 
                    className="h-8 opacity-60"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Partner tecnico - Sconti riservati agli iscritti
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2 pt-4">
                {[
                  "10 incontri online live (20 ore)",
                  "Certificazione BFE di I livello",
                  "Materiali digitali e casi clinici",
                  "Convenzioni per dispositivi"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Discount Badge */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  🎉 Risparmi 220€ con l'offerta early bird
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
