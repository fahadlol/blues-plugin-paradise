import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
}

interface CouponInfo {
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount?: number;
}

interface StripeCardFormProps {
  amount: number;
  items: CartItem[];
  onSuccess: (paymentIntent: any) => void;
  disabled?: boolean;
  appliedCoupon?: CouponInfo | null;
}

export const StripeCardForm = ({ 
  amount, 
  items, 
  onSuccess, 
  disabled,
  appliedCoupon 
}: StripeCardFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createPaymentIntent = async () => {
    if (!stripe || !elements) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          items: items.map(item => ({
            plugin_id: item.id,
            title: item.title,
            price: item.price,
            category: item.category
          })),
          applied_coupon: appliedCoupon,
        },
      });

      if (error) throw error;
      return data.client_secret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || loading || disabled) {
      return;
    }

    setLoading(true);

    try {
      // Create payment intent if not already created
      let secret = clientSecret;
      if (!secret) {
        secret = await createPaymentIntent();
        if (!secret) {
          setLoading(false);
          return;
        }
        setClientSecret(secret);
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: secret,
        confirmParams: {
          return_url: `${window.location.origin}/order-complete`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "Your payment could not be processed. Please try again.",
          variant: "destructive"
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: `You have successfully purchased ${items.length} plugin(s)`,
        });
        onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize payment intent on first render
  const initializePayment = async () => {
    if (!clientSecret && stripe && elements) {
      const secret = await createPaymentIntent();
      if (secret) {
        setClientSecret(secret);
      }
    }
  };

  // Call initialize on component mount
  useState(() => {
    initializePayment();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {clientSecret && (
            <div className="space-y-4">
              <PaymentElement />
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || loading || disabled || !clientSecret}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};