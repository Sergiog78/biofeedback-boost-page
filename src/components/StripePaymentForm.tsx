import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onValidationChange: (isValid: boolean) => void;
  clientSecret: string;
}

export interface StripePaymentFormRef {
  submitPayment: () => Promise<void>;
  isProcessing: boolean;
}

const StripePaymentForm = forwardRef<StripePaymentFormRef, StripePaymentFormProps>(
  ({ onSuccess, onValidationChange, clientSecret }, ref) => {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardholderName, setCardholderName] = useState("");
    
    // Track completion status of all Stripe Elements
    const [cardComplete, setCardComplete] = useState(false);
    const [expiryComplete, setExpiryComplete] = useState(false);
    const [cvcComplete, setCvcComplete] = useState(false);
    const [nameComplete, setNameComplete] = useState(false);

    // Update parent validation when all fields are complete
    useEffect(() => {
      const allValid = cardComplete && expiryComplete && cvcComplete && nameComplete;
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🔍 Stripe form validation state:`, {
        cardComplete,
        expiryComplete,
        cvcComplete,
        nameComplete,
        allValid
      });
      onValidationChange(allValid);
    }, [cardComplete, expiryComplete, cvcComplete, nameComplete, onValidationChange]);


    const submitPayment = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 💳 Starting payment submission`, {
        hasStripe: !!stripe,
        hasElements: !!elements,
        hasClientSecret: !!clientSecret,
        cardholderName
      });

      if (!stripe || !elements) {
        console.error(`[${timestamp}] ❌ Stripe or Elements not ready`);
        return;
      }

      setIsProcessing(true);

      try {
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
          console.error(`[${timestamp}] ❌ CardNumberElement not found`);
          toast({
            title: "Errore",
            description: "Modulo carta non pronto",
            variant: "destructive",
          });
          return;
        }

        console.log(`[${timestamp}] 🔐 Confirming card payment...`);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { 
            card: cardNumberElement,
            billing_details: {
              name: cardholderName,
            },
          },
        });

        if (error) {
          const timestamp = new Date().toISOString();
          console.error(`[${timestamp}] ❌ Payment error:`, error);
          toast({
            title: "Errore pagamento",
            description: error.message || "Si è verificato un errore durante il pagamento. Verifica i dati della carta e riprova.",
            variant: "destructive",
          });
        } else if (paymentIntent) {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] 💳 Payment Intent response:`, {
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount
          });

          if (paymentIntent.status === "succeeded") {
            console.log(`[${timestamp}] ✅ Payment succeeded`);
            toast({
              title: "Pagamento completato!",
              description: "Il tuo pagamento è stato elaborato con successo.",
            });
            
            // Redirect to success page with payment_intent_id
            window.location.href = `/payment-success?payment_intent_id=${paymentIntent.id}`;
          } else if (paymentIntent.status === "requires_payment_method") {
            console.error(`[${timestamp}] ❌ Payment requires payment method - card was declined or invalid`);
            toast({
              title: "Pagamento rifiutato",
              description: "La carta è stata rifiutata o i dati non sono validi. Verifica i dati della carta e riprova.",
              variant: "destructive",
            });
          } else if (paymentIntent.status === "requires_action") {
            console.warn(`[${timestamp}] ⚠️ Payment requires additional action (e.g., 3D Secure)`);
            toast({
              title: "Autenticazione richiesta",
              description: "Il pagamento richiede un'autenticazione aggiuntiva. Segui le istruzioni della tua banca.",
              variant: "default",
            });
          } else if (paymentIntent.status === "processing") {
            console.log(`[${timestamp}] ⏳ Payment is processing`);
            toast({
              title: "Pagamento in elaborazione",
              description: "Il tuo pagamento è in elaborazione. Riceverai una conferma a breve.",
            });
          } else {
            console.error(`[${timestamp}] ❌ Unexpected payment status: ${paymentIntent.status}`);
            toast({
              title: "Stato pagamento sconosciuto",
              description: `Il pagamento ha uno stato inatteso (${paymentIntent.status}). Contatta il supporto.`,
              variant: "destructive",
            });
          }
        } else {
          const timestamp = new Date().toISOString();
          console.error(`[${timestamp}] ❌ No error and no paymentIntent returned from confirmCardPayment`);
          toast({
            title: "Errore imprevisto",
            description: "Si è verificato un errore imprevisto. Riprova o contatta il supporto.",
            variant: "destructive",
          });
        }
      } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ❌ Payment exception:`, error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il pagamento",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submitPayment,
      isProcessing,
    }));

    const stripeElementStyle = {
      base: {
        fontSize: '16px',
        color: '#6b7280',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    };

    return (
      <div className="space-y-3">
        {/* Numero carta */}
        <div>
          <div className="relative bg-[#f8f8f8] rounded-lg border border-gray-200">
            <div className="px-4 py-4">
              <CardNumberElement 
                options={{ 
                  style: stripeElementStyle,
                  showIcon: false,
                  placeholder: 'Numero carta'
                }}
                onChange={(event) => {
                  console.log(`[${new Date().toISOString()}] 💳 Card number changed:`, {
                    complete: event.complete,
                    error: event.error?.message
                  });
                  setCardComplete(event.complete);
                }}
              />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Data scadenza e CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f8f8f8] rounded-lg border border-gray-200 px-4 py-4">
            <CardExpiryElement 
              options={{ 
                style: stripeElementStyle,
                placeholder: 'Data di scadenza (MM/AA)'
              }}
              onChange={(event) => {
                console.log(`[${new Date().toISOString()}] 📅 Expiry changed:`, {
                  complete: event.complete,
                  error: event.error?.message
                });
                setExpiryComplete(event.complete);
              }}
            />
          </div>
          <div className="relative bg-[#f8f8f8] rounded-lg border border-gray-200">
            <div className="px-4 py-4">
              <CardCvcElement 
                options={{ 
                  style: stripeElementStyle,
                  placeholder: 'Codice di sicurezza'
                }}
                onChange={(event) => {
                  console.log(`[${new Date().toISOString()}] 🔒 CVC changed:`, {
                    complete: event.complete,
                    error: event.error?.message
                  });
                  setCvcComplete(event.complete);
                }}
              />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* Nome sulla carta */}
        <div>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => {
              const newValue = e.target.value;
              setCardholderName(newValue);
              const isValid = newValue.trim().length > 0;
              console.log(`[${new Date().toISOString()}] ✍️ Cardholder name changed:`, {
                length: newValue.length,
                isValid
              });
              setNameComplete(isValid);
            }}
            placeholder="Nome sulla carta"
            className="w-full bg-[#f8f8f8] border border-gray-200 rounded-lg px-4 py-4 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Tutte le transazioni sono sicure e crittografate.
        </p>
      </div>
    );
  }
);

StripePaymentForm.displayName = "StripePaymentForm";

export default StripePaymentForm;
