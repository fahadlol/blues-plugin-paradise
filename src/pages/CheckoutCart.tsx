import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { CreditCard, Shield, ArrowLeft, ExternalLink, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StripeProvider } from "@/components/StripeProvider";
import { StripeCardForm } from "@/components/StripeCardForm";
import { PayPalProvider } from "@/components/PayPalProvider";
import { PayPalCheckout } from "@/components/PayPalCheckout";

const CheckoutCart = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    items, 
    subtotalAmount, 
    discountAmount, 
    totalAmount, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    clearCart 
  } = useCart();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [refundPolicy, setRefundPolicy] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

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
    // Redirect to cart if empty
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
  }, [items, navigate]);

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

  const handlePaymentSuccess = async (paymentIntent: any) => {
    if (!user) return;

    try {
      // Create order record
      const orderData = {
        customer_id: user.id,
        items: items.map(item => ({
          plugin_id: item.id,
          title: item.title,
          price: item.price,
          category: item.category
        })),
        total_amount: totalAmount,
        status: 'completed',
        customer_info: {
          email: user.email,
          payment_method: 'stripe',
          stripe_payment_intent_id: paymentIntent.id,
          applied_coupon: appliedCoupon ? {
            code: appliedCoupon.code,
            name: appliedCoupon.name,
            discount_amount: discountAmount
          } : null
        }
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      // Update coupon usage if applied
      if (appliedCoupon) {
        await supabase.rpc('increment_coupon_usage', { 
          coupon_code: appliedCoupon.code 
        });
      }

      // Clear cart
      clearCart();

      // Navigate to success page
      navigate(`/order-complete/${order.id}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast({
        title: "Warning",
        description: "Payment succeeded but there was an issue creating your order. Please contact support.",
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
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

  if (!user || items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/cart")}
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary ({items.length} items)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <div className="text-lg font-bold">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotalAmount.toFixed(2)}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedCoupon.name})</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold text-xl">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Coupon Code</h4>
                    {appliedCoupon ? (
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-green-700 dark:text-green-300">
                              {appliedCoupon.name}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">
                              Code: {appliedCoupon.code}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={removeCoupon}
                            className="text-green-700 hover:text-green-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={couponLoading}
                        />
                        <Button 
                          variant="outline" 
                          onClick={async () => {
                            if (!couponCode.trim()) return;
                            setCouponLoading(true);
                            const result = await applyCoupon(couponCode);
                            if (result.success) {
                              setCouponCode('');
                              toast({
                                title: "Success",
                                description: result.message,
                              });
                            } else {
                              toast({
                                title: "Invalid Coupon",
                                description: result.message,
                                variant: "destructive"
                              });
                            }
                            setCouponLoading(false);
                          }}
                          disabled={couponLoading || !couponCode.trim()}
                        >
                          {couponLoading ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    )}
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

                {/* Payment Options */}
                {agreedToTerms && (
                  <Tabs defaultValue="stripe" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="stripe">Credit Card</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stripe" className="space-y-4">
                      <StripeProvider amount={totalAmount}>
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5" />
                              Credit Card Payment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <StripeCardForm
                              amount={totalAmount}
                              items={items}
                              onSuccess={handlePaymentSuccess}
                              disabled={processing}
                              appliedCoupon={appliedCoupon}
                            />
                          </CardContent>
                        </Card>
                      </StripeProvider>
                    </TabsContent>
                    
                    <TabsContent value="paypal" className="space-y-4">
                      <PayPalProvider>
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-[#0070ba] rounded flex items-center justify-center text-white text-xs font-bold">
                                PP
                              </div>
                              PayPal Payment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <PayPalCheckout
                              amount={totalAmount}
                              items={items}
                              onSuccess={handlePaymentSuccess}
                              disabled={processing}
                              appliedCoupon={appliedCoupon}
                            />
                          </CardContent>
                        </Card>
                      </PayPalProvider>
                    </TabsContent>
                  </Tabs>
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

export default CheckoutCart;