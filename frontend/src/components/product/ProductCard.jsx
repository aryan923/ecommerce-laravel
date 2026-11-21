"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Scale } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { normalizeImageUrl } from '../../lib/image-helper';

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();
  const { isInCompare: checkIsInCompare, toggleCompare } = useCompare();

  if (!product) return null;

  const isWishlisted = checkIsWishlisted(product);
  const isCompared = checkIsInCompare(product);

  const rawImage =
    product.primary_image ||
    product.primary_image_url ||
    product.main_image_url ||
    product.image ||
    product.image_url;

  const imageSrc = normalizeImageUrl(rawImage);
    
  const price = product.price || 0;
  const originalPrice = product.compare_at_price || product.original_price || (product.sale_price && product.price < product.sale_price ? product.sale_price : null);
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openCart();
    showToast(`Added "${product.name || product.title}" to your cart`, 'success');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
  };

  return (
    <div
      data-testid="product-card"
      className="group relative bg-white/95 text-stone-900 border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Image Container with Zoom & Vignette */}
        <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name || product.title || 'Product'}
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              onError={(e) => {
                if (!e.currentTarget.dataset.fallback) {
                  e.currentTarget.dataset.fallback = 'true';
                  e.currentTarget.src = '/placeholder.svg';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 font-medium bg-stone-100">
              Luxora Collection
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {hasDiscount && (
              <span className="bg-gradient-to-r from-amber-700 to-amber-800 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md">
                -{discountPercent}% OFF
              </span>
            )}
            {product.is_featured && (
              <span className="bg-stone-950/90 text-stone-100 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md border border-stone-800/50">
                Featured
              </span>
            )}
          </div>

          {/* Action Icons (Wishlist + Compare) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            {/* Wishlist Heart Icon */}
            <button
              onClick={handleToggleWishlist}
              data-testid="wishlist-heart-btn"
              className="w-8 h-8 rounded-full bg-white/85 hover:bg-white backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-rose-600 transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>

            {/* Compare Toggle Icon */}
            <button
              onClick={handleToggleCompare}
              data-testid="compare-toggle-btn"
              className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer ${
                isCompared
                  ? 'bg-stone-900 text-amber-400 font-bold'
                  : 'bg-white/85 hover:bg-white text-stone-600 hover:text-stone-900'
              }`}
              title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Info */}
        <div className="p-4">
          {/* Category Tag */}
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-1 truncate">
            {product.category?.name || product.brand?.name || product.brand || 'Collection'}
          </span>

          {/* Title */}
          <Link href={`/products/${product.slug || product.id}`} className="block group-hover:text-amber-800 transition-colors">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight line-clamp-1 group-hover:underline decoration-amber-700/30 underline-offset-2">
              {product.name || product.title}
            </h3>
          </Link>

          {/* Rating & Review */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] font-extrabold text-stone-800">
              {product.rating || '4.8'}
            </span>
            <span className="text-[10px] text-stone-400 font-medium">({product.reviews_count || 42})</span>
          </div>

          {/* Price Tag */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-sm font-extrabold text-stone-950 tracking-tight">
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through font-medium">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4 pt-0">
        <button
          onClick={handleAddToCart}
          className="w-full bg-stone-950 hover:bg-amber-800 text-white text-[11px] font-extrabold py-2.5 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
