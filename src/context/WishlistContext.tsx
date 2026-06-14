import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  moveToCart: (productId: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('token');

  const fetchWishlist = useCallback(async () => {
    if (!token) {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await wishlistAPI.get();
      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, token]);

  const addItemToList = async (product: Product) => {
    if (token) {
      try {
        const response = await wishlistAPI.add(product.id);
        if (response.data.success) {
          setItems(response.data.data || []);
          toast.success('Added to wishlist!');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to add to wishlist');
      }
    } else {
      setItems((prev) => {
        if (prev.some((item) => item.id === product.id)) return prev;
        return [...prev, product];
      });
      toast.success('Added to wishlist!');
    }
  };

  const removeItem = async (productId: string) => {
    if (token) {
      try {
        const response = await wishlistAPI.remove(productId);
        if (response.data.success) {
          setItems(response.data.data || []);
          toast.success('Removed from wishlist');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to remove from wishlist');
      }
    } else {
      setItems((prev) => prev.filter((item) => item.id !== productId));
      toast.success('Removed from wishlist');
    }
  };

  const isInWishlist = (productId: string) => items.some((item) => item.id === productId);

  const clearWishlist = async () => {
    if (token) {
      try {
        const response = await wishlistAPI.clear();
        if (response.data.success) {
          setItems([]);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to clear wishlist');
      }
    } else {
      setItems([]);
    }
  };

  const moveToCart = async (productId: string) => {
    if (token) {
      try {
        await wishlistAPI.moveToCart(productId);
        setItems((prev) => prev.filter((item) => item.id !== productId));
        toast.success('Moved to cart!');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to move to cart');
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem: addItemToList,
        removeItem,
        isInWishlist,
        clearWishlist,
        moveToCart,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
