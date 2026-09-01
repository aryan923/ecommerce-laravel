"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api-client';

export default function AddToCartSection({ product = {}, selectedVariant = null }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const variantId = selectedVariant?.id || product.default_variant_id || product.id;
  const maxStock = selectedVariant ? selectedVariant.stock_quantity : (product.stock_quantity ?? product.stock ?? 10);
  const isOutOfStock = maxStock <= 0;

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQty = () => {
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast(`Maximum available stock is ${maxStock}`, 'info');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;

    setIsSubmitting(true);
    try {
      await addItem(product, quantity, selectedVariant?.id);
      openCart();
      showToast(`Added ${quantity} x "${product.name || 'Product'}" to cart`, 'success');
    } catch (err) {
      showToast('Could not add item to cart', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;

    setIsSubmitting(true);
    try {
      await addItem(product, quantity, selectedVariant?.id);
      router.push('/checkout');
    } catch (err) {
      router.push('/checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleWishlist = async () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    try {
      if (nextState) {
        await apiClient.post('/wishlist', { product_id: product.id });
        showToast(`Added "${product.name || 'Product'}" to Wishlist`, 'success');
      } else {
        await apiClient.delete(`/wishlist/${product.id}`);
        showToast('Removed from Wishlist', 'info');
      }
    } catch (err) {
      showToast(nextState ? 'Saved to Wishlist' : 'Removed from Wishlist', 'info');
    }
  };

  return (
    <div data-testid="add-to-cart-section" className="flex flex-col gap-4 pt-2">
      {/* Quantity Stepper & Wishlist Row */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-stone-900">Quantity:</span>

        {/* Stepper */}
        <div className="flex items-center border border-stone-200 rounded-xl bg-white p-1">
          <button
            data-testid="quantity-decrease"
            type="button"
            onClick={handleDecreaseQty}
            disabled={quantity <= 1 || isOutOfStock}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span
            data-testid="quantity-value"
            className="w-10 text-center font-bold text-stone-950 text-sm"
          >
            {quantity}
          </span>

          <button
            data-testid="quantity-increase"
            type="button"
            onClick={handleIncreaseQty}
            disabled={quantity >= maxStock || isOutOfStock}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          data-testid="wishlist-btn"
          type="button"
          onClick={handleToggleWishlist}
          className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
            isWishlisted
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
          <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
        </button>
      </div>

      {/* Action Buttons: Add to Cart & Buy Now */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          data-testid="add-to-cart-btn"
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isSubmitting}
          className="flex-1 bg-stone-950 hover:bg-stone-850 disabled:bg-stone-300 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>

        <button
          data-testid="buy-now-btn"
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || isSubmitting}
          className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
        >
          <Zap className="w-4 h-4" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
