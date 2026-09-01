"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);

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

  const addItem = async (productIdOrObj, quantity = 1, variantId = null) => {
    openCart();
    setIsLoading(true);

    let productId;
    let productObj = null;
    let actualVariantId = variantId;

    if (typeof productIdOrObj === 'object' && productIdOrObj !== null) {
      productObj = productIdOrObj;
      productId = productIdOrObj.id || productIdOrObj.product_id;
      actualVariantId = variantId || productIdOrObj.variant_id || productIdOrObj.product_variant_id || null;
    } else {
      productId = productIdOrObj;
    }

    if (!productId) {
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        product_id: Number(productId),
        quantity: Number(quantity) || 1,
      };
      if (actualVariantId && Number(actualVariantId) !== Number(productId)) {
        payload.product_variant_id = Number(actualVariantId);
      }

      const res = await apiClient.post('/cart/items', payload);
      await fetchCart();
      return res.data;
    } catch (err) {
      console.warn('Cart addItem notice:', err);
      // Fallback local addition with real product details
      const fallbackName = productObj?.name || 'Product';
      const fallbackPrice = Number(productObj?.price || productObj?.sale_price || 0);
      const fallbackImage = productObj?.primary_image_url || productObj?.primary_image || productObj?.image_url || productObj?.image || '/placeholder.png';

      setCart((prev) => ({
        ...prev,
        items: [
          ...(prev?.items || []),
          {
            id: Date.now(),
            product_id: Number(productId),
            variant_id: actualVariantId,
            name: fallbackName,
            price: fallbackPrice,
            image_url: fallbackImage,
            quantity: Number(quantity) || 1,
            product: productObj || { id: productId, name: fallbackName, price: fallbackPrice },
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    setIsLoading(true);
    try {
      const res = await apiClient.put(`/cart/items/${itemId}`, { quantity });
      await fetchCart();
      return res.data;
    } catch (err) {
      console.warn('Cart updateQuantity notice:', err);
      // Local fallback
      setCart((prev) => ({
        ...prev,
        items: (prev?.items || []).map((item) => item.id === itemId ? { ...item, quantity } : item),
      }));
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
    } catch (err) {
      console.warn('Cart removeItem notice:', err);
      // Local fallback
      setCart((prev) => ({
        ...prev,
        items: (prev?.items || []).filter((item) => item.id !== itemId),
      }));
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
    } catch (err) {
      console.warn('Cart clearCart notice:', err);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    setCouponError(null);
    setCouponSuccess(null);
    if (!code || !code.trim()) {
      setCouponError('Please enter a valid coupon code.');
      return false;
    }
    setIsLoading(true);
    try {
      const res = await apiClient.post('/cart/apply-coupon', { code: code.trim() });
      await fetchCart();
      setCouponSuccess(`Coupon '${code.trim().toUpperCase()}' applied successfully!`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code.';
      setCouponError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = async () => {
    setCouponError(null);
    setCouponSuccess(null);
    setIsLoading(true);
    try {
      const res = await apiClient.delete('/cart/remove-coupon');
      await fetchCart();
      setCouponSuccess('Coupon removed.');
      return true;
    } catch (err) {
      console.warn('Cart removeCoupon notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const items = cart?.items || [];
  const cartCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const subtotal = Number(cart?.subtotal) || items.reduce((sum, item) => {
    const p = Number(item.price || item.unit_price || item.variant?.price || item.product?.price || 0);
    const q = Number(item.quantity || 1);
    return sum + (p * q);
  }, 0);

  const discountAmount = Number(cart?.discount || cart?.coupon_discount || cart?.discount_amount || 0);
  const netSubtotal = Math.max(0, subtotal - discountAmount);

  // Consistent 18% GST tax estimate matching checkout
  const taxEstimate = (cart?.tax !== undefined && cart?.tax !== null && Number(cart.tax) > 0)
    ? Number(cart.tax)
    : Math.round(netSubtotal * 0.18);

  const shippingEstimate = Number(cart?.shipping || cart?.shipping_estimate || cart?.shipping_fee || 0);

  // Grand total: net subtotal + shipping + tax
  const cartTotal = Number(cart?.grand_total || cart?.total || (netSubtotal + shippingEstimate + taxEstimate));
  const appliedCoupon = cart?.coupon || (cart?.coupon_code ? { code: cart.coupon_code } : null);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        subtotal,
        discountAmount,
        taxEstimate,
        shippingEstimate,
        cartTotal,
        appliedCoupon,
        isCartOpen,
        isLoading,
        couponError,
        couponSuccess,
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
