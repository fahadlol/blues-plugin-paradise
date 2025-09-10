import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
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
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // If item already exists, increase quantity
        return currentItems.map(item =>
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...currentItems, { ...newItem, quantity: 1 }];
      }
    });

    toast({
      title: "Added to Cart",
      description: `${newItem.title} has been added to your cart`,
    });
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

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    });
  };

  const isInCart = (id: string) => {
    return items.some(item => item.id === id);
  };

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      totalAmount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};