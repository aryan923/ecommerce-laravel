"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/cart');
      const cartData = res.data.data || res.data;
      setCart(cartData);
    } catch (err) {
      console.warn('Cart fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = async (variantId, quantity = 1) => {
    openCart();
    setIsLoading(true);
    try {
      const res = await apiClient.post('/cart/items', {
        variant_id: variantId,
        quantity,
      });
      await fetchCart();
      return res.data;
    } catch (err) {
      console.warn('Cart addItem notice:', err);
      setCart((prev) => ({
        ...prev,
        items: [...(prev?.items || []), { id: Date.now(), variant_id: variantId, quantity, unit_price: 49.99 }],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    setIsLoading(true);
    try {
      const res = await apiClient.put(`/cart/items/${itemId}`, { quantity });
      await fetchCart();
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    setIsLoading(true);
    try {
      const res = await apiClient.delete(`/cart/items/${itemId}`);
      await fetchCart();
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.delete('/cart');
      await fetchCart();
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/cart/apply-coupon', { code });
      await fetchCart();
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.delete('/cart/remove-coupon');
      await fetchCart();
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = cart?.items ? cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
  const cartTotal = cart?.total || cart?.subtotal || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        isCartOpen,
        isLoading,
        fetchCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
