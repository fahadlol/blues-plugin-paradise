import { PayPalButtons } from "@paypal/react-paypal-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PayPalCheckoutProps {
  amount: number;
  pluginId: string;
  pluginTitle: string;
  onSuccess: (details: any) => void;
  disabled?: boolean;
}

export const PayPalCheckout = ({
  amount,
  pluginId,
  pluginTitle,
  onSuccess,
  disabled
}: PayPalCheckoutProps) => {
  const { toast } = useToast();

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toFixed(2),
          },
          description: pluginTitle,
        },
      ],
    });
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      
      // Create order record in database
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { error } = await supabase.from("orders").insert({
        customer_id: user.user.id,
        items: [{ plugin_id: pluginId, title: pluginTitle, price: amount }],
        total_amount: amount,
        status: "paid",
        customer_info: {
          email: user.user.email,
          payment_method: "paypal",
          paypal_order_id: details.id,
          paypal_payer_id: details.payer.payer_id,
        },
      });

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: `You have successfully purchased ${pluginTitle} via PayPal`,
      });

      onSuccess(details);
    } catch (error: any) {
      console.error("PayPal payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Payment could not be processed",
        variant: "destructive"
      });
    }
  };

  const onError = (error: any) => {
    console.error("PayPal error:", error);
    toast({
      title: "PayPal Error",
      description: "There was an issue with PayPal. Please try again.",
      variant: "destructive"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          PayPal Payment
          <Badge variant="secondary">Alternative Payment</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">{pluginTitle}</span>
            <span className="font-bold">${amount.toFixed(2)}</span>
          </div>
        </div>
        
        <PayPalButtons
          style={{ 
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal"
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};