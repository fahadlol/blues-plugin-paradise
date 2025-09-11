import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  title: string;
  price: number; // Snapshot price when added to cart
  originalPrice?: number; // Current price from database (for comparison)
  thumbnail: string;
  category: string;
  addedAt: string; // Timestamp when added to cart
}

interface CouponInfo {
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount?: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  appliedCoupon: CouponInfo | null;
  addItem: (item: Omit<CartItem, 'addedAt'>) => Promise<void>;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  mergeCarts: (guestCart: CartItem[]) => void;
  showNotification: boolean;
  setShowNotification: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedCoupon = localStorage.getItem('appliedCoupon');
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (error) {
        console.error('Error loading coupon:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);

  const itemCount = items.length; // No quantities - each plugin can only be added once
  const subtotalAmount = items.reduce((total, item) => total + item.price, 0);
  
  // Calculate discount amount
  const discountAmount = appliedCoupon ? (() => {
    if (subtotalAmount < (appliedCoupon.min_amount || 0)) return 0;
    
    if (appliedCoupon.discount_type === 'percentage') {
      return subtotalAmount * (appliedCoupon.discount_value / 100);
    } else {
      return Math.min(appliedCoupon.discount_value, subtotalAmount);
    }
  })() : 0;
  
  const totalAmount = Math.max(0, subtotalAmount - discountAmount);

  const addItem = async (newItem: Omit<CartItem, 'addedAt'>) => {
    const existingItem = items.find(item => item.id === newItem.id);
    
    if (existingItem) {
      toast({
        title: "Already in Cart",
        description: `${newItem.title} is already in your cart`,
        variant: "destructive"
      });
      return;
    }

    // Get current price from database for comparison
    try {
      const { data: currentPlugin } = await supabase
        .from('plugins')
        .select('price')
        .eq('id', newItem.id)
        .single();

      const itemWithTimestamp: CartItem = {
        ...newItem,
        originalPrice: currentPlugin?.price || newItem.price,
        addedAt: new Date().toISOString()
      };

      setItems(currentItems => [...currentItems, itemWithTimestamp]);
      setShowNotification(true);

      toast({
        title: "Added to Cart",
        description: `${newItem.title} has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Still add to cart even if price check fails
      const itemWithTimestamp: CartItem = {
        ...newItem,
        addedAt: new Date().toISOString()
      };
      setItems(currentItems => [...currentItems, itemWithTimestamp]);
      setShowNotification(true);
    }
  };

  const removeItem = (id: string) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.id === id);
      if (item) {
        toast({
          title: "Removed from Cart",
          description: `${item.title} has been removed from your cart`,
        });
      }
      return currentItems.filter(item => item.id !== id);
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    });
  };

  const isInCart = (id: string) => {
    return items.some(item => item.id === id);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data: coupon, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        return { success: false, message: 'Invalid coupon code' };
      }

      // Check if coupon is expired
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

      if (now < validFrom) {
        return { success: false, message: 'This coupon is not yet valid' };
      }

      if (validUntil && now > validUntil) {
        return { success: false, message: 'This coupon has expired' };
      }

      // Check usage limits
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return { success: false, message: 'This coupon has reached its usage limit' };
      }

      // Check minimum order amount
      if (coupon.min_amount && subtotalAmount < coupon.min_amount) {
        return { 
          success: false, 
          message: `Minimum order amount of $${coupon.min_amount} required for this coupon` 
        };
      }

      setAppliedCoupon({
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.discount_type as 'percentage' | 'fixed',
        discount_value: coupon.discount_value,
        min_amount: coupon.min_amount
      });

      return { success: true, message: `Coupon "${coupon.name}" applied successfully!` };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, message: 'Error validating coupon. Please try again.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order",
    });
  };

  const mergeCarts = (guestCart: CartItem[]) => {
    if (guestCart.length === 0) return;

    setItems(currentItems => {
      const mergedItems = [...currentItems];
      let addedCount = 0;

      guestCart.forEach(guestItem => {
        const exists = mergedItems.find(item => item.id === guestItem.id);
        if (!exists) {
          mergedItems.push(guestItem);
          addedCount++;
        }
      });

      if (addedCount > 0) {
        toast({
          title: "Cart Merged",
          description: `${addedCount} item(s) from your guest cart have been added`,
        });
      }

      return mergedItems;
    });

    // Clear guest cart from localStorage
    localStorage.removeItem('guestCart');
  };

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotalAmount,
      discountAmount,
      totalAmount,
      appliedCoupon,
      addItem,
      removeItem,
      clearCart,
      isInCart,
      applyCoupon,
      removeCoupon,
      mergeCarts,
      showNotification,
      setShowNotification
    }}>
      {children}
    </CartContext.Provider>
  );
};