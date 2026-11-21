"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';
import { getAuthToken } from '../lib/session';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchWishlist = useCallback(async () => {
    // Only fetch from protected server endpoint if user is authenticated
    const token = getAuthToken();
    if (!token) {
      if (typeof window !== 'undefined') {
        try {
          const local = localStorage.getItem('guest_wishlist');
          if (local) setWishlistItems(JSON.parse(local));
        } catch (e) {}
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.get('/wishlist');
      const data = res.data.data || res.data;
      const items = Array.isArray(data) ? data : (data?.items || []);
      setWishlistItems(items);
    } catch (err) {
      // 401 is expected if token expired or invalid; silently handle without console errors
      if (err?.response?.status !== 401) {
        console.warn('Wishlist fetch notice:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback((productIdOrObj) => {
    if (!productIdOrObj) return false;
    const targetId = typeof productIdOrObj === 'object'
      ? (productIdOrObj.id || productIdOrObj.product_id)
      : Number(productIdOrObj);

    return wishlistItems.some((item) => {
      const itemProdId = item.product_id || item.product?.id || item.id;
      return Number(itemProdId) === Number(targetId);
    });
  }, [wishlistItems]);

  const addToWishlist = async (product) => {
    if (!product) return;
    setIsLoading(true);
    const prodId = product.id || product.product_id;
    const variantId = product.variant_id || product.product_variant_id || null;

    const token = getAuthToken();
    if (!token) {
      // Guest local wishlist storage
      const newItem = {
        id: Date.now(),
        product_id: Number(prodId),
        variant_id: variantId,
        title: product.name || product.title || 'Saved Product',
        name: product.name || product.title || 'Saved Product',
        brand: product.brand || product.brand_name || 'LUXORA',
        image_url: product.primary_image_url || product.image_url || product.image || '/placeholder.png',
        price: Number(product.price || product.sale_price || 0),
        original_price: Number(product.regular_price || product.original_price || product.price || 0),
        discount_percent: Number(product.discount_percent || 0),
        in_stock: product.in_stock !== false,
        stock_qty: Number(product.stock_qty || 10),
        product: product,
      };

      setWishlistItems((prev) => {
        const next = prev.some((i) => Number(i.product_id || i.id) === Number(prodId))
          ? prev
          : [...prev, newItem];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('guest_wishlist', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
      toast?.showToast?.(`'${product.name || product.title || 'Product'}' saved to wishlist!`, 'success');
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.post('/wishlist', {
        product_id: Number(prodId),
        variant_id: variantId ? Number(variantId) : null,
      });
      await fetchWishlist();
      toast?.showToast?.(`'${product.name || product.title || 'Product'}' added to your wishlist!`, 'success');
      return res.data;
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.warn('Wishlist addToWishlist notice:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistIdOrProdId) => {
    setIsLoading(true);
    const targetId = Number(wishlistIdOrProdId);

    // Find item to remove
    const itemToRemove = wishlistItems.find(
      (item) => Number(item.id) === targetId || Number(item.product_id) === targetId
    );
    const actualWishlistId = itemToRemove?.id || targetId;

    try {
      await apiClient.delete(`/wishlist/${actualWishlistId}`);
      await fetchWishlist();
      toast?.showToast?.('Item removed from wishlist.', 'info');
    } catch (err) {
      console.warn('Wishlist removeFromWishlist notice:', err);
      // Local fallback
      setWishlistItems((prev) =>
        prev.filter((item) => Number(item.id) !== targetId && Number(item.product_id) !== targetId)
      );
      toast?.showToast?.('Item removed from wishlist.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (product) => {
    if (!product) return;
    if (isWishlisted(product)) {
      const targetId = product.id || product.product_id;
      const foundItem = wishlistItems.find(
        (i) => Number(i.product_id || i.id) === Number(targetId)
      );
      await removeFromWishlist(foundItem?.id || targetId);
    } else {
      await addToWishlist(product);
    }
  };

  const moveToCart = async (wishlistIdOrItem, cartAddItemFn) => {
    setIsLoading(true);
    let targetItem = null;

    if (typeof wishlistIdOrItem === 'object' && wishlistIdOrItem !== null) {
      targetItem = wishlistIdOrItem;
    } else {
      targetItem = wishlistItems.find(
        (i) => Number(i.id) === Number(wishlistIdOrItem) || Number(i.product_id) === Number(wishlistIdOrItem)
      );
    }

    const actualId = targetItem?.id || wishlistIdOrItem;

    try {
      await apiClient.post(`/wishlist/${actualId}/move-to-cart`);
      await fetchWishlist();
      if (cartAddItemFn && targetItem) {
        await cartAddItemFn(targetItem, 1, targetItem.variant_id);
      }
      toast?.showToast?.('Item moved to your cart!', 'success');
    } catch (err) {
      console.warn('Wishlist moveToCart notice:', err);
      // Local fallback: add to cart via provided fn, then remove from wishlist
      if (cartAddItemFn && targetItem) {
        await cartAddItemFn(targetItem, 1, targetItem.variant_id);
      }
      setWishlistItems((prev) => prev.filter((i) => Number(i.id) !== Number(actualId)));
      toast?.showToast?.('Item moved to your cart!', 'success');
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    setIsLoading(true);
    try {
      await apiClient.delete('/wishlist');
      await fetchWishlist();
      toast?.showToast?.('Wishlist cleared.', 'info');
    } catch (err) {
      console.warn('Wishlist clearWishlist notice:', err);
      setWishlistItems([]);
      toast?.showToast?.('Wishlist cleared.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isLoading,
        fetchWishlist,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        moveToCart,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
