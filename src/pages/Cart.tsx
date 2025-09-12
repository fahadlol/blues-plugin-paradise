import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Cart = () => {
  const { 
    items, 
    subtotalAmount, 
    discountAmount, 
    totalAmount, 
    removeItem, 
    itemCount, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any plugins to your cart yet.
            </p>
            <Link to="/">
              <Button variant="hero" size="lg">
                Browse Plugins
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={item.thumbnail} 
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {item.category}
                          </Badge>
                          <div className="mt-2 text-lg font-bold">
                            ${item.price.toFixed(2)}
                          </div>
                         </div>
                         <div className="text-right">
                           <div className="text-lg font-bold">
                             ${item.price.toFixed(2)}
                           </div>
                           {item.originalPrice && item.originalPrice !== item.price && (
                             <div className="text-xs text-muted-foreground">
                               Current: ${item.originalPrice.toFixed(2)}
                             </div>
                           )}
                         </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                       {items.map((item) => (
                         <div key={item.id} className="flex justify-between text-sm">
                           <span className="text-muted-foreground">
                             {item.title}
                           </span>
                           <span>${item.price.toFixed(2)}</span>
                         </div>
                       ))}
                     </div>
                     
                     <Separator />
                     
                     <div className="flex justify-between text-sm">
                       <span>Subtotal</span>
                       <span>${subtotalAmount.toFixed(2)}</span>
                     </div>
                     
                     {appliedCoupon && (
                       <div className="flex justify-between text-sm text-green-600">
                         <span>Discount ({appliedCoupon.name})</span>
                         <span>-${discountAmount.toFixed(2)}</span>
                       </div>
                     )}
                     
                     <Separator />
                     
                     <div className="flex justify-between font-semibold text-lg">
                       <span>Total</span>
                       <span>${totalAmount.toFixed(2)}</span>
                     </div>
                  </CardContent>
                </Card>

                <Card>
                   <CardHeader>
                     <CardTitle className="text-lg">Coupon Code</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
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
                             Remove
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
                   </CardContent>
                 </Card>

                <Link to="/checkout-cart" className="block">
                  <Button variant="hero" size="lg" className="w-full">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <div className="text-xs text-muted-foreground">
                  <p>• Instant download access</p>
                  <p>• 30-day money back guarantee</p>
                  <p>• Lifetime updates included</p>
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

export default Cart;