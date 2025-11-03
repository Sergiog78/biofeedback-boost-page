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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            onClick={() => step === 'payment' ? setStep('info') : navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 'payment' ? 'Modifica dati' : 'Torna indietro'}
          </Button>
          <img src={bfeLogo} alt="BFE Logo" className="h-8" />
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8 max-w-md mx-auto lg:max-w-none">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {step === 'payment' ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Informazioni</span>
            </div>
            <div className={`w-12 h-0.5 ${step === 'payment' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Pagamento</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="space-y-6 order-2 lg:order-1">
            {step === 'info' ? (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Dati di contatto</h2>
                <form onSubmit={handleInfoSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome *</Label>
                      <Input 
                        id="firstName"
                        name="firstName"
                        placeholder="Mario" 
                        required 
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Cognome *</Label>
                      <Input 
                        id="lastName"
                        name="lastName"
                        placeholder="Rossi" 
                        required 
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="mario.rossi@email.com" 
                      required 
                      autoComplete="email"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ti invieremo la conferma qui
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono *</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      type="tel" 
                      placeholder="+39 123 456 7890" 
                      required 
                      autoComplete="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Professione *</Label>
                    <Input 
                      id="profession"
                      name="profession"
                      placeholder="Es. Psicologo, Psicoterapeuta" 
                      required 
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="terms" 
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      />
                      <Label 
                        htmlFor="terms" 
                        className="text-sm font-normal cursor-pointer leading-snug"
                      >
                        Accetto i termini e condizioni e confermo di aver letto l'informativa sulla privacy *
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox id="newsletter" name="newsletter" />
                      <Label 
                        htmlFor="newsletter" 
                        className="text-sm font-normal cursor-pointer leading-snug"
                      >
                        Desidero ricevere aggiornamenti su futuri corsi
                      </Label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-lg h-14"
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
              </Card>
            ) : (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Pagamento</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Sicuro</span>
                  </div>
                </div>
                
                {clientSecret && stripePromise ? (
                  <Elements 
                    stripe={stripePromise} 
                    options={{ 
                      clientSecret,
                      locale: 'it',
                    }}
                  >
                    <StripePaymentForm onSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>I tuoi dati sono al sicuro e criptati</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 px-4">
              <div className="text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Pagamento sicuro
                </p>
              </div>
              <div className="text-center">
                <Check className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Rimborso garantito
                </p>
              </div>
              <div className="text-center">
                <Lock className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Dati protetti
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <Card className="p-6 border-2">
              <h3 className="text-xl font-bold mb-4">Riepilogo ordine</h3>
              
              <div className="space-y-4 pb-4 border-b">
                <div>
                  <h4 className="font-semibold mb-1">
                    Corso Completo di Biofeedback
                  </h4>
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
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-4 border-b">
                <div className="flex justify-center mb-3">
                  <img 
                    src={righettoLogo} 
                    alt="Righetto" 
                    className="h-10 opacity-80"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Partner tecnico - Sconti riservati agli iscritti
                </p>
              </div>

              <div className="space-y-3 py-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prezzo di listino</span>
                  <span className="line-through">500€</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-400">
                  <span>Sconto early bird (56%)</span>
                  <span>-220€</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-lg font-semibold">Totale</span>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">280€</div>
                    <div className="text-xs text-muted-foreground">IVA inclusa</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-green-400">
                  🎉 Risparmi 220€ con l'offerta early bird
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
