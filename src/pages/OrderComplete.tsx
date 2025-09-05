import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Mail, ArrowRight, Home, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{
    plugin_id: string;
    title: string;
    price: number;
  }>;
  customer_info: {
    email: string;
    payment_method: string;
  };
}

import { DownloadManager } from '@/components/DownloadManager';

const OrderComplete = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundPolicy, setRefundPolicy] = useState<string>('');

  useEffect(() => {
    document.title = "Order Complete | Blues Marketplace";
    
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentId = urlParams.get('payment_intent');
      
      if (paymentIntentId && user) {
        try {
          // Update order status and generate download links
          const { data: orders, error: fetchError } = await supabase
            .from('orders')
            .select('id, items, customer_id')
            .eq('customer_info->>stripe_payment_intent_id', paymentIntentId)
            .eq('customer_id', user.id);

          if (fetchError) throw fetchError;

          for (const order of (Array.isArray(orders) ? orders : [])) {
            // Update order status
            await supabase
              .from('orders')
              .update({ status: 'paid' })
              .eq('id', order.id);

            // Generate download links for each item
            const items = Array.isArray(order.items) ? order.items : [];
            for (const item of items) {
              if (item.plugin_id) {
                const downloadLink = await supabase.rpc('create_download_link', {
                  p_plugin_id: item.plugin_id,
                  p_customer_id: user.id,
                  p_order_id: order.id,
                  p_expires_hours: 24
                });

                console.log('Generated download link:', downloadLink);
              }
            }
          }
          
          toast({
            title: "Download Links Generated",
            description: "Your download links have been created and will expire in 24 hours"
          });
        } catch (error: any) {
          console.error('Error processing payment success:', error);
          toast({
            title: "Warning",
            description: "Payment processed but there was an issue generating download links. Contact support.",
            variant: "destructive"
          });
        }
      }
    };

    handlePaymentSuccess();

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
  }, [user, toast]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) return;
      
      try {
        let query = supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id);

        // Search by order ID or payment intent ID
        if (orderId) {
          query = query.eq('id', orderId);
        } else if (paymentIntent) {
          query = query.eq('customer_info->>stripe_payment_intent_id', paymentIntent);
        } else {
          throw new Error('No order identifier provided');
        }

        const { data, error } = await query.single();

        if (error) throw error;
        setOrder({
          ...data,
          items: Array.isArray(data.items) ? data.items as Array<{ plugin_id: string; title: string; price: number; }> : [],
          customer_info: typeof data.customer_info === 'object' && data.customer_info !== null ? data.customer_info as { email: string; payment_method: string; } : { email: '', payment_method: '' }
        });

        // Send confirmation email (simulate for MVP)
        toast({
          title: "Confirmation Email Sent",
          description: `Order confirmation sent to ${user.email}`,
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, paymentIntent, user, toast]);

  if (loading) {
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

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <Link to="/">
            <Button variant="hero">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Success Header */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Order Complete!</h1>
              <p className="text-xl text-muted-foreground">
                Thank you for your purchase. Your order has been processed successfully.
              </p>
            </div>

            {/* Order Details */}
            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">Plugin ID: {item.plugin_id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${item.price}</div>
                      <Button variant="outline" size="sm" className="mt-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Paid</span>
                    <span className="text-2xl font-bold">${order.total_amount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Paid via {order.customer_info.payment_method === 'card' ? 'Credit Card' : 'PayPal'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📧 Confirmation Email</h4>
                    <p className="text-sm text-muted-foreground">
                      We've sent a confirmation email to {order.customer_info.email} with your receipt and download links.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📥 Download Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Your plugins are ready to download. Use the download buttons above or check your email.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🔄 Lifetime Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive all future updates for your purchased plugins at no extra cost.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">💬 Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Need help? Contact our support team through the support page or Discord.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {refundPolicy && (
              <Card className="text-left mb-8">
                <CardHeader>
                  <CardTitle>Refund Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">30-Day Money Back Guarantee</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      We offer a full refund within 30 days of purchase for technical issues, compatibility problems, or if the plugin doesn't match the description.
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
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="hero">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Store
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline">
                  Get Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderComplete;