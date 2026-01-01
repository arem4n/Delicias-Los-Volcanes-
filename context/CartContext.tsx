
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  bulkAddToCart: (items: { product: Product; quantity: number }[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // El estado del carrito ahora es puramente efímero y se gestiona en memoria.
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // La validación de stock ahora es una salvaguarda del lado del cliente;
        // la verdadera validación ocurrirá en el backend al crear el pedido.
        if (existing.quantity >= product.stock) return prev;
        
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stock < 1) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const bulkAddToCart = useCallback((items: { product: Product; quantity: number }[]) => {
    setCart(() => {
      const newCart: CartItem[] = [];
      items.forEach(({ product, quantity }) => {
        if (product.stock > 0) {
          const finalQty = Math.min(quantity, product.stock);
          newCart.push({ ...product, quantity: finalQty });
        }
      });
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        // Permitimos que la cantidad sea 0 temporalmente, se filtrará después.
        if (newQty < 0) return item;
        if (newQty > item.stock) return { ...item, quantity: item.stock }; // Corregir al máximo stock
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0)); // Eliminar productos con cantidad 0
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, bulkAddToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe ser utilizado dentro de un CartProvider");
  return context;
};
