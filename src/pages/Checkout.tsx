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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            onClick={() => step === 'payment' ? setStep('info') : navigate('/')}
            className="gap-2 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{step === 'payment' ? 'Modifica dati' : 'Torna indietro'}</span>
          </Button>
          <img src={bfeLogo} alt="BFE Logo" className="h-8" />
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[1fr,420px] gap-6 lg:gap-8 items-start">
          {/* Left Column - Form */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Progress Indicator - Mobile */}
            <div className="lg:hidden flex items-center justify-between mb-6 px-2">
              <div className={`flex items-center gap-2 ${step === 'info' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'info' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                  {step === 'payment' ? <Check className="h-3.5 w-3.5" /> : '1'}
                </div>
                <span className="text-xs font-medium">Dati</span>
              </div>
              <div className={`flex-1 h-px mx-3 ${step === 'payment' ? 'bg-primary' : 'bg-border'}`} />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium">Pagamento</span>
              </div>
            </div>

            {step === 'info' ? (
              <div className="bg-background rounded-lg p-5 sm:p-7 shadow-sm border">
                <h1 className="text-xl sm:text-2xl font-semibold mb-6">Dati di contatto</h1>
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        Nome
                      </Label>
                      <Input 
                        id="firstName"
                        name="firstName"
                        placeholder="Mario" 
                        required 
                        autoComplete="given-name"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Cognome
                      </Label>
                      <Input 
                        id="lastName"
                        name="lastName"
                        placeholder="Rossi" 
                        required 
                        autoComplete="family-name"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="mario.rossi@email.com" 
                      required 
                      autoComplete="email"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Telefono
                    </Label>
                    <Input 
                      id="phone"
                      name="phone"
                      type="tel" 
                      placeholder="+39 123 456 7890" 
                      required 
                      autoComplete="tel"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profession" className="text-sm font-medium">
                      Professione
                    </Label>
                    <Input 
                      id="profession"
                      name="profession"
                      placeholder="Es. Psicologo, Psicoterapeuta" 
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="terms" 
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        className="mt-0.5"
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

                    <div className="flex items-start gap-3">
                      <Checkbox id="newsletter" name="newsletter" className="mt-0.5" />
                      <Label 
                        htmlFor="newsletter" 
                        className="text-sm font-normal cursor-pointer leading-relaxed"
                      >
                        Desidero ricevere aggiornamenti su futuri corsi
                      </Label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 sm:h-13 text-base font-semibold mt-6"
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
              </div>
            ) : (
              <div className="bg-background rounded-lg p-5 sm:p-7 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl sm:text-2xl font-semibold">Pagamento</h1>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Sicuro</span>
                  </div>
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

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Pagamento sicuro e criptato</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Badges - Desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-4 px-2">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Pagamento sicuro
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Rimborso garantito
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Dati protetti
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-20">
            <div className="bg-background rounded-lg p-5 sm:p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Riepilogo ordine</h2>
              
              <div className="space-y-4 pb-4 mb-4 border-b">
                <div>
                  <h3 className="font-medium text-base mb-1">
                    Corso Completo di Biofeedback
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Certificazione BFE - I livello
                  </p>
                </div>

                <div className="space-y-2">
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
              </div>

              <div className="py-4 mb-4 border-b">
                <div className="flex justify-center mb-2">
                  <img 
                    src={righettoLogo} 
                    alt="Righetto" 
                    className="h-9 opacity-70"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Partner tecnico - Sconti riservati agli iscritti
                </p>
              </div>

              <div className="space-y-2 py-4 mb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prezzo di listino</span>
                  <span className="line-through text-muted-foreground">500€</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-500">
                  <span>Sconto early bird (56%)</span>
                  <span>-220€</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-medium">Totale</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold">280€</div>
                    <div className="text-xs text-muted-foreground">IVA inclusa</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-3.5 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  🎉 Risparmi 220€ con l'offerta early bird
                </p>
              </div>
            </div>

            {/* Trust Badges - Mobile */}
            <div className="lg:hidden grid grid-cols-3 gap-3 mt-4 px-2">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 mb-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Sicuro
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 mb-1.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Garantito
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 mb-1.5">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Protetto
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
