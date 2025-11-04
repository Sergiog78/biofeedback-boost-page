import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  onSuccess: () => void;
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
    const [isReady, setIsReady] = useState(false);
    const [cardholderName, setCardholderName] = useState("");

    // Validation handled via PaymentElement events instead of elements.getElement


    const submitPayment = async () => {
      if (!stripe || !elements) {
        return;
      }

      setIsProcessing(true);

      try {
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
          toast({
            title: "Errore",
            description: "Modulo carta non pronto",
            variant: "destructive",
          });
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { 
            card: cardNumberElement,
            billing_details: {
              name: cardholderName,
            },
          },
          return_url: `${window.location.origin}/payment-success`,
        });

        if (error) {
          toast({
            title: "Errore pagamento",
            description: error.message,
            variant: "destructive",
          });
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
          onSuccess();
        }
      } catch (error) {
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
                onReady={() => onValidationChange(true)}
                onChange={(event) => onValidationChange((event as any).complete)}
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
            />
          </div>
          <div className="relative bg-[#f8f8f8] rounded-lg border border-gray-200">
            <div className="px-4 py-4">
              <CardCvcElement 
                options={{ 
                  style: stripeElementStyle,
                  placeholder: 'Codice di sicurezza'
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
            onChange={(e) => setCardholderName(e.target.value)}
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
