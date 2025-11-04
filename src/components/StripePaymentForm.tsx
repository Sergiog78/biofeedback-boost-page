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
        color: '#1a1a1a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#a3a3a3',
        },
        padding: '14px',
      },
      invalid: {
        color: '#ef4444',
      },
    };

    return (
      <div className="space-y-4">
        {/* Numero carta */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Numero carta</label>
          <div className="border border-gray-300 rounded-lg p-3.5 bg-white">
            <CardNumberElement 
              options={{ style: stripeElementStyle, showIcon: true }}
              onReady={() => onValidationChange(true)}
              onChange={(event) => onValidationChange((event as any).complete)}
            />
          </div>
        </div>

        {/* Data scadenza e CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data di scadenza (MM/AA)</label>
            <div className="border border-gray-300 rounded-lg p-3.5 bg-white">
              <CardExpiryElement options={{ style: stripeElementStyle }} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Codice di sicurezza</label>
            <div className="border border-gray-300 rounded-lg p-3.5 bg-white">
              <CardCvcElement options={{ style: stripeElementStyle }} />
            </div>
          </div>
        </div>

        {/* Nome sulla carta */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nome sulla carta</label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Nome come appare sulla carta"
            className="w-full border border-gray-300 rounded-lg p-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary"
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
