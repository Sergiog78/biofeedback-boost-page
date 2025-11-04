import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  onSuccess: () => void;
  onValidationChange: (isValid: boolean) => void;
}

export interface StripePaymentFormRef {
  submitPayment: () => Promise<void>;
  isProcessing: boolean;
}

const StripePaymentForm = forwardRef<StripePaymentFormRef, StripePaymentFormProps>(
  ({ onSuccess, onValidationChange }, ref) => {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Validation handled via PaymentElement events instead of elements.getElement


    const submitPayment = async () => {
      if (!stripe || !elements) {
        return;
      }

      setIsProcessing(true);

      try {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
        });

        if (error) {
          toast({
            title: "Errore pagamento",
            description: error.message,
            variant: "destructive",
          });
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

    return (
      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'accordion',
          }}
          onReady={() => onValidationChange(true)}
          onChange={(event) => onValidationChange((event as any).complete)}
        />
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
