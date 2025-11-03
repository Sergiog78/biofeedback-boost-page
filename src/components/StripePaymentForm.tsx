import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StripePaymentFormProps {
  onSuccess: () => void;
  clientSecret: string;
}

const StripePaymentForm = ({ onSuccess, clientSecret }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPal = () => {
    toast({
      title: "PayPal non configurato",
      description: "Aggiungi le credenziali PayPal per attivare il checkout veloce.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Campo carta non pronto");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
        return_url: `${window.location.origin}/payment-success`,
      });

      if (error) {
        toast({
          title: "Errore pagamento",
          description: (error as any)?.message ?? "Errore sconosciuto",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="w-full h-12"
          onClick={handlePayPal}
        >
          Checkout veloce con PayPal
        </Button>

        <div className="flex items-center justify-center">
          <span className="text-xs text-muted-foreground">oppure</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Paga con carta</label>
          <div className="rounded-md border p-4 bg-card">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full text-lg h-14"
        disabled={!stripe || isProcessing || !clientSecret}
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
