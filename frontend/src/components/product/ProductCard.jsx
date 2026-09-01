"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { normalizeImageUrl } from '../../lib/image-helper';

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  const rawImage =
    product.primary_image ||
    product.primary_image_url ||
    product.main_image_url ||
    product.image ||
    product.image_url;

  const imageSrc = normalizeImageUrl(rawImage);
    
  const price = product.price || 0;
  const originalPrice = product.compare_at_price || product.original_price || product.sale_price && product.price < product.sale_price ? product.sale_price : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openCart();
    showToast(`Added "${product.name}" to your cart`, 'success');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
    showToast(
      !isWishlisted ? `Saved "${product.name}" to wishlist` : `Removed from wishlist`,
      'info'
    );
  };

  return (
    <div
      data-testid="product-card"
      className="group relative bg-white text-stone-900 border border-stone-200/70 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Compact Square Image Container */}
        <div className="relative aspect-square w-full bg-stone-100/80 overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name || 'Product'}
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
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <span className="bg-amber-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-stone-950 text-white text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                Featured
              </span>
            )}
          </div>

          {/* Wishlist Heart Icon */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-rose-600 hover:bg-white transition-colors shadow z-10"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
        </div>

        {/* Content Info */}
        <div className="p-3.5">
          {/* Category Tag */}
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block mb-0.5 truncate">
            {product.category?.name || product.brand?.name || 'Collection'}
          </span>

          {/* Title */}
          <Link href={`/products/${product.slug || product.id}`} className="block group-hover:text-amber-800 transition-colors">
            <h3 className="text-xs sm:text-sm font-semibold text-stone-900 tracking-tight line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] font-bold text-stone-700">
              {product.rating || '4.8'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xs sm:text-sm font-bold text-stone-950">
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="px-3.5 pb-3.5 pt-0">
        <button
          onClick={handleAddToCart}
          className="w-full bg-stone-950 hover:bg-stone-850 text-white text-[11px] font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
