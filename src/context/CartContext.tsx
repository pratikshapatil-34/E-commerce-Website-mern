import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product, CartItem } from '../types';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  coupon: { code: string; discount: number } | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading] = useState(false);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);

  const token = localStorage.getItem('token');

  const fetchCart = useCallback(async () => {
    if (!token) {
      const saved = localStorage.getItem('cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      return;
    }

    try {
      const response = await cartAPI.get();
      if (response.data.success) {
        const cart = response.data.data;
        setItems(cart.items || []);
        setShipping(cart.shipping || 0);
        setTax(cart.tax || 0);
        setTotal(cart.total || 0);
        setCoupon(cart.coupon || null);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, token]);

  const addItem = async (product: Product, quantity = 1) => {
    if (token) {
      try {
        const response = await cartAPI.add(product.id, quantity);
        if (response.data.success) {
          const cart = response.data.data;
          setItems(cart.items || []);
          setShipping(cart.shipping || 0);
          setTax(cart.tax || 0);
          setTotal(cart.total || 0);
          toast.success('Added to cart!');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to add to cart');
      }
    } else {
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
      toast.success('Added to cart!');
    }
  };

  const removeItem = async (productId: string) => {
    if (token) {
      try {
        const response = await cartAPI.remove(productId);
        if (response.data.success) {
          const cart = response.data.data;
          setItems(cart.items || []);
          setShipping(cart.shipping || 0);
          setTax(cart.tax || 0);
          setTotal(cart.total || 0);
          setCoupon(cart.coupon || null);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to remove item');
      }
    } else {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    if (token) {
      try {
        const response = await cartAPI.update(productId, quantity);
        if (response.data.success) {
          const cart = response.data.data;
          setItems(cart.items || []);
          setShipping(cart.shipping || 0);
          setTax(cart.tax || 0);
          setTotal(cart.total || 0);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to update quantity');
      }
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        const response = await cartAPI.clear();
        if (response.data.success) {
          setItems([]);
          setShipping(0);
          setTax(0);
          setTotal(0);
          setCoupon(null);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to clear cart');
      }
    } else {
      setItems([]);
      setCoupon(null);
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!token) {
      toast.error('Please login to apply coupon');
      return false;
    }

    try {
      const response = await cartAPI.applyCoupon(code);
      if (response.data.success) {
        const cart = response.data.data;
        setItems(cart.items || []);
        setShipping(cart.shipping || 0);
        setTax(cart.tax || 0);
        setTotal(cart.total || 0);
        setCoupon(cart.coupon);
        toast.success('Coupon applied!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid coupon');
      return false;
    }
  };

  const removeCoupon = async () => {
    if (token) {
      try {
        const response = await cartAPI.removeCoupon();
        if (response.data.success) {
          const cart = response.data.data;
          setItems(cart.items || []);
          setShipping(cart.shipping || 0);
          setTax(cart.tax || 0);
          setTotal(cart.total || 0);
          setCoupon(null);
          toast.success('Coupon removed');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to remove coupon');
      }
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Calculate for non-authenticated users
  const effectiveShipping = token ? shipping : subtotal > 50 ? 0 : 10;
  const effectiveTax = token ? tax : subtotal * 0.08;
  const effectiveTotal = token ? total : subtotal + effectiveShipping + effectiveTax;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shipping: effectiveShipping,
        tax: effectiveTax,
        total: effectiveTotal,
        coupon,
        applyCoupon,
        removeCoupon,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
