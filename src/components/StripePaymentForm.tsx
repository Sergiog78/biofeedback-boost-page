import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StripePaymentFormProps {
  onSuccess: () => void;
}

const StripePaymentForm = ({ onSuccess }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="min-h-[200px]">
        <PaymentElement 
          options={{
            layout: 'accordion',
          }}
          onReady={() => console.log('PaymentElement ready')}
          onLoadError={(error) => console.error('PaymentElement load error:', error)}
        />
      </div>
      <Button 
        type="submit" 
        size="lg" 
        className="w-full text-lg h-14"
        disabled={!stripe || isProcessing}
        variant="hero"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Elaborazione...
          </>
        ) : (
          'Paga 280€'
        )}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
