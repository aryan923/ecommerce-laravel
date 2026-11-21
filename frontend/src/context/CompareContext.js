"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext(null);

const MAX_COMPARE_LIMIT = 4;
const STORAGE_KEY = 'luxora_compare_items';

export function CompareProvider({ children }) {
  const [comparedProducts, setComparedProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const toast = useToast();

  // Load initial compare state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setComparedProducts(parsed.slice(0, MAX_COMPARE_LIMIT));
        }
      }
    } catch (e) {
      console.warn('Failed to parse compare items from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync compare items to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedProducts));
      } catch (e) {
        console.warn('Failed to save compare items to localStorage:', e);
      }
    }
  }, [comparedProducts, isLoaded]);

  const isInCompare = useCallback((productIdOrObj) => {
    if (!productIdOrObj) return false;
    const targetId = typeof productIdOrObj === 'object'
      ? (productIdOrObj.id || productIdOrObj.product_id)
      : Number(productIdOrObj);

    return comparedProducts.some((item) => Number(item.id || item.product_id) === Number(targetId));
  }, [comparedProducts]);

  const addToCompare = useCallback((product) => {
    if (!product) return false;
    const targetId = Number(product.id || product.product_id);

    if (isInCompare(targetId)) {
      toast?.showToast?.(`'${product.title || product.name || 'Product'}' is already in your comparison list.`, 'info');
      return false;
    }

    if (comparedProducts.length >= MAX_COMPARE_LIMIT) {
      toast?.showToast?.(`Maximum ${MAX_COMPARE_LIMIT} products can be compared at a time. Please remove an item first.`, 'warning');
      return false;
    }

    const itemToAdd = {
      id: targetId,
      title: product.title || product.name || 'Product',
      slug: product.slug || `product-${targetId}`,
      brand: product.brand || product.brand_name || 'Luxora',
      image_url: product.image_url || product.primary_image || (product.images && product.images[0]?.url) || 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300',
      price: product.price ? Number(product.price) : 0,
      original_price: product.original_price ? Number(product.original_price) : Number(product.price || 0),
      discount_percent: product.discount_percent || 0,
      rating: product.rating || 4.5,
      reviews_count: product.reviews_count || 12,
      in_stock: product.in_stock !== undefined ? Boolean(product.in_stock) : true,
      stock_qty: product.stock_qty !== undefined ? Number(product.stock_qty) : 10,
      attributes: product.attributes || {
        Material: product.material || 'Premium Quality',
        Color: product.color || 'Standard',
        Warranty: product.warranty || '1 Year Guarantee'
      }
    };

    setComparedProducts((prev) => [...prev, itemToAdd]);
    toast?.showToast?.(`'${itemToAdd.title}' added to product comparison!`, 'success');
    return true;
  }, [comparedProducts, isInCompare, toast]);

  const removeFromCompare = useCallback((productIdOrObj) => {
    if (!productIdOrObj) return;
    const targetId = typeof productIdOrObj === 'object'
      ? (productIdOrObj.id || productIdOrObj.product_id)
      : Number(productIdOrObj);

    setComparedProducts((prev) => {
      const removedItem = prev.find((item) => Number(item.id || item.product_id) === Number(targetId));
      if (removedItem) {
        setTimeout(() => {
          toast?.showToast?.(`'${removedItem.title}' removed from comparison.`, 'info');
        }, 0);
      }
      return prev.filter((item) => Number(item.id || item.product_id) !== Number(targetId));
    });
  }, [toast]);

  const toggleCompare = useCallback((product) => {
    if (!product) return;
    const targetId = Number(product.id || product.product_id);
    if (isInCompare(targetId)) {
      removeFromCompare(targetId);
    } else {
      addToCompare(product);
    }
  }, [isInCompare, addToCompare, removeFromCompare]);

  const clearCompare = useCallback(() => {
    setComparedProducts([]);
    toast?.showToast?.('Comparison list cleared.', 'info');
  }, [toast]);

  return (
    <CompareContext.Provider
      value={{
        comparedProducts,
        compareCount: comparedProducts.length,
        maxCompareLimit: MAX_COMPARE_LIMIT,
        isInCompare,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
