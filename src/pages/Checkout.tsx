import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, ArrowLeft, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StripeProvider } from "@/components/StripeProvider";
import { StripeCardForm } from "@/components/StripeCardForm";
import { PayPalProvider } from "@/components/PayPalProvider";
import { PayPalCheckout } from "@/components/PayPalCheckout";

interface Plugin {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
}

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [refundPolicy, setRefundPolicy] = useState<string>('');

  useEffect(() => {
    document.title = "Checkout | Blues Marketplace";
  }, []);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase plugins",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    const fetchRefundPolicy = async () => {
      try {
        const { data } = await supabase
          .from('policies')
          .select('content')
          .eq('policy_type', 'refund_policy')
          .eq('is_active', true)
          .single();
        
        if (data) {
          setRefundPolicy(data.content);
        }
      } catch (error) {
        console.error('Error fetching refund policy:', error);
      }
    };

    fetchRefundPolicy();
  }, []);

  useEffect(() => {
    const fetchPlugin = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('plugins')
          .select('id, title, description, price, thumbnail, category')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPlugin(data);
      } catch (error) {
        console.error('Error fetching plugin:', error);
        toast({
          title: "Error",
          description: "Failed to load plugin details",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPlugin();
    }
  }, [id, user, toast, navigate]);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    if (!plugin || !user) return;

    try {
      // Update order status to completed using payment intent ID
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('customer_info->>stripe_payment_intent_id', paymentIntent.id);

      if (error) {
        console.error('Error updating order:', error);
      }

      // Navigate to success page
      navigate(`/order-complete?payment_intent=${paymentIntent.id}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast({
        title: "Warning",
        description: "Payment succeeded but there was an issue updating your order. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const handlePayPalPayment = async () => {
    if (!plugin || !user) return;

    if (!agreedToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms of Service and Refund Policy to continue",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      // Create order in database for PayPal
      const orderData = {
        customer_id: user.id,
        items: [{ plugin_id: plugin.id, title: plugin.title, price: plugin.price }],
        total_amount: plugin.price,
        status: 'pending',
        customer_info: {
          email: user.email,
          payment_method: 'paypal'
        }
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      // For MVP, simulate PayPal processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update order status to completed
      await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id);

      toast({
        title: "Payment Successful!",
        description: `You have successfully purchased ${plugin.title}`,
      });

      navigate(`/order-complete/${order.id}`);
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your PayPal payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!plugin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Plugin Not Found</h1>
          <Button onClick={() => navigate("/")} variant="hero">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/plugin/${plugin.id}`)}
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plugin
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={plugin.thumbnail} 
                      alt={plugin.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{plugin.title}</h3>
                      <p className="text-sm text-muted-foreground">{plugin.description}</p>
                      <Badge variant="secondary">{plugin.category}</Badge>
                    </div>
                    <div className="text-lg font-bold">${plugin.price}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">${plugin.price}</span>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="font-medium">What you get:</span>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Instant download access</li>
                      <li>• Lifetime updates</li>
                      <li>• 24/7 support</li>
                      <li>• 30-day money back guarantee</li>
                    </ul>
                  </div>

                  {refundPolicy && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Refund Policy Summary</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        30-day money back guarantee for technical issues or compatibility problems.
                      </p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={() => window.open('/policies/refund_policy', '_blank')}
                      >
                        View full refund policy
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <div className="space-y-6">
                {/* Terms Agreement */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox 
                        id="terms-agreement"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                        className="mt-1"
                      />
                      <div className="text-sm">
                        <label htmlFor="terms-agreement" className="cursor-pointer">
                          I agree to the{' '}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto"
                            onClick={() => window.open('/policies/terms_of_service', '_blank')}
                          >
                            Terms of Service
                          </Button>{' '}
                          and{' '}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto"
                            onClick={() => window.open('/policies/refund_policy', '_blank')}
                          >
                            Refund Policy
                          </Button>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stripe & PayPal Payments */}
                {agreedToTerms && (
                  <Tabs defaultValue="stripe" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="stripe">Credit Card</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stripe" className="space-y-4">
                      <StripeProvider amount={plugin.price}>
                        <StripeCardForm
                          amount={plugin.price}
                          pluginId={plugin.id}
                          pluginTitle={plugin.title}
                          onSuccess={handlePaymentSuccess}
                          disabled={processing}
                        />
                      </StripeProvider>
                    </TabsContent>
                    
                    <TabsContent value="paypal" className="space-y-4">
                      <PayPalProvider>
                        <PayPalCheckout
                          amount={plugin.price}
                          pluginId={plugin.id}
                          pluginTitle={plugin.title}
                          onSuccess={handlePaymentSuccess}
                          disabled={processing}
                        />
                      </PayPalProvider>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Legacy PayPal Button (kept as fallback) */}
                {false && agreedToTerms && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#0070ba] rounded flex items-center justify-center text-white text-xs font-bold">
                          PP
                        </div>
                        Alternative Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handlePayPalPayment}
                        disabled={processing || !agreedToTerms}
                        size="lg"
                      >
                        Pay with PayPal - ${plugin.price.toFixed(2)}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {processing && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm">Processing your payment...</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy. Your payment is secured with industry-standard encryption.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;