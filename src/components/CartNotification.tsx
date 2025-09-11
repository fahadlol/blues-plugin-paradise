import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartNotificationProps {
  show: boolean;
  onClose: () => void;
}

export const CartNotification = ({ show, onClose }: CartNotificationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Allow fade out animation
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <Card className="w-80 bg-card border-primary/20 shadow-glow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">Added to Cart!</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Link to="/cart" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Cart
              </Button>
            </Link>
            <Link to="/checkout-cart" className="flex-1">
              <Button variant="hero" size="sm" className="w-full">
                Checkout
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};