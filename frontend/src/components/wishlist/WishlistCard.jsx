"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { normalizeImageUrl } from '../../lib/image-helper';

export default function WishlistCard({ item }) {
  const { formatPrice } = useCurrency();
  const { addItem, openCart } = useCart();
  const { removeFromWishlist, moveToCart } = useWishlist();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!item) return null;

  const title = item.title || item.name || item.product?.name || 'Saved Product';
  const brand = item.brand || item.brand_name || item.product?.brand?.name || 'LUXORA';
  const slug = item.slug || item.product?.slug || item.product_id || item.id;
  const rawImage = item.image_url || item.primary_image_url || item.image || item.product?.primary_image_url;
  const imageSrc = normalizeImageUrl(rawImage);

  const price = Number(item.price || item.product?.price || 0);
  const originalPrice = Number(item.original_price || item.compare_at_price || item.product?.original_price || 0);
  const hasDiscount = originalPrice > price;
  const discountPercent = item.discount_percent || (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  const inStock = item.in_stock !== false && (item.stock_qty === undefined || item.stock_qty > 0);
  const variantAttrs = item.attributes ? Object.entries(item.attributes) : [];

  const handleMoveToCart = async () => {
    setIsProcessing(true);
    try {
      await moveToCart(item, addItem);
      openCart();
    } catch (err) {
      console.warn('Move to cart error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    setIsProcessing(true);
    try {
      await removeFromWishlist(item.id || item.product_id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      data-testid="wishlist-card"
      className="group relative bg-white text-stone-900 border border-stone-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full bg-stone-100/80 overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                if (!e.currentTarget.dataset.fallback) {
                  e.currentTarget.dataset.fallback = 'true';
                  e.currentTarget.src = '/placeholder.svg';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 font-medium">
              Luxora Product
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {hasDiscount && discountPercent > 0 && (
              <span className="bg-rose-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Remove Icon Button */}
          <button
            onClick={handleRemove}
            disabled={isProcessing}
            data-testid="remove-wishlist-item-btn"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-rose-600 hover:bg-white transition-colors shadow z-10"
            title="Remove from Wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
            {brand}
          </span>

          <Link href={`/products/${slug}`} className="block group-hover:text-amber-800 transition-colors">
            <h3 className="text-sm font-semibold text-stone-900 tracking-tight line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Variant Attribute Pills */}
          {variantAttrs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {variantAttrs.map(([key, val]) => (
                <span
                  key={key}
                  className="bg-stone-100 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-full"
                >
                  {key}: {val}
                </span>
              ))}
            </div>
          )}

          {/* Stock Indicator Badge */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {inStock ? (
              <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-rose-600 text-[11px] font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-base font-bold text-stone-950">
              {formatPrice(price)}
            </span>
            {hasDiscount && originalPrice > 0 && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={handleMoveToCart}
          disabled={!inStock || isProcessing}
          data-testid="move-to-cart-btn"
          className="w-full bg-stone-950 hover:bg-stone-850 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isProcessing ? 'Moving...' : inStock ? 'Move to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
}
