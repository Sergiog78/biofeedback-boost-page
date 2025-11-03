import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, Check, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StripePaymentForm from "@/components/StripePaymentForm";
import bfeLogo from "@/assets/bfe-logo-text.png";
import righettoLogo from "@/assets/righetto-logo.png";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
  });
  
  // Countdown timer - scadenza 10 novembre 2025 alle 23:59
  const targetDate = new Date('2025-11-10T23:59:59').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Forza scroll all'inizio della pagina su mobile
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    
    // Raccogli i dati dal form
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
    
    // Salva i dati in localStorage
    try {
      const existingCustomers = JSON.parse(localStorage.getItem('checkout_customers') || '[]');
      existingCustomers.push(customerData);
      localStorage.setItem('checkout_customers', JSON.stringify(existingCustomers));
      localStorage.setItem('current_customer', JSON.stringify(customerData));
    } catch (error) {
      console.error('Errore nel salvare i dati del cliente:', error);
    }
    
    // Crea PaymentIntent
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          email: customerData.email,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          amount: 280,
        }
      });

      if (error) {
        console.error('Errore nella creazione del payment intent:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore. Riprova tra poco.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      }
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
    <div className="min-h-screen bg-gradient-to-b from-secondary/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna indietro
          </Button>
          <img 
            src={bfeLogo} 
            alt="BFE Logo" 
            className="h-8 opacity-80"
          />
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Completa l'iscrizione</h1>
              <p className="text-muted-foreground">
                Sicuro, veloce e protetto. Iscriviti ora con lo sconto del 56%.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {showPayment ? "Pagamento" : "Informazioni personali"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showPayment ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... keep existing code (form fields) */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome *</Label>
                        <Input 
                          id="firstName"
                          name="firstName"
                          placeholder="Mario" 
                          required 
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Cognome *</Label>
                        <Input 
                          id="lastName"
                          name="lastName"
                          placeholder="Rossi" 
                          required 
                          className="bg-background"
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
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        Riceverai la conferma e i dettagli di accesso a questo indirizzo
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
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Professione *</Label>
                      <Input 
                        id="profession"
                        name="profession"
                        placeholder="Es. Psicologo, Psicoterapeuta" 
                        required 
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id="terms" 
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        />
                        <Label 
                          htmlFor="terms" 
                          className="text-sm font-normal cursor-pointer leading-tight"
                        >
                          Accetto i termini e condizioni e confermo di aver letto l'informativa sulla privacy *
                        </Label>
                      </div>

                      <div className="flex items-start gap-2">
                        <Checkbox id="newsletter" name="newsletter" />
                        <Label 
                          htmlFor="newsletter" 
                          className="text-sm font-normal cursor-pointer leading-tight"
                        >
                          Desidero ricevere aggiornamenti su futuri corsi e iniziative
                        </Label>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full text-lg"
                      disabled={isProcessing}
                      variant="hero"
                    >
                      {isProcessing ? "Elaborazione..." : "Continua al pagamento"}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Lock className="h-4 w-4" />
                        <span>Pagamento sicuro</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span>Dati protetti</span>
                      </div>
                    </div>
                  </form>
                ) : (
                  clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm onSuccess={handlePaymentSuccess} />
                    </Elements>
                  )
                )}
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Pagamento sicuro SSL
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Soddisfatti o rimborsati
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Privacy garantita
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardTitle>Riepilogo ordine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Corso Completo di Biofeedback
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Introduzione al Biofeedback in Psicoterapia - Certificazione BFE
                  </p>
                </div>

                <div className="space-y-3 py-4 border-y">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">10 incontri online live (20 ore totali)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Certificazione BFE di I livello</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Materiali digitali e casi clinici</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Convenzioni per dispositivi professionali</span>
                  </div>
                </div>

                <div className="py-4 border-y">
                  <p className="text-xs text-muted-foreground mb-3 text-center">
                    Partner tecnico per dispositivi biofeedback
                  </p>
                  <div className="flex justify-center">
                    <img 
                      src={righettoLogo} 
                      alt="Righetto - Partner dispositivi biofeedback" 
                      className="h-12 opacity-80 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Sconti riservati agli iscritti al corso
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prezzo di listino</span>
                    <span className="line-through">500€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400 font-medium">Sconto early bird (56%)</span>
                    <span className="text-green-400 font-medium">-220€</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">Totale</span>
                    <span className="text-3xl font-bold text-primary">280€</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    IVA inclusa
                  </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-green-400" />
                    <p className="text-sm font-medium text-green-400">
                      🎉 Risparmi 220€ con questa offerta!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center bg-background/50 rounded-lg p-2">
                      <div className="text-2xl font-bold text-green-400">{timeLeft.days}</div>
                      <div className="text-xs text-muted-foreground">giorni</div>
                    </div>
                    <div className="text-center bg-background/50 rounded-lg p-2">
                      <div className="text-2xl font-bold text-green-400">{timeLeft.hours}</div>
                      <div className="text-xs text-muted-foreground">ore</div>
                    </div>
                    <div className="text-center bg-background/50 rounded-lg p-2">
                      <div className="text-2xl font-bold text-green-400">{timeLeft.minutes}</div>
                      <div className="text-xs text-muted-foreground">min</div>
                    </div>
                    <div className="text-center bg-background/50 rounded-lg p-2">
                      <div className="text-2xl font-bold text-green-400">{timeLeft.seconds}</div>
                      <div className="text-xs text-muted-foreground">sec</div>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Offerta valida fino al 10 novembre 2025
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Garanzia soddisfatti o rimborsati</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se non sei soddisfatto, ti rimborsiamo entro 14 giorni dall'acquisto.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
