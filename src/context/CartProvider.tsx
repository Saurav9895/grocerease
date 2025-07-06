
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product } from '@/lib/types';

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, skuId?: string, selectedOptions?: Record<string, string>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart items from localStorage", error);
      localStorage.removeItem('cartItems');
    } finally {
        setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialLoad]);

  const addToCart = (product: Product, quantity: number, skuId?: string, selectedOptions?: Record<string, string>) => {
    const cartItemId = skuId ? `${product.id}_${skuId}` : product.id;

    let specificSkuData = {};
    if (skuId && product.variantSKUs) {
      const sku = product.variantSKUs.find(s => s.id === skuId);
      if (sku) {
        specificSkuData = {
          price: sku.price,
          originalPrice: sku.originalPrice,
          imageUrl: sku.imageUrl,
          stock: sku.stock,
        };
      }
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === cartItemId);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      const newItem: CartItem = {
        ...product,
        ...specificSkuData,
        id: cartItemId,
        productId: product.id,
        quantity: quantity,
        skuId: skuId,
        selectedOptions: selectedOptions,
      };
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
